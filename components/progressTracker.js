// progressTracker.js

export function renderXPBar(totalXP, goalXP = 1000) {
  const fillWidth = Math.min((totalXP / goalXP) * 100, 100);
  const bar = document.createElement('div');
  bar.className = 'progress-bar';

  const fill = document.createElement('div');
  fill.className = 'progress-fill';
  fill.style.width = `${fillWidth}%`;

  bar.appendChild(fill);
  return bar;
}

export function renderZoneProgress(zone) {
  const total = zone.quests.length;
  const completed = zone.quests.filter(q => q.completed).length;
  const percent = total ? (completed / total) * 100 : 0;

  const wrapper = document.createElement('div');
  wrapper.className = 'zone-progress-wrapper';

  const label = document.createElement('small');
  label.textContent = `Progress: ${completed}/${total} quests (${Math.round(percent)}%)`;

  const bar = document.createElement('div');
  bar.className = 'progress-bar';

  const fill = document.createElement('div');
  fill.className = 'progress-fill';
  fill.style.width = `${percent}%`;

  bar.appendChild(fill);
  wrapper.appendChild(label);
  wrapper.appendChild(bar);

  return wrapper;
}
