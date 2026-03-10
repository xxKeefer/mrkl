---
id: MRKL-098
title: flag field not exposed in create-edit cli or tui
type: fix
status: todo
created: '2026-03-10'
---

## Description

The flag field exists in TaskData and is rendered in template.ts but is not exposed via --flag on the create command, not editable in the edit TUI, and not shown in the list view or preview. Add --flag to create CLI, add flag field to interactive create and edit TUIs, and display flag in list view and preview.

## Acceptance Criteria

- [ ] 
- [ ] flag field appears in interactive create TUI
- [ ] flag field editable in interactive edit TUI
- [ ] flag shown in list view preview panel
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
