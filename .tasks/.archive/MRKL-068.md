---
id: MRKL-068
title: add state factories to tui-test-harness
type: test
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-056
blocks:
  - MRKL-067
---

## Description

Added state factories (`makeTask`, `makeFormState`, `makeListState`) and `ListRenderState` type to `src/tui/tui-test-harness.ts`. Exported `FormState` and `FormMode` from `src/tui/create-tui.ts`. All factories accept `Partial<T>` overrides.

## Acceptance Criteria

- [x] makeFormState returns valid FormState with all required fields populated
- [x] makeListState returns valid ListRenderState with all required fields populated
- [x] both accept Partial overrides to customize specific fields
- [x] unit tests verify defaults and overrides
- [x] makeTask helper returns valid TaskData with defaults and overrides
