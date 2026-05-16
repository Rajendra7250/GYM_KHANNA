/* ===== Workouts Page ===== */
const Workouts = (() => {
  const muscleEmojis = {
    chest: '💪', back: '🔙', legs: '🦵', shoulders: '🏔️',
    arms: '💪', core: '🎯', cardio: '🏃', other: '⭐',
  };

  // Session Timer State
  let sessionStartTime = null;
  let sessionInterval = null;

  // Daily View State
  let currentDate = new Date();

  function getDateStr() {
    return Storage.dateStr(currentDate);
  }

  function updateDateLabel() {
    const label = document.getElementById('workout-date-label');
    if (!label) return;
    if (Storage.isToday(getDateStr())) {
      label.textContent = 'Today';
    } else {
      label.textContent = Storage.formatDate(getDateStr());
    }
  }

  function render() {
    renderTemplates();
    updateDateLabel();
    const ds = getDateStr();
    const exercises = Storage.getWorkoutsByDate(ds);
    const container = document.getElementById('workout-list');

    if (!exercises.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🏋️</div>
          <div class="empty-state-text">No workouts logged yet.<br>Start by adding your first exercise!</div>
          <button class="btn btn-primary" onclick="App.openModal('modal-workout')">Add Exercise</button>
        </div>
      `;
      return;
    }

    let html = '<div class="data-list">';
    const unit = Settings.getSettings().unit;
    let currentSupersetId = null;
    let supersetHtml = '';

      exercises.forEach((ex, idx) => {
        const vol = (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0);
        const itemHtml = `
          <div class="swipe-item">
            <div class="swipe-background">
              🗑️ Delete
            </div>
            <div class="swipe-content data-item ${ex.supersetId ? 'superset-item' : ''}" style="margin:0; border:none;">
              <div class="data-item-icon" style="background:rgba(255,255,255,0.05)">${muscleEmojis[ex.muscle] || '⭐'}</div>
              <div class="data-item-info">
                <div class="data-item-name" style="cursor:pointer; text-decoration:underline; text-decoration-color:var(--text-muted); text-underline-offset:3px;" onclick="Workouts.showHistory('${ex.exercise.replace(/'/g, "\\'")}')">${ex.exercise}</div>
                <div class="data-item-meta">
                  <span class="muscle-tag ${ex.muscle}">${ex.muscle}</span>
                  &nbsp; ${ex.sets}×${ex.reps} ${ex.weight ? '@ ' + ex.weight + unit : ''}
                  ${ex.notes ? `<div style="margin-top:4px; font-style:italic; color:var(--text-muted)">"${ex.notes}"</div>` : ''}
                </div>
              </div>
              ${vol > 0 ? `<div class="data-item-value">${vol.toLocaleString()} ${unit}</div>` : ''}
              <div class="data-item-actions">
                <button class="btn-icon" onclick="Workouts.edit('${ex.id}')" title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="btn-icon swipe-action-delete" style="display:none;" onclick="Workouts.remove('${ex.id}')" title="Delete"></button>
              </div>
            </div>
          </div>
        `;

      if (ex.supersetId) {
        if (currentSupersetId !== ex.supersetId) {
          currentSupersetId = ex.supersetId;
        }
        supersetHtml += itemHtml;
        
        if (idx === exercises.length - 1 || exercises[idx + 1].supersetId !== currentSupersetId) {
          html += `<div class="superset-group">${supersetHtml}</div>`;
          supersetHtml = '';
          currentSupersetId = null;
        }
      } else {
        html += itemHtml;
      }
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const selVal = document.getElementById('workout-exercise').value;
    const custom = document.getElementById('workout-custom').value.trim();
    const exercise = custom || selVal;
    if (!exercise) { App.toast('Please select or type an exercise'); return; }

    const editId = document.getElementById('form-workout').dataset.editId;
    
    // Superset Logic
    const isSuperset = document.getElementById('workout-superset').checked;
    let supersetId = null;
    if (isSuperset && !editId) {
      const today = Storage.getTodayWorkouts();
      if (today.length > 0) {
        const lastEx = today[0];
        if (lastEx.supersetId) {
          supersetId = lastEx.supersetId;
        } else {
          supersetId = 'ss_' + Date.now().toString(36);
          lastEx.supersetId = supersetId;
          Storage.addWorkout(lastEx);
        }
      }
    } else if (editId) {
      // Keep existing superset ID if editing
      const w = Storage.getWorkouts().find(x => x.id === editId);
      if (w) supersetId = w.supersetId;
    }

    const muscle = document.getElementById('workout-muscle').value;

    Storage.addWorkout({
      id: editId,
      date: getDateStr(), // Use currently viewed date
      supersetId,
      exercise,
      muscle: muscle,
      sets: parseInt(document.getElementById('workout-sets').value) || 0,
      reps: parseInt(document.getElementById('workout-reps').value) || 0,
      weight: parseFloat(document.getElementById('workout-weight').value) || 0,
      notes: document.getElementById('workout-notes').value.trim(),
    });

    document.getElementById('form-workout').reset();
    delete document.getElementById('form-workout').dataset.editId;
    App.closeModal('modal-workout');
    App.toast(editId ? 'Exercise updated' : 'Exercise logged! 💪', 'success');
    render();
    Dashboard.render();

    // Start rest timer if it's a new entry and not a superset
    if (!editId && !isSuperset && window.Timer) {
      const restTimers = Settings.getSettings().restTimers || {};
      const timerSecs = restTimers[muscle] !== undefined ? parseInt(restTimers[muscle]) : 90;
      if (timerSecs > 0) {
        Timer.start(timerSecs);
      }
    }
  }

  function remove(id) {
    App.confirm('Delete Exercise', 'Are you sure you want to delete this exercise log? This cannot be undone.', () => {
      Storage.deleteWorkout(id);
      render();
      Dashboard.render();
      App.toast('Exercise removed');
    });
  }

  function edit(id) {
    const workouts = Storage.getWorkouts();
    const w = workouts.find(x => x.id === id);
    if (!w) return;
    document.getElementById('workout-exercise').value = w.exercise;
    document.getElementById('workout-muscle').value = w.muscle;
    document.getElementById('workout-sets').value = w.sets;
    document.getElementById('workout-reps').value = w.reps;
    document.getElementById('workout-weight').value = w.weight || '';
    document.getElementById('workout-notes').value = w.notes || '';
    document.getElementById('workout-superset').checked = !!w.supersetId;
    document.getElementById('form-workout').dataset.editId = id;
    App.openModal('modal-workout');
  }

  // Auto-set muscle group when selecting preset exercise
  function initPresetSync() {
    const sel = document.getElementById('workout-exercise');
    sel.addEventListener('change', () => {
      const opt = sel.selectedOptions[0];
      if (opt && opt.parentElement.tagName === 'OPTGROUP') {
        const group = opt.parentElement.label.toLowerCase();
        const muscleSel = document.getElementById('workout-muscle');
        if (muscleSel.querySelector(`option[value="${group}"]`)) {
          muscleSel.value = group;
        }
      }
    });
  }

  // ===== ROUTINES / TEMPLATES =====
  function renderTemplates() {
    const tList = document.getElementById('templates-list');
    if (!tList) return;
    const templates = Storage.getTemplates();
    if (!templates || !templates.length) {
      tList.innerHTML = `<div style="font-size:0.85rem; color:var(--text-muted); font-style:italic; padding:var(--sp-sm) 0;">No routines created yet.</div>`;
      return;
    }
    
    let html = '';
    templates.forEach(t => {
      html += `
        <div class="template-card" style="background:var(--bg-secondary); padding:var(--sp-md); border-radius:var(--r-md); min-width:200px; display:flex; flex-direction:column; gap:var(--sp-sm); box-shadow:0 2px 4px rgba(0,0,0,0.2); flex-shrink:0;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:600;">${t.name}</div>
            <button class="btn-icon" onclick="Workouts.deleteRoutine('${t.id}')" title="Delete Routine" style="margin:-8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
          <div style="font-size:0.8rem; color:var(--text-secondary);">${t.exercises.length} exercises</div>
          <button class="btn btn-primary" style="margin-top:auto;" onclick="Workouts.logRoutine('${t.id}')">Log Routine</button>
        </div>
      `;
    });
    tList.innerHTML = html;
  }

  function handleRoutineSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('routine-name').value.trim();
    const exercisesStr = document.getElementById('routine-exercises').value.trim();
    if (!name || !exercisesStr) return;
    
    const exercises = exercisesStr.split(',').map(s => s.trim()).filter(s => s);
    Storage.addTemplate({ name, exercises });
    
    document.getElementById('form-routine').reset();
    App.closeModal('modal-routine');
    App.toast('Routine created!');
    renderTemplates();
  }

  function logRoutine(id) {
    const templates = Storage.getTemplates();
    const t = templates.find(x => x.id === id);
    if (!t) return;
    
    App.confirm('Log Routine', `Log ${t.exercises.length} exercises for "${t.name}"?`, () => {
      t.exercises.forEach(exName => {
        // Attempt to guess muscle from exercise library, or default to 'other'
        const libEx = Object.values(ExerciseLibrary.data).flat().find(e => e.toLowerCase() === exName.toLowerCase());
        let muscle = 'other';
        if (libEx) {
          for (const [key, list] of Object.entries(ExerciseLibrary.data)) {
            if (list.includes(libEx)) { muscle = key; break; }
          }
        }
        
        Storage.addWorkout({
          date: getDateStr(),
          exercise: exName,
          muscle: muscle,
          sets: 3, // Default values
          reps: 10,
          weight: 0,
          notes: `From ${t.name} routine`
        });
      });
      App.toast(`Logged ${t.name}! Edit them to fill in weights.`);
      render();
      Dashboard.render();
    });
  }

  function deleteRoutine(id) {
    App.confirm('Delete Routine', 'Are you sure you want to delete this routine?', () => {
      Storage.deleteTemplate(id);
      renderTemplates();
      App.toast('Routine deleted');
    });
  }

  function fillRoutine(name, exercises) {
    const nameEl = document.getElementById('routine-name');
    const exercisesEl = document.getElementById('routine-exercises');
    if (nameEl) nameEl.value = name;
    if (exercisesEl) exercisesEl.value = exercises;
  }

  // ===== SESSION TIMER =====
  function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  function updateSessionClock() {
    if (!sessionStartTime) return;
    const elapsed = Date.now() - sessionStartTime;
    const clockEl = document.getElementById('session-clock');
    if (clockEl) clockEl.textContent = formatDuration(elapsed);
  }

  function toggleSession() {
    const btn = document.getElementById('btn-session-toggle');
    if (!sessionStartTime) {
      // Start
      sessionStartTime = Date.now();
      sessionInterval = setInterval(updateSessionClock, 1000);
      if (btn) { btn.textContent = 'End Workout'; btn.style.background = 'var(--danger)'; }
      App.toast('Workout started! 💪');
    } else {
      // End
      const duration = Date.now() - sessionStartTime;
      clearInterval(sessionInterval);
      Storage.addSession({ duration, exercises: Storage.getTodayWorkouts().length });
      sessionStartTime = null;
      sessionInterval = null;
      const clockEl = document.getElementById('session-clock');
      if (clockEl) clockEl.textContent = '00:00:00';
      if (btn) { btn.textContent = 'Start Workout'; btn.style.background = ''; }
      App.toast(`Workout done! ${formatDuration(duration)}`, 'success');
      Dashboard.render();
    }
  }

  // ===== EXERCISE HISTORY =====
  function showHistory(exerciseName) {
    const all = Storage.getWorkouts().filter(w => w.exercise === exerciseName);
    if (!all.length) { App.toast('No history for this exercise'); return; }

    document.getElementById('exercise-history-title').textContent = exerciseName + ' History';

    // Build chart data: max weight per date
    const byDate = {};
    const volByDate = {};
    all.forEach(w => {
      if (!byDate[w.date] || w.weight > byDate[w.date]) byDate[w.date] = w.weight || 0;
      const vol = (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
      volByDate[w.date] = (volByDate[w.date] || 0) + vol;
    });
    const chartData = Object.entries(byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, weight]) => ({ label: Storage.formatDate(date), value: weight }));
    const volData = Object.entries(volByDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, vol]) => ({ label: Storage.formatDate(date), value: vol }));

    // Weight progression chart
    const canvas = document.getElementById('chart-exercise-history');
    if (canvas && chartData.length > 1) {
      Charts.drawLineChart(canvas, chartData);
    } else if (canvas) {
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = 200 * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = '200px';
      ctx.clearRect(0, 0, rect.width, 200);
      ctx.fillStyle = '#8a8a9a';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Need at least 2 sessions to show trend', rect.width / 2, 100);
    }

    // Volume trend chart
    const volCanvas = document.getElementById('chart-exercise-volume');
    if (volCanvas && volData.length > 1) {
      Charts.drawBarChart(volCanvas, volData);
    } else if (volCanvas) {
      const ctx = volCanvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = volCanvas.parentElement.getBoundingClientRect();
      volCanvas.width = rect.width * dpr;
      volCanvas.height = 150 * dpr;
      ctx.scale(dpr, dpr);
      volCanvas.style.width = rect.width + 'px';
      volCanvas.style.height = '150px';
      ctx.clearRect(0, 0, rect.width, 150);
      ctx.fillStyle = '#8a8a9a';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Need more data for volume trend', rect.width / 2, 75);
    }

    // 1RM Calculation (Epley Formula: weight × (1 + reps/30))
    const unit = Settings.getSettings().unit;
    const rmBox = document.getElementById('exercise-1rm');
    const rmVal = document.getElementById('exercise-1rm-value');
    let best1RM = 0;
    all.forEach(w => {
      if (w.weight > 0 && w.reps > 0) {
        const est = w.weight * (1 + w.reps / 30);
        if (est > best1RM) best1RM = est;
      }
    });
    if (best1RM > 0 && rmBox && rmVal) {
      rmBox.style.display = 'block';
      rmVal.textContent = best1RM.toFixed(1) + ' ' + unit;
    } else if (rmBox) {
      rmBox.style.display = 'none';
    }

    // Build list
    let listHtml = '';
    all.forEach(w => {
      const vol = (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
      listHtml += `
        <div class="data-item">
          <div class="data-item-icon" style="background:rgba(255,255,255,0.05)">📅</div>
          <div class="data-item-info">
            <div class="data-item-name">${Storage.formatDate(w.date)}</div>
            <div class="data-item-meta">${w.sets}×${w.reps} @ ${w.weight || 0}${unit} ${w.notes ? `— ${w.notes}` : ''}</div>
          </div>
          ${vol > 0 ? `<div class="data-item-value">${vol.toLocaleString()} ${unit}</div>` : ''}
        </div>
      `;
    });
    document.getElementById('exercise-history-list').innerHTML = listHtml;

    App.openModal('modal-exercise-history');
  }

  function init() {
    ExerciseLibrary.populateSelect('workout-exercise');
    document.getElementById('form-workout').addEventListener('submit', handleSubmit);
    document.getElementById('form-routine').addEventListener('submit', handleRoutineSubmit);
    
    // Date Navigation
    const prevBtn = document.getElementById('workout-prev-day');
    const nextBtn = document.getElementById('workout-next-day');
    if (prevBtn) prevBtn.addEventListener('click', () => { currentDate.setDate(currentDate.getDate() - 1); render(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { currentDate.setDate(currentDate.getDate() + 1); render(); });

    const btnAddRoutine = document.getElementById('btn-add-routine');
    if (btnAddRoutine) btnAddRoutine.addEventListener('click', () => App.openModal('modal-routine'));

    const btnSession = document.getElementById('btn-session-toggle');
    if (btnSession) btnSession.addEventListener('click', toggleSession);
    
    initPresetSync();
  }

  return { render, renderTemplates, init, remove, edit, logRoutine, deleteRoutine, showHistory, toggleSession, fillRoutine };
})();
