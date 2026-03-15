---
id: MRKL-094
title: add priority flag to create command and tui
type: feat
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-091
blocks:
  - MRKL-097
---

## Description

Add --priority/-P flag (number 1-5) to the create command in commands/create.ts. Validate value is 1-5. Pass through to CreateTaskOpts. Add priority field to interactiveCreate in create-tui.ts as a selectable list (1-lowest through 5-highest with emoji labels). Default to 3 (normal).

## Acceptance Criteria

- [x] invalid priority values (outside 1-5) produce error
- [x] priority passed through to createTask via CreateTaskOpts
- [x] interactive create TUI includes priority selector with emoji labels
- [x] priority defaults to 3 when not specified
- [x] existing tests pass (pnpm test)
- [x] typecheck passes (pnpm typecheck)
