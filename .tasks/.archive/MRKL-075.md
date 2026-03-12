---
id: MRKL-075
title: create-tui interaction tests — field navigation
type: test
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-058
blocks:
  - MRKL-072
---

## Description

Tier 2 keyboard interaction tests in src/tui/create-tui.spec.ts. Use node-pty to spawn the create TUI in a real pseudo-terminal, send keystrokes, and capture screen state via xterm-headless at each step. Tests: navigate fields with up/down arrow keys, cycle type with left/right arrows, verify cursor position and field highlighting change correctly.

## Acceptance Criteria

- [x] test: arrow down moves to next field, snapshot shows new field highlighted
- [x] test: arrow up moves to previous field
- [x] test: left/right arrows cycle type options on type field
- [x] each interaction step produces a snapshot
- [x] pnpm test passes
