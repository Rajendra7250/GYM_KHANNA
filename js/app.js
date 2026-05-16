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
      case 'workouts': Workouts.render(); Programs.renderActiveProgram(); break;
      case 'nutrition': Nutrition.render(); break;
      case 'progress': Progress.render(); break;
      case 'analytics': Analytics.render(); Programs.render(); break;
      case 'settings': Settings.render(); break;
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
  function toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.2rem;">${icon}</span>
        <span style="flex:1;">${message}</span>
        <button class="toast-close" style="background:none; border:none; color:inherit; cursor:pointer; padding:4px; font-size:1.1rem; opacity:0.7;">✕</button>
      </div>
      <div class="toast-progress" style="height:3px; background:rgba(255,255,255,0.3); position:absolute; bottom:0; left:0; width:100%; transform-origin:left; animation: toastProgress 3s linear forwards;"></div>
    `;
    
    const closeBtn = t.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => t.remove());

    container.appendChild(t);
    haptic('light'); // haptic feedback for toast
    setTimeout(() => { if (t.parentElement) t.remove(); }, 3000);
  }

  // Haptics
  function haptic(style = 'light') {
    if (!navigator.vibrate) return;
    try {
      if (style === 'light') navigator.vibrate(15);
      if (style === 'heavy') navigator.vibrate([30, 50, 30, 50, 50]);
    } catch (e) {}
  }

  // Number Animation
  function animateNumber(element, finalValue, duration = 800) {
    if (!element) return;
    const startValue = 0;
    let startTime = null;
    
    // Check if value has a decimal
    const isFloat = finalValue % 1 !== 0;
    
    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = startValue + (finalValue - startValue) * easeProgress;
      
      element.textContent = isFloat ? currentVal.toFixed(1) : Math.floor(currentVal);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = finalValue; // Ensure exact final
      }
    }
    window.requestAnimationFrame(step);
  }

  // Confirmation Dialog
  function confirm(title, msg, onConfirm) {
    const modal = document.getElementById('modal-confirm');
    if (!modal) return;
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-msg').textContent = msg;

    const btnYes = document.getElementById('confirm-btn-yes');
    // Remove old listeners to prevent multiple fires
    const newBtnYes = btnYes.cloneNode(true);
    btnYes.parentNode.replaceChild(newBtnYes, btnYes);

    newBtnYes.addEventListener('click', () => {
      closeModal('modal-confirm');
      if (onConfirm) onConfirm();
    });

    openModal('modal-confirm');
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
    Auth.init();
    Settings.init();
    Timer.init();
    Workouts.init();
    Nutrition.init();
    Progress.init();
    Analytics.init();
    Programs.init();
    AI.init();

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

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => console.log('SW setup failed', err));
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      } else if (e.key.toLowerCase() === 'w') {
        openModal('modal-workout');
      } else if (e.key.toLowerCase() === 'f') {
        openModal('modal-food');
      }
    });

    // Global Button Haptics
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn') || e.target.closest('.btn-icon') || e.target.closest('.quick-action')) {
        haptic('light');
      }
    });

    // Onboarding Carousel
    if (!localStorage.getItem('gk_onboarded')) {
      openModal('modal-onboarding');
      let currentSlide = 1;
      const nextBtn = document.getElementById('btn-onboarding-next');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          document.getElementById(`onboarding-slide-${currentSlide}`).classList.remove('active');
          document.getElementById(`dot-${currentSlide}`).classList.remove('active');
          currentSlide++;
          if (currentSlide <= 3) {
            document.getElementById(`onboarding-slide-${currentSlide}`).classList.add('active');
            document.getElementById(`dot-${currentSlide}`).classList.add('active');
            if (currentSlide === 3) nextBtn.textContent = "Let's Go!";
          } else {
            localStorage.setItem('gk_onboarded', 'true');
            closeModal('modal-onboarding');
          }
        });
      }
    }

    // Global Swipe-to-Delete
    let touchStartX = 0;
    let touchCurrentX = 0;
    let activeSwipeElement = null;

    document.addEventListener('touchstart', e => {
      const swipeContent = e.target.closest('.swipe-content');
      if (!swipeContent) return;
      activeSwipeElement = swipeContent;
      touchStartX = e.touches[0].clientX;
      swipeContent.style.transition = 'none';
    }, { passive: true });

    document.addEventListener('touchmove', e => {
      if (!activeSwipeElement) return;
      touchCurrentX = e.touches[0].clientX;
      const diff = touchCurrentX - touchStartX;
      if (diff < 0) { // Only allow swiping left
        // Add resistance
        const translate = Math.max(diff, -100);
        activeSwipeElement.style.transform = `translateX(${translate}px)`;
      }
    }, { passive: true });

    document.addEventListener('touchend', e => {
      if (!activeSwipeElement) return;
      activeSwipeElement.style.transition = 'transform 0.2s ease';
      const diff = touchCurrentX - touchStartX;
      
      if (diff < -80) { // Threshold reached
        activeSwipeElement.style.transform = `translateX(-100%)`;
        const btnDelete = activeSwipeElement.parentElement.querySelector('.swipe-action-delete');
        if (btnDelete) btnDelete.click();
      } else {
        activeSwipeElement.style.transform = `translateX(0)`;
      }
      activeSwipeElement = null;
    });
  }

  // Start when DOM is ready
  document.addEventListener('DOMContentLoaded', init);

  return {
    init, navigateTo, openModal, closeModal, toast, confirm, haptic, animateNumber
  };
})();
