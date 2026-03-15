---
id: MRKL-123
title: epic task to get emoji indicator
type: feat
status: done
created: '2026-03-12'
flag: completed
parent: MRKL-091
---

## Description

it is hard to see which tasks are epics in the list view. they should get an emoji indicator in the status

## Acceptance Criteria

- [x] tasks with children should have a emoji indicator ✴️
- [x] tasks that are children should have a emoji indicator ❇️
- [x] list preview tasks title line shoudl have the format `${epic/child emoji if any}${priority emoji} <task id> <task type> \n <task title>`
