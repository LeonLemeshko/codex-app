// Renders the Lore Archive panel, displaying lore and aether entries.
// Handles lore data fetching and UI.

export async function renderArchive() {
  const container = document.getElementById('archive');
  container.innerHTML = `<h2>Lore Archive</h2>`;

  const res = await fetch('data/loreArch.json');
  const rawText = await res.text();
  const parsed = JSON.parse(rawText);
  const entries = Array.isArray(parsed.entries) ? parsed.entries : [];

  // Regular lore entries
  const loreEntries = entries.filter(e => e.section !== 'aether');
  loreEntries.forEach(entry => {
    const card = document.createElement('section');
    card.className = 'archive-entry lore-entry';
    card.innerHTML = `
      <div class="entry-header">
        <h3>${entry.title}</h3>
        <small class="entry-date">${entry.date || ''}</small>
      </div>
      <div class="tags">${(entry.tags || []).map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>
      <p class="entry-body">${entry.content}</p>
    `;
    container.appendChild(card);
  });

  // Separator for Aether entries
  const aetherEntries = entries.filter(e => e.section === 'aether');
  if (aetherEntries.length) {
    const sep = document.createElement('div');
    sep.className = 'archive-separator';
    sep.innerHTML = `<hr><h3 class="aether-header">Aether Archive</h3>`;
    container.appendChild(sep);

    aetherEntries.forEach(entry => {
      const card = document.createElement('section');
      card.className = 'archive-entry aether-entry';
      card.innerHTML = `
        <div class="entry-header">
          <h3>${entry.title}</h3>
          <small class="entry-date">${entry.date || ''}</small>
        </div>
        <div class="tags">${(entry.tags || []).map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>
        <p class="entry-body">${entry.content}</p>
      `;
      container.appendChild(card);
    });
  }
}

window.renderArchive = renderArchive;