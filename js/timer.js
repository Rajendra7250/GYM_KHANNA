/* ===== Timer Module ===== */
const Timer = (() => {
  let interval;
  let remaining = 0;
  let active = false;

  let sessionActive = false;
  let sessionStartTime = null;
  let sessionInterval = null;

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

    // Session Timer Hook
    const btn = document.getElementById('btn-session-toggle');
    if (btn) btn.addEventListener('click', toggleSession);

    // Restore session if active
    const saved = localStorage.getItem('gk_active_session');
    if (saved) {
      sessionStartTime = parseInt(saved);
      startSessionLoop();
    }
  }

  function toggleSession() {
    if (sessionActive) {
      stopSession();
    } else {
      startSession();
    }
  }

  function startSession() {
    sessionStartTime = Date.now();
    localStorage.setItem('gk_active_session', sessionStartTime);
    startSessionLoop();
    App.toast("Workout session started! Let's go! 🔥", "success");
  }

  function startSessionLoop() {
    sessionActive = true;
    updateSessionUI();
    sessionInterval = setInterval(updateSessionClock, 1000);
    updateSessionClock();
  }

  function stopSession() {
    const durationMs = Date.now() - sessionStartTime;
    const durationMins = Math.round(durationMs / 60000);
    
    Storage.addSession({
      startTime: sessionStartTime,
      endTime: Date.now(),
      duration: durationMins
    });

    clearInterval(sessionInterval);
    sessionActive = false;
    sessionStartTime = null;
    localStorage.removeItem('gk_active_session');
    
    updateSessionUI();
    App.toast(`Workout ended! Duration: ${durationMins} mins. Great work! 👊`, "success");
    if (typeof Workouts !== 'undefined') Workouts.render();
    if (typeof Dashboard !== 'undefined') Dashboard.render();
  }

  function updateSessionClock() {
    const clock = document.getElementById('session-clock');
    if (!clock) return;
    
    const diff = Date.now() - sessionStartTime;
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    clock.textContent = `${h}:${m}:${s}`;
  }

  function updateSessionUI() {
    const btn = document.getElementById('btn-session-toggle');
    const clock = document.getElementById('session-clock');
    if (btn) {
      btn.textContent = sessionActive ? 'End Workout' : 'Start Workout';
      btn.className = sessionActive ? 'btn btn-ghost' : 'btn btn-primary';
    }
    if (clock) {
      clock.style.display = sessionActive ? 'block' : 'none';
    }
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

  return { init, start, stop, updateSessionUI };
})();
