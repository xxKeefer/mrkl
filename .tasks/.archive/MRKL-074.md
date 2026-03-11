---
id: MRKL-074
title: list-tui render snapshots — advanced states
type: test
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-058
blocks:
  - MRKL-073
---

## Description

Tier 1 snapshot tests in src/tui/list-tui.spec.ts. Additional snapshots for complex UI states: epic grouping (parent + children + standalone tasks), tasks with blocking indicators, archive tab active, scroll offset > 0, and title truncation at 40 col narrow width.

## Acceptance Criteria

- [x] snapshot: epic grouping (parent with children) at 80 cols
- [x] snapshot: tasks with blocking indicators at 80 cols
- [x] snapshot: archive tab active at 80 cols
- [x] snapshot: scroll offset > 0 at 80 cols
- [x] snapshot: title truncation at 40 cols
- [x] pnpm test passes
