---
id: MRKL-077
title: create-tui interaction tests — autocomplete flow
type: test
status: todo
created: '2026-03-10'
parent: MRKL-058
blocks:
  - MRKL-076
---

## Description

Tier 2 keyboard interaction tests in src/tui/create-tui.spec.ts. Tests for autocomplete fields (parent, blocks): navigate to parent field, type partial text, verify suggestions appear, arrow down to highlight suggestion, press Enter to select, verify selected value shows. Same for blocks add field.

## Acceptance Criteria

- [ ] test: typing in parent field shows filtered suggestions
- [ ] test: arrow keys navigate suggestion list
- [ ] test: Enter selects highlighted suggestion
- [ ] test: selected parent displays correctly in form
- [ ] pnpm test passes
