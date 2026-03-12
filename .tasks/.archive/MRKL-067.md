---
id: MRKL-067
title: add rendertoscreen helper using xterm-headless
type: test
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-056
blocks:
  - MRKL-066
---

## Description

Add `renderToScreen(ansiOutput, cols, rows)` to `src/tui/tui-test-harness.ts`. Uses `@xterm/headless` Terminal to interpret raw ANSI escape codes and reads the virtual terminal buffer directly via `buffer.active.getLine()` to return the plain-text screen buffer — what a user would actually see. Trailing blank lines are trimmed. This converts unreadable ANSI strings into snapshotable text grids.

## Acceptance Criteria

- [x] `renderToScreen` writes ANSI to xterm-headless Terminal and returns plain text from the buffer
- [x] ANSI color/style codes are stripped — output is plain text only
- [x] `CLEAR_SCREEN` resets buffer — only post-clear content appears
- [x] cursor positioning places content at correct row/col in the output
- [x] unit tests in `tui-test-harness.spec.ts` cover all four behaviors
