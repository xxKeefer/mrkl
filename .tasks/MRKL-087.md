---
id: MRKL-087
title: loop back to list view after edit exit
type: feat
status: todo
created: '2026-03-10'
parent: MRKL-083
blocks:
  - MRKL-089
---

## Description

In commands/list.ts, after interactiveEdit completes (whether saved or cancelled), re-enter interactiveList instead of exiting. The loop should continue until the user presses Esc from the list view itself. Re-read tasks from disk on each loop iteration so edits are reflected.

## Acceptance Criteria

- [ ] selecting a task and editing it returns to the list view
- [ ] cancelling edit (Esc from edit) returns to the list view
- [ ] pressing Esc from the list view exits the program
- [ ] task data is refreshed after each edit so changes appear
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
