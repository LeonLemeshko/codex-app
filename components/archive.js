export async function renderArchive() {
  const container = document.getElementById('archive');

  container.innerHTML = `
    <nav id="archive-nav" style="margin-bottom:1em;">
      <button id="archiveLoreBtn" class="selected" type="button">Lore Archive</button>
      <button id="archiveAetherBtn" type="button">Aether Archive</button>
    </nav>
    <h2>Lore Archive</h2>
    <p class="fallback">This section will store completed achievements, legendary zones, and narrative records.</p>
  `;

  // Add robust event listeners for navigation buttons
  const loreBtn = container.querySelector('#archiveLoreBtn');
  const aetherBtn = container.querySelector('#archiveAetherBtn');
  if (loreBtn && aetherBtn) {
    loreBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      loreBtn.classList.add('selected');
      aetherBtn.classList.remove('selected');
      setTimeout(() => showPanel('archive'), 0);
    });
    aetherBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      aetherBtn.classList.add('selected');
      loreBtn.classList.remove('selected');
      setTimeout(() => showPanel('aether'), 0);
    });
  }

  try {
    const res = await fetch('./data/archive.json');
    const rawText = await res.text();

    console.log('Raw archive response:\n' + rawText);

    let data = [];

    try {
      const parsed = JSON.parse(rawText);
      data = Array.isArray(parsed) ? parsed : parsed.entries || [];
    } catch (jsonErr) {
      container.innerHTML += `<p class="fallback">⚠️ Archive format is invalid or missing.</p>`;
      console.error('JSON parsing failed:', jsonErr);
      window.loreEntries = [];
      window.loreLoaded = true;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML += `<p class="fallback">📚 No archived lore found yet.</p>`;
      window.loreEntries = [];
      window.loreLoaded = true;
      return;
    }

    // ✅ Expose lore data globally for Lore panel
    window.loreEntries = data;
    window.loreLoaded = true;

    // ✅ Trigger Lore panel rendering
    if (typeof window.renderLore === 'function') {
      window.renderLore();
    }

    // 📚 Render Archive Panel Content
    data.forEach(entry => {
      const card = document.createElement('section');
      card.className = 'archive-entry';

      const header = document.createElement('div');
      header.className = 'entry-header';

      const title = document.createElement('h3');
      title.textContent = entry.title || 'Untitled Entry';
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
  } catch (err) {
    container.innerHTML += `<p class="fallback">⚠️ Failed to load archive entries.</p>`;
    console.error('Archive loading error:', err);
    window.loreEntries = [];
    window.loreLoaded = true;

    if (typeof window.renderLore === 'function') {
      window.renderLore(); // Render blank Lore panel
    }
  }
}
