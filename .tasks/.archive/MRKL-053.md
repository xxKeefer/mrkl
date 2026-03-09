---
id: MRKL-053
title: add parent and blocks fields to interactive edit tui
type: feat
status: done
created: '2026-03-08'
flag: completed
---

## Description

Pre-populate parent and blocks in the edit form. Same fuzzy-find UX as create.

## Acceptance Criteria

- [x] edit form shows current parent and blocks values
- [x] parent and blocks can be changed or cleared
- [x] same validation as create (exists, not archived, no nested epics)
- [x] updateTask writes modified relationships to file
