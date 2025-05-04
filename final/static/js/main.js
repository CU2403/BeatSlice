// static/js/main.js

document.addEventListener('DOMContentLoaded', () => {
  // ==================== Learn1 & Learn2 ====================
  const stemButtons = document.querySelectorAll('.stem-button');
  if (stemButtons.length && !document.getElementById('master-play-btn')) {
    const audioEl = document.getElementById('stemAudio');
    const slider  = document.getElementById('stem-slider');
    const canvas  = document.getElementById('stemCanvas');
    const ctx     = canvas.getContext('2d');
    const buttons = stemButtons;

    // High-DPI canvas
    function resizeLearnCanvas() {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    window.addEventListener('resize', resizeLearnCanvas);
    resizeLearnCanvas();

    // Web Audio API 
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const source = audioCtx.createMediaElementSource(audioEl);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    function drawLearn() {
      requestAnimationFrame(drawLearn);
      analyser.getByteFrequencyData(dataArray);
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      const w = canvas.clientWidth / dataArray.length;
      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 255;
        const h = v * canvas.clientHeight;
        ctx.fillStyle = `hsl(${120 * v}, 100%, 40%)`;
        ctx.fillRect(i * w, canvas.clientHeight - h, w * 0.8, h);
      }
    }
    drawLearn();


    let currentBtn = null;
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const src = btn.getAttribute('data-src');
        if (currentBtn === btn) {
          audioEl.pause();
          currentBtn.classList.remove('active');
          currentBtn = null;
        } else {
          if (currentBtn) currentBtn.classList.remove('active');
          currentBtn = btn;
          btn.classList.add('active');
          audioEl.src = src;
          audioEl.currentTime = 0;
          audioEl.play();
          if (audioCtx.state === 'suspended') audioCtx.resume();
        }
      });
    });

    audioEl.addEventListener('ended', () => {
      if (currentBtn) currentBtn.classList.remove('active');
      currentBtn = null;
    });


    audioEl.addEventListener('loadedmetadata', () => {
      slider.max = audioEl.duration;
    });
    audioEl.addEventListener('timeupdate', () => {
      slider.value = audioEl.currentTime;
    });
    slider.addEventListener('input', () => {
      audioEl.currentTime = slider.value;
    });
  }

  // ==================== Learn3  ====================
  const masterBtn = document.getElementById('master-play-btn');
  const masterSlider = document.getElementById('master-slider');
  if (masterBtn && masterSlider) {
    /* …原有 Learn3 / Learn4 / Learn5 / Learn6 / Learn7 脚本… */
  }

  // ====================
  // Only on quiz pages: ensure single-audio playback
  // ====================
  if (window.location.pathname.includes('/quiz/')) {
    const allAudio = document.querySelectorAll('audio');
    allAudio.forEach(a => {
      a.addEventListener('play', () => {
        allAudio.forEach(other => {
          if (other !== a) other.pause();
        });
      });
    });
  }
});
