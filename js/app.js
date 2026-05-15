/* ===== GymKhanna App Controller ===== */
const App = (() => {
  // Navigation
  function navigateTo(page) {
    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    // Update sidebar nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    // Update bottom nav
    document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.remove('active'));
    const bottomItem = document.querySelector(`.bottom-nav-item[data-page="${page}"]`);
    if (bottomItem) bottomItem.classList.add('active');

    // Render relevant page
    switch (page) {
      case 'dashboard': Dashboard.render(); break;
      case 'workouts': Workouts.render(); break;
      case 'nutrition': Nutrition.render(); break;
      case 'progress': Progress.render(); break;
    }
  }

  // Modal helpers
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }
  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }

  // Toast notifications
  function toast(message, type = '') {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast' + (type ? ' ' + type : '');
    t.textContent = message;
    container.appendChild(t);
    setTimeout(() => { if (t.parentElement) t.remove(); }, 3000);
  }

  // Initialize app
  function init() {
    // Sidebar nav clicks
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(item.dataset.page);
      });
    });

    // Bottom nav clicks
    document.querySelectorAll('.bottom-nav-item[data-page]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(item.dataset.page);
      });
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close[data-close]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
    });

    // Quick actions
    const qaWorkout = document.getElementById('qa-workout');
    if (qaWorkout) qaWorkout.addEventListener('click', () => openModal('modal-workout'));
    const qaFood = document.getElementById('qa-food');
    if (qaFood) qaFood.addEventListener('click', () => openModal('modal-food'));

    // Add buttons
    const btnAddWorkout = document.getElementById('btn-add-workout');
    if (btnAddWorkout) btnAddWorkout.addEventListener('click', () => openModal('modal-workout'));
    const btnAddFood = document.getElementById('btn-add-food');
    if (btnAddFood) btnAddFood.addEventListener('click', () => openModal('modal-food'));

    // Init sub-modules
    Workouts.init();
    Nutrition.init();
    Progress.init();

    // Render dashboard
    Dashboard.render();

    // Handle window resize for charts
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const activePage = document.querySelector('.page.active');
        if (activePage) {
          const pageId = activePage.id.replace('page-', '');
          navigateTo(pageId);
        }
      }, 250);
    });
  }

  // Start when DOM is ready
  document.addEventListener('DOMContentLoaded', init);

  return { navigateTo, openModal, closeModal, toast };
})();
