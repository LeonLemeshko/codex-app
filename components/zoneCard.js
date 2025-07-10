// zoneCard.js
import { calculateXP } from './utils.js';

export function renderZones(zones) {
  const container = document.getElementById('zone-container');

  if (zones.length === 0) {
    container.innerHTML = `<p class="fallback">No core zones found.</p>`;
    return;
  }

  container.innerHTML = zones.map(zone => `
    <section id="${zone.id}">
      <h2>${zone.title}</h2>
      <p>${zone.description}</p>
      <ul>
        ${zone.quests.map(quest => `
          <li class="${quest.completed ? 'completed' : ''}">
            <label>
              <input type="checkbox"
                data-zone="${zone.id}"
                data-quest="${quest.id}"
                ${quest.completed ? 'checked' : ''}
              />
              ${quest.text} (+${quest.xp} XP)
            </label>
          </li>
        `).join('')}
      </ul>
    </section>
  `).join('');

  // Attach listeners after injection
  container.querySelectorAll('input[type="checkbox"]').forEach(box => {
    box.addEventListener('change', () => {
      const zoneId = box.getAttribute('data-zone');
      const questId = box.getAttribute('data-quest');
      window.toggleQuest(zoneId, questId);
    });
  });

  // Update XP counter
  document.getElementById('xp-counter').innerText = `XP: ${calculateXP(zones)}`;
}

export function renderLifeZones(zones) {
  const container = document.getElementById('zone-container');

  if (zones.length === 0) {
    container.innerHTML += `<p class="fallback">No life zones found.</p>`;
    return;
  }

  zones.forEach(zone => {
    const section = document.createElement('section');
    section.className = 'life-zone';

    const title = document.createElement('h2');
    title.textContent = zone.title;

    const mainQuest = document.createElement('p');
    mainQuest.className = 'main-quest';
    mainQuest.textContent = zone.mainQuest;

    const completedList = document.createElement('ul');
    completedList.innerHTML = (zone.objectives.completed || [])
      .map(obj => `<li class="completed">${obj}</li>`).join('');

    const activeList = document.createElement('ul');
    activeList.innerHTML = (zone.objectives.active || [])
      .map(obj => `<li class="active">${obj}</li>`).join('');

    const reward = document.createElement('p');
    reward.className = 'reward-box';
    reward.textContent = zone.reward;

    section.appendChild(title);
    section.appendChild(mainQuest);
    section.innerHTML += `<h4>Completed Objectives:</h4>`;
    section.appendChild(completedList);
    section.innerHTML += `<h4>Active Objectives:</h4>`;
    section.appendChild(activeList);
    section.appendChild(reward);

    container.appendChild(section);
  });
}
