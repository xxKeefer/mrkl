---
id: MRKL-050
title: add relationship computation functions to task module
type: feat
status: todo
created: '2026-03-08'
---

## Description

Pure functions that derive inverse relationships from loaded task arrays. Also add validation helpers for parent/blocks existence.

## Acceptance Criteria

- [ ] getChildren(tasks, epicId) returns tasks where parent === epicId
- [ ] getBlockedBy(tasks, taskId) returns tasks that include taskId in their blocks
- [ ] validateParent checks target exists in active tasks and is not itself a child
- [ ] validateBlocks checks all targets exist in active tasks
- [ ] resolveTaskId used for all ID inputs (full, zero-padded, numeric)
- [ ] unit tests cover all helpers
