---
id: MRKL-043
title: allow direct edditing
type: feat
status: todo
created: '2026-03-07'
---
## Description

allow direct editing of tickets within terminal with configured editor

## Acceptance Criteria

- [ ] selecting a task from the list tui opens the task file in the terminal editor
- [ ] if none configured default editor is vi
- [ ] saving the file take you back to the tui
- [ ] attemping to save a file with corrupt frontmatter will error and revert the file alerting the user without crashing
