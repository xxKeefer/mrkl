---
id: MRKL-119
title: add list command spec for command orchestration
type: test
status: todo
created: '2026-03-12'
parent: MRKL-116
---

## Description

Extend src/commands/list.spec.ts with tests for the command-level orchestration: filter passing (--type, --status flags forwarded to listTasks), plain-vs-TTY detection (process.stdout.isTTY false forces plain, --plain flag forces plain), and the interactive loop path (mock TUI imports, verify interactiveList is called with correct tasks/archivedTasks, verify updateTask called when interactiveEdit returns a result, verify loop exits on null selection).

## Acceptance Criteria

- [ ] tests cover: --type filter passed to listTasks
- [ ] tests cover: --status filter passed to listTasks
- [ ] tests cover: non-TTY stdout forces plain output
- [ ] tests cover: --plain flag forces plain output even on TTY
- [ ] tests cover: interactive loop calls updateTask on edit result
- [ ] tests cover: interactive loop exits cleanly on null selection
- [ ] all existing tests pass (pnpm test)
- [ ] pnpm lint && pnpm typecheck pass
