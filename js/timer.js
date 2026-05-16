/* ===== Timer Module ===== */
const Timer = (() => {
  let interval;
  let remaining = 0;
  let active = false;

  function init() {
    const html = `
      <div id="rest-timer" class="rest-timer hidden">
        <div class="timer-header">Rest Timer</div>
        <div class="timer-display" id="timer-display">01:30</div>
        <div class="timer-controls">
          <button class="btn-icon" id="timer-minus" title="-15s">-15s</button>
          <button class="btn btn-primary" id="timer-skip">Skip</button>
          <button class="btn-icon" id="timer-plus" title="+30s">+30s</button>
        </div>
        <button class="timer-close" id="timer-close">✕</button>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('timer-minus').addEventListener('click', () => addTime(-15));
    document.getElementById('timer-plus').addEventListener('click', () => addTime(30));
    document.getElementById('timer-skip').addEventListener('click', stop);
    document.getElementById('timer-close').addEventListener('click', stop);
  }

  function start(seconds = 90) {
    if (active) clearInterval(interval);
    remaining = seconds;
    active = true;
    document.getElementById('rest-timer').classList.remove('hidden');
    updateDisplay();
    
    interval = setInterval(() => {
      remaining--;
      updateDisplay();
      if (remaining <= 0) {
        finish();
      }
    }, 1000);
  }

  function addTime(secs) {
    if (!active) return;
    remaining += secs;
    if (remaining < 0) remaining = 0;
    updateDisplay();
  }

  function stop() {
    clearInterval(interval);
    active = false;
    document.getElementById('rest-timer').classList.add('hidden');
  }

  function finish() {
    stop();
    App.toast("Rest time is up! Get back to it! 💪", "success");
    playBeep();
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch(e) {
      console.log('AudioContext not supported or blocked');
    }
  }

  function updateDisplay() {
    const el = document.getElementById('timer-display');
    if (!el) return;
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');
    el.textContent = `${m}:${s}`;
  }

  return { init, start, stop };
})();
