---
id: MRKL-076
title: create-tui interaction tests — text input and submit
type: test
status: todo
created: '2026-03-10'
parent: MRKL-058
blocks:
  - MRKL-075
---

## Description

Tier 2 keyboard interaction tests in src/tui/create-tui.spec.ts. Tests: type characters into title field (verify text appears on screen), submit with Enter (verify form submits), cancel with Esc (verify form cancels). Use node-pty + xterm-headless to capture and snapshot each state.

## Acceptance Criteria

- [ ] test: typing characters into title field shows text on screen
- [ ] test: pressing Enter on filled form triggers submit
- [ ] test: pressing Esc cancels form
- [ ] pnpm test passes
