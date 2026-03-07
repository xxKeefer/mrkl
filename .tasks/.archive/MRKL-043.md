---
id: MRKL-043
title: allow direct edditing
type: feat
status: done
created: '2026-03-07'
flag: completed
---

## Description

allow direct editing of tickets within terminal with configured editor

## Acceptance Criteria

- [x] selecting a task from the list tui opens the task file in the terminal editor
- [x] if none configured default editor is vi
- [x] saving the file take you back to the tui
- [x] attemping to save a file with corrupt frontmatter will error and revert the file alerting the user without crashing
