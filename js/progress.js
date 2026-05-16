/* ===== Progress Page ===== */
const Progress = (() => {
  let activeMetric = 'weight';

  function render() {
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

    renderProgressChart();
    renderPRs();
    prefillInputs();
  }

  function prefillInputs() {
    const latest = Storage.getLatestMeasurement();
    if (!latest) return;
    const fields = ['weight', 'bodyFat', 'chest', 'waist', 'biceps', 'thighs'];
    fields.forEach(f => {
      const input = document.getElementById(`measure-${f}`);
      if (input && latest[f]) input.value = latest[f];
    });
  }

  function renderProgressChart() {
    const log = Storage.getWeightLog();
    const canvas = document.getElementById('chart-progress');
    if (!canvas) return;

    if (!log.length) {
      Charts.drawEmptyState(canvas, 'Log your metrics to see trend charts');
      return;
    }

    const data = log.filter(entry => entry[activeMetric] !== undefined || (activeMetric === 'weight' && entry.kg !== undefined))
      .map(entry => ({
        label: Storage.formatDate(entry.date),
        value: entry[activeMetric] || entry.kg,
      }));

    if (!data.length) {
      Charts.drawEmptyState(canvas, `No data for ${activeMetric} yet`);
      return;
    }

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

  function handleLogMeasurements() {
    const data = {
      weight: parseFloat(document.getElementById('measure-weight').value),
      bodyFat: parseFloat(document.getElementById('measure-bodyFat').value),
      chest: parseFloat(document.getElementById('measure-chest').value),
      waist: parseFloat(document.getElementById('measure-waist').value),
      biceps: parseFloat(document.getElementById('measure-biceps').value),
      thighs: parseFloat(document.getElementById('measure-thighs').value),
    };

    // Remove undefined/NaN values
    Object.keys(data).forEach(key => {
      if (isNaN(data[key])) delete data[key];
    });

    if (Object.keys(data).length === 0) {
      App.toast('Please enter at least one measurement');
      return;
    }

    Storage.addMeasurement(data);
    App.toast('Measurements updated! 📊', 'success');
    render();
    Dashboard.render();
  }

  function init() {
    const btn = document.getElementById('btn-log-measurements');
    if (btn) btn.addEventListener('click', handleLogMeasurements);

    const selector = document.getElementById('metric-selector');
    if (selector) {
      selector.addEventListener('change', (e) => {
        activeMetric = e.target.value;
        renderProgressChart();
      });
    }
  }

  return { render, init };
})();
