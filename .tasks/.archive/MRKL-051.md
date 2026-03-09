---
id: MRKL-051
title: add -parent and -blocks flags to create command
type: feat
status: done
created: '2026-03-08'
flag: completed
---

## Description

Extend create command to accept relationship flags. Validate targets on creation. Wire through to createTask.

## Acceptance Criteria

- [x] validation rejects archived or nonexistent parent/blocks targets
- [x] validation rejects setting parent to a task that already has a parent (no nested epics)
- [x] ID resolution works for full, zero-padded, and numeric IDs
