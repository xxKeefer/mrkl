---
id: MRKL-102
title: enter in empty fuzzy find should skip
type: fix
status: done
created: '2026-03-10'
flag: completed
---

## Description

In the create/edit TUI, pressing Enter on an empty autocomplete field (Parent, +Block) was selecting the first suggestion instead of skipping to the next field. Fixed by checking for empty input before checking suggestion highlights in `handleAutocompleteEnter()`.

## Acceptance Criteria

- [x] pressing enter in an empty fuzzy field should proceed to the next input
- [x] pressing enter in a fuzzy field with one or more characters should select the first item in the list
