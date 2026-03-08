---
id: MRKL-053
title: add parent and blocks fields to interactive edit tui
type: feat
status: todo
created: '2026-03-08'
---

## Description

Pre-populate parent and blocks in the edit form. Same fuzzy-find UX as create.

## Acceptance Criteria

- [ ] edit form shows current parent and blocks values
- [ ] parent and blocks can be changed or cleared
- [ ] same validation as create (exists, not archived, no nested epics)
- [ ] updateTask writes modified relationships to file
