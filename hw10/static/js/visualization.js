// static/js/visualization.js

class AudioVisualizer {
  constructor() {
    this.audioContext   = null;
    this.tracks         = Array.from(document.querySelectorAll('.track'));
    this.playAllBtn     = document.getElementById('play-all');
    this.stopAllBtn     = document.getElementById('stop-all');

    // for the global play-head
    this.globalStart    = null;
    this.globalDuration = 0;

    this.setupTracks();
    this.setupTransportControls();
    this.setupMainVisualization();
  }

  ensureAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } else if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setupTracks() {
    this.tracks.forEach(trackEl => {
      const audioEl    = trackEl.querySelector('audio');
      const controlsEl = trackEl.querySelector('.track-controls');
      const sliderEl   = trackEl.querySelector('.volume-slider');
      const vizCtn     = trackEl.querySelector('.visualization');

      let analyserAdded = false;
      const addAnalyser = () => {
        if (analyserAdded) return;
        this.ensureAudioContext();
        const src      = this.audioContext.createMediaElementSource(audioEl);
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        analyser.connect(this.audioContext.destination);
        this.buildCanvas(vizCtn, analyser);
        analyserAdded = true;
      };

      // click anywhere in the controls strip to toggle play/pause
      controlsEl.addEventListener('click', e => {
        // allow volume slider interaction without toggling
        if (e.target === sliderEl) return;

        if (audioEl.paused) {
          addAnalyser();
          this.ensureAudioContext();
          audioEl.play();
          controlsEl.classList.remove('off');
        } else {
          audioEl.pause();
          controlsEl.classList.add('off');
        }
      });

      // wire up the volume slider
      sliderEl.addEventListener('input', () => {
        audioEl.volume = sliderEl.value / 100;
      });
    });
  }

  buildCanvas(container, analyser) {
    const canvas    = document.createElement('canvas');
    canvas.width    = container.clientWidth  || 600;
    canvas.height   = container.clientHeight || 100;
    container.appendChild(canvas);

    const ctx       = canvas.getContext('2d');
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const barWidth  = (canvas.width / dataArray.length) * 2.5;

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const h = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `hsl(${i * 360 / dataArray.length},100%,50%)`;
        ctx.fillRect(x, canvas.height - h, barWidth, h);
        x += barWidth + 1;
      }
    };
    draw();
  }

  setupTransportControls() {
    this.playAllBtn.addEventListener('click', () => {
      // determine the longest track for global timing
      this.globalDuration = Math.max(
        ...this.tracks.map(t => {
          const d = t.querySelector('audio').duration;
          return isNaN(d) ? 0 : d;
        })
      );
      this.ensureAudioContext();
      this.globalStart = this.audioContext.currentTime;

      // simulate clicking each controlsEl to wire up and play
      this.tracks.forEach(trackEl =>
        trackEl.querySelector('.track-controls').click()
      );
    });

    this.stopAllBtn.addEventListener('click', () => {
      this.globalStart = null;
      this.tracks.forEach(trackEl => {
        const audioEl    = trackEl.querySelector('audio');
        const controlsEl = trackEl.querySelector('.track-controls');
        audioEl.pause();
        audioEl.currentTime = 0;
        controlsEl.classList.add('off');
      });
    });
  }

  setupMainVisualization() {
    const main   = document.getElementById('main-visualization');
    const parent = main.parentElement;
    main.width   = parent.clientWidth;
    main.height  = parent.clientHeight;
    const ctx    = main.getContext('2d');

    const drawMain = () => {
      requestAnimationFrame(drawMain);
      ctx.clearRect(0, 0, main.width, main.height);

      if (this.globalStart !== null && this.globalDuration > 0) {
        const elapsed = this.audioContext.currentTime - this.globalStart;
        const t       = Math.min(Math.max(elapsed / this.globalDuration, 0), 1);
        const x       = t * main.width;

        ctx.strokeStyle = 'white';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, main.height);
        ctx.stroke();
      }
    };
    drawMain();
  }
}

// initialize
document.addEventListener('DOMContentLoaded', () => new AudioVisualizer());
