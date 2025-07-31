import { renderZones, renderLifeZones } from './components/zoneCard.js';
import { renderXPBar, renderZoneProgress } from './components/progressTracker.js';
import { renderAchievements } from './components/achievements.js';
import { renderProjectMap } from './components/projectMap.js';
import { renderArchive } from './components/archive.js';

let allZones = [];
let zonesReady = false;
let loreEntries = [];
let loreLoaded = false;

function calculateXP(zones) {
  return zones.reduce((sum, zone) => {
    return sum + zone.quests.reduce((zSum, q) => zSum + (q.xp || 0), 0);
  }, 0);
}

function renderJournal() {
  const journal = document.getElementById('journal');
  journal.innerHTML = '';

  const wrapper = document.createElement('section');
  wrapper.className = 'codex-panel';
  wrapper.id = 'journalPanel';
  journal.appendChild(wrapper);

  const totalXP = calculateXP(allZones);

  const xpHeader = document.createElement('h3');
  xpHeader.textContent = `Total XP: ${totalXP}`;
  wrapper.appendChild(xpHeader);

  const xpBar = renderXPBar(totalXP, 1000);
  wrapper.appendChild(xpBar);

  allZones.forEach(zone => {
    const activeQuests = zone.quests.filter(q => q.active && !q.completed);
    const completedQuests = zone.quests.filter(q => q.completed);

    if (activeQuests.length === 0 && completedQuests.length === 0) return;

    const zoneBlock = document.createElement('section');
    zoneBlock.className = 'zone-card';

    const title = document.createElement('h4');
    title.textContent = zone.title;
    zoneBlock.appendChild(title);

    const progress = renderZoneProgress(zone);
    zoneBlock.appendChild(progress);

    // Active quests
    activeQuests.forEach(q => {
      const questCard = document.createElement('div');
      questCard.className = 'quest-card';
      questCard.innerHTML = `
        <strong>${q.title}</strong>
        <p>${q.description}</p>
        <p>XP: ${q.xp}</p>
        <button onclick="editQuest('${zone.id}', '${q.id}')">✏️ Edit</button>
        <button onclick="toggleActive('${zone.id}', '${q.id}')">🛑 Deactivate</button>
        <button onclick="toggleQuest('${zone.id}', '${q.id}')">✅ Mark Complete</button>
        <button onclick="deleteQuest('${zone.id}', '${q.id}')">🗑️ Delete</button>
      `;
      zoneBlock.appendChild(questCard);
    });

    // Completed quests
    completedQuests.forEach(q => {
      const questCard = document.createElement('div');
      questCard.className = 'quest-card completed';
      questCard.innerHTML = `
        <strong>${q.title}</strong>
        <p>${q.description}</p>
        <p>XP: ${q.xp}</p>
        <button onclick="editQuest('${zone.id}', '${q.id}')">✏️ Edit</button>
        <button onclick="toggleQuest('${zone.id}', '${q.id}')">☑️ Undo Complete</button>
        <button onclick="deleteQuest('${zone.id}', '${q.id}')">🗑️ Delete</button>
      `;
      zoneBlock.appendChild(questCard);
    });

    wrapper.appendChild(zoneBlock);
  });
}

function renderLore() {
  const container = document.getElementById('lore');
  container.innerHTML = ''; // Clear previous content

  const entries = Array.isArray(window.loreEntries)
    ? window.loreEntries
    : [];

  if (!entries.length) {
    container.innerHTML = '<p class="fallback">📭 No lore entries found.</p>';
    return;
  }

  entries.forEach(entry => {
    const card = document.createElement('section');
    card.className = 'lore-entry';

    const header = document.createElement('div');
    header.className = 'entry-header';

    const title = document.createElement('h3');
    title.textContent = entry.title || 'Untitled';
    header.appendChild(title);

    const date = document.createElement('small');
    date.className = 'entry-date';
    date.textContent = entry.date || '📅 Unknown Date';
    header.appendChild(date);

    card.appendChild(header);

    if (entry.tags?.length) {
      const tagWrapper = document.createElement('div');
      tagWrapper.className = 'tags';
      entry.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag';
        tagEl.textContent = tag;
        tagWrapper.appendChild(tagEl);
      });
      card.appendChild(tagWrapper);
    }

    const body = document.createElement('p');
    body.className = 'entry-body';
    body.textContent = entry.content || '';
    card.appendChild(body);

    container.appendChild(card);
  });
}

allZones.forEach(zone => {
  const activeQuests = zone.quests.filter(q => q.active && !q.completed);
  const completedQuests = zone.quests.filter(q => q.completed);

  // Skip zones with neither type of quest
  if (activeQuests.length === 0 && completedQuests.length === 0) return;

  const zoneBlock = document.createElement('section');
  zoneBlock.className = 'zone-card';

  const title = document.createElement('h4');
  title.textContent = zone.title;
  zoneBlock.appendChild(title);

  const progress = renderZoneProgress(zone);
  zoneBlock.appendChild(progress);

  // Render active quests
  activeQuests.forEach(q => {
    const questCard = document.createElement('div');
    questCard.className = 'quest-card';
    questCard.innerHTML = `
      <strong>${q.title}</strong>
      <p>${q.description}</p>
      <p>XP: ${q.xp}</p>
      <button onclick="editQuest('${zone.id}', '${q.id}')">✏️ Edit</button>
      <button onclick="toggleActive('${zone.id}', '${q.id}')">🛑 Deactivate</button>
      <button onclick="toggleQuest('${zone.id}', '${q.id}')">✅ Mark Complete</button>
      <button onclick="deleteQuest('${zone.id}', '${q.id}')">🗑️ Delete</button>
    `;
    zoneBlock.appendChild(questCard);
  });

  // Render completed quests
  completedQuests.forEach(q => {
    const questCard = document.createElement('div');
    questCard.className = 'quest-card completed';
    questCard.innerHTML = `
      <strong>${q.title}</strong>
      <p>${q.description}</p>
      <p>XP: ${q.xp}</p>
      <button onclick="editQuest('${zone.id}', '${q.id}')">✏️ Edit</button>
      <button onclick="toggleQuest('${zone.id}', '${q.id}')">☑️ Undo Complete</button>
      <button onclick="deleteQuest('${zone.id}', '${q.id}')">🗑️ Delete</button>
    `;
    zoneBlock.appendChild(questCard);
  });

  wrapper.appendChild(zoneBlock);
});

document.getElementById('questEditorForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const editingKey = this.dataset.editing;
  if (editingKey) {
    const [zoneId, questId] = editingKey.split(':');
    const zone = allZones.find(z => z.id === zoneId);
    const quest = zone?.quests.find(q => q.id === questId);

    if (quest) {
      quest.title = document.getElementById('questTitle').value.trim();
      quest.description = document.getElementById('questDescription').value.trim();
      quest.category = document.getElementById('questCategory').value;
      quest.xp = parseInt(document.getElementById('questXP').value);
      quest.priority = document.getElementById('questPriority').value;
      quest.status = document.getElementById('questStatus').value;
      quest.repeatable = document.getElementById('questRepeatable').checked;
      quest.zone = document.getElementById('questZone').value;
      quest.text = quest.title;

      saveToLocal(allZones);
      showPanel('journal'); // ✅ switched from renderJournal to showPanel
      updateXPTracker();
      alert(`✏️ Quest "${quest.title}" updated.`);
      this.reset();
      delete this.dataset.editing;
      return;
    }
  }

  const newQuest = {
    id: Date.now().toString(),
    title: document.getElementById('questTitle').value.trim(),
    description: document.getElementById('questDescription').value.trim(),
    category: document.getElementById('questCategory').value,
    xp: parseInt(document.getElementById('questXP').value),
    priority: document.getElementById('questPriority').value,
    status: document.getElementById('questStatus').value,
    repeatable: document.getElementById('questRepeatable').checked,
    zone: document.getElementById('questZone').value,
    completed: false,
    active: true,
    text: document.getElementById('questTitle').value.trim()
  };

  let zoneObj = allZones.find(z => z.title === newQuest.zone || z.id === newQuest.zone);
  if (!zoneObj) {
    zoneObj = {
      id: newQuest.zone,
      title: newQuest.zone,
      type: 'custom',
      quests: []
    };
    allZones.push(zoneObj);
  }

  zoneObj.quests.push(newQuest);
  saveToLocal(allZones);

  renderZones([zoneObj]);
  showPanel('journal'); // ✅ switched from renderJournal to showPanel
  updateXPTracker();

  alert(`✅ Quest "${newQuest.title}" added to ${newQuest.zone} (+${newQuest.xp} XP)`);
  this.reset();
});

function clearQuestForm() {
  document.getElementById('questEditorForm').reset();
}

function processSmartInput() {
  const input = document.getElementById('smartInput').value.trim();
  if (!input) return alert('⚠️ Please enter some text first.');

  const lines = input.split('\n').map(line => line.trim()).filter(Boolean);

  // Title & XP extraction
  const titleMatch = lines.find(line => line.toLowerCase().startsWith('title:'));
  const xpMatch = lines.find(line => line.toLowerCase().includes('xp'));
  const xpValue = xpMatch ? parseInt(xpMatch.match(/\d+/)?.[0] || '0') : 0;

  // Repeatable & status flags
  const repeatable = /repeatable|daily/i.test(input);
  const status = input.toLowerCase().includes('inactive') ? 'inactive' : 'active';

  // Priority
  const smartPriority =
    /urgent|now|must/i.test(input) ? 'high' :
    /soon|important/i.test(input) ? 'medium' :
    'low';

  // Zone guessing
  const zoneFromKeywords =
    /life|journal|reflection/i.test(input) ? 'Life' :
    /core|main|path/i.test(input) ? 'Projects' :
    /project|work|dev/i.test(input) ? 'Projects' : 'Core';

  // Category guessing
  let category = 'Main Quests';
  if (/ritual|morning|routine/i.test(input)) category = 'Daily Rituals';
  if (/guild|campaign|battle|faction/i.test(input)) category = 'Guild Campaigns';

  // Fill form fields
  document.getElementById('questTitle').value = titleMatch?.split(':')[1]?.trim() || lines[0];
  document.getElementById('questDescription').value = lines.slice(1).join(' ') || input;
  document.getElementById('questXP').value = xpValue;
  document.getElementById('questPriority').value = smartPriority;
  document.getElementById('questZone').value = zoneFromKeywords;
  document.getElementById('questCategory').value = category;
  document.getElementById('questRepeatable').checked = repeatable;
  document.getElementById('questStatus').value = status;

  // Suggestions block
  const suggestions = [];
  if (document.getElementById('questTitle').value.length < 5)
    suggestions.push('Consider making the quest title more descriptive.');
  if (document.getElementById('questDescription').value.split(' ').length < 10)
    suggestions.push('Add more detail to the description for clarity.');
  if (xpValue < 10)
    suggestions.push('XP value seems low — is this a quick task or should it reward more?');
  if (smartPriority === 'low' && /urgent|important/i.test(input))
    suggestions.push('Priority might need to be upgraded from "Low" based on keywords.');

  const listEl = document.getElementById('suggestionList');
  listEl.innerHTML = '';
  suggestions.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s;
    listEl.appendChild(li);
  });
  document.getElementById('smartSuggestions').style.display = suggestions.length ? 'block' : 'none';

  alert('🧠 Parsed input and populated fields!');
}

function addLoreEntry() {
  const title = document.getElementById('loreTitle').value.trim();
  const content = document.getElementById('loreContent').value.trim();
  const tags = document.getElementById('loreTags').value.split(',').map(t => t.trim()).filter(Boolean);

  if (!title || !content) {
    alert('⚠️ Title and content are required.');
    return;
  }

  const newEntry = {
    title,
    content,
    tags,
    date: new Date().toLocaleDateString()
  };

  if (!Array.isArray(loreEntries)) {
    loreEntries = [];
  }

  loreEntries.unshift(newEntry); // Adds to top of the list

  // Clear form
  document.getElementById('loreTitle').value = '';
  document.getElementById('loreContent').value = '';
  document.getElementById('loreTags').value = '';

  renderLore(); // Refresh the lore panel
}

async function loadLoreEntries() {
  try {
    const response = await fetch('data/loreData.json');
    const raw = await response.text();
    console.log('Raw archive response:\n' + raw);
    const data = JSON.parse(raw);
    loreEntries = Array.isArray(data.entries) ? data.entries : data;
    loreLoaded = true;
    renderLore(); // ✅ Force render immediately after data is ready
  } catch (error) {
    console.error('⚠️ Failed to load lore:', error);
    loreEntries = [];
    loreLoaded = true;
    renderLore(); // Even if error, allow "empty state" UI to show
  }
}

// Render Aether Archive Panel
async function renderAetherArchive() {
  const container = document.getElementById('aether');
  if (!container) return;

  let data;
  try {
    const res = await fetch('data/loreData.json');
    data = await res.json();
  } catch (e) {
    container.innerHTML = `<div class="error">Failed to load Aether Archive data.</div>`;
    return;
  }

  // Only show entries tagged with 'meta', 'rare', or 'aether'
  const entries = (data.entries || []).filter(entry =>
    entry.tags &&
    entry.tags.some(tag =>
      ['meta', 'rare', 'aether'].includes(tag.toLowerCase())
    )
  );

  container.innerHTML = `
    <div class="panel-header">
      <h2>🌌 Aether Archive</h2>
      <button class="edit-btn" onclick="showPanel('add')">Edit</button>
    </div>
    <div id="aether-entries">
      ${entries.length === 0
        ? `<div class="lore-entry">No special Aether Archive entries found.</div>`
        : entries.map(entry => `
        <div class="lore-entry">
          <h3>${entry.title}</h3>
          <div class="lore-meta">
            <span class="lore-date">${entry.date}</span>
            <span class="lore-tags">${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</span>
          </div>
          <p>${entry.content}</p>
        </div>
      `).join('')}
    </div>
  `;
}

async function showPanel(panelId) {
  console.log(`[showPanel] Switching to panel: ${panelId}`);
  // Toggle panel visibility and reset overlays/modals
  document.querySelectorAll('.codex-panel').forEach(panel => {
    if (panel.id === panelId) {
      panel.style.display = 'block';
      panel.style.pointerEvents = 'auto';
      panel.style.opacity = '1';
      panel.scrollTop = 0;
      panel.focus?.();
    } else {
      panel.style.display = 'none';
      panel.style.pointerEvents = 'none';
      panel.style.opacity = '0.5';
    }
  });

  // Hide any overlays or modals
  document.querySelectorAll('.modal, .overlay').forEach(el => {
    el.style.display = 'none';
    el.style.pointerEvents = 'none';
    el.style.opacity = '0';
  });

  // Highlight active tab
  document.querySelectorAll('.tab-nav button').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.querySelector(`.tab-nav button[data-panel="${panelId}"]`)?.classList.add('selected');

  // Panel-specific behavior
  if (panelId === 'journal') {
    if (!zonesReady) await loadZones();
    renderJournal();
  }

  if (panelId === 'zones') {
    await loadZones();
    filterZone('core'); // ✅ Default to Core Quests
  }

  if (panelId === 'achievements') {
    renderAchievements();
  }

  if (panelId === 'archive') {
    console.log('[showPanel] Attempting to show Archive panel...');
    function tryRenderArchive(attempt = 0) {
      const container = document.getElementById('archive');
      if (!container) {
        console.warn('[showPanel] Archive container not found.');
        return;
      }
      container.innerHTML = '';
      const style = getComputedStyle(container);
      console.log(`[showPanel] tryRenderArchive attempt ${attempt}, display: ${style && style.display}`);
      if (style && style.display === 'block' && typeof renderArchive === 'function') {
        console.log('[showPanel] Archive panel is visible, calling renderArchive()');
        renderArchive();
      } else if (attempt < 3) {
        // Retry up to 3 times with a short delay
        setTimeout(() => tryRenderArchive(attempt + 1), 60);
      } else {
        console.warn('⚠️ Archive panel still hidden after multiple attempts.');
      }
    }
    requestAnimationFrame(() => tryRenderArchive());
  }

  if (panelId === 'lore') {
    requestAnimationFrame(() => {
      if (typeof renderLore === 'function') {
        renderLore(); // ✅ Safe after display change
      } else {
        console.warn('renderLore is not defined.');
      }
    });
  }

  if (panelId === 'aether') {
    await renderAetherArchive();
  }
}

// ...existing code...

async function filterZone(zoneId) {
  if (!zonesReady) await loadZones();

  // 🛡️ Prevent zone rendering if #zones panel is hidden
  const zonesPanel = document.getElementById('zones');
  const style = getComputedStyle(zonesPanel);
  if (style.display === 'none') {
    console.warn('🛡️ Zone panel is hidden — skipping zone render.');
    return;
  }

  // ✅ Shield Archive Panel (fix: use zoneId, not zone)
  if (zoneId === 'aether') {
    showPanel('aether');
    return;
  }

  // Highlight the selected sub-tab button
  document.querySelectorAll('#zones nav button').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.querySelector(`#zones nav button[onclick*="${zoneId}"]`)?.classList.add('selected');

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

async function loadZones() {
  const saved = loadFromLocal();
  if (saved && saved.length) {
    allZones = saved;
  } else {
    const res = await fetch('./data/zones.json');
    const zones = await res.json();
    allZones = zones;
  }

  zonesReady = true;
  renderZones(allZones);
  saveToLocal(allZones);
  return allZones;
}

async function loadLifeZones(callback) {
  const res = await fetch('./data/lifeZones.json');
  const lifeZones = await res.json();
  callback ? callback(lifeZones) : renderLifeZones(lifeZones);
}

function saveToLocal(zones) {
  localStorage.setItem('codexProgress', JSON.stringify(zones));
}

function loadFromLocal() {
  const saved = localStorage.getItem('codexProgress');
  return saved ? JSON.parse(saved) : null;
}

function toggleQuest(zoneId, questId) {
  const zone = allZones.find(z => z.id === zoneId);
  if (!zone) return;

  const quest = zone.quests.find(q => q.id === questId);
  if (!quest) return;

  quest.completed = !quest.completed;
  saveToLocal(allZones);

  const currentPanel = document.querySelector('.codex-panel:not([style*="display: none"])')?.id;
  if (currentPanel === 'journal') renderJournal();
  else if (currentPanel === 'zones') renderZones([zone]);
}

function toggleActive(zoneId, questId) {
  const zone = allZones.find(z => z.id === zoneId);
  if (!zone) return;

  const quest = zone.quests.find(q => q.id === questId);
  if (!quest) return;

  quest.active = !quest.active;
  saveToLocal(allZones);
  renderJournal();
}

function updatePriority(zoneId, questId, newPriority) {
  const zone = allZones.find(z => z.id === zoneId);
  if (!zone) return;

  const quest = zone.quests.find(q => q.id === questId);
  if (!quest) return;

  quest.priority = newPriority;
  saveToLocal(allZones);
  renderJournal();
}

function editQuest(zoneId, questId) {
  const zone = allZones.find(z => z.id === zoneId);
  if (!zone) return;

  const quest = zone.quests.find(q => q.id === questId);
  if (!quest) return;

  showPanel('add'); // ✅ Switch to Add/Edit tab

  document.getElementById('questTitle').value = quest.title;
  document.getElementById('questDescription').value = quest.description;
  document.getElementById('questCategory').value = quest.category;
  document.getElementById('questXP').value = quest.xp;
  document.getElementById('questPriority').value = quest.priority;
  document.getElementById('questStatus').value = quest.status;
  document.getElementById('questRepeatable').checked = quest.repeatable;
  document.getElementById('questZone').value = quest.zone;

  document.getElementById('questEditorForm').dataset.editing = `${zoneId}:${questId}`;
}

function deleteQuest(zoneId, questId) {
  const zone = allZones.find(z => z.id === zoneId);
  if (!zone) return;

  const index = zone.quests.findIndex(q => q.id === questId);
  if (index === -1) return;

  const confirmDelete = confirm("Are you sure you want to delete this quest?");
  if (!confirmDelete) return;

  zone.quests.splice(index, 1);
  saveToLocal(allZones);
  renderJournal();
}

// ✅ Full Global Exposure
window.showPanel = showPanel;
window.filterZone = filterZone;
window.toggleQuest = toggleQuest;
window.toggleActive = toggleActive;
window.updatePriority = updatePriority;
window.clearQuestForm = clearQuestForm;
window.calculateXP = calculateXP;
window.renderJournal = renderJournal;
window.loadFromLocal = loadFromLocal;
window.loadZones = loadZones;
window.renderZones = renderZones;
window.renderLore = renderLore;
window.renderAetherArchive = renderAetherArchive;
window.addLoreEntry = addLoreEntry;
window.loadLoreEntries = loadLoreEntries;
window.saveToLocal = saveToLocal;
window.editQuest = editQuest;
window.deleteQuest = deleteQuest;
window.processSmartInput = processSmartInput;  // 🧠 Smart Input Fix
