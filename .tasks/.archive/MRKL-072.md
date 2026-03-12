---
id: MRKL-072
title: create-tui render snapshots — filled form states
type: test
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-058
blocks:
  - MRKL-071
---

## Description

Tier 2 snapshot tests added to `src/tui/create-tui.spec.ts` covering filled and non-default form states. Each test builds a specific `FormState` via `makeFormState()` with overrides, renders through `render()` + `renderToScreen()`, and asserts with `toMatchSnapshot()`. Five new snapshots stored in `src/tui/__snapshots__/create-tui.spec.ts.snap`.

## Acceptance Criteria

- [x] snapshot: filled create form at 80 cols (type=chore, title, description, parent, 2 blocks, 2 criteria)
- [x] snapshot: edit mode form with status field at 80 cols (taskId visible, status=in-progress)
- [x] snapshot: error state (empty title) at 80 cols (error message displayed, cursor on title)
- [x] snapshot: active autocomplete with suggestions at 80 cols (parent field active, 3 candidates, highlight=1)
- [x] snapshot: long text wrapping at 40 cols (title and description wrap across multiple visual lines)
- [x] pnpm test passes
