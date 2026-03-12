---
id: MRKL-078
title: list-tui interaction tests — navigation and search
type: test
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-058
blocks:
  - MRKL-074
---

## Description

Tier 2 keyboard interaction tests in src/tui/list-tui.spec.ts. Use node-pty + xterm-headless. Tests: arrow key navigation (up/down moves selection highlight), search/filter by typing (verify list filters as characters are typed), tab switch between Tasks and Archive tabs, select with Enter (verify correct task selected), cancel with Esc.

## Acceptance Criteria

- [x] test: arrow down moves selection to next task
- [x] test: arrow up moves selection to previous task
- [x] test: typing characters filters the task list
- [x] test: Tab key switches between Tasks and Archive
- [x] test: Enter selects the highlighted task
- [x] test: Esc cancels and exits
- [x] pnpm test passes
