/* ===== Analytics Dashboard ===== */
const Analytics = (() => {
  const MUSCLE_COLORS = {
    chest: '#FF6B6B',
    back: '#4ECDC4',
    legs: '#45B7D1',
    shoulders: '#96CEB4',
    arms: '#FFEAA7',
    core: '#DDA0DD',
    cardio: '#98D8C8',
    other: '#888892',
  };

  function render() {
    renderMuscleDonut();
    renderVolumeChart();
    renderCaloriesChart();
    renderComparisonTable();
  }

  function renderMuscleDonut() {
    const canvas = document.getElementById('chart-muscle-dist');
    if (!canvas) return;

    const dist = Storage.getMuscleDistribution();
    const total = Object.values(dist).reduce((s, v) => s + v, 0);

    if (total === 0) {
      const container = canvas.parentElement;
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">Log workouts to see your muscle distribution!</div></div>';
      return;
    }

    const segments = Object.entries(dist)
      .sort((a, b) => b[1] - a[1])
      .map(([muscle, vol]) => ({
        label: muscle.charAt(0).toUpperCase() + muscle.slice(1),
        value: vol,
        color: MUSCLE_COLORS[muscle] || MUSCLE_COLORS.other,
        pct: ((vol / total) * 100).toFixed(1)
      }));

    Charts.drawDonutChart(canvas, segments, Math.round(total / 1000) + 'k');

    // Legend
    const legendEl = document.getElementById('muscle-legend');
    if (legendEl) {
      legendEl.innerHTML = segments.map(s => `
        <div style="display:flex; align-items:center; gap:8px; padding:6px 0;">
          <div style="width:12px; height:12px; border-radius:3px; background:${s.color}; flex-shrink:0;"></div>
          <span style="flex:1; font-size:0.85rem;">${s.label}</span>
          <span style="font-weight:600; font-size:0.85rem;">${s.pct}%</span>
        </div>
      `).join('');
    }
  }

  function renderVolumeChart() {
    const canvas = document.getElementById('chart-volume-trend');
    if (!canvas) return;

    const data = Storage.getVolumeOverTime(14);
    // Convert to kg for readability
    const chartData = data.map(d => ({ ...d, value: Math.round(d.value / 1000) }));

    if (chartData.every(d => d.value === 0)) {
      canvas.parentElement.innerHTML = '<div class="empty-state" style="height:200px;"><div class="empty-state-icon">📈</div><div class="empty-state-text">Start logging to see volume trends!</div></div>';
      return;
    }

    Charts.drawLineChart(canvas, chartData);
  }

  function renderCaloriesChart() {
    const canvas = document.getElementById('chart-cal-activity');
    if (!canvas) return;

    const calData = Storage.getCaloriesOverTime(14);
    const volData = Storage.getVolumeOverTime(14);

    // We'll draw calories as lines. If both are 0, show empty.
    if (calData.every(d => d.value === 0) && volData.every(d => d.value === 0)) {
      canvas.parentElement.innerHTML = '<div class="empty-state" style="height:200px;"><div class="empty-state-icon">🔥</div><div class="empty-state-text">Log meals and workouts to see correlation!</div></div>';
      return;
    }

    // Draw calories as the primary line
    Charts.drawLineChart(canvas, calData);

    // Overlay volume as bars on the same canvas (semi-transparent)
    const { ctx, w, h } = getCanvasInfo(canvas);
    if (!ctx) return;

    const padL = 45, padR = 15, padT = 15, padB = 35;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;
    const maxVol = Math.max(...volData.map(d => d.value), 1);
    const gap = chartW / volData.length;
    const barW = Math.min(gap * 0.4, 12);

    volData.forEach((d, i) => {
      const x = padL + gap * i + (gap - barW) / 2;
      const barH = (d.value / maxVol) * chartH * 0.3; // Only 30% height overlay
      const y = padT + chartH - barH;
      ctx.fillStyle = 'rgba(78, 205, 196, 0.25)';
      ctx.fillRect(x, y, barW, barH);
    });
  }

  function getCanvasInfo(canvas) {
    try {
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      return { ctx, w: rect.width, h: canvas.height / dpr };
    } catch { return {}; }
  }

  function renderComparisonTable() {
    const tableEl = document.getElementById('weekly-comparison-table');
    if (!tableEl) return;

    const weeks = Storage.getWeeklyComparison();

    let html = `
      <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
        <thead>
          <tr style="border-bottom:1px solid var(--border-glass);">
            <th style="text-align:left; padding:10px 8px; color:var(--text-secondary); font-weight:600;">Week</th>
            <th style="text-align:center; padding:10px 8px; color:var(--text-secondary); font-weight:600;">Days</th>
            <th style="text-align:right; padding:10px 8px; color:var(--text-secondary); font-weight:600;">Volume</th>
            <th style="text-align:right; padding:10px 8px; color:var(--text-secondary); font-weight:600;">Avg Cal</th>
          </tr>
        </thead>
        <tbody>
    `;

    weeks.forEach((w, i) => {
      const isThisWeek = i === 0;
      const avgCal = w.calories > 0 ? Math.round(w.calories / 7) : 0;
      const volK = w.volume > 0 ? (w.volume / 1000).toFixed(1) + 'k' : '0';

      // Compare with previous week
      let volChange = '';
      if (i < weeks.length - 1 && weeks[i + 1].volume > 0) {
        const diff = ((w.volume - weeks[i + 1].volume) / weeks[i + 1].volume * 100).toFixed(0);
        if (diff > 0) volChange = `<span style="color:var(--success); font-size:0.75rem;"> ↑${diff}%</span>`;
        else if (diff < 0) volChange = `<span style="color:var(--danger); font-size:0.75rem;"> ↓${Math.abs(diff)}%</span>`;
      }

      html += `
        <tr style="border-bottom:1px solid var(--border-glass); ${isThisWeek ? 'background:rgba(255,255,255,0.03);' : ''}">
          <td style="padding:10px 8px; ${isThisWeek ? 'font-weight:700;' : ''}">${isThisWeek ? '📍 This Week' : w.label}</td>
          <td style="text-align:center; padding:10px 8px;">${w.workoutDays}/7</td>
          <td style="text-align:right; padding:10px 8px; font-weight:600;">${volK}${volChange}</td>
          <td style="text-align:right; padding:10px 8px;">${avgCal}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    tableEl.innerHTML = html;
  }

  function init() {
    // Nothing to init at load time
  }

  return { render, init };
})();
