---
id: MRKL-072
title: create-tui render snapshots — filled form states
type: test
status: todo
created: '2026-03-10'
parent: MRKL-058
blocks:
  - MRKL-071
---

## Description

Tier 1 snapshot tests in src/tui/create-tui.spec.ts. Snapshot a filled form (title, desc, parent, blocks, criteria all populated) at 80 cols. Also snapshot: edit mode (with task ID + status field visible), error state (empty title after submit attempt), active autocomplete field with suggestions visible, and long text wrapping at 40 col narrow width.

## Acceptance Criteria

- [ ] snapshot: filled create form at 80 cols
- [ ] snapshot: edit mode form with status field at 80 cols
- [ ] snapshot: error state (empty title) at 80 cols
- [ ] snapshot: active autocomplete with suggestions at 80 cols
- [ ] snapshot: long text wrapping at 40 cols
- [ ] pnpm test passes
