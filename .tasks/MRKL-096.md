---
id: MRKL-096
title: show priority in list view and preview
type: feat
status: todo
created: '2026-03-10'
parent: MRKL-091
blocks:
  - MRKL-097
---

## Description

Add priority emoji column to the interactive list view in list-tui.ts. Show the priority emoji (⏬🔽⏹️🔼⏫) as a compact column in the task row. Include priority with emoji label in the preview panel. Tasks without explicit priority display as ⏹️ (normal).

## Acceptance Criteria

- [ ] priority emoji appears as a column in list view rows
- [ ] priority with label shown in preview panel
- [ ] tasks without priority field display as normal (⏹️)
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
