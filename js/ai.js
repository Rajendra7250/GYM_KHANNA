/* ===== AI Workout Suggestions Module ===== */
const AI = (() => {
  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  function getApiKey() {
    return 'AIzaSyBSFJWxTsqzf2k2bSCRn7VagceBk9KeMbk';
  }

  async function callGemini(prompt) {
    const key = getApiKey();
    if (!key) {
      App.toast('Add your Gemini API key in Settings to use AI features', 'warning');
      return null;
    }

    try {
      const res = await fetch(`${GEMINI_URL}?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Gemini API error:', err);
        App.toast('AI request failed. Check your API key.', 'error');
        return null;
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
      console.error('AI fetch error:', err);
      App.toast('Could not reach AI service', 'error');
      return null;
    }
  }

  function buildContext() {
    const workouts = Storage.getWorkouts();
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = Storage.dateStr(d);
      const dayW = workouts.filter(w => w.date === ds);
      if (dayW.length > 0) {
        const muscles = [...new Set(dayW.map(w => w.muscle))];
        const vol = dayW.reduce((s, w) => s + (w.sets || 0) * (w.reps || 0) * (w.weight || 0), 0);
        last7Days.push(`${ds}: trained ${muscles.join(', ')} (volume: ${vol}kg)`);
      } else {
        last7Days.push(`${ds}: rest day`);
      }
    }

    const dist = Storage.getMuscleDistribution();
    const totalVol = Object.values(dist).reduce((s, v) => s + v, 0);
    const muscleBreakdown = Object.entries(dist)
      .sort((a, b) => b[1] - a[1])
      .map(([m, v]) => `${m}: ${totalVol > 0 ? ((v / totalVol) * 100).toFixed(0) : 0}%`)
      .join(', ');

    const weeklyComp = Storage.getWeeklyComparison();
    const volTrend = weeklyComp.map(w => `${w.label}: ${w.volume}kg vol, ${w.workoutDays} days`).join(' | ');

    return `
User's last 7 days of training:
${last7Days.join('\n')}

Overall muscle volume distribution: ${muscleBreakdown}

4-week volume trend: ${volTrend}

Unit preference: ${Settings.getSettings().unit}
    `.trim();
  }

  async function suggestMuscleGroup() {
    const container = document.getElementById('ai-suggestion-content');
    if (container) {
      container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);"><div style="font-size:2rem; margin-bottom:8px;">🤔</div>Thinking...</div>';
    }

    const context = buildContext();
    const prompt = `You are a personal fitness coach AI for the GymKhanna app. Based on the user's recent training history, suggest what muscle group they should train TODAY. Be specific and give a brief reason why.

${context}

Reply in this exact format (no markdown):
MUSCLE GROUP: [group name]
REASON: [1-2 sentences why]
SUGGESTED EXERCISES: [3-4 exercises with sets x reps, comma separated]
INTENSITY: [Light/Moderate/Heavy]`;

    const result = await callGemini(prompt);
    if (!result) {
      if (container) container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔑</div><div class="empty-state-text">Add your Gemini API key in Settings</div></div>';
      return;
    }

    if (container) {
      const lines = result.split('\n').filter(l => l.trim());
      let html = '<div style="display:flex; flex-direction:column; gap:12px;">';
      lines.forEach(line => {
        const [label, ...rest] = line.split(':');
        const value = rest.join(':').trim();
        if (label && value) {
          html += `
            <div>
              <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">${label.trim()}</div>
              <div style="font-weight:600;">${value}</div>
            </div>
          `;
        }
      });
      html += '</div>';
      container.innerHTML = html;
    }
  }

  async function suggestAlternatives(exerciseName) {
    const prompt = `You are a fitness coach. Suggest 4 alternative exercises for "${exerciseName}" that target the same muscles. For each, briefly explain why it's a good substitute.

Reply as a numbered list, each line format: "Exercise Name - reason"
Keep it concise, no markdown.`;

    const result = await callGemini(prompt);
    if (!result) return;

    App.toast('Alternatives loaded!', 'success');
    const modal = document.getElementById('modal-view-program');
    if (modal) {
      document.getElementById('view-program-content').innerHTML = `
        <h3 style="margin-bottom:var(--sp-md);">Alternatives for ${exerciseName}</h3>
        <div style="white-space:pre-line; line-height:1.8; color:var(--text-secondary);">${result}</div>
        <button class="btn btn-ghost" style="width:100%; margin-top:var(--sp-lg);" data-close="modal-view-program">Close</button>
      `;
      App.openModal('modal-view-program');
    }
  }

  async function checkDeload() {
    const container = document.getElementById('ai-deload-content');
    if (container) {
      container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);"><div style="font-size:2rem; margin-bottom:8px;">📊</div>Analyzing volume...</div>';
    }

    const context = buildContext();
    const prompt = `You are a sports science coach. Analyze this user's training data and determine if they need a deload week. Consider volume trends, training frequency, and recovery.

${context}

Reply in this exact format (no markdown):
STATUS: [Need Deload / Looking Good / Overreaching Warning]
ANALYSIS: [2-3 sentences analyzing their volume and recovery]
RECOMMENDATION: [Specific actionable advice, 2-3 sentences]`;

    const result = await callGemini(prompt);
    if (!result) {
      if (container) container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔑</div><div class="empty-state-text">Add your Gemini API key in Settings</div></div>';
      return;
    }

    if (container) {
      const lines = result.split('\n').filter(l => l.trim());
      let html = '<div style="display:flex; flex-direction:column; gap:12px;">';
      lines.forEach(line => {
        const [label, ...rest] = line.split(':');
        const value = rest.join(':').trim();
        if (label && value) {
          let icon = '';
          if (value.includes('Need Deload')) icon = '🔴';
          else if (value.includes('Warning') || value.includes('Overreaching')) icon = '🟡';
          else if (value.includes('Looking Good')) icon = '🟢';
          html += `
            <div>
              <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">${label.trim()}</div>
              <div style="font-weight:600;">${icon} ${value}</div>
            </div>
          `;
        }
      });
      html += '</div>';
      container.innerHTML = html;
    }
  }

  function init() {
    const btnSuggest = document.getElementById('btn-ai-suggest');
    if (btnSuggest) btnSuggest.addEventListener('click', suggestMuscleGroup);

    const btnDeload = document.getElementById('btn-ai-deload');
    if (btnDeload) btnDeload.addEventListener('click', checkDeload);
  }

  return { init, suggestMuscleGroup, suggestAlternatives, checkDeload };
})();
