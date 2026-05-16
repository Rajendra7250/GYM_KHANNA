/* ===== Workouts Page ===== */
const Workouts = (() => {
  const muscleEmojis = {
    chest: '💪', back: '🔙', legs: '🦵', shoulders: '🏔️',
    arms: '💪', core: '🎯', cardio: '🏃', other: '⭐',
  };

  function render() {
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
      exercises.forEach(ex => {
        const vol = (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0);
        html += `
          <div class="data-item">
            <div class="data-item-icon" style="background:rgba(255,255,255,0.05)">${muscleEmojis[ex.muscle] || '⭐'}</div>
            <div class="data-item-info">
              <div class="data-item-name">${ex.exercise}</div>
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

    Storage.addWorkout({
      id: editId,
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

  function init() {
    ExerciseLibrary.populateSelect('workout-exercise');
    document.getElementById('form-workout').addEventListener('submit', handleSubmit);
    initPresetSync();
  }

  return { render, init, remove, edit };
})();
