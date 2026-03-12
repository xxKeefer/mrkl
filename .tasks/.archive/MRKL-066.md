---
id: MRKL-066
title: create tui-test-harness.ts with createmockstdout
type: test
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-056
blocks:
  - MRKL-065
---

## Description

TUI test harness providing `createMockStdout(columns, rows)` — returns a `MockStdout` (cast `NodeJS.WriteStream` with `getOutput()` and `reset()` helpers). Mocks only what TUI render functions actually use: `columns`, `rows`, and `write()`. Foundation for all TUI snapshot tests.

## Acceptance Criteria

- [x] `createMockStdout` returns object with configurable `columns` and `rows`
- [x] `write()` captures string data into an internal buffer
- [x] `getOutput()` returns accumulated written output
- [x] `reset()` clears the buffer for reuse between renders
- [x] Exported `MockStdout` type for downstream test usage
- [x] TypeScript types are correct — passes typecheck
- [x] Co-located spec file with full coverage
