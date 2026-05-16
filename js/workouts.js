/* ===== Workouts Page ===== */
const Workouts = (() => {
  const muscleEmojis = {
    chest: '💪', back: '🔙', legs: '🦵', shoulders: '🏔️',
    arms: '💪', core: '🎯', cardio: '🏃', other: '⭐',
  };

  function render() {
    renderTemplates();
    const groups = Storage.getWorkoutsGrouped();
    const container = document.getElementById('workout-list');

    if (!groups.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🏋️</div>
          <div class="empty-state-text">No workouts logged yet.<br>Start by adding your first exercise!</div>
          <button class="btn btn-primary" onclick="App.openModal('modal-workout')">Add Exercise</button>
        </div>
      `;
      return;
    }

    let html = '';
    const unit = Settings.getSettings().unit;
    groups.forEach(([date, exercises]) => {
      const label = Storage.isToday(date) ? 'Today' : Storage.formatDate(date);
      html += `<div class="date-group"><div class="date-group-header">${label}</div><div class="data-list">`;
      let currentSupersetId = null;
      let supersetHtml = '';

      exercises.forEach((ex, idx) => {
        const vol = (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0);
        const itemHtml = `
          <div class="data-item ${ex.supersetId ? 'superset-item' : ''}">
            <div class="data-item-icon" style="background:rgba(255,255,255,0.05)">${muscleEmojis[ex.muscle] || '⭐'}</div>
            <div class="data-item-info">
              <div class="data-item-name clickable" onclick="Workouts.showHistory('${ex.exercise}')">${ex.exercise}</div>
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
              <button class="btn-icon" onclick="Workouts.remove('${ex.id}')" title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
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
      html += '</div></div>';
    });
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

    Storage.addWorkout({
      id: editId,
      supersetId,
      exercise,
      muscle: document.getElementById('workout-muscle').value,
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
    Timer.start(90); // Start 90s rest timer
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

  function showHistory(name) {
    const workouts = Storage.getWorkouts().filter(w => w.exercise === name);
    document.getElementById('history-title').textContent = `${name} History`;
    
    const list = document.getElementById('history-list');
    if (workouts.length === 0) {
      list.innerHTML = `<div class="empty-state">No history for this exercise.</div>`;
    } else {
      let html = '';
      workouts.forEach(w => {
        html += `
          <div class="data-item">
            <div class="data-item-info">
              <div class="data-item-name">${Storage.formatDate(w.date)}</div>
              <div class="data-item-meta">${w.sets}×${w.reps} @ ${w.weight || 0} ${Settings.getSettings().unit}</div>
            </div>
            <div class="data-item-value">${((w.sets || 0) * (w.reps || 0) * (w.weight || 0)).toLocaleString()}</div>
          </div>
        `;
      });
      list.innerHTML = html;
    }

    const canvas = document.getElementById('chart-history');
    if (workouts.length > 0) {
      const chartData = workouts.slice().reverse().map(w => ({
        label: Storage.formatDate(w.date),
        value: w.weight || 0
      }));
      Charts.drawLineChart(canvas, chartData);
    } else {
      Charts.drawEmptyState(canvas, 'No progression data');
    }

    App.openModal('modal-history');
  }

  function init() {
    ExerciseLibrary.populateSelect('workout-exercise');
    document.getElementById('form-workout').addEventListener('submit', handleSubmit);
    document.getElementById('form-routine').addEventListener('submit', handleRoutineSubmit);
    
    const btnAddRoutine = document.getElementById('btn-add-routine');
    if (btnAddRoutine) btnAddRoutine.addEventListener('click', () => App.openModal('modal-routine'));
    
    if (typeof Timer !== 'undefined') Timer.updateSessionUI();
    
    initPresetSync();
  }

  return { render, renderTemplates, init, remove, edit, logRoutine, deleteRoutine, showHistory };
})();
