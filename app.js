function safeParse(json, fallback) {
  try {
    if (!json || json === "undefined") return fallback;
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// --- FIXED BLOCK START ---
window.questJournal = safeParse(localStorage.getItem('questJournal'), []);
window.personalJourneyQuests = safeParse(localStorage.getItem('personalJourneyQuests'), null);

if (!Array.isArray(window.personalJourneyQuests) || window.personalJourneyQuests.length === 0) {
  fetch('data/personalJrny.json')
    .then(res => res.json())
    .then(data => {
      window.personalJourneyQuests = data;
      localStorage.setItem('personalJourneyQuests', JSON.stringify(data));
      // If currently on the personalJourney panel, re-render
      if (document.querySelector('.codex-panel#personalJourney')?.style.display === 'block') {
        renderPersonalJourneyQuests(window.personalJourneyQuests);
      }
    });
} else {
  // Always use localStorage if available
  console.log('Loaded personalJourneyQuests from localStorage:', window.personalJourneyQuests);
}
// --- FIXED BLOCK END ---

import { renderRealms, renderPersonalJourneyQuests } from './components/cmpZnPanels.js';
import { renderXPBar } from './components/xpTracker.js';
import { renderAchievements } from './components/achievements.js';
import { renderArchive } from './components/archive.js';
import { renderRealmList, loadRealms } from './components/cmpZnEditor.js';
import { setupRealmEditorEvents } from './components/cmpZnEditor.js';
window.loadRealms = loadRealms;
setupRealmEditorEvents();

let allRealms = [];
let realmsReady = false;
let loreEntries = [];

// Utility to show only one Add button and set its tooltip
function setAddButton(panel, tooltip) {
  document.getElementById('addRealmBtn')?.style.setProperty('display', 'none');
  document.getElementById('addAchievementBtn')?.style.setProperty('display', 'none');
  document.getElementById('addLoreBtn')?.style.setProperty('display', 'none');
  if (panel === 'realms') {
    const btn = document.getElementById('addRealmBtn');
    if (btn) {
      btn.style.display = '';
      btn.title = tooltip;
    }
  } else if (panel === 'achievements') {
    const btn = document.getElementById('addAchievementBtn');
    if (btn) {
      btn.style.display = '';
      btn.title = tooltip;
    }
  } else if (panel === 'archive') {
    const btn = document.getElementById('addLoreBtn');
    if (btn) {
      btn.style.display = '';
      btn.title = tooltip;
    }
  }
}

function calculateXP(realms) {
  return realms.reduce((sum, realm) => {
    return sum + (realm.quests ? realm.quests.reduce((zSum, q) => zSum + (q.xp || 0), 0) : 0);
  }, 0);
}

function renderJournal() {
  const journal = document.getElementById('journal');
  journal.innerHTML = '';

  const wrapper = document.createElement('section');
  wrapper.className = 'codex-panel';
  wrapper.id = 'journalPanel';
  journal.appendChild(wrapper);

  let allQuests = [];
  allRealms.forEach(realm => {
    // Direct quests
    if (Array.isArray(realm.quests)) {
      const journalQuests = realm.quests.filter(q => q.inJournal);
      if (journalQuests.length > 0) {
        allQuests.push({
          realmId: realm.id,
          realmTitle: realm.title,
          quests: journalQuests
        });
      }
    }
    // Nested questLines
    if (Array.isArray(realm.questLines)) {
      realm.questLines.forEach(ql => {
        if (Array.isArray(ql.quests)) {
          const journalQuests = ql.quests.filter(q => q.inJournal);
          if (journalQuests.length > 0) {
            allQuests.push({
              realmId: realm.id,
              realmTitle: realm.title,
              quests: journalQuests
            });
          }
        }
      });
    }
  });

  // --- ADD THIS BLOCK: Personal Journey Objectives ---
  window.questJournal = window.questJournal || [];
  if (window.questJournal.length > 0) {
    allQuests.push({
      realmId: 'personal-journey',
      realmTitle: 'Personal Journey',
      quests: window.questJournal
    });
  }
  // --- END BLOCK ---

  // Calculate total XP
  const totalXP = allQuests.reduce((sum, group) => {
    return sum + group.quests.reduce((zSum, q) => zSum + (q.xp || 0), 0);
  }, 0);

  const xpHeader = document.createElement('h3');
  xpHeader.textContent = `Total XP: ${totalXP}`;
  wrapper.appendChild(xpHeader);

  const xpBar = renderXPBar(totalXP, 1000);
  wrapper.appendChild(xpBar);

  // Render all quests grouped by realm
  allQuests.forEach(group => {
    if (!group.quests || group.quests.length === 0) return;

    const realmBlock = document.createElement('section');
    realmBlock.className = 'realm-card';

    const title = document.createElement('h4');
    title.textContent = group.realmTitle;
    realmBlock.appendChild(title);

    group.quests.forEach(q => {
      const questCard = document.createElement('div');
      questCard.className = 'quest-card';
      if (q.completed) questCard.classList.add('completed');
      else if (!q.active) questCard.classList.add('inactive');

      questCard.innerHTML = `
        <strong>${q.title}</strong>
        <p>${q.description || ''}</p>
        <p>XP: ${q.xp || 0}</p>
        ${q.completed
          ? `<button onclick="window.toggleQuest('${group.realmId}', '${q.id}')">☑️ Undo Complete</button>`
          : q.active
            ? `<button onclick="window.toggleActive('${group.realmId}', '${q.id}')">🛡️ Deactivate</button>
               <button onclick="window.toggleQuest('${group.realmId}', '${q.id}')">✅ Mark Complete</button>`
            : `<button onclick="window.toggleActive('${group.realmId}', '${q.id}')">✅ Activate</button>`
        }
      `;
      const controls = document.createElement('div');
      controls.className = 'card-controls';
      controls.innerHTML = `
        <button class="icon-btn" onclick="window.editQuest('${group.realmId}', '${q.id}')">✏️ Edit</button>
        <button class="icon-btn" onclick="window.deleteQuest('${group.realmId}', '${q.id}')">🗑️ Delete</button>
      `;
      questCard.appendChild(controls);
      realmBlock.appendChild(questCard);
    });

    wrapper.appendChild(realmBlock);
  });
}

function renderLore() {
  const container = document.getElementById('lore');
  container.innerHTML = '';

  const entries = Array.isArray(loreEntries) ? loreEntries : [];

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

function updateXPTracker() {
  const xpCounter = document.getElementById('xp-counter');
  if (xpCounter) {
    xpCounter.textContent = `XP: ${calculateXP(allRealms)}`;
  }
}

function saveToLocal(realms) {
  try {
    localStorage.setItem('codexRealms', JSON.stringify(realms));
  } catch (e) {
    console.warn('Failed to save realms:', e);
  }
}

function loadFromLocal() {
  try {
    const raw = localStorage.getItem('codexRealms');
    if (raw) {
      allRealms = JSON.parse(raw);
      realmsReady = true;
    }
  } catch (e) {
    console.warn('Failed to load realms from localStorage:', e);
    allRealms = [];
    realmsReady = false;
  }
}

function toggleQuest(realmId, questId) {
  if (realmId === 'personal-journey') {
    const quest = window.personalJourneyQuests.find(q => q.id === questId);
    if (!quest) return;
    quest.completed = !quest.completed;
    quest.active = !quest.active;
    localStorage.setItem('personalJourneyQuests', JSON.stringify(window.personalJourneyQuests));
    renderPersonalJourneyQuests(window.personalJourneyQuests);
    return;
  }
  const realm = allRealms.find(z => z.id === realmId);
  if (!realm) return;
  let quest = null;
  if (Array.isArray(realm.quests)) {
    quest = realm.quests.find(q => q.id === questId);
  }
  if (!quest && Array.isArray(realm.questLines)) {
    for (const ql of realm.questLines) {
      if (Array.isArray(ql.quests)) {
        quest = ql.quests.find(q => q.id === questId);
        if (quest) break;
      }
    }
  }
  if (!quest) return;
  quest.completed = !quest.completed;
  if (Array.isArray(realm.quests)) {
    quest = realm.quests.find(q => q.id === questId);
  }
  if (!quest && Array.isArray(realm.questLines)) {
    for (const ql of realm.questLines) {
      if (Array.isArray(ql.quests)) {
        quest = ql.quests.find(q => q.id === questId);
        if (quest) break;
      }
    }
  }
  if (!quest) return;
  quest.active = !quest.active;
  saveToLocal(allRealms);
  renderJournal();
  updateXPTracker();
}

function toggleActive(realmId, questId) {
  if (realmId === 'personal-journey') {
    const quest = window.personalJourneyQuests.find(q => q.id === questId);
    if (!quest) return;
    quest.active = !quest.active;
    localStorage.setItem('personalJourneyQuests', JSON.stringify(window.personalJourneyQuests));
    renderPersonalJourneyQuests(window.personalJourneyQuests);
    return;
  }
  const realm = allRealms.find(z => z.id === realmId);
  if (!realm) return;
  let quest = null;
  if (Array.isArray(realm.quests)) {
    quest = realm.quests.find(q => q.id === questId);
  }
  if (!quest && Array.isArray(realm.questLines)) {
    for (const ql of realm.questLines) {
      if (Array.isArray(ql.quests)) {
        quest = ql.quests.find(q => q.id === questId);
        if (quest) break;
      }
    }
  }
  if (!quest) return;
  quest.active = !quest.active;
  saveToLocal(allRealms);
  renderJournal();
  updateXPTracker();
}
window.toggleActive = toggleActive;

function updatePriority(realmId, questId, priority) {
  const realm = allRealms.find(z => z.id === realmId);
  if (!realm) return;
  const quest = realm.quests.find(q => q.id === questId);
  if (!quest) return;
  quest.priority = priority;
  saveToLocal(allRealms);
  renderJournal();
}

function editQuest(realmId, questId) {
  if (realmId === 'personal-journey') {
    const quest = window.personalJourneyQuests.find(q => q.id === questId);
    if (!quest) return;
    showPanel('add');
    document.getElementById('questTitle').value = quest.title;
    document.getElementById('questDescription').value = quest.description;
    document.getElementById('questCategory').value = quest.category;
    document.getElementById('questXP').value = quest.xp;
    document.getElementById('questPriority').value = quest.priority;
    document.getElementById('questStatus').value = quest.status;
    document.getElementById('questRepeatable').checked = quest.repeatable;
    document.getElementById('questEditorForm').dataset.editing = `${realmId}:${questId}`;
    return;
  }
  const realm = allRealms.find(z => z.id === realmId);
  if (!realm) return;
  const quest = realm.quests.find(q => q.id === questId);
  if (!quest) return;
  showPanel('add');
  document.getElementById('questTitle').value = quest.title;
  document.getElementById('questDescription').value = quest.description;
  document.getElementById('questCategory').value = quest.category;
  document.getElementById('questXP').value = quest.xp;
  document.getElementById('questPriority').value = quest.priority;
  document.getElementById('questStatus').value = quest.status;
  document.getElementById('questRepeatable').checked = quest.repeatable;
  document.getElementById('questEditorForm').dataset.editing = `${realmId}:${questId}`;
}

function deleteQuest(realmId, questId) {
  if (realmId === 'personal-journey') {
    const idx = window.personalJourneyQuests.findIndex(q => q.id === questId);
    if (idx === -1) return;
    window.personalJourneyQuests.splice(idx, 1);
    localStorage.setItem('personalJourneyQuests', JSON.stringify(window.personalJourneyQuests));
    renderPersonalJourneyQuests(window.personalJourneyQuests);
    return;
  }
  const realm = allRealms.find(z => z.id === realmId);
  if (!realm) return;
  const questIdx = realm.quests.findIndex(q => q.id === questId);
  if (questIdx === -1) return;
  realm.quests.splice(questIdx, 1);
  saveToLocal(allRealms);
  renderJournal();
  updateXPTracker();
}

document.getElementById('questEditorForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const editingKey = this.dataset.editing;
  if (editingKey) {
    const [realmId, questId] = editingKey.split(':');
    if (realmId === 'personal-journey') {
      const quest = window.personalJourneyQuests.find(q => q.id === questId);
      if (quest) {
        quest.title = document.getElementById('questTitle').value.trim();
        quest.description = document.getElementById('questDescription').value.trim();
        quest.category = document.getElementById('questCategory').value;
        quest.xp = parseInt(document.getElementById('questXP').value);
        quest.priority = document.getElementById('questPriority').value;
        quest.status = document.getElementById('questStatus').value;
        quest.repeatable = document.getElementById('questRepeatable').checked;
        quest.text = quest.title;

        localStorage.setItem('personalJourneyQuests', JSON.stringify(window.personalJourneyQuests));
        showPanel('personalJourney');
        alert(`✏️ Personal Journey Quest "${quest.title}" updated.`);
        this.reset();
        delete this.dataset.editing;
        return;
      }
    }
    // ...existing code for allRealms...
    const realm = allRealms.find(z => z.id === realmId);
    const quest = realm?.quests.find(q => q.id === questId);

    if (quest) {
      quest.title = document.getElementById('questTitle').value.trim();
      quest.description = document.getElementById('questDescription').value.trim();
      quest.category = document.getElementById('questCategory').value;
      quest.xp = parseInt(document.getElementById('questXP').value);
      quest.priority = document.getElementById('questPriority').value;
      quest.status = document.getElementById('questStatus').value;
      quest.repeatable = document.getElementById('questRepeatable').checked;
      quest.text = quest.title;

      saveToLocal(allRealms);
      showPanel('journal');
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
    completed: false,
    active: true,
    text: document.getElementById('questTitle').value.trim(),
    inJournal: true // <-- ADD THIS LINE
  };

  // Assign new quests to a default realm or handle as needed
  let defaultRealm = allRealms.find(z => z.title === "General");
  if (!defaultRealm) {
    defaultRealm = {
      id: "general",
      title: "General",
      type: "custom",
      quests: []
    };
    allRealms.push(defaultRealm);
  }

  defaultRealm.quests.push(newQuest);
  saveToLocal(allRealms);

  renderRealms([defaultRealm]);
  showPanel('journal');
  updateXPTracker();

  alert(`✅ Quest "${newQuest.title}" added (+${newQuest.xp} XP)`);
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

  // Category guessing
  let category = 'Main Quests';
  if (/ritual|morning|routine/i.test(input)) category = 'Daily Rituals';
  if (/guild|campaign|battle|faction/i.test(input)) category = 'Guild Campaigns';

  // Fill form fields
  document.getElementById('questTitle').value = titleMatch?.split(':')[1]?.trim() || lines[0];
  document.getElementById('questDescription').value = lines.slice(1).join(' ') || input;
  document.getElementById('questXP').value = xpValue;
  document.getElementById('questPriority').value = smartPriority;
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
  const section = document.getElementById('archiveSection').value || "lore"; // "lore" or "aether"

  if (!title || !content) {
    alert('⚠️ Title and content are required.');
    return;
  }

  const newEntry = {
    title,
    content,
    tags,
    date: new Date().toLocaleDateString(),
    section
  };

  if (!Array.isArray(loreEntries)) {
    loreEntries = [];
  }

  loreEntries.unshift(newEntry);

  document.getElementById('loreTitle').value = '';
  document.getElementById('loreContent').value = '';
  document.getElementById('loreTags').value = '';
  document.getElementById('archiveSection').value = 'lore';

  renderLore();
}

async function loadLoreEntries() {
  try {
    const response = await fetch('data/loreData.json');
    const raw = await response.text();
    console.log('Raw archive response:\n' + raw);
    const data = JSON.parse(raw);
    loreEntries = Array.isArray(data.entries) ? data.entries : data;
    loreLoaded = true;
    renderLore();
  } catch (error) {
    console.error('⚠️ Failed to load lore:', error);
    loreEntries = [];
    loreLoaded = true;
    renderLore();
  }
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

  if (panelId === 'journal') {
    loadFromLocal();
    if (!allRealms.length) {
      try {
        const response = await fetch('data/realms.json');
        allRealms = await response.json();
        realmsReady = true;
      } catch (err) {
        console.error('Failed to load realms.json:', err);
        allRealms = [];
        realmsReady = false;
      }
    }
    renderJournal();
    updateXPTracker();
  }

  if (panelId === 'realms') {
    setAddButton('realms', 'Add a new Realm');
    loadFromLocal(); // <-- Use localStorage if available
    if (!allRealms.length) {
      try {
        const response = await fetch('data/realms.json');
        allRealms = await response.json();
        realmsReady = true;
      } catch (err) {
        console.error('Failed to load realms.json:', err);
        allRealms = [];
        realmsReady = false;
      }
    }
    filterRealm('all'); // Show all realms by default
    updateXPTracker();
  }

  if (panelId === 'achievements') {
    setAddButton('achievements', 'Add a new Achievement');
    renderAchievements();
  }

  if (panelId === 'archive') {
    setAddButton('archive', 'Add a new Lore Entry');
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
        renderLore();
      } else {
        console.warn('renderLore is not defined.');
      }
    });
  }
  
  if (panelId === 'add') {
    clearQuestForm();
  }

  if (panelId === 'personalJourney') {
    renderPersonalJourneyQuests(window.personalJourneyQuests);
  }
}

async function filterRealm(realmId) {
  loadFromLocal();

  if (!realmsReady) {
    try {
      allRealms = await window.loadRealms();
      realmsReady = true;
    } catch (err) {
      console.error('Failed to load realms:', err);
      allRealms = [];
      realmsReady = false;
      return;
    }
  }

  const realmsPanel = document.getElementById('realms');
  if (!realmsPanel) {
    console.warn('Realms panel not found.');
    return;
  }
  const style = getComputedStyle(realmsPanel);
  if (style.display === 'none') {
    console.warn('🛡️ Realms panel is hidden — skipping realm render.');
    return;
  }

  document.querySelectorAll('#realms nav button').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.querySelector(`#realms nav button[onclick*="${realmId}"]`)?.classList.add('selected');

  let tooltip = 'Add a new Realm';
  if (realmId === 'core') tooltip = 'Add a new Core Quest';
  else if (realmId === 'life') tooltip = 'Add a new Personal Journey';
  else if (realmId === 'ritual') tooltip = 'Add a new Daily Ritual';
  else if (realmId === 'guild') tooltip = 'Add a new Guild Campaign';

  setAddButton('realms', tooltip);

  const realmListPanel = document.getElementById('realmListPanel');
  if (realmId === 'all') {
    realmListPanel.style.display = 'block';
    try {
      const response = await fetch('data/realms.json');
      const realmsData = await response.json();
      renderRealmList(realmsData);
    } catch (err) {
      console.error('Failed to load realms.json', err);
      renderRealmList([]);
    }
  } else {
    realmListPanel.style.display = 'none';
  }

  const realmContainer = document.getElementById('realm-container');
  if (!realmContainer) {
    console.warn('Realm container not found.');
    return;
  }
  realmContainer.innerHTML = '';

  if (realmId === 'core') {
    // Flatten all core questLines from all realms
    const coreRealms = [];
    allRealms.forEach(realm => {
      if (Array.isArray(realm.questLines)) {
        realm.questLines.forEach(ql => {
          if (ql.type === 'core' && Array.isArray(ql.quests) && ql.quests.length > 0) {
            coreRealms.push({
              id: `${realm.id}-${ql.id}`,
              title: `${realm.title}: ${ql.title}`,
              description: realm.description,
              quests: ql.quests
            });
          }
        });
      }
    });
    renderRealms(coreRealms);
    return;
  }

  // --- REPLACE THIS BLOCK ---
  // if (realmId === 'life') {
  //   try {
  //     const response = await fetch('data/personalJrny.json');
  //     const personalRealms = await response.json();
  //     renderPersonalJourneyQuests(personalRealms);
  //   } catch (e) {
  //     console.warn('Failed to load personal journey realms:', e);
  //     renderPersonalJourneyQuests([]);
  //   }
  //   return;
  // }
  // --- WITH THIS: ---
  if (realmId === 'life') {
    // Always use the latest global data, not a fresh fetch
    renderPersonalJourneyQuests(window.personalJourneyQuests);
    return;
  }
  // --- END REPLACEMENT ---

  if (realmId === 'ritual') {
    try {
      const response = await fetch('data/dailyRitual.json');
      const ritualRealms = await response.json();
      renderRealms(ritualRealms);
    } catch (e) {
      console.warn('Failed to load daily ritual realms:', e);
      renderRealms([]);
    }
    return;
  }

  if (realmId === 'guild') {
    try {
      const response = await fetch('data/guildCamp.json');
      const guildRealms = await response.json();
      renderRealms(guildRealms);
    } catch (e) {
      console.warn('Failed to load guild campaign realms:', e);
      renderRealms([]);
    }
    return;
  }
}

// Add button handlers for each panel
function handleAddClick() { showPanel('add'); }
function handleAddAchievement() { showPanel('add'); }
function handleAddLore() { showPanel('add'); }
function openPersonalJourneyEditor() {
  showPanel('add');
  document.getElementById('categoryGroup').value = 'Campaign Zone';
  window.updateSubcategories();
  document.getElementById('questCategory').value = 'Personal Journey';
  document.getElementById('questTitle').focus();
}

function openDailyRitualEditor() {
  showPanel('add');
  document.getElementById('categoryGroup').value = 'Campaign Zone';
  window.updateSubcategories();
  document.getElementById('questCategory').value = 'Daily Ritual';
  document.getElementById('questTitle').focus();
}

function openGuildCampaignEditor() {
  showPanel('add');
  document.getElementById('categoryGroup').value = 'Quest Journal';
  window.updateSubcategories();
  document.getElementById('questCategory').value = 'Guild Campaigns';
  document.getElementById('questTitle').focus();
}

function openAchievementEditor() {
  showPanel('add');
  document.getElementById('categoryGroup').value = 'Achievements';
  window.updateSubcategories();
  document.getElementById('questCategory').value = 'Achievements';
  document.getElementById('questTitle').focus();
}

// Expose to window for button onclicks and main UI actions
window.showPanel = showPanel;
window.filterRealm = filterRealm;
window.toggleQuest = toggleQuest;
window.toggleActive = toggleActive;
window.updatePriority = updatePriority;
window.clearQuestForm = clearQuestForm;
window.calculateXP = calculateXP;
window.renderJournal = renderJournal;
window.loadFromLocal = loadFromLocal;
window.loadRealms = loadRealms;
window.renderRealms = renderRealms;
window.renderLore = renderLore;
window.addLoreEntry = addLoreEntry;
window.loadLoreEntries = loadLoreEntries;
window.saveToLocal = saveToLocal;
window.editQuest = editQuest;
window.deleteQuest = deleteQuest;
window.processSmartInput = processSmartInput;
window.handleAddClick = handleAddClick;
window.handleAddAchievement = handleAddAchievement;
window.handleAddLore = handleAddLore;
window.openPersonalJourneyEditor = openPersonalJourneyEditor;
window.openDailyRitualEditor = openDailyRitualEditor;
window.openGuildCampaignEditor = openGuildCampaignEditor;
window.openAchievementEditor = openAchievementEditor;

const subcategories = {
  "Quest Journal": [
    { value: "Daily Rituals", label: "Daily Rituals" },
    { value: "Guild Campaigns", label: "Guild Campaigns" },
    { value: "Main Quests", label: "Main Quests" },
    { value: "Personal Journey", label: "Personal Journey" }
  ],
  "Campaign Zone": [
    { value: "Personal Journey", label: "Personal Journey" },
    { value: "Daily Ritual", label: "Daily Ritual" },
  ],
  "Realms": [
    { value: "Core", label: "Core" },
    { value: "Personal Journey", label: "Personal Journey" },
    { value: "Daily Ritual", label: "Daily Ritual" },
    { value: "Guild Campaigns", label: "Guild Campaigns" }
  ],
  "Achievements": [
    { value: "Achievements", label: "Achievements" }
  ],
  "Lore Archive": [
    { value: "Lore Archive", label: "Lore Archive" }
  ],
};

window.updateSubcategories = function() {
  const group = document.getElementById('categoryGroup').value;
  const subcat = document.getElementById('questCategory');
  subcat.innerHTML = '<option value="">Select Subcategory...</option>';
  if (subcategories[group]) {
    subcategories[group].forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      subcat.appendChild(option);
    });
  }
};

function addToJournalUniversal(questId) {
  let found = false;
  allRealms.forEach(realm => {
    // Direct quests
    if (Array.isArray(realm.quests)) {
      realm.quests.forEach(q => {
        if (q.id === questId) {
          q.inJournal = true;
          q.active = true;
          found = true;
        }
      });
    }
    // Nested questLines
    if (Array.isArray(realm.questLines)) {
      realm.questLines.forEach(ql => {
        if (Array.isArray(ql.quests)) {
          ql.quests.forEach(q => {
            if (q.id === questId) {
              q.inJournal = true;
              q.active = true;
              found = true;
            }
          });
        }
      });
    }
  });
  if (found) {
    saveToLocal(allRealms);
    renderJournal();
  } else {
    alert('Quest not found!');
  }
}
window.addToJournalUniversal = addToJournalUniversal;