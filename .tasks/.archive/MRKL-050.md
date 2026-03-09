---
id: MRKL-050
title: add relationship computation functions to task module
type: feat
status: done
created: '2026-03-08'
flag: completed
---

## Description

Pure functions that derive inverse relationships from loaded task arrays. Also add validation helpers for parent/blocks existence.

## Acceptance Criteria

- [x] getChildren(tasks, epicId) returns tasks where parent === epicId
- [x] getBlockedBy(tasks, taskId) returns tasks that include taskId in their blocks
- [x] validateParent checks target exists in active tasks and is not itself a child
- [x] validateBlocks checks all targets exist in active tasks
- [x] resolveTaskId used for all ID inputs (full, zero-padded, numeric)
- [x] unit tests cover all helpers
