/* ===== Nutrition Page ===== */
const Nutrition = (() => {
  let currentDate = new Date();

  function getDateStr() {
    return Storage.dateStr(currentDate);
  }

  function updateDateLabel() {
    const label = document.getElementById('food-date-label');
    if (!label) return;
    if (Storage.isToday(getDateStr())) {
      label.textContent = 'Today';
    } else {
      label.textContent = Storage.formatDate(getDateStr());
    }
  }

  function render() {
    updateDateLabel();
    const ds = getDateStr();
    const nutrition = Storage.getDailyNutrition(ds);
    const foods = Storage.getFoodByDate(ds);

    // Nutrition stats
    const statsEl = document.getElementById('nutrition-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-card pink">
          <div class="stat-card-icon">🔥</div>
          <div class="stat-card-value">${nutrition.calories.toLocaleString()}</div>
          <div class="stat-card-label">Calories</div>
        </div>
        <div class="stat-card cyan">
          <div class="stat-card-icon">🥩</div>
          <div class="stat-card-value">${nutrition.protein.toFixed(1)}g</div>
          <div class="stat-card-label">Protein</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-card-icon">🍚</div>
          <div class="stat-card-value">${nutrition.carbs.toFixed(1)}g</div>
          <div class="stat-card-label">Carbs</div>
        </div>
        <div class="stat-card fire">
          <div class="stat-card-icon">🥑</div>
          <div class="stat-card-value">${nutrition.fat.toFixed(1)}g</div>
          <div class="stat-card-label">Fat</div>
        </div>
      `;
    }

    // Macro bars
    const settings = Settings.getSettings();
    const goals = { protein: settings.protein, carbs: settings.carbs, fat: settings.fat };
    const macroEl = document.getElementById('macro-bars');
    if (macroEl) {
      macroEl.innerHTML = `
        <div class="macro-row">
          <div class="macro-label">Protein</div>
          <div class="macro-track"><div class="macro-fill protein" style="width: ${Math.min((nutrition.protein / goals.protein) * 100, 100)}%"></div></div>
          <div class="macro-value">${nutrition.protein.toFixed(0)}g</div>
        </div>
        <div class="macro-row">
          <div class="macro-label">Carbs</div>
          <div class="macro-track"><div class="macro-fill carbs" style="width: ${Math.min((nutrition.carbs / goals.carbs) * 100, 100)}%"></div></div>
          <div class="macro-value">${nutrition.carbs.toFixed(0)}g</div>
        </div>
        <div class="macro-row">
          <div class="macro-label">Fat</div>
          <div class="macro-track"><div class="macro-fill fat" style="width: ${Math.min((nutrition.fat / goals.fat) * 100, 100)}%"></div></div>
          <div class="macro-value">${nutrition.fat.toFixed(0)}g</div>
        </div>
      `;
    }

    // Food list
    const listEl = document.getElementById('food-list');
    if (!listEl) return;

    if (!foods.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🍽️</div>
          <div class="empty-state-text">No food logged for this day.<br>Track your meals to hit your macros!</div>
          <button class="btn btn-primary" onclick="App.openModal('modal-food')">Add Food</button>
        </div>
      `;
      return;
    }

    let html = '<div class="data-list">';
    const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

    meals.forEach(meal => {
      const mealFoods = foods.filter(f => (f.meal || 'Snack') === meal);
      if (mealFoods.length === 0) return;

      html += `<div class="date-group-header" style="margin-top:var(--sp-md);">${meal}</div>`;

      mealFoods.forEach(f => {
        html += `
          <div class="data-item">
            <div class="data-item-icon" style="background:rgba(255,255,255,0.05)">🍗</div>
            <div class="data-item-info">
              <div class="data-item-name">${f.name}</div>
              <div class="data-item-meta">
                P: ${f.protein || 0}g &nbsp; C: ${f.carbs || 0}g &nbsp; F: ${f.fat || 0}g
              </div>
            </div>
            <div class="data-item-value">${(f.calories || 0).toLocaleString()} kcal</div>
            <div class="data-item-actions">
              <button class="btn-icon" onclick="Nutrition.remove('${f.id}')" title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          </div>
        `;
      });
    });
    html += '</div>';
    listEl.innerHTML = html;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('food-name').value.trim();
    if (!name) { App.toast('Please enter a food name'); return; }

    Storage.addFood({
      name,
      meal: document.getElementById('food-meal') ? document.getElementById('food-meal').value : 'Snack',
      calories: parseFloat(document.getElementById('food-calories').value) || 0,
      protein: parseFloat(document.getElementById('food-protein').value) || 0,
      carbs: parseFloat(document.getElementById('food-carbs').value) || 0,
      fat: parseFloat(document.getElementById('food-fat').value) || 0,
      date: getDateStr(),
    });

    document.getElementById('form-food').reset();
    App.closeModal('modal-food');
    App.toast('Food logged! 🍗', 'success');
    render();
    Dashboard.render();
  }

  function remove(id) {
    Storage.deleteFood(id);
    render();
    Dashboard.render();
    App.toast('Food entry removed');
  }

  function initPresetSync() {
    const preset = document.getElementById('food-preset');
    if (!preset) return;
    preset.addEventListener('change', () => {
      if (!preset.value) return;
      try {
        const data = JSON.parse(preset.value);
        document.getElementById('food-name').value = data.n || '';
        document.getElementById('food-calories').value = data.c || '';
        document.getElementById('food-protein').value = data.p || '';
        document.getElementById('food-carbs').value = data.cb || '';
        document.getElementById('food-fat').value = data.f || '';
      } catch (err) {
        console.warn('Preset parse error', err);
      }
    });
  }

  function init() {
    const form = document.getElementById('form-food');
    if (form) form.addEventListener('submit', handleSubmit);

    // Date navigation
    const prevBtn = document.getElementById('food-prev-day');
    const nextBtn = document.getElementById('food-next-day');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        render();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        render();
      });
    }

    initPresetSync();
  }

  return { render, init, remove };
})();
