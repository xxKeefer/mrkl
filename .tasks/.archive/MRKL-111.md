---
id: MRKL-111
title: condense stastus in list view
type: refactor
status: done
created: '2026-03-12'
flag: completed
parent: MRKL-091
---

## Description

listing all the ids of bloccking rleations ships is taking too much room. we need to give it back to the title

## Acceptance Criteria

- [x] relation ship column removed
- [x] title column should have remain room of the colums truncating if too lung
- [x] if task blocks at least one task then after the status there should be a blocking emoji
- [x] if a task is blocked by at least one task then after the status there should be a blocked by emoji
- [x] if both blocking and blocked by then both emojis appear
- [x] full list of blocking relation ships only in preview
- [x] example template of status collumn: <status><priority emoji><blocked by emoji if any><blocks emoji if any>
