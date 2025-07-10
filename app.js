import { renderZones, renderLifeZones } from './components/zoneCard.js';
import { renderXPBar, renderZoneProgress } from './components/progressTracker.js';
import { renderAchievements } from './components/achievements.js';
import { renderProjectMap } from './components/projectMap.js';
import { renderArchive } from './components/archive.js';

let allZones = [];
let zonesReady = false;

// Tab Switching
function showPanel(panelId) {
  document.querySelectorAll('.codex-panel').forEach(panel => {
    panel.style.display = (panel.id === panelId) ? 'block' : 'none';
  });

  document.querySelectorAll('.tab-nav button').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.querySelector(`.tab-nav button[data-panel="${panelId}"]`)?.classList.add('selected');

  if (panelId === 'journal') renderJournal();
  if (panelId === 'zones') filterZone('all');
  if (panelId === 'achievements') renderAchievements();
  if (panelId === 'archive') renderArchive();
}

// Data Loaders
async function loadZones() {
  const res = await fetch('/data/zones.json');
  const zones = await res.json();

  // 🔧 TEMPORARY OVERRIDE TO FORCE ZONES.JSON LOAD
  allZones = zones;
  zonesReady = true;
  renderZones(allZones);
  saveToLocal(allZones);
  return allZones;
}

async function loadLifeZones(callback) {
  const res = await fetch('/data/lifeZones.json');
  const lifeZones = await res.json();
  callback ? callback(lifeZones) : renderLifeZones(lifeZones);
}

// Persistence
function saveToLocal(zones) {
  localStorage.setItem('codexProgress', JSON.stringify(zones));
}
function loadFromLocal() {
  const saved = localStorage.getItem('codexProgress');
  return saved ? JSON.parse(saved) : null;
}

// Quest Completion Toggle
function toggleQuest(zoneId, questId) {
  const zone = allZones.find(z => z.id === zoneId);
  if (!zone) return;

  const quest = zone.quests.find(q => q.id === questId);
  if (!quest) return;

  quest.completed = !quest.completed;
  saveToLocal(allZones);

  const currentPanel = document.querySelector('.codex-panel:not([style*="display: none"])')?.id;
  if (currentPanel === 'journal') {
    renderJournal();
  } else if (currentPanel === 'zones') {
    renderZones([zone]);
  }
}

// Quest Active Toggle
function toggleActive(zoneId, questId) {
  const zone = allZones.find(z => z.id === zoneId);
  if (!zone) return;

  const quest = zone.quests.find(q => q.id === questId);
  if (!quest) return;

  quest.active = !quest.active;
  saveToLocal(allZones);
  renderJournal();
}

// Priority Updater
function updatePriority(zoneId, questId, newPriority) {
  const zone = allZones.find(z => z.id === zoneId);
  if (!zone) return;

  const quest = zone.quests.find(q => q.id === questId);
  if (!quest) return;

  quest.priority = newPriority;
  saveToLocal(allZones);
  renderJournal();
}

// XP Math
function calculateXP(zones) {
  return zones.reduce((total, zone) => {
    return total + zone.quests.reduce((xp, q) => xp + (q.completed ? q.xp : 0), 0);
  }, 0);
}

// Journal Rendering
function renderJournal() {
  const journal = document.getElementById('journal');
  journal.innerHTML = '';

  const zones = allZones;
  const totalXP = calculateXP(zones);

  const xpHeader = document.createElement('h3');
  xpHeader.textContent = `Total XP: ${totalXP}`;
  journal.appendChild(xpHeader);

  const xpBar = renderXPBar(totalXP, 1000);
  journal.appendChild(xpBar);

  zones.forEach(zone => {
    const activeQuests = zone.quests.filter(q => q.active);
    if (activeQuests.length === 0) return;

    const card = document.createElement('section');
    card.className = 'zone-card';

    const title = document.createElement('h4');
    title.textContent = zone.title;
    card.appendChild(title);

    const progress = renderZoneProgress(zone);
    card.appendChild(progress);

    const priorities = {
      main: [],
      daily: [],
      side: [],
      optional: []
    };

    activeQuests.forEach(q => {
      priorities[q.priority || 'optional'].push(q);
    });

    // Sorted priority render
    ['main', 'daily', 'side', 'optional'].forEach(label => {
      const quests = priorities[label];
      if (quests.length > 0) {
        const header = document.createElement('h5');
        header.textContent = `${label.charAt(0).toUpperCase() + label.slice(1)} Quests`;
        card.appendChild(header);

        const list = document.createElement('ul');
        quests.forEach(q => {
          const li = document.createElement('li');
          li.innerHTML = `
            ${q.text} (+${q.xp} XP)
            <button onclick="toggleActive('${zone.id}', '${q.id}')">
              ${q.active ? '🟢 Active' : '⚫ Inactive'}
            </button>
            <select onchange="updatePriority('${zone.id}', '${q.id}', this.value)">
              <option value="main" ${q.priority === 'main' ? 'selected' : ''}>Main</option>
              <option value="daily" ${q.priority === 'daily' ? 'selected' : ''}>Daily</option>
              <option value="side" ${q.priority === 'side' ? 'selected' : ''}>Side</option>
              <option value="optional" ${q.priority === 'optional' ? 'selected' : ''}>Optional</option>
            </select>
          `;
          if (q.completed) li.classList.add('completed');
          list.appendChild(li);
        });

        card.appendChild(list);
      }
    });

    journal.appendChild(card);
  });
}

// Zone Filtering
async function filterZone(zoneId) {
  if (!zonesReady) await loadZones();

  const container = document.getElementById('zone-container');
  container.innerHTML = '';

  if (zoneId === 'all') return renderProjectMap();

  if (zoneId === 'core') {
    const coreZones = allZones.filter(z => z.type === 'core');
    return renderZones(coreZones);
  }

  if (zoneId === 'life') {
    return await loadLifeZones(z => {
      const lifeZones = z.filter(z => z.type === 'life');
      renderLifeZones(lifeZones);
    });
  }

  const matchCore = allZones.find(z => z.id === zoneId);
  if (matchCore) return renderZones([matchCore]);

  await loadLifeZones(z => {
    const matchLife = z.find(zone => zone.id === zoneId);
    if (matchLife) renderLifeZones([matchLife]);
  });
}

// Global Exposure
window.showPanel = showPanel;
window.filterZone = filterZone;
window.toggleQuest = toggleQuest;
window.toggleActive = toggleActive;
window.updatePriority = updatePriority;

// Launch App
(async function init() {
  await loadZones();
  await loadLifeZones();
})();
