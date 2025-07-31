import { calculateXP } from './utils.js';

export async function renderAchievements() {
  const container = document.getElementById('achievements');
  container.innerHTML = '';

  const panel = document.createElement('section');
  panel.className = 'codex-panel';
  panel.id = 'achievementsPanel';
  container.appendChild(panel);

  try {
    const res = await fetch('./data/achievements.json');
    let achievements = await res.json();

    const totalXP = calculateXP(window.allZones || []);

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
