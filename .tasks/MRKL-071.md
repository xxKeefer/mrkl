---
id: MRKL-071
title: create-tui render snapshots — empty form at 40-80-120 cols
type: test
status: todo
created: '2026-03-10'
parent: MRKL-058
blocks:
  - MRKL-069
  - MRKL-068
---

## Description

Tier 1 snapshot tests in src/tui/create-tui.spec.ts. Use makeFormState() with defaults (empty create form) and renderToScreen at 40, 80, and 120 column widths. Call render(state, mockStdout), capture output, pipe through renderToScreen, and toMatchSnapshot(). Three separate snapshots, one per width.

## Acceptance Criteria

- [ ] snapshot test for empty create form at 40 cols
- [ ] snapshot test for empty create form at 80 cols
- [ ] snapshot test for empty create form at 120 cols
- [ ] all snapshots written to __snapshots__/ beside spec file
- [ ] pnpm test passes
