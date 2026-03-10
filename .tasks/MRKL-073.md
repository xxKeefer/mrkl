---
id: MRKL-073
title: list-tui render snapshots — empty and basic states
type: test
status: todo
created: '2026-03-10'
parent: MRKL-058
blocks:
  - MRKL-070
  - MRKL-068
---

## Description

Tier 1 snapshot tests in src/tui/list-tui.spec.ts (new file). Use makeListState() and renderToScreen. Snapshots: empty task list at 40/80/120 cols, and a basic list with 5-6 mixed tasks at 80 cols.

## Acceptance Criteria

- [ ] snapshot: empty task list at 40 cols
- [ ] snapshot: empty task list at 80 cols
- [ ] snapshot: empty task list at 120 cols
- [ ] snapshot: basic task list (5-6 tasks) at 80 cols
- [ ] pnpm test passes
