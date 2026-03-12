---
id: MRKL-120
title: add edit command spec for cli-mode paths
type: test
status: todo
created: '2026-03-12'
parent: MRKL-116
---

## Description

Create src/commands/edit.spec.ts following close.spec.ts pattern. Mock logger and TUI imports (interactiveList, interactiveEdit). Test: direct ID mode finds task and opens edit form, updateTask called with edit result, logger.update confirms success, error when task ID not found triggers process.exit, no-op when interactiveEdit returns null (user cancels), and interactive mode (no ID arg) delegates to interactiveList then interactiveEdit.

## Acceptance Criteria

- [ ] edit.spec.ts exists as colocated sibling
- [ ] tests cover: direct ID mode finds and updates task
- [ ] tests cover: logger.update called with updated task info
- [ ] tests cover: null result from interactiveEdit is a no-op
- [ ] tests cover: missing task ID triggers error exit
- [ ] all existing tests pass (pnpm test)
- [ ] pnpm lint && pnpm typecheck pass
