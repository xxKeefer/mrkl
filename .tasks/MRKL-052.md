---
id: MRKL-052
title: add parent and blocks fields to interactive create tui
type: feat
status: todo
created: '2026-03-08'
---

## Description

Add a fuzzy-find autocomplete text field for parent and a multi-entry fuzzy-find field for blocks (similar to acceptance criteria) to the interactive create form.

## Acceptance Criteria

- [ ] parent field shows fuzzy-filtered list of active task IDs and titles
- [ ] blocks field allows adding multiple task IDs via fuzzy-find
- [ ] only non-archived tasks appear in autocomplete
- [ ] tasks that already have a parent are excluded from parent autocomplete
