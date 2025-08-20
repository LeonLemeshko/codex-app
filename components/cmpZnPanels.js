// Renders quest panels for Campaign Zone: 
// Core Quests, Personal Journey, Realms, Daily Ritual, Guild Campaigns.
// Handles quest card UI, completion toggles, and Add to Journal button logic.

import { calculateXP } from './utils.js';

// 🔷 Renders main campaign and custom realms
export function renderRealms(realms) {
  const container = document.getElementById('realm-container');
  container.innerHTML = '';

  if (!realms || realms.length === 0) {
    container.innerHTML = `<p class="fallback">No realms available.</p>`;
    return;
  }

  realms.forEach(realm => {
    const section = document.createElement('section');
    section.className = 'codex-panel';
    section.id = realm.id;

    const title = document.createElement('h2');
    title.textContent = realm.title;
    section.appendChild(title);

    const description = document.createElement('p');
    description.textContent = realm.description || '';
    section.appendChild(description);

    const questList = document.createElement('ul');
    questList.className = 'quest-list';

    realm.quests.forEach(q => {
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
              data-realm="${realm.id}"
              data-quest="${q.id}"
              ${q.completed ? 'checked' : ''}
            /> Mark Complete
          </label>
          ${!q.inJournal ? `<button class="add-to-journal" data-id="${q.id}">➕ Add to Journal</button>` : ''}
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
      const realmId = box.getAttribute('data-realm');
      const questId = box.getAttribute('data-quest');
      window.toggleQuest(realmId, questId);
    });
  });

  // ✅ Add to Journal button handler
  container.querySelectorAll('.add-to-journal').forEach(btn => {
    btn.addEventListener('click', () => {
      const questId = btn.getAttribute('data-id');
      window.addToJournalUniversal(questId);
      alert('Quest added to Journal!');
    });
  });

  document.getElementById('xp-counter').textContent = `XP: ${calculateXP(realms)}`;
}

// 🌱 Renders life realms with personal objectives
export function renderLifeRealms(realms) {
  const container = document.getElementById('realm-container');
  container.innerHTML = '';

  if (!realms || realms.length === 0) {
    container.innerHTML = `<p class="fallback">No life realms found.</p>`;
    return;
  }

  realms.forEach(realm => {
    const section = document.createElement('section');
    section.className = 'life-realm';

    const title = document.createElement('h2');
    title.textContent = realm.title;
    section.appendChild(title);

    const mainQuest = document.createElement('p');
    mainQuest.className = 'main-quest';
    mainQuest.textContent = realm.mainQuest || '';
    section.appendChild(mainQuest);

    const completedHeader = document.createElement('h4');
    completedHeader.textContent = 'Completed Objectives:';
    section.appendChild(completedHeader);

    const completedList = document.createElement('ul');
    completedList.innerHTML = (realm.objectives?.completed || [])
      .map(obj => `<li class="completed">${obj}</li>`).join('');
    section.appendChild(completedList);

    const activeHeader = document.createElement('h4');
    activeHeader.textContent = 'Active Objectives:';
    section.appendChild(activeHeader);

    const activeList = document.createElement('ul');
    activeList.innerHTML = (realm.objectives?.active || [])
      .map(obj => `<li class="active">${obj}</li>`).join('');
    section.appendChild(activeList);

    const reward = document.createElement('p');
    reward.className = 'reward-box';
    reward.textContent = realm.reward || '';
    section.appendChild(reward);

    container.appendChild(section);
  });
}

// 🚀 Renders personal journey quests
export function renderPersonalJourneyQuests(personalJourneyQuests) {
  console.log('Rendering Personal Journey Quests:', personalJourneyQuests); // <-- Add this line

  window.personalJourneyQuests = personalJourneyQuests;

  const container = document.getElementById('realm-container');
  container.innerHTML = '';

  if (!personalJourneyQuests || personalJourneyQuests.length === 0) {
    container.innerHTML = `<p class="fallback">No personal journey quests found.</p>`;
    return;
  }

  personalJourneyQuests.forEach(journey => {
    const section = document.createElement('section');
    section.className = 'personal-journey';

    // Title of the journey
    const title = document.createElement('h2');
    title.textContent = journey.title;
    section.appendChild(title);

    // Main quest description
    const mainQuest = document.createElement('p');
    mainQuest.className = 'main-quest';
    mainQuest.textContent = journey.mainQuest || '';
    section.appendChild(mainQuest);

    // Completed objectives header and list
    const completedHeader = document.createElement('h4');
    completedHeader.textContent = 'Completed Objectives:';
    section.appendChild(completedHeader);

    const completedList = document.createElement('ul');
    completedList.innerHTML = (journey.objectives?.completed || [])
      .map(obj => `<li class="completed">${typeof obj === 'object' ? obj.title : obj}</li>`).join('');
    section.appendChild(completedList);

    // Active objectives header and list
    const activeHeader = document.createElement('h4');
    activeHeader.textContent = 'Active Objectives:';
    section.appendChild(activeHeader);

    const activeList = document.createElement('ul');
    activeList.innerHTML = (journey.objectives?.active || [])
      .map(obj => `
        <li class="active">
          <strong>${obj.title}</strong>
          ${obj.inJournal
            ? `
              <span class="pending-badge">⏳ Progress Pending</span>
              <div class="progress-tracker">
                <div class="progress-bar" style="width:${obj.progress || 0}%"></div>
                <span class="progress-label">${obj.progress || 0}%</span>
              </div>
              <button class="retract-quest" data-journey="${journey.id}" data-obj="${obj.id}">↩️ Retract</button>
              <button class="restart-quest" data-journey="${journey.id}" data-obj="${obj.id}">🔄 Restart</button>
            `
            : `<button class="add-to-journal" data-journey="${journey.id}" data-obj="${obj.id}">➕ Add to Journal</button>`
          }
        </li>
      `).join('');
    section.appendChild(activeList);

    // Reward box
    const reward = document.createElement('p');
    reward.className = 'reward-box';
    reward.textContent = journey.reward || '';
    section.appendChild(reward);

    // Append the section to the container
    container.appendChild(section);
  });

  // Attach event listeners AFTER all sections are appended
  container.querySelectorAll('.add-to-journal').forEach(btn => {
    btn.onclick = function() {
      const journeyId = btn.getAttribute('data-journey');
      const objId = btn.getAttribute('data-obj');
      console.log('Add to Journal clicked:', journeyId, objId);
      window.addObjectiveToJournal(journeyId, objId);
      alert('Objective added to Journal!');
      renderPersonalJourneyQuests(window.personalJourneyQuests);
      window.renderJournal(); // <-- FIXED: no argument
    };
  });

  // Attach event listeners for Retract button
  container.querySelectorAll('.retract-quest').forEach(btn => {
    btn.onclick = function() {
      const journeyId = btn.getAttribute('data-journey');
      const objId = btn.getAttribute('data-obj');
      window.retractObjectiveFromJournal(journeyId, objId);
      renderPersonalJourneyQuests(window.personalJourneyQuests);
      window.renderJournal();
    };
  });

  // Attach event listeners for Restart button
  container.querySelectorAll('.restart-quest').forEach(btn => {
    btn.onclick = function() {
      const journeyId = btn.getAttribute('data-journey');
      const objId = btn.getAttribute('data-obj');
      window.restartObjective(journeyId, objId);
      renderPersonalJourneyQuests(window.personalJourneyQuests);
      window.renderJournal();
    };
  });
}