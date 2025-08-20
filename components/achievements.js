// Renders the Achievements panel and handles achievement unlock logic.
// Displays badges and achievement cards.

import { calculateXP } from './utils.js';

export async function renderAchievements() {
  const container = document.getElementById('achievements');
  container.innerHTML = '';

  const panel = document.createElement('section');
  panel.className = 'codex-panel';
  panel.id = 'achievementsPanel';
  container.appendChild(panel);

  try {
    // Try local first, fallback to fetch
    let achievements = [];
    if (localStorage.getItem('codexAchievements')) {
      achievements = JSON.parse(localStorage.getItem('codexAchievements'));
    } else {
      const res = await fetch('data/achievements.json');
      achievements = await res.json();
      // Optionally cache for future loads
      localStorage.setItem('codexAchievements', JSON.stringify(achievements));
    }

    const totalXP = typeof window.calculateXP === 'function'
      ? window.calculateXP(window.allZones || [])
      : calculateXP(window.allZones || []);

    // Unlock logic
    achievements = achievements.map(item => {
      if (item.unlockCondition === 'xp_50' && totalXP >= 50) item.unlocked = true;
      if (item.unlockCondition === 'xp_100' && totalXP >= 100) item.unlocked = true;
      if (item.unlockCondition === 'first_quest' && totalXP > 0) item.unlocked = true;
      return item;
    });

    achievements.sort((a, b) => {
      if (a.unlocked === b.unlocked) return 0;
      return a.unlocked ? -1 : 1;
    });

    if (!Array.isArray(achievements) || achievements.length === 0) {
      panel.innerHTML += `<p class="fallback">🏅 No achievements unlocked yet.</p>`;
      return;
    }

    achievements.forEach(item => {
      const card = document.createElement('section');
      card.className = 'achievement-card';
      if (item.unlocked) card.classList.add('unlocked');

      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = item.badge || '🏅';

      const title = document.createElement('h3');
      title.textContent = item.title;

      const desc = document.createElement('p');
      desc.textContent = item.description;

      card.appendChild(badge);
      card.appendChild(title);
      card.appendChild(desc);
      panel.appendChild(card);
    });
  } catch (err) {
    panel.innerHTML = `<p class="fallback">⚠️ Could not load achievements.</p>`;
    console.error('Error loading achievements:', err);
  }
}

// Expose for debugging if needed
window.renderAchievements = renderAchievements;