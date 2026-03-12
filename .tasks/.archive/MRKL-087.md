---
id: MRKL-087
title: loop back to list view after edit exit
type: feat
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-083
blocks:
  - MRKL-089
---

## Description

Wrap the `interactiveList` → `interactiveEdit` flow in `commands/list.ts` in a `while(true)` loop. After each edit (save or cancel), re-read tasks from disk and return to the list view. Only `Esc` from the list view itself breaks the loop and exits.

test the loop back manually here

## Acceptance Criteria

- [x] selecting a task and editing it returns to the list view
- [x] cancelling edit (Esc from edit) returns to the list view
- [x] pressing Esc from the list view exits the program
- [x] task data is refreshed after each edit so changes appear
- [x] existing tests pass (pnpm test)
- [x] typecheck passes (pnpm typecheck)
