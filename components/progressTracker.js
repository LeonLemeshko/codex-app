export function renderXPBar(totalXP, goalXP = 1000) {
  const fillWidth = Math.min((totalXP / goalXP) * 100, 100);

  const wrapper = document.createElement('div');
  wrapper.className = 'xp-bar-wrapper';

  const label = document.createElement('div');
  label.className = 'xp-label';
  label.textContent = `XP: ${totalXP} / ${goalXP}`;

  const bar = document.createElement('div');
  bar.className = 'progress-bar';

  const fill = document.createElement('div');
  fill.className = 'progress-fill';
  fill.style.width = `${fillWidth}%`;

  bar.appendChild(fill);
  wrapper.appendChild(label);
  wrapper.appendChild(bar);

  return wrapper;
}

export function renderZoneProgress(zone) {
  const total = zone.quests.length;
  const completed = zone.quests.filter(q => q.completed).length;
  const percent = total ? (completed / total) * 100 : 0;
  const rounded = Math.round(percent);

  const wrapper = document.createElement('div');
  wrapper.className = 'zone-progress-wrapper';

  const label = document.createElement('div');
  label.className = 'zone-progress-label';
  label.innerHTML = `🟡 ${rounded}% Complete`;

  const bar = document.createElement('div');
  bar.className = 'progress-bar zone-break';

  const fill = document.createElement('div');
  fill.className = 'progress-fill';
  fill.style.width = `${percent}%`;

  if (percent === 100) fill.classList.add('complete');
  else if (percent >= 50) fill.classList.add('halfway');
  else fill.classList.add('starting');

  bar.appendChild(fill);
  wrapper.appendChild(label);
  wrapper.appendChild(bar);

  return wrapper;
}
