/* ===== Dashboard Page ===== */
const Dashboard = (() => {
  const quotes = [
    "The only bad workout is the one that didn't happen. 💪",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "Strive for progress, not perfection.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "No shortcuts. Just hard work and dedication. 🔥",
    "Champions are made when no one is watching.",
    "Be stronger than your excuses.",
    "Discipline is choosing what you want most over what you want now.",
  ];

  function render() {
    // Greeting
    const hour = new Date().getHours();
    let greet = 'Good evening';
    if (hour < 12) greet = 'Good morning';
    else if (hour < 17) greet = 'Good afternoon';
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('dashboard-greeting').textContent = `${greet}! ${q}`;

    // Stats
    const todayWorkouts = Storage.getTodayWorkouts();
    const todayNutrition = Storage.getDailyNutrition();
    const streak = Storage.getStreak();
    const totalVol = todayWorkouts.reduce((s, w) => s + (w.sets || 0) * (w.reps || 0) * (w.weight || 0), 0);
    const lastSession = Storage.getLastSession();
    const waterMl = Storage.getWaterByDate();

    function fmtDur(ms) {
      if (!ms) return '--';
      const s = Math.floor(ms / 1000);
      const m = Math.floor(s / 60);
      return m + ' min';
    }

    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer) return;
    
    // Initial skeleton render
    if (!statsContainer.dataset.loaded) {
      statsContainer.innerHTML = `
        <div class="stat-card skeleton" style="height:120px;"></div>
        <div class="stat-card skeleton" style="height:120px;"></div>
        <div class="stat-card skeleton" style="height:120px;"></div>
        <div class="stat-card skeleton" style="height:120px;"></div>
      `;
    }

    const statsHTML = `
      <div class="stat-card purple">
        <div class="stat-card-icon">🏋️</div>
        <div class="stat-card-value" data-anim-value="${todayWorkouts.length}">0</div>
        <div class="stat-card-label">Exercises Today</div>
      </div>
      <div class="stat-card pink">
        <div class="stat-card-icon">🔥</div>
        <div class="stat-card-value" data-anim-value="${todayNutrition.calories}">0</div>
        <div class="stat-card-label">Calories Eaten</div>
      </div>
      <div class="stat-card cyan">
        <div class="stat-card-icon">⚡</div>
        <div class="stat-card-value" data-anim-value="${totalVol > 0 ? (totalVol / 1000).toFixed(1) : '0'}">0</div>
        <div class="stat-card-label">Volume (kg)</div>
      </div>
      <div class="stat-card fire">
        <div class="stat-card-icon">🔥</div>
        <div class="stat-card-value" style="display:flex; align-items:center; gap:8px;">
          <span data-anim-value="${streak}">0</span>
          ${streak >= 100 ? '<span title="100-Day Streak" style="font-size:1.2rem; animation:badgePulse 2s infinite;">🥇</span>' : 
            streak >= 30 ? '<span title="30-Day Streak" style="font-size:1.2rem; animation:badgePulse 2s infinite;">🥈</span>' : 
            streak >= 7 ? '<span title="7-Day Streak" style="font-size:1.2rem; animation:badgePulse 2s infinite;">🥉</span>' : ''}
        </div>
        <div class="stat-card-label">Day Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">⏱️</div>
        <div class="stat-card-value">${fmtDur(lastSession ? lastSession.duration : 0)}</div>
        <div class="stat-card-label">Last Session</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">💧</div>
        <div class="stat-card-value" data-anim-value="${waterMl > 0 ? (waterMl/1000).toFixed(1) : '0'}">0</div>
        <div class="stat-card-label">Water Today (L)</div>
      </div>
    `;

    // Apply real data after a tiny delay for effect if first load
    setTimeout(() => {
      statsContainer.innerHTML = statsHTML;
      statsContainer.dataset.loaded = 'true';
      
      statsContainer.querySelectorAll('[data-anim-value]').forEach(el => {
        const val = parseFloat(el.dataset.animValue);
        if (!isNaN(val)) App.animateNumber(el, val);
      });
    }, statsContainer.dataset.loaded ? 0 : 300);

    // Weekly chart
    const weekly = Storage.getWeeklyActivity();
    Charts.drawBarChart(document.getElementById('chart-weekly'), weekly);

    // Heatmap
    renderHeatmap();
  }

  function renderHeatmap() {
    const container = document.getElementById('heatmap-container');
    if (!container) return;

    const workouts = Storage.getWorkouts();
    const activity = {}; // ds -> count
    workouts.forEach(w => {
      activity[w.date] = (activity[w.date] || 0) + 1;
    });

    // On mobile, show fewer weeks so it fits without overflow
    const isMobile = window.innerWidth <= 480;
    const numWeeks = isMobile ? 16 : 52;
    const boxSize = isMobile ? 10 : 14;
    const gap = isMobile ? 2 : 4;

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (numWeeks * 7));
    // Back to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let html = `<div style="display:flex; gap:${gap}px;">`;
    let current = new Date(startDate);
    
    // Fill weeks
    const weeks = [];
    let currentWeek = [];
    while (current <= today) {
      const ds = Storage.dateStr(current);
      currentWeek.push({ date: ds, count: activity[ds] || 0 });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      current.setDate(current.getDate() + 1);
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    weeks.forEach(week => {
      html += `<div style="display:flex; flex-direction:column; gap:${gap}px;">`;
      week.forEach(day => {
        let intensity = 0;
        if (day.count > 0) intensity = 1;
        if (day.count > 2) intensity = 2;
        if (day.count > 4) intensity = 3;
        if (day.count > 6) intensity = 4;
        
        const color = intensity === 0 ? 'rgba(255,255,255,0.05)' :
                      intensity === 1 ? 'rgba(136,136,146, 0.4)' :
                      intensity === 2 ? 'rgba(136,136,146, 0.7)' :
                      intensity === 3 ? 'rgba(234,234,234, 0.7)' :
                      '#eaeaea';
        
        html += `<div class="heatmap-box" style="width:${boxSize}px; height:${boxSize}px; border-radius:2px; background:${color}; transition:transform 0.2s; cursor:pointer;" title="${Storage.formatDate(day.date)}: ${day.count} exercises"></div>`;
      });
      html += '</div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
  }

  return { render };
})();
