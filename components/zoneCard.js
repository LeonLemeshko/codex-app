import { calculateXP } from './utils.js';

// 🔷 Renders main campaign and custom zones
export function renderZones(zones) {
  const container = document.getElementById('zone-container');
  container.innerHTML = '';

  if (!zones || zones.length === 0) {
    container.innerHTML = `<p class="fallback">No zones available.</p>`;
    return;
  }

  zones.forEach(zone => {
    const section = document.createElement('section');
    section.className = 'codex-panel';
    section.id = zone.id;

    const title = document.createElement('h2');
    title.textContent = zone.title;
    section.appendChild(title);

    const description = document.createElement('p');
    description.textContent = zone.description || '';
    section.appendChild(description);

    const questList = document.createElement('ul');
    questList.className = 'quest-list';

    zone.quests.forEach(q => {
      const li = document.createElement('li');
      li.className = 'quest-card';
      if (q.completed) li.classList.add('completed');
      if (q.active) li.classList.add('active');

      const statusIcon = q.completed
        ? '✅'
        : q.active
        ? '🟢'
        : '⚫';

      const repeatTag = q.repeatable ? `<span class="repeatable">🔁</span>` : '';
      const priorityTag = q.priority ? `<span class="priority">${q.priority}</span>` : '';

      li.innerHTML = `
        <div class="quest-line">
          ${statusIcon} <strong>${q.title || q.text}</strong> ${repeatTag}
          <span class="xp">(+${q.xp} XP)</span> ${priorityTag}
        </div>
        ${q.description ? `<p class="desc">${q.description}</p>` : ''}
        <div class="quest-actions">
          <label>
            <input type="checkbox"
              data-zone="${zone.id}"
              data-quest="${q.id}"
              ${q.completed ? 'checked' : ''}
            /> Mark Complete
          </label>
          <button class="add-to-journal" data-zone="${zone.id}" data-id="${q.id}">
            ➕ Add to Journal
          </button>
        </div>
      `;
      questList.appendChild(li);
    });

    section.appendChild(questList);
    container.appendChild(section);
  });

  // ✅ Completion toggles
  container.querySelectorAll('input[type="checkbox"]').forEach(box => {
    box.addEventListener('change', () => {
      const zoneId = box.getAttribute('data-zone');
      const questId = box.getAttribute('data-quest');
      window.toggleQuest(zoneId, questId);
    });
  });

  // ✅ Journal sync button
  container.querySelectorAll('.add-to-journal').forEach(btn => {
    btn.addEventListener('click', () => {
      const zoneId = btn.getAttribute('data-zone');
      const questId = btn.getAttribute('data-id');
      alert(`⚙️ Quest "${questId}" from zone "${zoneId}" added to Journal.`);
      // Expand logic if you add journal syncing later
    });
  });

  document.getElementById('xp-counter').textContent = `XP: ${calculateXP(zones)}`;
}

// 🌱 Renders life zones with personal objectives
export function renderLifeZones(zones) {
  const container = document.getElementById('zone-container');
  container.innerHTML = '';

  if (!zones || zones.length === 0) {
    container.innerHTML = `<p class="fallback">No life zones found.</p>`;
    return;
  }

  zones.forEach(zone => {
    const section = document.createElement('section');
    section.className = 'life-zone';

    const title = document.createElement('h2');
    title.textContent = zone.title;
    section.appendChild(title);

    const mainQuest = document.createElement('p');
    mainQuest.className = 'main-quest';
    mainQuest.textContent = zone.mainQuest || '';
    section.appendChild(mainQuest);

    const completedHeader = document.createElement('h4');
    completedHeader.textContent = 'Completed Objectives:';
    section.appendChild(completedHeader);

    const completedList = document.createElement('ul');
    completedList.innerHTML = (zone.objectives?.completed || [])
      .map(obj => `<li class="completed">${obj}</li>`).join('');
    section.appendChild(completedList);

    const activeHeader = document.createElement('h4');
    activeHeader.textContent = 'Active Objectives:';
    section.appendChild(activeHeader);

    const activeList = document.createElement('ul');
    activeList.innerHTML = (zone.objectives?.active || [])
      .map(obj => `<li class="active">${obj}</li>`).join('');
    section.appendChild(activeList);

    const reward = document.createElement('p');
    reward.className = 'reward-box';
    reward.textContent = zone.reward || '';
    section.appendChild(reward);

    container.appendChild(section);
  });
}
