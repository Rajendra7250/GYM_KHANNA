/* ===== Authentication & Sync Module ===== */
const Auth = (() => {
  let currentUser = null;
  let syncTimeout = null;

  function isMobile() {
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || window.innerWidth <= 768;
  }

  function init() {
    // Attach sidebar button (desktop)
    const btnAuth = document.getElementById('btn-auth');
    if (btnAuth) {
      btnAuth.addEventListener('click', handleAuthClick);
    }

    const setup = () => {
      const fb = window.FirebaseAPI;

      // Handle redirect result (mobile Google login returns here)
      if (fb.getRedirectResult) {
        fb.getRedirectResult(fb.auth).then((result) => {
          if (result && result.user) {
            App.closeModal('modal-auth');
          }
        }).catch(err => {
          console.error('Redirect auth error', err);
        });
      }

      fb.onAuthStateChanged(fb.auth, (user) => {
        currentUser = user;
        updateUI();
        if (user) {
          App.toast(`Welcome back, ${user.displayName || 'User'}!`, 'success');
          downloadCloudData();
        }
      });

      initAuthEvents();
    };

    if (window.FirebaseAPI) {
      setup();
    } else {
      window.addEventListener('firebase-ready', setup);
    }
  }

  function handleAuthClick(e) {
    if (e) e.preventDefault();
    try {
      if (currentUser) {
        const fb = window.FirebaseAPI;
        fb.signOut(fb.auth).then(() => {
          App.toast('Logged out successfully');
        });
      } else {
        App.openModal('modal-auth');
      }
    } catch(err) {
      alert("Error: " + err.message);
    }
  }

  function initAuthEvents() {
    const btnGoogle = document.getElementById('btn-login-google');
    if (btnGoogle) btnGoogle.addEventListener('click', () => {
      const fb = window.FirebaseAPI;
      const provider = new fb.GoogleAuthProvider();

      if (isMobile()) {
        // Use redirect on mobile — popups are blocked by mobile browsers
        fb.signInWithRedirect(fb.auth, provider);
      } else {
        // Use popup on desktop
        fb.signInWithPopup(fb.auth, provider)
          .then(() => App.closeModal('modal-auth'))
          .catch(err => { console.error('Auth error', err); App.toast('Google login failed', 'danger'); });
      }
    });

    const btnLogin = document.getElementById('btn-login-email');
    if (btnLogin) btnLogin.addEventListener('click', () => {
      const email = document.getElementById('auth-email').value;
      const pass = document.getElementById('auth-password').value;
      if (!email || !pass) return App.toast('Please enter email and password', 'danger');
      const fb = window.FirebaseAPI;
      fb.signInWithEmailAndPassword(fb.auth, email, pass)
        .then(() => { App.closeModal('modal-auth'); document.getElementById('form-auth').reset(); })
        .catch(err => App.toast(err.message.replace('Firebase: ', ''), 'danger'));
    });

    const btnSignup = document.getElementById('btn-signup-email');
    if (btnSignup) btnSignup.addEventListener('click', () => {
      const email = document.getElementById('auth-email').value;
      const pass = document.getElementById('auth-password').value;
      if (!email || !pass) return App.toast('Please enter email and password', 'danger');
      const fb = window.FirebaseAPI;
      fb.createUserWithEmailAndPassword(fb.auth, email, pass)
        .then(() => { App.closeModal('modal-auth'); document.getElementById('form-auth').reset(); })
        .catch(err => App.toast(err.message.replace('Firebase: ', ''), 'danger'));
    });
  }

  function updateUI() {
    // Update ALL auth buttons (desktop sidebar + mobile top bar)
    const buttons = [
      document.getElementById('btn-auth'),
      document.getElementById('btn-auth-mobile')
    ];

    buttons.forEach(btn => {
      if (!btn) return;
      if (currentUser) {
        const photo = currentUser.photoURL
          ? `<img src="${currentUser.photoURL}" style="width:24px; height:24px; border-radius:50%;">`
          : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        btn.innerHTML = `${photo} <span>Logout</span>`;
        btn.classList.add('logged-in');
      } else {
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> <span>Login</span>`;
        btn.classList.remove('logged-in');
      }
    });
  }

  async function downloadCloudData() {
    if (!currentUser) return;
    const fb = window.FirebaseAPI;
    try {
      const docRef = fb.doc(fb.db, 'users', currentUser.uid);
      const docSnap = await fb.getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.workouts) localStorage.setItem('gk_workouts', JSON.stringify(data.workouts));
        if (data.food) localStorage.setItem('gk_food', JSON.stringify(data.food));
        if (data.weight) localStorage.setItem('gk_weight', JSON.stringify(data.weight));
        if (data.settings) localStorage.setItem('gk_settings', JSON.stringify(data.settings));

        App.toast('Cloud data synced!', 'success');

        // Re-render everything
        Settings.render();
        Dashboard.render();
        Workouts.render();
        Nutrition.render();
        Progress.render();
      }
    } catch (err) {
      console.error('Error fetching cloud data', err);
    }
  }

  function queueSync() {
    if (!currentUser) return;
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(async () => {
      const fb = window.FirebaseAPI;
      const data = {
        workouts: Storage.getWorkouts(),
        food: Storage.getFood(),
        weight: Storage.getWeightLog(),
        settings: Settings.getSettings(),
        lastUpdated: Date.now()
      };
      try {
        const docRef = fb.doc(fb.db, 'users', currentUser.uid);
        await fb.setDoc(docRef, data);
        console.log('Cloud sync complete');
      } catch (err) {
        console.error('Error syncing to cloud', err);
      }
    }, 2000); // debounce 2s
  }

  return { init, queueSync, isUserLoggedIn: () => !!currentUser, handleAuthClick };
})();
