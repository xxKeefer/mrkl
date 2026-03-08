---
id: MRKL-054
title: epic cascade prompt on done and close commands
type: feat
status: todo
created: '2026-03-08'
---

## Description

When done or close targets a task with active children, prompt user with cancel/cascade/orphan options.

## Acceptance Criteria

- [ ] done on epic with open children shows prompt with 3 options
- [ ] cancel aborts the operation
- [ ] cascade marks all children as done and archives them
- [ ] orphan removes parent field from children and appends <orphan of ID> to flag
- [ ] close behaves the same but cascades as closed instead of done
- [ ] orphan flag appends in angle brackets, preserving existing flag content
- [ ] tests cover all three paths for both done and close
