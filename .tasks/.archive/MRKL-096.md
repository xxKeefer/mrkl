---
id: MRKL-096
title: show priority in list view and preview
type: feat
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-091
blocks:
  - MRKL-097
  - MRKL-111
---

## Description

Add priority emoji column to the interactive list view in list-tui.ts. Show the priority emoji (⏬🔽⏹️🔼⏫) as a compact column in the task row. Include priority with emoji label in the preview panel. Tasks without explicit priority display as ⏹️ (normal).

## Acceptance Criteria

- [x] priority emoji appears as a column in list view rows
- [x] priority with label shown in preview panel
- [x] tasks without priority field display as normal (⏹️)
- [x] existing tests pass (pnpm test)
- [x] typecheck passes (pnpm typecheck)
