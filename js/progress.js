/* ===== Progress Page ===== */
const Progress = (() => {

  function render() {
    // Stats
    const totalWorkouts = Storage.getTotalWorkouts();
    const totalVolume = Storage.getTotalVolume();
    const streak = Storage.getStreak();
    const latestWeight = Storage.getLatestWeight();
    const unit = Settings.getSettings().unit;

    const statsEl = document.getElementById('progress-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-card purple">
          <div class="stat-card-icon">🏋️</div>
          <div class="stat-card-value">${totalWorkouts}</div>
          <div class="stat-card-label">Total Exercises</div>
        </div>
        <div class="stat-card pink">
          <div class="stat-card-icon">📊</div>
          <div class="stat-card-value">${totalVolume > 0 ? (totalVolume / 1000).toFixed(1) + 'k' : '0'}</div>
          <div class="stat-card-label">Volume (${unit})</div>
        </div>
        <div class="stat-card cyan">
          <div class="stat-card-icon">⚖️</div>
          <div class="stat-card-value">${latestWeight !== null ? latestWeight + ' ' + unit : '—'}</div>
          <div class="stat-card-label">Current Weight</div>
        </div>
        <div class="stat-card fire">
          <div class="stat-card-icon">🔥</div>
          <div class="stat-card-value">${streak}</div>
          <div class="stat-card-label">Day Streak</div>
        </div>
      `;
    }

    // Weight chart
    renderWeightChart();

    // Body measurements chart
    renderMeasurementsChart();

    // Personal records
    renderPRs();

    // Progress Photos
    renderPhotos();
  }

  function renderWeightChart() {
    const weightLog = Storage.getWeightLog();
    const canvas = document.getElementById('chart-weight');
    if (!canvas) return;

    if (!weightLog.length) {
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = 200 * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = '200px';
      ctx.clearRect(0, 0, rect.width, 200);
      ctx.fillStyle = '#8a8a9a';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Log your weight to see the trend chart', rect.width / 2, 100);
      return;
    }

    const data = weightLog.map(w => ({
      label: Storage.formatDate(w.date),
      value: w.kg,
    }));
    Charts.drawLineChart(canvas, data);
  }

  function renderPRs() {
    const prs = Storage.getPersonalRecords();
    const grid = document.getElementById('pr-grid');
    if (!grid) return;

    if (!prs.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🏆</div>
          <div class="empty-state-text">No personal records yet.<br>Log exercises with weight to track PRs!</div>
        </div>
      `;
      return;
    }

    let html = '';
    const unit = Settings.getSettings().unit;
    prs.forEach((pr, i) => {
      html += `
        <div class="pr-card" id="pr-card-${i}" style="position:relative;">
          <div class="pr-card-lift">${pr.exercise}</div>
          <div class="pr-card-value">${pr.weight}</div>
          <div class="pr-card-unit">${unit} × ${pr.reps} reps</div>
          <button class="btn-icon" style="position:absolute; top:8px; right:8px; background:rgba(255,255,255,0.1); border-radius:50%; padding:6px;" onclick="Progress.sharePR('pr-card-${i}', '${pr.exercise}')" title="Share PR">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>
        </div>
      `;
    });
    grid.innerHTML = html;
  }


  function handleLogWeight() {
    const input = document.getElementById('weight-input');
    const val = parseFloat(input.value);
    if (!val || val <= 0) {
      App.toast('Please enter a valid weight');
      return;
    }
    Storage.addWeight(val);
    input.value = '';
    App.toast('Weight logged! ⚖️', 'success');
    render();
    Dashboard.render();
  }

  // ===== BODY MEASUREMENTS =====
  function renderMeasurementsChart() {
    const canvas = document.getElementById('chart-measurements');
    if (!canvas) return;
    const metric = document.getElementById('meas-metric-select');
    const key = metric ? metric.value : 'bodyfat';
    const labels = { bodyfat: 'Body Fat %', chest: 'Chest (cm)', waist: 'Waist (cm)', biceps: 'Biceps (cm)', thighs: 'Thighs (cm)' };

    const all = Storage.getMeasurements();
    const filtered = all.filter(m => m[key] != null && m[key] > 0);

    if (!filtered.length) {
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = 200 * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = '200px';
      ctx.clearRect(0, 0, rect.width, 200);
      ctx.fillStyle = '#8a8a9a';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Log measurements to see ${labels[key]} trend`, rect.width / 2, 100);
      return;
    }

    const data = filtered.map(m => ({
      label: Storage.formatDate(m.date),
      value: m[key],
    }));
    Charts.drawLineChart(canvas, data);
  }

  function handleSaveMeasurements() {
    const m = {
      bodyfat: parseFloat(document.getElementById('meas-bodyfat').value) || null,
      chest: parseFloat(document.getElementById('meas-chest').value) || null,
      waist: parseFloat(document.getElementById('meas-waist').value) || null,
      biceps: parseFloat(document.getElementById('meas-biceps').value) || null,
      thighs: parseFloat(document.getElementById('meas-thighs').value) || null,
    };
    if (!m.bodyfat && !m.chest && !m.waist && !m.biceps && !m.thighs) {
      App.toast('Enter at least one measurement');
      return;
    }
    Storage.addMeasurement(m);
    App.toast('Measurements saved! 📏', 'success');
    document.getElementById('measurements-form').style.display = 'none';
    render();
  }

  // ===== PROGRESS PHOTOS =====
  async function renderPhotos() {
    const photos = await PhotoDB.getPhotos();
    const gallery = document.getElementById('photo-gallery');
    const emptyState = document.getElementById('photo-empty');
    const compareBtn = document.getElementById('btn-compare-photos');
    if (!gallery || !emptyState) return;

    if (photos.length === 0) {
      gallery.style.display = 'none';
      emptyState.style.display = 'flex';
      if (compareBtn) compareBtn.style.display = 'none';
      return;
    }

    gallery.style.display = 'grid';
    emptyState.style.display = 'none';
    if (compareBtn) compareBtn.style.display = photos.length > 1 ? 'block' : 'none';

    let html = '';
    photos.forEach(p => {
      html += `
        <div style="position:relative; aspect-ratio:3/4; border-radius:var(--r-md); overflow:hidden; background:var(--bg-tertiary);">
          <img src="${p.data}" style="width:100%; height:100%; object-fit:cover;">
          <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); padding:4px 8px; font-size:0.75rem; text-align:center;">
            ${Storage.formatDate(p.date)}
          </div>
        </div>
      `;
    });
    gallery.innerHTML = html;

    // Populate compare selects
    const selBefore = document.getElementById('photo-select-before');
    const selAfter = document.getElementById('photo-select-after');
    if (selBefore && selAfter) {
      let optHtml = '';
      photos.forEach(p => { optHtml += `<option value="${p.id}">${Storage.formatDate(p.date)}</option>`; });
      
      const prevB = selBefore.value;
      const prevA = selAfter.value;
      selBefore.innerHTML = optHtml;
      selAfter.innerHTML = optHtml;
      
      if (photos.length > 1) {
        selBefore.value = prevB || photos[photos.length - 1].id;
        selAfter.value = prevA || photos[0].id;
      }
      updatePhotoComparison();
    }
  }

  async function updatePhotoComparison() {
    const photos = await PhotoDB.getPhotos();
    const idB = document.getElementById('photo-select-before').value;
    const idA = document.getElementById('photo-select-after').value;
    
    const pB = photos.find(p => p.id === idB);
    const pA = photos.find(p => p.id === idA);
    
    if (pB) document.getElementById('photo-img-before').src = pB.data;
    if (pA) document.getElementById('photo-img-after').src = pA.data;
  }

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Compress using Canvas
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800; // Limit size to 800px max dimension

        if (width > height && width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        } else if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export as WebP for smaller size
        const base64 = canvas.toDataURL('image/webp', 0.8);
        PhotoDB.savePhoto(base64).then(() => {
          App.toast('Progress photo saved!', 'success');
          renderPhotos();
        }).catch(err => {
          console.error(err);
          App.toast('Failed to save photo locally', 'error');
        });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset
  }

  // ===== SOCIAL SHARING =====
  async function sharePR(cardId, exerciseName) {
    if (!window.html2canvas) {
      App.toast('Please wait, sharing module is loading...', 'error');
      return;
    }
    
    // Get actual PR data
    const prs = Storage.getPersonalRecords();
    const pr = prs.find(p => p.exercise === exerciseName);
    if (!pr) return;
    
    const unit = Settings.getSettings().unit;
    
    // Populate the template
    document.getElementById('share-template-weight').textContent = `${pr.weight} ${unit}`;
    document.getElementById('share-template-exercise').textContent = `${pr.exercise} × ${pr.reps} reps`;
    
    const template = document.getElementById('share-pr-template');
    
    try {
      App.toast('Generating cute PR card...', 'success');
      const canvas = await html2canvas(template, { 
        backgroundColor: null,
        scale: 2 // High quality
      });
      
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `gymkhanna-pr-${exerciseName.replace(/ /g, '-')}.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `New PR for ${exerciseName}!`,
              text: `Just hit a new PR for ${exerciseName} on GymKhanna! 🔥💪`,
              files: [file]
            });
          } catch (err) {
            console.log('User canceled share', err);
          }
        } else {
          // Fallback: download the image
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
          App.toast('Image downloaded! (Web Share API not supported)');
        }
      });
    } catch (err) {
      App.toast('Failed to generate image', 'error');
      console.error(err);
    }
  }

  function init() {
    const btn = document.getElementById('btn-log-weight');
    if (btn) btn.addEventListener('click', handleLogWeight);

    const input = document.getElementById('weight-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleLogWeight();
        }
      });
    }

    // Measurements form toggle
    const btnMeas = document.getElementById('btn-log-measurements');
    if (btnMeas) {
      btnMeas.addEventListener('click', () => {
        const form = document.getElementById('measurements-form');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
      });
    }

    const btnSaveMeas = document.getElementById('btn-save-measurements');
    if (btnSaveMeas) btnSaveMeas.addEventListener('click', handleSaveMeasurements);

    const metricSel = document.getElementById('meas-metric-select');
    if (metricSel) metricSel.addEventListener('change', () => renderMeasurementsChart());

    // Progress Photos Handlers
    const photoUpload = document.getElementById('photo-upload');
    if (photoUpload) photoUpload.addEventListener('change', handlePhotoUpload);

    const btnCompare = document.getElementById('btn-compare-photos');
    if (btnCompare) btnCompare.addEventListener('click', () => App.openModal('modal-compare'));

    const selBefore = document.getElementById('photo-select-before');
    const selAfter = document.getElementById('photo-select-after');
    if (selBefore) selBefore.addEventListener('change', updatePhotoComparison);
    if (selAfter) selAfter.addEventListener('change', updatePhotoComparison);
  }

  return { render, init, sharePR };
})();
