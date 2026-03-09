---
id: MRKL-054
title: epic cascade prompt on done and close commands
type: feat
status: done
created: '2026-03-08'
flag: completed
---

## Description

When done or close targets a task with active children, prompt user with cancel/cascade/orphan options.

## Acceptance Criteria

- [x] done on epic with open children shows prompt with 3 options
- [x] cancel aborts the operation
- [x] cascade marks all children as done and archives them
- [x] orphan removes parent field from children and appends <orphan of ID> to flag
- [x] close behaves the same but cascades as closed instead of done
- [x] orphan flag appends in angle brackets, preserving existing flag content
- [x] tests cover all three paths for both done and close
