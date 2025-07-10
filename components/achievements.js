export async function renderAchievements() {
  const container = document.getElementById('achievements');
  container.innerHTML = '';

  try {
    const res = await fetch('/data/achievements.json');
    const achievements = await res.json();

    achievements.forEach(item => {
      const card = document.createElement('section');
      card.className = 'achievement-card';

      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = item.badge;

      const title = document.createElement('h3');
      title.textContent = item.title;

      const desc = document.createElement('p');
      desc.textContent = item.description;

      card.appendChild(badge);
      card.appendChild(title);
      card.appendChild(desc);

      // Optional: Visual cue if unlocked
      if (item.unlocked) {
        card.classList.add('unlocked');
      }

      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p class="fallback">Could not load achievements.</p>`;
    console.error('Error loading achievements:', err);
  }
}
