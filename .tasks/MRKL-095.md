---
id: MRKL-095
title: add priority to edit interactive tui
type: feat
status: todo
created: '2026-03-10'
parent: MRKL-091
blocks:
  - MRKL-097
---

## Description

Add priority field to interactiveEdit in create-tui.ts. Show current priority with emoji label, allow cycling through 1-5 values. Include priority in EditTaskResult so it persists on save.

## Acceptance Criteria

- [ ] interactive edit TUI shows priority field with emoji label
- [ ] priority is editable by cycling through 1-5 values
- [ ] priority included in EditTaskResult on save
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
