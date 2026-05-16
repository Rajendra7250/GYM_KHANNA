/* ===== GymKhanna Storage Module ===== */
const Storage = (() => {
  const KEYS = {
    workouts: 'gk_workouts',
    food: 'gk_food',
    weight: 'gk_weight',
    templates: 'gk_templates',
    measurements: 'gk_measurements',
    water: 'gk_water',
    sessions: 'gk_sessions',
    photos: 'gk_photos',
    programs: 'gk_programs',
    activeProgram: 'gk_active_program',
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

  // ===== BODY MEASUREMENTS =====
  function getMeasurements() { return _get(KEYS.measurements); }
  function addMeasurement(m) {
    const all = getMeasurements();
    m.date = m.date || todayStr();
    m.timestamp = Date.now();
    const idx = all.findIndex(x => x.date === m.date);
    if (idx >= 0) { all[idx] = { ...all[idx], ...m }; }
    else { all.push(m); }
    all.sort((a, b) => a.date.localeCompare(b.date));
    _set(KEYS.measurements, all);
  }

  // ===== WATER INTAKE =====
  function getWaterLog() { return _get(KEYS.water); }
  function getWaterByDate(ds) {
    const all = getWaterLog();
    const d = ds || todayStr();
    const entry = all.find(w => w.date === d);
    return entry ? entry.ml : 0;
  }
  function addWater(ml, ds) {
    const all = getWaterLog();
    const d = ds || todayStr();
    const idx = all.findIndex(w => w.date === d);
    if (idx >= 0) { all[idx].ml += ml; }
    else { all.push({ date: d, ml }); }
    _set(KEYS.water, all);
    return getWaterByDate(d);
  }

  // ===== WORKOUT SESSIONS =====
  function getSessions() { return _get(KEYS.sessions); }
  function addSession(s) {
    const all = getSessions();
    s.date = s.date || todayStr();
    all.unshift(s);
    _set(KEYS.sessions, all);
  }
  function getLastSession() {
    const all = getSessions();
    return all.length ? all[0] : null;
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



  // ===== PROGRAMS =====
  function getPrograms() { return _get(KEYS.programs); }
  function addProgram(p) {
    const all = getPrograms();
    p.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    p.createdAt = Date.now();
    all.push(p);
    _set(KEYS.programs, all);
    return p;
  }
  function updateProgram(id, updates) {
    const all = getPrograms();
    const idx = all.findIndex(p => p.id === id);
    if (idx !== -1) { all[idx] = { ...all[idx], ...updates }; _set(KEYS.programs, all); }
  }
  function deleteProgram(id) {
    _set(KEYS.programs, getPrograms().filter(p => p.id !== id));
    if (getActiveProgram() === id) setActiveProgram(null);
  }
  function getActiveProgram() {
    try { return JSON.parse(localStorage.getItem(KEYS.activeProgram)); } catch { return null; }
  }
  function setActiveProgram(id) {
    localStorage.setItem(KEYS.activeProgram, JSON.stringify(id));
  }

  // ===== ANALYTICS HELPERS =====
  function getMuscleDistribution() {
    const all = getWorkouts();
    const dist = {};
    all.forEach(w => {
      const m = w.muscle || 'other';
      const vol = (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
      dist[m] = (dist[m] || 0) + vol;
    });
    return dist;
  }

  function getVolumeOverTime(days = 30) {
    const all = getWorkouts();
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = dateStr(d);
      const dayWorkouts = all.filter(w => w.date === ds);
      const vol = dayWorkouts.reduce((s, w) => s + (w.sets || 0) * (w.reps || 0) * (w.weight || 0), 0);
      result.push({ date: ds, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: vol });
    }
    return result;
  }

  function getCaloriesOverTime(days = 30) {
    const allFood = getFood();
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = dateStr(d);
      const dayFood = allFood.filter(f => f.date === ds);
      const cals = dayFood.reduce((s, f) => s + (f.calories || 0), 0);
      result.push({ date: ds, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: cals });
    }
    return result;
  }

  function getWeeklyComparison() {
    const all = getWorkouts();
    const allFood = getFood();
    const weeks = [];
    for (let w = 0; w < 4; w++) {
      let totalVol = 0, totalCal = 0, workoutDays = new Set();
      for (let d = 0; d < 7; d++) {
        const dt = new Date(); dt.setDate(dt.getDate() - (w * 7 + d));
        const ds = dateStr(dt);
        const dayW = all.filter(x => x.date === ds);
        if (dayW.length > 0) workoutDays.add(ds);
        totalVol += dayW.reduce((s, x) => s + (x.sets || 0) * (x.reps || 0) * (x.weight || 0), 0);
        totalCal += allFood.filter(f => f.date === ds).reduce((s, f) => s + (f.calories || 0), 0);
      }
      const startD = new Date(); startD.setDate(startD.getDate() - (w * 7 + 6));
      const endD = new Date(); endD.setDate(endD.getDate() - (w * 7));
      weeks.push({
        label: `${startD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        volume: totalVol,
        calories: totalCal,
        workoutDays: workoutDays.size,
        weekNum: w
      });
    }
    return weeks;
  }

  function getExerciseHistory(exerciseName) {
    return getWorkouts().filter(w => w.exercise === exerciseName).sort((a, b) => a.timestamp - b.timestamp);
  }

  function suggestWeight(exerciseName, unit) {
    const history = getExerciseHistory(exerciseName);
    if (history.length === 0) return null;
    const last = history[history.length - 1];
    const increment = (unit === 'lbs') ? 5 : 2.5;
    // If they hit target reps, suggest increase
    if (last.reps >= 5) return last.weight + increment;
    return last.weight; // Same weight if reps were low
  }

  return {
    todayStr, dateStr, formatDate, isToday,
    getWorkouts, addWorkout, deleteWorkout, getTodayWorkouts, getWorkoutsByDate, getWorkoutsGrouped, getWeeklyActivity,
    getTemplates, addTemplate, deleteTemplate,
    getFood, addFood, deleteFood, getFoodByDate, getDailyNutrition,
    getWeightLog, addWeight, getLatestWeight,
    getMeasurements, addMeasurement,
    getWaterLog, getWaterByDate, addWater,
    getSessions, addSession, getLastSession,
    getStreak, getPersonalRecords, getTotalVolume, getTotalWorkouts,
    getPrograms, addProgram, updateProgram, deleteProgram, getActiveProgram, setActiveProgram,
    getMuscleDistribution, getVolumeOverTime, getCaloriesOverTime, getWeeklyComparison,
    getExerciseHistory, suggestWeight,
  };
})();
