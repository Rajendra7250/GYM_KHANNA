/* ===== GymKhanna Storage Module ===== */
const Storage = (() => {
  const KEYS = {
    workouts: 'gk_workouts',
    food: 'gk_food',
    weight: 'gk_weight',
  };

  function _get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  }
  function _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    if (window.Auth) Auth.queueSync();
  }

  // Date helpers
  function todayStr() { return new Date().toISOString().slice(0, 10); }
  function dateStr(d) { return d.toISOString().slice(0, 10); }
  function formatDate(str) {
    const d = new Date(str + 'T00:00:00');
    const opts = { weekday: 'short', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', opts);
  }
  function isToday(str) { return str === todayStr(); }

  // ===== WORKOUTS =====
  function getWorkouts() { return _get(KEYS.workouts); }
  function addWorkout(w) {
    const all = getWorkouts();
    w.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    w.date = w.date || todayStr();
    w.timestamp = Date.now();
    all.unshift(w);
    _set(KEYS.workouts, all);
    return w;
  }
  function deleteWorkout(id) {
    const all = getWorkouts().filter(w => w.id !== id);
    _set(KEYS.workouts, all);
  }
  function getTodayWorkouts() { return getWorkouts().filter(w => w.date === todayStr()); }
  function getWorkoutsByDate(dateStr) { return getWorkouts().filter(w => w.date === dateStr); }

  // Group workouts by date
  function getWorkoutsGrouped() {
    const all = getWorkouts();
    const groups = {};
    all.forEach(w => {
      if (!groups[w.date]) groups[w.date] = [];
      groups[w.date].push(w);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }

  // Weekly workout counts (last 7 days)
  function getWeeklyActivity() {
    const all = getWorkouts();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = dateStr(d);
      const count = all.filter(w => w.date === ds).length;
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({ label: dayLabel, value: count, date: ds });
    }
    return days;
  }

  // ===== FOOD =====
  function getFood() { return _get(KEYS.food); }
  function addFood(f) {
    const all = getFood();
    f.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    f.date = f.date || todayStr();
    f.timestamp = Date.now();
    all.unshift(f);
    _set(KEYS.food, all);
    return f;
  }
  function deleteFood(id) {
    const all = getFood().filter(f => f.id !== id);
    _set(KEYS.food, all);
  }
  function getFoodByDate(ds) {
    return getFood().filter(f => f.date === (ds || todayStr()));
  }
  function getDailyNutrition(ds) {
    const foods = getFoodByDate(ds);
    return {
      calories: foods.reduce((s, f) => s + (f.calories || 0), 0),
      protein: foods.reduce((s, f) => s + (f.protein || 0), 0),
      carbs: foods.reduce((s, f) => s + (f.carbs || 0), 0),
      fat: foods.reduce((s, f) => s + (f.fat || 0), 0),
      count: foods.length,
    };
  }

  // ===== WEIGHT =====
  function getWeightLog() { return _get(KEYS.weight); }
  function addWeight(kg) {
    const all = getWeightLog();
    const today = todayStr();
    const idx = all.findIndex(w => w.date === today);
    if (idx >= 0) { all[idx].kg = kg; }
    else { all.push({ date: today, kg, timestamp: Date.now() }); }
    all.sort((a, b) => a.date.localeCompare(b.date));
    _set(KEYS.weight, all);
  }
  function getLatestWeight() {
    const all = getWeightLog();
    return all.length ? all[all.length - 1].kg : null;
  }

  // ===== STATS =====
  function getStreak() {
    const allDates = new Set([
      ...getWorkouts().map(w => w.date),
      ...getFood().map(f => f.date),
    ]);
    let streak = 0;
    const d = new Date();
    while (true) {
      const ds = dateStr(d);
      if (allDates.has(ds)) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  }

  function getPersonalRecords() {
    const all = getWorkouts();
    const prs = {};
    all.forEach(w => {
      if (!w.weight || w.weight <= 0) return;
      const key = w.exercise;
      if (!prs[key] || w.weight > prs[key].weight) {
        prs[key] = { exercise: w.exercise, weight: w.weight, date: w.date, reps: w.reps };
      }
    });
    return Object.values(prs).sort((a, b) => b.weight - a.weight);
  }

  function getTotalVolume() {
    return getWorkouts().reduce((s, w) => s + (w.sets || 0) * (w.reps || 0) * (w.weight || 0), 0);
  }

  function getTotalWorkouts() { return getWorkouts().length; }

  return {
    todayStr, dateStr, formatDate, isToday,
    getWorkouts, addWorkout, deleteWorkout, getTodayWorkouts, getWorkoutsByDate, getWorkoutsGrouped, getWeeklyActivity,
    getFood, addFood, deleteFood, getFoodByDate, getDailyNutrition,
    getWeightLog, addWeight, getLatestWeight,
    getStreak, getPersonalRecords, getTotalVolume, getTotalWorkouts,
  };
})();
