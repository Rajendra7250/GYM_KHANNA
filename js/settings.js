/* ===== Settings & Utilities Module ===== */
const Settings = (() => {
  const DEFAULT = {
    calories: 2500, protein: 150, carbs: 250, fat: 65,
    waterGoal: 3000, unit: 'kg', theme: 'dark',
    restTimers: { chest: 90, back: 90, legs: 120, shoulders: 90, arms: 60, core: 60, cardio: 0, other: 90 }
  };

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#ededf0' : '#1a1a1e';
    const toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.checked = theme === 'light';
  }

  function getSettings() {
    try {
      return { ...DEFAULT, ...JSON.parse(localStorage.getItem('gk_settings')) };
    } catch { return DEFAULT; }
  }

  function saveSettings(s) {
    localStorage.setItem('gk_settings', JSON.stringify(s));
    if (window.Auth) Auth.queueSync();
  }

  function render() {
    const s = getSettings();
    const calEl = document.getElementById('set-calories');
    if (calEl) calEl.value = s.calories;
    const pEl = document.getElementById('set-protein');
    if (pEl) pEl.value = s.protein;
    const cEl = document.getElementById('set-carbs');
    if (cEl) cEl.value = s.carbs;
    const fEl = document.getElementById('set-fat');
    if (fEl) fEl.value = s.fat;
    const wgEl = document.getElementById('set-water-goal');
    if (wgEl) wgEl.value = s.waterGoal || 3000;
    const uEl = document.getElementById('set-unit');
    if (uEl) uEl.value = s.unit;
    applyTheme(s.theme || 'dark');

    // Rest Timers
    if (s.restTimers) {
      ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'other'].forEach(m => {
        const el = document.getElementById('timer-' + m);
        if (el) el.value = s.restTimers[m];
      });
    }
  }

  function handleSaveTimers(e) {
    e.preventDefault();
    const s = getSettings();
    s.restTimers = {
      chest: parseInt(document.getElementById('timer-chest').value) || 90,
      back: parseInt(document.getElementById('timer-back').value) || 90,
      legs: parseInt(document.getElementById('timer-legs').value) || 120,
      shoulders: parseInt(document.getElementById('timer-shoulders').value) || 90,
      arms: parseInt(document.getElementById('timer-arms').value) || 60,
      core: parseInt(document.getElementById('timer-core').value) || 60,
      cardio: parseInt(document.getElementById('timer-cardio').value) || 0,
      other: parseInt(document.getElementById('timer-other').value) || 90,
    };
    saveSettings(s);
    App.toast("Rest timers saved!", "success");
  }

  function handleSave(e) {
    e.preventDefault();
    const s = {
      calories: parseInt(document.getElementById('set-calories').value) || 2500,
      protein: parseInt(document.getElementById('set-protein').value) || 150,
      carbs: parseInt(document.getElementById('set-carbs').value) || 250,
      fat: parseInt(document.getElementById('set-fat').value) || 65,
      waterGoal: parseInt(document.getElementById('set-water-goal').value) || 3000,
      unit: document.getElementById('set-unit').value,
      theme: getSettings().theme || 'dark'
    };
    
    // Preserve restTimers
    const oldSettings = getSettings();
    if (oldSettings.restTimers) s.restTimers = oldSettings.restTimers;
    saveSettings(s);
    App.toast("Settings saved!", "success");
    // Re-render pages
    Nutrition.render();
    Progress.render();
    Workouts.render();
  }

  function exportData() {
    const data = {
      workouts: Storage.getWorkouts(),
      food: Storage.getFood(),
      weight: Storage.getWeightLog(),
      settings: getSettings()
    };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gymkhanna_backup_${Storage.todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    App.toast("Data exported successfully!", "success");
  }

  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.workouts) localStorage.setItem('gk_workouts', JSON.stringify(data.workouts));
        if (data.food) localStorage.setItem('gk_food', JSON.stringify(data.food));
        if (data.weight) localStorage.setItem('gk_weight', JSON.stringify(data.weight));
        if (data.settings) localStorage.setItem('gk_settings', JSON.stringify(data.settings));
        
        App.toast("Data restored successfully!", "success");
        setTimeout(() => location.reload(), 1000);
      } catch (err) {
        App.toast("Invalid backup file.", "danger");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  }

  function init() {
    const form = document.getElementById('form-settings');
    if (form) form.addEventListener('submit', handleSave);

    const timerForm = document.getElementById('form-timers');
    if (timerForm) timerForm.addEventListener('submit', handleSaveTimers);
    
    const btnExp = document.getElementById('btn-export');
    if (btnExp) btnExp.addEventListener('click', exportData);
    
    const fileImp = document.getElementById('file-import');
    if (fileImp) fileImp.addEventListener('change', importData);

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('change', () => {
        const theme = themeToggle.checked ? 'light' : 'dark';
        const s = getSettings();
        s.theme = theme;
        saveSettings(s);
        applyTheme(theme);
      });
    }

    // Apply saved theme immediately
    applyTheme(getSettings().theme || 'dark');
    render();
  }

  return { init, render, getSettings };
})();
