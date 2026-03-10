---
id: MRKL-102
title: enter in empty fuzzy find should skip
type: fix
status: todo
created: '2026-03-10'
---

## Description

it is comon for user to only fill description and then hit enter on repeat to create the task in the creat / edit TUI's, currently what happens is it selects the first item from the list. this is sort of a focus trap.

## Acceptance Criteria

- [ ] pressing enter in a empty fuzzy field should proceed to the next input
- [ ] presing enter in a fuiuzzy field with one or mor characters should select the first item in the list
