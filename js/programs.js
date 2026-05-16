/* ===== Workout Program Builder ===== */
const Programs = (() => {
  // Default program templates
  const DEFAULT_PROGRAMS = [
    {
      name: 'Push / Pull / Legs (4 Weeks)',
      type: 'ppl',
      weeks: 4,
      days: [
        {
          name: 'Push Day',
          exercises: [
            { exercise: 'Bench Press', muscle: 'chest', sets: 4, reps: 8 },
            { exercise: 'Overhead Press', muscle: 'shoulders', sets: 3, reps: 10 },
            { exercise: 'Incline Bench Press', muscle: 'chest', sets: 3, reps: 10 },
            { exercise: 'Lateral Raises', muscle: 'shoulders', sets: 3, reps: 15 },
            { exercise: 'Tricep Pushdown', muscle: 'arms', sets: 3, reps: 12 },
          ]
        },
        {
          name: 'Pull Day',
          exercises: [
            { exercise: 'Deadlift', muscle: 'back', sets: 4, reps: 5 },
            { exercise: 'Pull Ups', muscle: 'back', sets: 3, reps: 8 },
            { exercise: 'Barbell Row', muscle: 'back', sets: 3, reps: 10 },
            { exercise: 'Face Pulls', muscle: 'shoulders', sets: 3, reps: 15 },
            { exercise: 'Barbell Curl', muscle: 'arms', sets: 3, reps: 12 },
          ]
        },
        {
          name: 'Leg Day',
          exercises: [
            { exercise: 'Squat', muscle: 'legs', sets: 4, reps: 8 },
            { exercise: 'Romanian Deadlift', muscle: 'legs', sets: 3, reps: 10 },
            { exercise: 'Leg Press', muscle: 'legs', sets: 3, reps: 12 },
            { exercise: 'Lunges', muscle: 'legs', sets: 3, reps: 10 },
            { exercise: 'Calf Raises', muscle: 'legs', sets: 4, reps: 15 },
          ]
        }
      ]
    },
    {
      name: 'Upper / Lower Split (4 Weeks)',
      type: 'upper_lower',
      weeks: 4,
      days: [
        {
          name: 'Upper Body A',
          exercises: [
            { exercise: 'Bench Press', muscle: 'chest', sets: 4, reps: 8 },
            { exercise: 'Barbell Row', muscle: 'back', sets: 4, reps: 8 },
            { exercise: 'Overhead Press', muscle: 'shoulders', sets: 3, reps: 10 },
            { exercise: 'Lat Pulldown', muscle: 'back', sets: 3, reps: 10 },
            { exercise: 'Barbell Curl', muscle: 'arms', sets: 2, reps: 12 },
            { exercise: 'Tricep Pushdown', muscle: 'arms', sets: 2, reps: 12 },
          ]
        },
        {
          name: 'Lower Body A',
          exercises: [
            { exercise: 'Squat', muscle: 'legs', sets: 4, reps: 8 },
            { exercise: 'Romanian Deadlift', muscle: 'legs', sets: 3, reps: 10 },
            { exercise: 'Leg Press', muscle: 'legs', sets: 3, reps: 12 },
            { exercise: 'Leg Curl', muscle: 'legs', sets: 3, reps: 12 },
            { exercise: 'Calf Raises', muscle: 'legs', sets: 4, reps: 15 },
            { exercise: 'Hanging Leg Raise', muscle: 'core', sets: 3, reps: 12 },
          ]
        },
        {
          name: 'Upper Body B',
          exercises: [
            { exercise: 'Incline Bench Press', muscle: 'chest', sets: 4, reps: 10 },
            { exercise: 'Seated Cable Row', muscle: 'back', sets: 4, reps: 10 },
            { exercise: 'Arnold Press', muscle: 'shoulders', sets: 3, reps: 12 },
            { exercise: 'Cable Crossover', muscle: 'chest', sets: 3, reps: 12 },
            { exercise: 'Hammer Curl', muscle: 'arms', sets: 2, reps: 12 },
            { exercise: 'Skull Crushers', muscle: 'arms', sets: 2, reps: 12 },
          ]
        },
        {
          name: 'Lower Body B',
          exercises: [
            { exercise: 'Deadlift', muscle: 'back', sets: 4, reps: 5 },
            { exercise: 'Lunges', muscle: 'legs', sets: 3, reps: 10 },
            { exercise: 'Leg Press', muscle: 'legs', sets: 3, reps: 15 },
            { exercise: 'Leg Curl', muscle: 'legs', sets: 3, reps: 12 },
            { exercise: 'Calf Raises', muscle: 'legs', sets: 3, reps: 20 },
            { exercise: 'Plank', muscle: 'core', sets: 3, reps: 60 },
          ]
        }
      ]
    },
    {
      name: 'Full Body (3x/week, 4 Weeks)',
      type: 'full_body',
      weeks: 4,
      days: [
        { name: 'Full Body A', exercises: [
          { exercise: 'Squat', muscle: 'legs', sets: 4, reps: 6 },
          { exercise: 'Bench Press', muscle: 'chest', sets: 4, reps: 8 },
          { exercise: 'Barbell Row', muscle: 'back', sets: 3, reps: 10 },
          { exercise: 'Overhead Press', muscle: 'shoulders', sets: 3, reps: 10 },
          { exercise: 'Barbell Curl', muscle: 'arms', sets: 2, reps: 12 },
        ]},
        { name: 'Full Body B', exercises: [
          { exercise: 'Deadlift', muscle: 'back', sets: 3, reps: 5 },
          { exercise: 'Incline Bench Press', muscle: 'chest', sets: 3, reps: 10 },
          { exercise: 'Lat Pulldown', muscle: 'back', sets: 3, reps: 10 },
          { exercise: 'Lunges', muscle: 'legs', sets: 3, reps: 10 },
          { exercise: 'Tricep Pushdown', muscle: 'arms', sets: 2, reps: 12 },
        ]},
        { name: 'Full Body C', exercises: [
          { exercise: 'Leg Press', muscle: 'legs', sets: 4, reps: 12 },
          { exercise: 'Cable Crossover', muscle: 'chest', sets: 3, reps: 12 },
          { exercise: 'Seated Cable Row', muscle: 'back', sets: 3, reps: 12 },
          { exercise: 'Lateral Raises', muscle: 'shoulders', sets: 3, reps: 15 },
          { exercise: 'Hanging Leg Raise', muscle: 'core', sets: 3, reps: 12 },
        ]}
      ]
    },
    {
      name: 'Bro Split (5-Day, 4 Weeks)',
      type: 'bro',
      weeks: 4,
      days: [
        { name: 'Chest Day', exercises: [
          { exercise: 'Bench Press', muscle: 'chest', sets: 4, reps: 8 },
          { exercise: 'Incline Bench Press', muscle: 'chest', sets: 3, reps: 10 },
          { exercise: 'Dumbbell Flyes', muscle: 'chest', sets: 3, reps: 12 },
          { exercise: 'Cable Crossover', muscle: 'chest', sets: 3, reps: 15 },
          { exercise: 'Push Ups', muscle: 'chest', sets: 2, reps: 20 },
        ]},
        { name: 'Back Day', exercises: [
          { exercise: 'Deadlift', muscle: 'back', sets: 4, reps: 5 },
          { exercise: 'Pull Ups', muscle: 'back', sets: 3, reps: 8 },
          { exercise: 'Barbell Row', muscle: 'back', sets: 3, reps: 10 },
          { exercise: 'Lat Pulldown', muscle: 'back', sets: 3, reps: 12 },
          { exercise: 'Seated Cable Row', muscle: 'back', sets: 3, reps: 12 },
        ]},
        { name: 'Shoulders Day', exercises: [
          { exercise: 'Overhead Press', muscle: 'shoulders', sets: 4, reps: 8 },
          { exercise: 'Arnold Press', muscle: 'shoulders', sets: 3, reps: 10 },
          { exercise: 'Lateral Raises', muscle: 'shoulders', sets: 4, reps: 15 },
          { exercise: 'Face Pulls', muscle: 'shoulders', sets: 3, reps: 15 },
        ]},
        { name: 'Legs Day', exercises: [
          { exercise: 'Squat', muscle: 'legs', sets: 4, reps: 8 },
          { exercise: 'Leg Press', muscle: 'legs', sets: 3, reps: 12 },
          { exercise: 'Romanian Deadlift', muscle: 'legs', sets: 3, reps: 10 },
          { exercise: 'Leg Curl', muscle: 'legs', sets: 3, reps: 12 },
          { exercise: 'Calf Raises', muscle: 'legs', sets: 4, reps: 15 },
        ]},
        { name: 'Arms Day', exercises: [
          { exercise: 'Barbell Curl', muscle: 'arms', sets: 4, reps: 10 },
          { exercise: 'Skull Crushers', muscle: 'arms', sets: 4, reps: 10 },
          { exercise: 'Hammer Curl', muscle: 'arms', sets: 3, reps: 12 },
          { exercise: 'Tricep Pushdown', muscle: 'arms', sets: 3, reps: 12 },
        ]}
      ]
    }
  ];

  function render() {
    renderProgramsList();
    renderActiveProgram();
  }

  function renderProgramsList() {
    const container = document.getElementById('programs-list');
    if (!container) return;

    const programs = Storage.getPrograms();
    const activeId = Storage.getActiveProgram();

    if (programs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-text">No programs yet.<br>Start by adding a pre-built template!</div>
        </div>
      `;
      return;
    }

    let html = '<div class="data-list">';
    programs.forEach(p => {
      const isActive = p.id === activeId;
      const currentWeek = p.currentWeek || 1;
      html += `
        <div class="data-item" style="${isActive ? 'border-color: var(--success);' : ''}">
          <div class="data-item-icon" style="background:rgba(255,255,255,0.05); font-size:1.3rem;">
            ${isActive ? '✅' : '📋'}
          </div>
          <div class="data-item-info">
            <div class="data-item-name">${p.name}</div>
            <div class="data-item-meta">
              ${p.weeks} weeks · ${p.days.length} day split · Week ${currentWeek}/${p.weeks}
            </div>
          </div>
          <div class="data-item-actions" style="gap:6px;">
            ${!isActive ? `<button class="btn btn-primary" style="font-size:0.75rem; padding:6px 12px;" onclick="Programs.activate('${p.id}')">Activate</button>` : `<button class="btn btn-ghost" style="font-size:0.75rem; padding:6px 12px;" onclick="Programs.deactivate()">Stop</button>`}
            <button class="btn-icon" onclick="Programs.viewProgram('${p.id}')" title="View">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="btn-icon" onclick="Programs.remove('${p.id}')" title="Delete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function renderActiveProgram() {
    const container = document.getElementById('active-program-today');
    if (!container) return;

    const activeId = Storage.getActiveProgram();
    if (!activeId) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    const programs = Storage.getPrograms();
    const program = programs.find(p => p.id === activeId);
    if (!program) { container.style.display = 'none'; return; }

    container.style.display = 'block';
    const currentWeek = program.currentWeek || 1;
    const unit = Settings.getSettings().unit;

    // Determine today's day in the rotation
    const dayOfWeek = new Date().getDay(); // 0=Sun...6=Sat
    const workDays = Math.min(dayOfWeek === 0 ? 7 : dayOfWeek, program.days.length);
    const todayIdx = (workDays - 1) % program.days.length;
    const todayPlan = program.days[todayIdx];

    if (!todayPlan) { container.style.display = 'none'; return; }

    let html = `
      <div class="card" style="border-left:3px solid var(--success); margin-bottom:var(--sp-lg);">
        <div class="section-title" style="margin-bottom:var(--sp-md);">
          <h3>📋 Today's Program: ${todayPlan.name}</h3>
          <span style="font-size:0.8rem; color:var(--text-secondary);">Week ${currentWeek}/${program.weeks}</span>
        </div>
        <div class="data-list">
    `;

    todayPlan.exercises.forEach(ex => {
      const suggested = Storage.suggestWeight(ex.exercise, unit);
      const weightText = suggested ? `${suggested}${unit}` : 'First time!';
      const weightColor = suggested ? 'var(--success)' : 'var(--text-muted)';

      html += `
        <div class="data-item" style="cursor:pointer;" onclick="Programs.logExercise('${ex.exercise.replace(/'/g, "\\'")}', '${ex.muscle}', ${ex.sets}, ${ex.reps}, ${suggested || 0})">
          <div class="data-item-icon" style="background:rgba(255,255,255,0.05)">🏋️</div>
          <div class="data-item-info">
            <div class="data-item-name">${ex.exercise}</div>
            <div class="data-item-meta">${ex.sets}×${ex.reps} · <span style="color:${weightColor}; font-weight:600;">${weightText}</span></div>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Tap to log</div>
        </div>
      `;
    });

    html += '</div></div>';
    container.innerHTML = html;
  }

  function logExercise(exercise, muscle, sets, reps, weight) {
    document.getElementById('workout-exercise').value = exercise;
    document.getElementById('workout-muscle').value = muscle;
    document.getElementById('workout-sets').value = sets;
    document.getElementById('workout-reps').value = reps;
    if (weight > 0) document.getElementById('workout-weight').value = weight;
    App.openModal('modal-workout');
  }

  function activate(id) {
    Storage.setActiveProgram(id);
    App.toast('Program activated! 💪', 'success');
    render();
    if (Workouts && Workouts.render) Workouts.render();
  }

  function deactivate() {
    Storage.setActiveProgram(null);
    App.toast('Program deactivated');
    render();
    if (Workouts && Workouts.render) Workouts.render();
  }

  function advanceWeek(id) {
    const programs = Storage.getPrograms();
    const p = programs.find(x => x.id === id);
    if (!p) return;
    const currentWeek = p.currentWeek || 1;
    if (currentWeek < p.weeks) {
      Storage.updateProgram(id, { currentWeek: currentWeek + 1 });
      App.toast(`Advanced to Week ${currentWeek + 1}! 📈`, 'success');
    } else {
      App.toast('Program complete! 🎉 Time for a new cycle!', 'success');
      Storage.updateProgram(id, { currentWeek: 1 });
    }
    render();
  }

  function addDefault(index) {
    const template = DEFAULT_PROGRAMS[index];
    if (!template) return;
    const program = { ...template, currentWeek: 1 };
    Storage.addProgram(program);
    App.toast(`"${template.name}" added!`, 'success');
    render();
  }

  function remove(id) {
    App.confirm('Delete Program', 'This will permanently delete this program.', () => {
      Storage.deleteProgram(id);
      App.toast('Program deleted');
      render();
    });
  }

  function viewProgram(id) {
    const programs = Storage.getPrograms();
    const p = programs.find(x => x.id === id);
    if (!p) return;

    const modal = document.getElementById('modal-view-program');
    if (!modal) return;

    const unit = Settings.getSettings().unit;
    let html = `<h3 style="margin-bottom:var(--sp-md);">${p.name}</h3>`;
    html += `<p style="color:var(--text-secondary); margin-bottom:var(--sp-lg);">${p.weeks} weeks · ${p.days.length} day split · Currently on Week ${p.currentWeek || 1}</p>`;

    p.days.forEach((day, i) => {
      html += `<div style="margin-bottom:var(--sp-lg);">`;
      html += `<div style="font-weight:700; margin-bottom:var(--sp-sm); color:var(--text-primary);">Day ${i + 1}: ${day.name}</div>`;
      html += `<div class="data-list">`;
      day.exercises.forEach(ex => {
        const suggested = Storage.suggestWeight(ex.exercise, unit);
        html += `
          <div class="data-item" style="padding:8px 12px;">
            <div class="data-item-info">
              <div class="data-item-name" style="font-size:0.85rem;">${ex.exercise}</div>
              <div class="data-item-meta">${ex.sets}×${ex.reps} · <span class="muscle-tag ${ex.muscle}">${ex.muscle}</span></div>
            </div>
            ${suggested ? `<div style="font-size:0.8rem; color:var(--success); font-weight:600;">→ ${suggested}${unit}</div>` : ''}
          </div>
        `;
      });
      html += `</div></div>`;
    });

    html += `
      <div style="display:flex; gap:var(--sp-sm); margin-top:var(--sp-lg);">
        <button class="btn btn-primary" style="flex:1;" onclick="Programs.advanceWeek('${p.id}'); App.closeModal('modal-view-program');">Advance Week</button>
        <button class="btn btn-ghost" style="flex:1;" data-close="modal-view-program">Close</button>
      </div>
    `;

    document.getElementById('view-program-content').innerHTML = html;
    App.openModal('modal-view-program');
  }

  function init() {
    const btnAddPPL = document.getElementById('btn-add-ppl');
    if (btnAddPPL) btnAddPPL.addEventListener('click', () => addDefault(0));

    const btnAddUL = document.getElementById('btn-add-ul');
    if (btnAddUL) btnAddUL.addEventListener('click', () => addDefault(1));

    const btnAddFB = document.getElementById('btn-add-fb');
    if (btnAddFB) btnAddFB.addEventListener('click', () => addDefault(2));

    const btnAddBro = document.getElementById('btn-add-bro');
    if (btnAddBro) btnAddBro.addEventListener('click', () => addDefault(3));

    const btnCustom = document.getElementById('btn-custom-program');
    if (btnCustom) btnCustom.addEventListener('click', () => App.openModal('modal-custom-program'));

    const btnSaveCustom = document.getElementById('btn-save-custom-program');
    if (btnSaveCustom) btnSaveCustom.addEventListener('click', saveCustomProgram);

    const btnAddDay = document.getElementById('btn-add-day');
    if (btnAddDay) btnAddDay.addEventListener('click', addCustomDay);
  }

  let customDayCount = 1;

  function addCustomDay() {
    customDayCount++;
    const container = document.getElementById('custom-days-container');
    if (!container) return;
    const dayHTML = `
      <div class="custom-day-block" id="custom-day-${customDayCount}" style="background:var(--bg-card); padding:var(--sp-md); border-radius:var(--r-md); border:1px solid var(--border-glass); margin-bottom:var(--sp-md);">
        <div class="form-group">
          <label class="form-label">Day ${customDayCount} Name</label>
          <input type="text" class="form-input custom-day-name" placeholder="e.g. Chest & Triceps">
        </div>
        <div class="form-group">
          <label class="form-label">Exercises (one per line: Name, muscle, sets, reps)</label>
          <textarea class="form-input custom-day-exercises" rows="4" placeholder="Bench Press, chest, 4, 8&#10;Tricep Pushdown, arms, 3, 12"></textarea>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', dayHTML);
  }

  function saveCustomProgram() {
    const name = document.getElementById('custom-program-name').value.trim();
    const weeks = parseInt(document.getElementById('custom-program-weeks').value) || 4;
    if (!name) { App.toast('Enter a program name', 'error'); return; }

    const dayBlocks = document.querySelectorAll('.custom-day-block');
    const days = [];

    dayBlocks.forEach(block => {
      const dayName = block.querySelector('.custom-day-name').value.trim() || 'Unnamed Day';
      const rawEx = block.querySelector('.custom-day-exercises').value.trim();
      if (!rawEx) return;

      const exercises = rawEx.split('\n').filter(l => l.trim()).map(line => {
        const parts = line.split(',').map(s => s.trim());
        return {
          exercise: parts[0] || 'Unknown',
          muscle: (parts[1] || 'other').toLowerCase(),
          sets: parseInt(parts[2]) || 3,
          reps: parseInt(parts[3]) || 10
        };
      });
      if (exercises.length > 0) days.push({ name: dayName, exercises });
    });

    if (days.length === 0) { App.toast('Add at least one day with exercises', 'error'); return; }

    Storage.addProgram({ name, type: 'custom', weeks, currentWeek: 1, days });
    App.toast(`"${name}" created! 🎉`, 'success');
    App.closeModal('modal-custom-program');
    customDayCount = 1;
    render();
  }

  return { render, init, activate, deactivate, advanceWeek, addDefault, remove, viewProgram, logExercise, renderActiveProgram };
})();
