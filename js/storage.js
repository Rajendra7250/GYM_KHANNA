/* ===== GymKhanna Storage Module ===== */
const Storage = (() => {
  const KEYS = {
    workouts: 'gk_workouts',
    food: 'gk_food',
    weight: 'gk_weight',
    templates: 'gk_templates',
    water: 'gk_water',
    sessions: 'gk_sessions',
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
    if (w.id) {
      const idx = all.findIndex(x => x.id === w.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...w };
        _set(KEYS.workouts, all);
        return all[idx];
      }
    }
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

  // ===== WORKOUT TEMPLATES =====
  function getTemplates() { return _get(KEYS.templates); }
  function addTemplate(t) {
    const all = getTemplates();
    t.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    all.push(t);
    _set(KEYS.templates, all);
    return t;
  }
  function deleteTemplate(id) {
    const all = getTemplates().filter(x => x.id !== id);
    _set(KEYS.templates, all);
  }

  // ===== WEEKLY / ACTIVITY =====
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
    if (f.id) {
      const idx = all.findIndex(x => x.id === f.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...f };
        _set(KEYS.food, all);
        return all[idx];
      }
    }
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

  // ===== WEIGHT / MEASUREMENTS =====
  function getWeightLog() { return _get(KEYS.weight); }
  function addMeasurement(data) {
    const all = getWeightLog();
    const today = todayStr();
    const idx = all.findIndex(w => w.date === today);
    const entry = { ...data, date: today, timestamp: Date.now() };
    if (entry.weight !== undefined) entry.kg = entry.weight;
    
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...entry };
    } else {
      all.push(entry);
    }
    all.sort((a, b) => a.date.localeCompare(b.date));
    _set(KEYS.weight, all);
  }
  function getLatestWeight() {
    const all = getWeightLog();
    if (!all.length) return null;
    const latest = all[all.length - 1];
    return latest.weight || latest.kg || null;
  }
  function getLatestMeasurement() {
    const all = getWeightLog();
    return all.length ? all[all.length - 1] : null;
  }

  // ===== WATER TRACKER =====
  function getWaterLog() { return _get(KEYS.water); }
  function addWater(amount, ds) {
    const all = getWaterLog();
    const date = ds || todayStr();
    const idx = all.findIndex(w => w.date === date);
    if (idx >= 0) {
      all[idx].amount = (all[idx].amount || 0) + amount;
    } else {
      all.push({ date, amount, timestamp: Date.now() });
    }
    _set(KEYS.water, all);
  }
  function getWaterByDate(ds) {
    const all = getWaterLog();
    const entry = all.find(w => w.date === (ds || todayStr()));
    return entry ? entry.amount : 0;
  }

  // ===== WORKOUT SESSIONS =====
  function getSessions() { return _get(KEYS.sessions); }
  function addSession(session) {
    const all = getSessions();
    session.id = Date.now().toString(36);
    session.timestamp = Date.now();
    all.push(session);
    _set(KEYS.sessions, all);
    return session;
  }
  function getLatestSession() {
    const all = getSessions();
    return all.length ? all[all.length - 1] : null;
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
    getTemplates, addTemplate, deleteTemplate,
    getFood, addFood, deleteFood, getFoodByDate, getDailyNutrition,
    getWeightLog, addWeight, getLatestWeight,
    getStreak, getPersonalRecords, getTotalVolume, getTotalWorkouts,
    addMeasurement, getLatestMeasurement,
    getWaterLog, addWater, getWaterByDate,
    getSessions, addSession, getLatestSession,
  };
})();
