---
id: MRKL-094
title: add priority flag to create command and tui
type: feat
status: todo
created: '2026-03-10'
parent: MRKL-091
blocks:
  - MRKL-097
---

## Description

Add --priority/-P flag (number 1-5) to the create command in commands/create.ts. Validate value is 1-5. Pass through to CreateTaskOpts. Add priority field to interactiveCreate in create-tui.ts as a selectable list (1-lowest through 5-highest with emoji labels). Default to 3 (normal).

## Acceptance Criteria

- [ ] 
- [ ] invalid priority values (outside 1-5) produce error
- [ ] priority passed through to createTask via CreateTaskOpts
- [ ] interactive create TUI includes priority selector with emoji labels
- [ ] priority defaults to 3 when not specified
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
