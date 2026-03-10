---
id: MRKL-066
title: create tui-test-harness.ts with createmockstdout
type: test
status: todo
created: '2026-03-10'
parent: MRKL-056
blocks:
  - MRKL-065
---

## Description

Create src/tui/tui-test-harness.ts with a createMockStdout(columns, rows) function that returns a mock NodeJS.WriteStream with configurable dimensions and a capture buffer. This is the foundation for all TUI snapshot tests.

## Acceptance Criteria

- [ ] createMockStdout returns object with columns, rows, and write() that captures output
- [ ] exported from src/tui/tui-test-harness.ts
- [ ] TypeScript types are correct — passes typecheck
