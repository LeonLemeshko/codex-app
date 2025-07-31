// ✅ Calculate total XP
export function calculateXP(zones) {
  return zones.reduce((totalXP, zone) => {
    return totalXP + zone.quests.reduce((zoneXP, quest) => {
      return zoneXP + (quest.completed ? quest.xp : 0);
    }, 0);
  }, 0);
}

// 🆔 Unique Quest ID Generator
export function generateQuestID() {
  return `quest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// 📊 Percentage Formatter
export function formatPercentage(value) {
  return Math.round(value * 100) / 100;
}

// 🧠 Priority Grouping Helper
export function groupQuestsByPriority(quests) {
  const buckets = {
    main: [],
    daily: [],
    side: [],
    optional: []
  };

  quests.forEach(q => {
    const priority = q.priority || 'optional';
    if (buckets[priority]) {
      buckets[priority].push(q);
    } else {
      buckets.optional.push(q); // fallback
    }
  });

  return buckets;
}

// 🔁 Toggle completion state
export function toggleQuest(zoneId, questId, zones) {
  const zone = zones.find(z => z.id === zoneId);
  const quest = zone?.quests?.find(q => q.id === questId);
  if (quest) {
    quest.completed = !quest.completed;
  }
}
