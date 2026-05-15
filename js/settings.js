/* ===== Settings & Utilities Module ===== */
const Settings = (() => {
  const DEFAULT = {
    protein: 150, carbs: 250, fat: 65,
    unit: 'kg', theme: 'dark'
  };

  function getSettings() {
    try {
      return { ...DEFAULT, ...JSON.parse(localStorage.getItem('gk_settings')) };
    } catch { return DEFAULT; }
  }

  function saveSettings(s) {
    localStorage.setItem('gk_settings', JSON.stringify(s));
  }

  function render() {
    const s = getSettings();
    const pEl = document.getElementById('set-protein');
    if (pEl) pEl.value = s.protein;
    const cEl = document.getElementById('set-carbs');
    if (cEl) cEl.value = s.carbs;
    const fEl = document.getElementById('set-fat');
    if (fEl) fEl.value = s.fat;
    const uEl = document.getElementById('set-unit');
    if (uEl) uEl.value = s.unit;
  }

  function handleSave(e) {
    e.preventDefault();
    const s = {
      protein: parseInt(document.getElementById('set-protein').value) || 150,
      carbs: parseInt(document.getElementById('set-carbs').value) || 250,
      fat: parseInt(document.getElementById('set-fat').value) || 65,
      unit: document.getElementById('set-unit').value,
      theme: 'dark'
    };
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
    
    const btnExp = document.getElementById('btn-export');
    if (btnExp) btnExp.addEventListener('click', exportData);
    
    const fileImp = document.getElementById('file-import');
    if (fileImp) fileImp.addEventListener('change', importData);
    
    render();
  }

  return { init, render, getSettings };
})();
