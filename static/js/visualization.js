// visualization.js

class AudioVisualizer {
    constructor() {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.tracks      = {};
      this.analyzers   = {};
      this.playing     = false;
  
      this.setupTracks();
      this.setupControls();
      this.setupMainVisualization();
    }
  
    setupTracks() {
      document.querySelectorAll('audio').forEach(audio => {
        const trackName = audio.id;
  
        // Resume AudioContext on first user interaction
        audio.addEventListener('play', () => {
          if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
          }
        });
  
        const source   = this.audioContext.createMediaElementSource(audio);
        const analyzer = this.audioContext.createAnalyser();
        analyzer.fftSize = 256;
        source.connect(analyzer);
        analyzer.connect(this.audioContext.destination);
  
        this.tracks[trackName]    = audio;
        this.analyzers[trackName] = analyzer;
  
        this.setupTrackVisualization(trackName);
      });
    }
  
    setupTrackVisualization(trackName) {
      const container = document.getElementById(`${trackName}-viz`);
      // If container is a <canvas>, use it; otherwise create one inside the div
      let canvas = container.tagName === 'CANVAS'
        ? container
        : container.querySelector('canvas');
  
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.width  = container.clientWidth  || 600;
        canvas.height = container.clientHeight || 100;
        container.appendChild(canvas);
      }
  
      const ctx      = canvas.getContext('2d');
      const analyzer = this.analyzers[trackName];
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray    = new Uint8Array(bufferLength);
  
      const draw = () => {
        requestAnimationFrame(draw);
        analyzer.getByteFrequencyData(dataArray);
  
        // clear background
        ctx.fillStyle = 'rgb(26, 26, 26)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
  
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillStyle = `hsl(${i * 360 / bufferLength}, 100%, 50%)`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };
  
      draw();
    }
  
    setupControls() {
      // Play All button
      document.getElementById('play-all').addEventListener('click', () => {
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        Object.values(this.tracks).forEach(track => track.play());
        this.playing = true;
      });
  
      // Stop All button
      document.getElementById('stop-all').addEventListener('click', () => {
        Object.values(this.tracks).forEach(track => {
          track.pause();
          track.currentTime = 0;
        });
        this.playing = false;
      });
  
      // Individual track toggles: play/pause
      document.querySelectorAll('.track-toggle').forEach(toggle => {
        toggle.addEventListener('change', e => {
          const track = this.tracks[e.target.dataset.track];
          if (e.target.checked) {
            track.play();
          } else {
            track.pause();
          }
        });
      });
  
      // Volume sliders
      document.querySelectorAll('.volume-slider').forEach(slider => {
        slider.addEventListener('input', e => {
          const track = this.tracks[e.target.dataset.track];
          track.volume = e.target.value / 100;
        });
      });
    }
  
    setupMainVisualization() {
      // If you don't need a combined visualizer, hide the main canvas so it
      // doesn't block your buttons:
      const mainCanvas = document.getElementById('main-visualization');
      if (mainCanvas) {
        mainCanvas.style.display = 'none';
      }
      // Otherwise, you can add another visualization loop here similar to above.
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    new AudioVisualizer();
  });
  