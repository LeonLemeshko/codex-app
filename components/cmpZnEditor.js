// Handles loading, editing, and rendering of Realms and zones in Campaign Zone.
// Provides editor UI and logic for realm/zone management.

export async function loadZones() {
  // Loads zones from localStorage or fallback to projectZones.json
  let zones = [];
  try {
    const raw = localStorage.getItem('codexZones');
    if (raw) {
      zones = JSON.parse(raw);
    } else {
      const response = await fetch('data/projectZones.json');
      zones = await response.json();
    }
  } catch (e) {
    console.warn('Failed to load zones:', e);
    zones = [];
  }
  return zones;
}

// Make loadZones available globally for HTML event handlers and other scripts
window.loadZones = loadZones;

export async function loadProjectZones() {
  const response = await fetch('data/projectZones.json');
  const zones = await response.json();
  window.projectZones = zones; // Make available for editor
  return zones;
}

export function renderZoneList(zones) {
  const list = document.getElementById('zoneList');
  list.innerHTML = '';
  zones.forEach(zone => {
    const zoneDiv = document.createElement('section');
    zoneDiv.className = 'zone-card';

    // Title
    const title = document.createElement('h4');
    title.textContent = zone.title;
    zoneDiv.appendChild(title);

    // Completed Quests
    if (zone.completed?.length) {
      const completedHeader = document.createElement('h5');
      completedHeader.textContent = '✅ Completed:';
      zoneDiv.appendChild(completedHeader);

      const completedList = document.createElement('ul');
      zone.completed.forEach(q => {
        const li = document.createElement('li');
        li.textContent = q.title || q;
        li.className = 'completed';
        completedList.appendChild(li);
      });
      zoneDiv.appendChild(completedList);
    }

    // In Progress Quests
    if (zone.inProgress?.length) {
      const inProgressHeader = document.createElement('h5');
      inProgressHeader.textContent = '⏳ In Progress:';
      zoneDiv.appendChild(inProgressHeader);

      const inProgressList = document.createElement('ul');
      zone.inProgress.forEach(q => {
        const li = document.createElement('li');
        li.textContent = q.title || q;
        li.className = 'active';
        inProgressList.appendChild(li);
      });
      zoneDiv.appendChild(inProgressList);
    }

    // Upcoming Quests
    if (zone.upcoming?.length) {
      const upcomingHeader = document.createElement('h5');
      upcomingHeader.textContent = '🟡 Upcoming:';
      zoneDiv.appendChild(upcomingHeader);

      const upcomingList = document.createElement('ul');
      zone.upcoming.forEach(q => {
        const li = document.createElement('li');
        li.textContent = q.title || q;
        upcomingList.appendChild(li);
      });
      zoneDiv.appendChild(upcomingList);
    }

    // Edit/Delete Buttons
    const controls = document.createElement('div');
    controls.className = 'quest-controls';
    controls.innerHTML = `
      <button onclick="window.openZoneEditor('${zone.id}')">Edit</button>
      <button onclick="window.deleteZone && window.deleteZone('${zone.id}')">Delete</button>
    `;
    zoneDiv.appendChild(controls);

    list.appendChild(zoneDiv);
  });
}

export function openZoneEditor(zoneId = null) {
  const modal = document.getElementById('zoneEditorModal');
  modal.style.display = 'block';

  // If editing, populate input
  if (zoneId) {
    const zone = window.projectZones?.find(z => z.id === zoneId);
    document.getElementById('zoneTitleInput').value = zone ? zone.title : '';
    modal.dataset.editing = zoneId;
    document.getElementById('zoneEditorTitle').textContent = 'Edit Zone';
  } else {
    document.getElementById('zoneTitleInput').value = '';
    modal.dataset.editing = '';
    document.getElementById('zoneEditorTitle').textContent = 'Add Zone';
  }
}

export function closeZoneEditor() {
  const modal = document.getElementById('zoneEditorModal');
  modal.style.display = 'none';
  modal.dataset.editing = '';
}

// Attach event listeners (call this once on page load)
export function setupZoneEditorEvents() {
 const saveBtn = document.getElementById('saveZoneBtn');
  const cancelBtn = document.getElementById('cancelZoneBtn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      // Save logic will go here (next step)
      closeZoneEditor();
    };
  }
  if (cancelBtn) {
    cancelBtn.onclick = closeZoneEditor;
  }
}

export { loadZones as loadRealms };
export { loadProjectZones as loadProjectRealms };
export { setupZoneEditorEvents as setupRealmEditorEvents };

// Expose editor functions to window for HTML onclicks
// window.openZoneEditor = openZoneEditor;
window.closeZoneEditor = closeZoneEditor;

export function renderRealmList(realms) {
  const list = document.getElementById('realmList');
  if (!list) return;
  list.innerHTML = '';

  realms.forEach(realm => {
    const realmDiv = document.createElement('section');
    realmDiv.className = 'realm-card';
    realmDiv.style.marginBottom = '2rem'; // Add spacing between cards
    realmDiv.style.borderBottom = '2px solid #e0e0e0'; // Visual separation

    // Realm Title
    const title = document.createElement('h3');
    title.textContent = realm.title || 'Untitled Realm';
    realmDiv.appendChild(title);

    // Realm Description
    if (realm.description) {
      const desc = document.createElement('p');
      desc.className = 'realm-desc';
      desc.textContent = realm.description;
      realmDiv.appendChild(desc);
    }

    // Quest Lines (only those with quests)
    if (Array.isArray(realm.questLines) && realm.questLines.length) {
      realm.questLines
        .filter(ql => Array.isArray(ql.quests) && ql.quests.length > 0)
        .forEach(ql => {
          const qlDiv = document.createElement('div');
          qlDiv.className = 'quest-line';
          qlDiv.style.marginTop = '1rem';

          // Quest Line Title
          const qlTitle = document.createElement('h4');
          qlTitle.textContent = ql.title || 'Quest Line';
          qlDiv.appendChild(qlTitle);

          // Quests
          const questList = document.createElement('ul');
          questList.style.paddingLeft = '1.5rem';
          ql.quests.forEach(q => {
            const questItem = document.createElement('li');
            questItem.className = 'quest-card';
            questItem.style.marginBottom = '1rem';
            questItem.style.background = '#23232b';
            questItem.style.border = '1px solid #444';
            questItem.style.borderRadius = '10px';
            questItem.style.padding = '1rem 1.5rem';
            questItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            questItem.style.color = '#f5f5f5';

            questItem.innerHTML = `
              <div style="font-size:1.1em;font-weight:600;margin-bottom:0.5em;">${q.title || 'Untitled Quest'}</div>
              <div style="margin-bottom:0.5em;">${q.description || ''}</div>
              <div style="font-size:0.95em;color:#d1cfcf;">
                XP: <span style="color:#ffe066;">${q.xp ?? 0}</span> &nbsp;|&nbsp;
                Priority: <span>${q.priority || 'none'}</span> &nbsp;|&nbsp;
                Status: <span>${q.status || 'unknown'}</span> &nbsp;|&nbsp;
                Repeatable: <span>${q.repeatable ? 'Yes' : 'No'}</span> &nbsp;|&nbsp;
                Completed: <span>${q.completed ? 'Yes' : 'No'}</span> &nbsp;|&nbsp;
                Active: <span>${q.active ? 'Yes' : 'No'}</span>
              </div>
            `;
            questList.appendChild(questItem);
          });
          qlDiv.appendChild(questList);
          realmDiv.appendChild(qlDiv);
        });
    }

    list.appendChild(realmDiv);
  });
}