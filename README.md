# Codex App

The Codex is a modular productivity tracker built as a personal quest journal. It transforms everyday goals into interactive achievements, drawing on the language of storytelling and gamification. Navigate dynamic realms, prioritize tasks, and track your progress with clarity and creativity.

---

## 🔧 Features

- Tab-based navigation (Core Quests, Personal Journey, Daily Rituals, Guild Campaigns, Realms, Codex Campaigns, and more)
- Toggle quest activation, completion, and priority levels
- Priority-aware rendering and Journal filtering
- XP system with live tracking bar
- Persistent data using `localStorage`
- Publicly deployed via GitHub Pages
- Modular JSON data structure for easy expansion
- Editable quest and realm data (planned)
- Collapsible quest lines and dynamic activation (planned)

---

## 🚀 Technologies

- HTML, CSS, JavaScript (Vanilla)
- Git, GitHub
- GitHub Pages for hosting and deployment

---

## 🌐 Live App

Access it here:  
🔗 [https://leonlemeshko.github.io/codex-app/](https://leonlemeshko.github.io/codex-app/)

---

## 📘 Usage

1. Choose a panel to explore (Core Quests, Personal Journey, Daily Rituals, Guild Campaigns, Realms, Codex Campaigns, etc.)
2. View and interact with quests: toggle activation, adjust priority, mark complete
3. XP progress updates in real-time
4. Completed quests stay visible for review and motivation
5. Realms panel organizes all major life areas; completing a Realm is the highest achievement

---

## 🗺️ Realms

**Realms** are major areas of your life (Fatherhood, Health, Career, each child, etc.). Completing a Realm is the highest achievement in the app. Every quest is connected to a specific Realm, so your progress is always meaningful and organized.

**Planned Realms Features:**
- Dynamic activation: Realms start inactive and unlock their quest lines when activated
- Collapsible quest lines: Organize quests into core, side, achievement, and personal categories
- All quests explicitly linked to their parent Realm for traceability
- UI and code refactored to use "Realm" terminology exclusively

---

## 🧭 Roadmap & Progress

### ✅ Recently Accomplished (August 20, 2025)
- Fixed persistent saving/loading of Personal Journey objectives and Quest Journal using localStorage
- Retract button now removes objectives from the journal and updates UI/storage correctly
- Cleaned up navigation/UI so Personal Journey only appears in Campaign Zone
- Modularized and refactored code for easier extension to other panels
- Ready to apply Add to Journal logic to all Campaign Zone panels next

---

### 🔜 Current Objectives (as of August 15, 2025)
- When an objective is added to the Quest Journal:
  - Show a "progress pending" visual next to it and hide the "Add to Journal" button
  - Display a quest progress tracker showing how far along the quest is
  - Add a retract quest button to allow sending the quest back to its panel of origin
  - Add a restart quest button, available both in the panel of origin and the Quest Journal, to reset quest progress
  - Ensure all these controls and visuals (progress tracker, XP tracker, retract/restart buttons) are visible for the quest in both the Quest Journal and its campaign zone panel
  - All logic and visuals must work consistently across all campaign zone panels
- Add logic for repeatable quests: allow marking objectives as repeatable and provide options to reassign them to other panels (e.g., Daily Rituals) before adding
- Design and implement flexible relocation and reassignment options for every quest and quest line, allowing movement between panels and categories
- Wireframe and brainstorm improved integration for quest relocation, reassignment, and category/priority adjustment directly from each panel
- Expand category and priority controls to allow setting these properties before filtering quests into the Quest Journal
- Continue modularizing and refactoring code for scalability and flexibility
- Refactor Quest Journal to have no hardcoded data and be only loaded through filtering functions but still have editing capabilities, keeping the same template foundation when quests are filtered in and categorized
- Establish foundational JSON structures for Realms, Guild Campaigns, Daily Rituals, and Personal Journey
- Ensure each quest is connected to a specific Realm for traceability
- Finalize Realms panel loading and rendering logic
- Implement collapsible quest lines and dynamic activation for Realms
- Refactor all code and UI references to avoid "zone" except in legacy or planned features
- Add descriptions and tooltips for new panels and buttons
- Continue modularizing JSON data for scalability
- Polish UI for Realms and Codex Campaigns panels
- Update README.md and documentation as features are completed

---

### 📝 Development Notes

- All new features, naming conventions, and UI changes are tracked in this README and in project briefings.
- Date/Time for next session: **August 15, 2025**  
  Resume with wireframing and logic for quest relocation and category/priority controls.

_Last updated: August 15, 2025_

---

## 🧭 Long-Term Roadmap

- 🔄 Replace placeholder quests with real-life objectives
- 🧱 Add new realms with modular scalability
- ✍️ Build an in-app quest editor (create/update directly in the UI)
- 📅 Introduce daily/weekly quest cycles and expiration logic
- 📱 Polish mobile UX and visual layout
- 🏆 Implement achievement flags and deeper progression tracking

---

## 🤝 Author

Built by [LeonLemeshko](https://github.com/LeonLemeshko)

---