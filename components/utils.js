// utils.js

export function calculateXP(zones) {
  return zones.reduce((totalXP, zone) => {
    return totalXP + zone.quests.reduce((zoneXP, quest) => {
      return zoneXP + (quest.completed ? quest.xp : 0);
    }, 0);
  }, 0);
}

export function toggleQuest(zoneId, questId, zones) {
  const zone = zones.find(z => z.id === zoneId);
  const quest = zone.quests.find(q => q.id === questId);
  if (quest) {
    quest.completed = !quest.completed;
  }
}
