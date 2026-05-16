/* ===== Progress Page ===== */
const Progress = (() => {

  function render() {
    // Stats
    const totalWorkouts = Storage.getTotalWorkouts();
    const totalVolume = Storage.getTotalVolume();
    const streak = Storage.getStreak();
    const latestWeight = Storage.getLatestWeight();
    const unit = Settings.getSettings().unit;

    const statsEl = document.getElementById('progress-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-card purple">
          <div class="stat-card-icon">🏋️</div>
          <div class="stat-card-value">${totalWorkouts}</div>
          <div class="stat-card-label">Total Exercises</div>
        </div>
        <div class="stat-card pink">
          <div class="stat-card-icon">📊</div>
          <div class="stat-card-value">${totalVolume > 0 ? (totalVolume / 1000).toFixed(1) + 'k' : '0'}</div>
          <div class="stat-card-label">Volume (${unit})</div>
        </div>
        <div class="stat-card cyan">
          <div class="stat-card-icon">⚖️</div>
          <div class="stat-card-value">${latestWeight !== null ? latestWeight + ' ' + unit : '—'}</div>
          <div class="stat-card-label">Current Weight</div>
        </div>
        <div class="stat-card fire">
          <div class="stat-card-icon">🔥</div>
          <div class="stat-card-value">${streak}</div>
          <div class="stat-card-label">Day Streak</div>
        </div>
      `;
    }

    // Weight chart
    renderWeightChart();

    // Body measurements chart
    renderMeasurementsChart();

    // Personal records
    renderPRs();
  }

  function renderWeightChart() {
    const weightLog = Storage.getWeightLog();
    const canvas = document.getElementById('chart-weight');
    if (!canvas) return;

    if (!weightLog.length) {
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
      ctx.fillText('Log your weight to see the trend chart', rect.width / 2, 100);
      return;
    }

    const data = weightLog.map(w => ({
      label: Storage.formatDate(w.date),
      value: w.kg,
    }));
    Charts.drawLineChart(canvas, data);
  }

  function renderPRs() {
    const prs = Storage.getPersonalRecords();
    const grid = document.getElementById('pr-grid');
    if (!grid) return;

    if (!prs.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🏆</div>
          <div class="empty-state-text">No personal records yet.<br>Log exercises with weight to track PRs!</div>
        </div>
      `;
      return;
    }

    let html = '';
    const unit = Settings.getSettings().unit;
    prs.forEach(pr => {
      html += `
        <div class="pr-card">
          <div class="pr-card-lift">${pr.exercise}</div>
          <div class="pr-card-value">${pr.weight}</div>
          <div class="pr-card-unit">${unit} × ${pr.reps} reps</div>
        </div>
      `;
    });
    grid.innerHTML = html;
  }


  function handleLogWeight() {
    const input = document.getElementById('weight-input');
    const val = parseFloat(input.value);
    if (!val || val <= 0) {
      App.toast('Please enter a valid weight');
      return;
    }
    Storage.addWeight(val);
    input.value = '';
    App.toast('Weight logged! ⚖️', 'success');
    render();
    Dashboard.render();
  }

  // ===== BODY MEASUREMENTS =====
  function renderMeasurementsChart() {
    const canvas = document.getElementById('chart-measurements');
    if (!canvas) return;
    const metric = document.getElementById('meas-metric-select');
    const key = metric ? metric.value : 'bodyfat';
    const labels = { bodyfat: 'Body Fat %', chest: 'Chest (cm)', waist: 'Waist (cm)', biceps: 'Biceps (cm)', thighs: 'Thighs (cm)' };

    const all = Storage.getMeasurements();
    const filtered = all.filter(m => m[key] != null && m[key] > 0);

    if (!filtered.length) {
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
      ctx.fillText(`Log measurements to see ${labels[key]} trend`, rect.width / 2, 100);
      return;
    }

    const data = filtered.map(m => ({
      label: Storage.formatDate(m.date),
      value: m[key],
    }));
    Charts.drawLineChart(canvas, data);
  }

  function handleSaveMeasurements() {
    const m = {
      bodyfat: parseFloat(document.getElementById('meas-bodyfat').value) || null,
      chest: parseFloat(document.getElementById('meas-chest').value) || null,
      waist: parseFloat(document.getElementById('meas-waist').value) || null,
      biceps: parseFloat(document.getElementById('meas-biceps').value) || null,
      thighs: parseFloat(document.getElementById('meas-thighs').value) || null,
    };
    if (!m.bodyfat && !m.chest && !m.waist && !m.biceps && !m.thighs) {
      App.toast('Enter at least one measurement');
      return;
    }
    Storage.addMeasurement(m);
    App.toast('Measurements saved! 📏', 'success');
    document.getElementById('measurements-form').style.display = 'none';
    render();
  }

  function init() {
    const btn = document.getElementById('btn-log-weight');
    if (btn) btn.addEventListener('click', handleLogWeight);

    const input = document.getElementById('weight-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleLogWeight();
        }
      });
    }

    // Measurements form toggle
    const btnMeas = document.getElementById('btn-log-measurements');
    if (btnMeas) {
      btnMeas.addEventListener('click', () => {
        const form = document.getElementById('measurements-form');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
      });
    }

    const btnSaveMeas = document.getElementById('btn-save-measurements');
    if (btnSaveMeas) btnSaveMeas.addEventListener('click', handleSaveMeasurements);

    const metricSel = document.getElementById('meas-metric-select');
    if (metricSel) metricSel.addEventListener('change', () => renderMeasurementsChart());
  }

  return { render, init };
})();
