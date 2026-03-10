---
id: MRKL-064
title: subtasking
type: feat
status: todo
created: '2026-03-10'
parent: MRKL-015
---

## Description

allow for a sub tasking feature that creates unique tasks that a children of a task being worked on in a feature branch
as a dev i want to be able to break my task into smaller units more appropriate to handle
it should function as the parent flag on the create comand, but instead be a --subtask <parentid> flag
the diferent behaviour however is that the task will be created with id of <parentid>-S<subtask number>.md

## Acceptance Criteria

- [ ] list feauture should still work and handle the new file name pattern
- [ ] the subtask number should be an auto incrementing number
- [ ] subtasks can not be parents, epics or have children or sub tasks
