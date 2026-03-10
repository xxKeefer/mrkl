---
id: MRKL-067
title: add rendertoscreen helper using xterm-headless
type: test
status: todo
created: '2026-03-10'
parent: MRKL-056
blocks:
  - MRKL-066
---

## Description

Add renderToScreen(ansiOutput, cols, rows) to src/tui/tui-test-harness.ts. Uses @xterm/headless Terminal + @xterm/addon-serialize SerializeAddon to interpret raw ANSI escape codes and return the plain-text screen buffer (what the user actually sees). This converts unreadable ANSI strings into snapshotable text grids.

## Acceptance Criteria

- [ ] renderToScreen writes ANSI to xterm-headless and returns plain text via SerializeAddon
- [ ] handles cursor movement, clear screen, colors, alt screen correctly
- [ ] unit test in tui-test-harness.spec.ts verifies a simple ANSI sequence renders to expected text
