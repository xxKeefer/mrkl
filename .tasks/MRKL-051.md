---
id: MRKL-051
title: add -parent and -blocks flags to create command
type: feat
status: todo
created: '2026-03-08'
---

## Description

Extend create command to accept relationship flags. Validate targets on creation. Wire through to createTask.

## Acceptance Criteria

- [ ] 
- [ ] 
- [ ] validation rejects archived or nonexistent parent/blocks targets
- [ ] validation rejects setting parent to a task that already has a parent (no nested epics)
- [ ] ID resolution works for full, zero-padded, and numeric IDs
