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

    const statsHTML = `
      <div class="stat-card purple">
        <div class="stat-card-icon">🏋️</div>
        <div class="stat-card-value">${todayWorkouts.length}</div>
        <div class="stat-card-label">Exercises Today</div>
      </div>
      <div class="stat-card pink">
        <div class="stat-card-icon">🔥</div>
        <div class="stat-card-value">${todayNutrition.calories.toLocaleString()}</div>
        <div class="stat-card-label">Calories Eaten</div>
      </div>
      <div class="stat-card cyan">
        <div class="stat-card-icon">⚡</div>
        <div class="stat-card-value">${totalVol > 0 ? (totalVol / 1000).toFixed(1) + 'k' : '0'}</div>
        <div class="stat-card-label">Volume (kg)</div>
      </div>
      <div class="stat-card fire">
        <div class="stat-card-icon">🔥</div>
        <div class="stat-card-value">${streak}</div>
        <div class="stat-card-label">Day Streak</div>
      </div>
    `;
    document.getElementById('dashboard-stats').innerHTML = statsHTML;

    // Weekly chart
    const weekly = Storage.getWeeklyActivity();
    Charts.drawBarChart(document.getElementById('chart-weekly'), weekly);
  }

  return { render };
})();
