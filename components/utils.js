// Utility functions for XP calculation, quest grouping, ID generation, etc.
// Shared helpers for quest and zone logic.

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

// 📝 Add Personal Journey Objective to Quest Journal
window.addObjectiveToJournal = function(journeyId, objId) {
  const journey = window.personalJourneyQuests.find(j => j.id === journeyId);
  if (!journey) return;
  const obj = (journey.objectives.active || []).find(o => o.id === objId);
  if (!obj) return;
  obj.inJournal = true;
  obj.progress = obj.progress || 0;
  window.questJournal = window.questJournal || [];
  if (!window.questJournal.some(o => o.id === objId)) {
    window.questJournal.push({
      ...obj,
      journeyTitle: journey.title,
      active: true
    });
  }
  // Optionally persist to localStorage:
  localStorage.setItem('questJournal', JSON.stringify(window.questJournal));
  localStorage.setItem('personalJourneyQuests', JSON.stringify(window.personalJourneyQuests));
};

// 🔄 Restart Personal Journey Objective
window.restartObjective = function(journeyId, objId) {
  const journey = window.personalJourneyQuests.find(j => j.id === journeyId);
  if (!journey) return;
  const obj = (journey.objectives.active || []).find(o => o.id === objId);
  if (!obj) return;
  obj.progress = 0;
  // Also update in questJournal if present
  if (window.questJournal) {
    const journalObj = window.questJournal.find(o => o.id === objId);
    if (journalObj) journalObj.progress = 0;
  }
  localStorage.setItem('questJournal', JSON.stringify(window.questJournal));
  localStorage.setItem('personalJourneyQuests', JSON.stringify(window.personalJourneyQuests));
};

// ↩️ Retract Personal Journey Objective from Quest Journal
window.retractObjectiveFromJournal = function(journeyId, objId) {
  const journey = window.personalJourneyQuests.find(j => j.id === journeyId);
  if (!journey) return;
  const obj = (journey.objectives.active || []).find(o => o.id === objId);
  if (!obj) return;
  obj.inJournal = false;
  // Remove from questJournal
  if (window.questJournal) {
    window.questJournal = window.questJournal.filter(o => o.id !== objId);
  }
  // Optionally persist to localStorage:
  localStorage.setItem('questJournal', JSON.stringify(window.questJournal));
  localStorage.setItem('personalJourneyQuests', JSON.stringify(window.personalJourneyQuests));
};
