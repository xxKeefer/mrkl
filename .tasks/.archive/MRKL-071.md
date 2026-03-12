---
id: MRKL-071
title: create-tui render snapshots — empty form at 40-80-120 cols
type: test
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-058
blocks:
  - MRKL-069
  - MRKL-068
---

## Description

Tier 1 snapshot tests added to `src/tui/create-tui.spec.ts`. Each test creates a `makeFormState()` default (empty create form), renders via `render(state, mockStdout)` at the target column width, pipes through `renderToScreen` for ANSI-stripped terminal output, and asserts with `toMatchSnapshot()`. Three snapshots at 40, 80, and 120 cols stored in `src/tui/__snapshots__/create-tui.spec.ts.snap`.

## Acceptance Criteria

- [x] snapshot test for empty create form at 40 cols
- [x] snapshot test for empty create form at 80 cols
- [x] snapshot test for empty create form at 120 cols
- [x] all snapshots written to __snapshots__/ beside spec file
- [x] pnpm test passes
