/* ===== GymKhanna Charts Module ===== */
const Charts = (() => {
  const COLORS = {
    purple: '#888892',
    pink: '#6a6a78',
    cyan: '#a0a0b0',
    orange: '#7a7a88',
    green: '#6ec87a',
    grid: 'rgba(255,255,255,0.04)',
    text: '#888892',
    barGrad1: '#eaeaea',
    barGrad2: '#888892',
  };

  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = canvas.height * dpr || 220 * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = (canvas.height / dpr) + 'px';
    return { ctx, w: rect.width, h: canvas.height / dpr };
  }

  function drawBarChart(canvas, data) {
    if (!canvas || !data.length) return;
    const { ctx, w, h } = setupCanvas(canvas);
    const padL = 35, padR = 15, padT = 15, padB = 35;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const barW = Math.min(chartW / data.length * 0.55, 36);
    const gap = chartW / data.length;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    }

    // Y-axis labels
    ctx.fillStyle = COLORS.text;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i;
      const val = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillText(val, padL - 8, y + 4);
    }

    // Bars
    data.forEach((d, i) => {
      const x = padL + gap * i + (gap - barW) / 2;
      const barH = (d.value / maxVal) * chartH;
      const y = padT + chartH - barH;

      const grad = ctx.createLinearGradient(x, y, x, padT + chartH);
      grad.addColorStop(0, COLORS.barGrad1);
      grad.addColorStop(1, COLORS.barGrad2);
      ctx.fillStyle = grad;

      // Rounded top
      const r = Math.min(barW / 2, 6);
      ctx.beginPath();
      ctx.moveTo(x, padT + chartH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, padT + chartH);
      ctx.fill();

      // Glow
      ctx.shadowColor = COLORS.purple;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // X label
      ctx.fillStyle = Storage.isToday(d.date) ? '#f0f0f5' : COLORS.text;
      ctx.font = Storage.isToday(d.date) ? 'bold 11px Inter, sans-serif' : '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barW / 2, padT + chartH + 20);
    });
  }

  function drawLineChart(canvas, data) {
    if (!canvas || !data.length) return;
    const { ctx, w, h } = setupCanvas(canvas);
    const padL = 45, padR = 15, padT = 15, padB = 35;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    const vals = data.map(d => d.value);
    const minVal = Math.min(...vals) - 2;
    const maxVal = Math.max(...vals) + 2;
    const range = maxVal - minVal || 1;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = COLORS.text;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal - (range / 4) * i), padL - 8, y + 4);
    }

    if (data.length < 2) {
      ctx.fillStyle = COLORS.text;
      ctx.textAlign = 'center';
      ctx.fillText('Log more weight entries to see trend', w / 2, h / 2);
      return;
    }

    const gap = chartW / (data.length - 1);
    const points = data.map((d, i) => ({
      x: padL + gap * i,
      y: padT + chartH - ((d.value - minVal) / range) * chartH,
    }));

    // Area fill
    const areaGrad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    areaGrad.addColorStop(0, 'rgba(234,234,234,0.1)');
    areaGrad.addColorStop(1, 'rgba(234,234,234,0)');
    ctx.fillStyle = areaGrad;
    ctx.beginPath();
    ctx.moveTo(points[0].x, padT + chartH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padT + chartH);
    ctx.fill();

    // Line
    const lineGrad = ctx.createLinearGradient(padL, 0, w - padR, 0);
    lineGrad.addColorStop(0, COLORS.cyan);
    lineGrad.addColorStop(1, COLORS.purple);
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Dots
    points.forEach((p, i) => {
      ctx.fillStyle = i === points.length - 1 ? '#eaeaea' : 'rgba(234,234,234,0.5)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === points.length - 1 ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
      if (i === points.length - 1) {
        ctx.strokeStyle = 'rgba(234,234,234,0.2)';
        ctx.lineWidth = 6;
        ctx.stroke();
      }
    });

    // X labels (show first, last, mid)
    ctx.fillStyle = COLORS.text;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    const showIdx = data.length <= 7 ? data.map((_, i) => i) : [0, Math.floor(data.length / 2), data.length - 1];
    showIdx.forEach(i => {
      if (data[i]) ctx.fillText(data[i].label, points[i].x, padT + chartH + 18);
    });
  }

  function drawDonutChart(canvas, segments, centerText) {
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(cx, cy) - 20;
    const innerRadius = radius * 0.65;
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

    ctx.clearRect(0, 0, w, h);

    let startAngle = -Math.PI / 2;
    segments.forEach(seg => {
      const sliceAngle = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Center text
    if (centerText) {
      ctx.fillStyle = '#f0f0f5';
      ctx.font = 'bold 22px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(centerText, cx, cy + 3);
      ctx.fillStyle = COLORS.text;
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('kcal', cx, cy + 20);
    }
  }

  function drawEmptyState(canvas, msg) {
    const { ctx, w, h } = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = COLORS.text;
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(msg, w / 2, h / 2);
  }

  return { drawBarChart, drawLineChart, drawDonutChart, drawEmptyState };
})();
