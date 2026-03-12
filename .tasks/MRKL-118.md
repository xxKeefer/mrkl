---
id: MRKL-118
title: add list command spec for plain-text output
type: test
status: todo
created: '2026-03-12'
parent: MRKL-116
blocks:
  - MRKL-119
---

## Description

Create src/commands/list.spec.ts covering the --plain / non-TTY output path. Mock logger. The plain output branch has substantial formatting: formatRow column alignment, epic grouping with tree characters (├─ └─), blocking/blockedBy indicators, archive section rendering, and empty-state message. Use the same tmp-dir + writeTask pattern from close.spec.ts.

## Acceptance Criteria

- [ ] list.spec.ts exists as colocated sibling
- [ ] tests cover: plain output header row and separator
- [ ] tests cover: epic grouping with tree prefix characters
- [ ] tests cover: blocking and blockedBy indicator suffixes
- [ ] tests cover: archive section renders below main tasks
- [ ] tests cover: empty state logs 'No tasks found'
- [ ] all existing tests pass (pnpm test)
- [ ] pnpm lint && pnpm typecheck pass
