export async function renderProjectMap() {
  const container = document.getElementById('zone-container');
  container.innerHTML = '';

  try {
    const res = await fetch('/data/projectZones.json');
    const zones = await res.json();

    zones.forEach(zone => {
      const section = document.createElement('section');
      section.className = 'life-zone';

      const title = document.createElement('h2');
      title.textContent = zone.title;

      const completed = document.createElement('ul');
      completed.innerHTML = zone.completed.map(item => `<li class="completed">${item}</li>`).join('');

      const inProgress = document.createElement('ul');
      inProgress.innerHTML = zone.inProgress.map(item => `<li class="active">${item}</li>`).join('');

      const upcoming = document.createElement('ul');
      upcoming.innerHTML = zone.upcoming.map(item => `<li>${item}</li>`).join('');

      section.appendChild(title);

      if (zone.completed.length) {
        section.innerHTML += `<h4>✅ Completed:</h4>`;
        section.appendChild(completed);
      }
      if (zone.inProgress.length) {
        section.innerHTML += `<h4>⏳ In Progress:</h4>`;
        section.appendChild(inProgress);
      }
      if (zone.upcoming.length) {
        section.innerHTML += `<h4>🔜 Upcoming:</h4>`;
        section.appendChild(upcoming);
      }

      container.appendChild(section);
    });
  } catch (err) {
    container.innerHTML = `<p class="fallback">Could not load project zones.</p>`;
    console.error('Error loading project zones:', err);
  }
}
