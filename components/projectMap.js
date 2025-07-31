export async function renderProjectMap() {
  const container = document.getElementById('zone-container');
  container.innerHTML = '';

  try {
    const res = await fetch('./data/projectZones.json');
    const zones = await res.json();

    zones.forEach(zone => {
      const section = document.createElement('section');
      section.className = 'codex-panel life-zone';

      const title = document.createElement('h2');
      title.textContent = zone.title;
      section.appendChild(title);

      if (zone.completed?.length) {
        const completedHeader = document.createElement('h4');
        completedHeader.textContent = '✅ Completed:';
        section.appendChild(completedHeader);

        const completedList = document.createElement('ul');
        completedList.innerHTML = zone.completed
          .map(item => `<li class="completed">${item}</li>`)
          .join('');
        section.appendChild(completedList);
      }

      if (zone.inProgress?.length) {
        const progressHeader = document.createElement('h4');
        progressHeader.textContent = '⏳ In Progress:';
        section.appendChild(progressHeader);

        const progressList = document.createElement('ul');
        progressList.innerHTML = zone.inProgress
          .map(item => `<li class="active">${item}</li>`)
          .join('');
        section.appendChild(progressList);
      }

      if (zone.upcoming?.length) {
        const upcomingHeader = document.createElement('h4');
        upcomingHeader.textContent = '🔜 Upcoming:';
        section.appendChild(upcomingHeader);

        const upcomingList = document.createElement('ul');
        upcomingList.innerHTML = zone.upcoming
          .map(item => `<li>${item}</li>`)
          .join('');
        section.appendChild(upcomingList);
      }

      const divider = document.createElement('div');
      divider.className = 'zone-break glow';
      section.appendChild(divider);

      container.appendChild(section);
    });
  } catch (err) {
    container.innerHTML = `<p class="fallback">⚠️ Could not load project zones.</p>`;
    console.error('Error loading project zones:', err);
  }
}
