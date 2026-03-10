---
id: MRKL-068
title: add state factories to tui-test-harness
type: test
status: todo
created: '2026-03-10'
parent: MRKL-056
blocks:
  - MRKL-067
---

## Description

Add makeFormState(overrides?) and makeListState(overrides?) factory functions to src/tui/tui-test-harness.ts. These return valid default FormState and ListRenderState objects with sensible defaults that tests can override via Partial<T>. Depends on the export refactors in MRKL-069 and MRKL-070.

## Acceptance Criteria

- [ ] makeFormState returns valid FormState with all required fields populated
- [ ] makeListState returns valid ListRenderState with all required fields populated
- [ ] both accept Partial overrides to customize specific fields
- [ ] unit tests verify defaults and overrides
