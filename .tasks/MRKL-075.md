---
id: MRKL-075
title: create-tui interaction tests — field navigation
type: test
status: todo
created: '2026-03-10'
parent: MRKL-058
blocks:
  - MRKL-072
---

## Description

Tier 2 keyboard interaction tests in src/tui/create-tui.spec.ts. Use node-pty to spawn the create TUI in a real pseudo-terminal, send keystrokes, and capture screen state via xterm-headless at each step. Tests: navigate fields with up/down arrow keys, cycle type with left/right arrows, verify cursor position and field highlighting change correctly.

## Acceptance Criteria

- [ ] test: arrow down moves to next field, snapshot shows new field highlighted
- [ ] test: arrow up moves to previous field
- [ ] test: left/right arrows cycle type options on type field
- [ ] each interaction step produces a snapshot
- [ ] pnpm test passes
