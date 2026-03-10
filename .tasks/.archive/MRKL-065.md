---
id: MRKL-065
title: install tui test dependencies
type: test
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-056
---

## Description

Install @xterm/headless, @xterm/addon-serialize, and node-pty as devDependencies. Run: pnpm add -D @xterm/headless @xterm/addon-serialize node-pty. Verify packages install cleanly and typecheck passes.

## Acceptance Criteria

- [x] pnpm add -D @xterm/headless @xterm/addon-serialize node-pty succeeds
- [x] pnpm typecheck passes with new deps
