---
id: MRKL-027
title: add emojis
type: docs
status: done
created: '2026-03-02'
---

## Description

i want to make mrkl a little more fun, add relevant emojis to comand messages and through the readme, add a tagline to the top of the the readme '📝 mrkl, rhymes with sparkle ✨'

CLI Command Messages (emojis added)

┌───────────────────┬─────────────────────────────┬───────┐
│ File │ Message │ Emoji │
├───────────────────┼─────────────────────────────┼───────┤
│ init.ts │ "mrkl initialized" │ 🎉 │
├───────────────────┼─────────────────────────────┼───────┤
│ create.ts │ "Created {id}: {title}" │ 📝 │
├───────────────────┼─────────────────────────────┼───────┤
│ create.ts │ Error messages (3) │ ❌ │
├───────────────────┼─────────────────────────────┼───────┤
│ list.ts │ "No tasks found" │ 📭 │
├───────────────────┼─────────────────────────────┼───────┤
│ done.ts │ "Archived {id}" │ ✅ │
├───────────────────┼─────────────────────────────┼───────┤
│ close.ts │ "Closed {id}" │ 🚫 │
├───────────────────┼─────────────────────────────┼───────┤
│ prune.ts │ "No archived tasks..." │ 📭 │
├───────────────────┼─────────────────────────────┼───────┤
│ prune.ts │ "Found N task(s) to prune" │ 🔍 │
├───────────────────┼─────────────────────────────┼───────┤
│ prune.ts │ "Aborted" │ 👋 │
├───────────────────┼─────────────────────────────┼───────┤
│ prune.ts │ "Pruned N archived task(s)" │ 🧹 │
├───────────────────┼─────────────────────────────┼───────┤
│ install-skills.ts │ "Installed {skill}" │ 🧩 │
├───────────────────┼─────────────────────────────┼───────┤
│ install-skills.ts │ "No skills to install" │ 📭 │
├───────────────────┼─────────────────────────────┼───────┤
│ install-skills.ts │ "No skills directory found" │ ❌ │
└───────────────────┴─────────────────────────────┴───────┘

README Updates

- Added tagline: 📝 mrkl, rhymes with sparkle ✨ below the title
- Added emojis to all section headings (🤔, 📦, 🚀, 🛠️, 🏷️, 📄, 🗂️, 👥, ⚙️, 🧑‍💻, 🤝, 📜)
- Added emojis to "Why mrkl?" bullet points (🗂️, 🌿, 🤖, 📏, ⚡)
- Updated install-skills example output to match new emoji

## Acceptance Criteria
