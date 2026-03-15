---
id: MRKL-095
title: add priority to edit interactive tui
type: feat
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-091
blocks:
  - MRKL-097
---

## Description

Add priority field to interactiveEdit in create-tui.ts. Show current priority with emoji label, allow cycling through 1-5 values. Include priority in EditTaskResult so it persists on save.

## Acceptance Criteria

- [x] interactive edit TUI shows priority field with emoji label
- [x] priority is editable by cycling through 1-5 values
- [x] priority included in EditTaskResult on save
- [x] existing tests pass (pnpm test)
- [x] typecheck passes (pnpm typecheck)
