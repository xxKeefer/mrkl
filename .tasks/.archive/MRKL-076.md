---
id: MRKL-076
title: create-tui interaction tests — text input and submit
type: test
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-058
blocks:
  - MRKL-075
---

## Description

Tier 2 keyboard interaction tests in src/tui/create-tui.spec.ts. Tests: type characters into title field (verify text appears on screen), submit with Enter (verify form submits), cancel with Esc (verify form cancels). Use node-pty + xterm-headless to capture and snapshot each state.

## Acceptance Criteria

- [x] test: typing characters into title field shows text on screen
- [x] test: pressing Enter on filled form triggers submit
- [x] test: pressing Esc cancels form
- [x] pnpm test passes
