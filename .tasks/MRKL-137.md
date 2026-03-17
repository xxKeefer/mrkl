---
id: MRKL-137
title: wrap relationship ids with aligned indentation
type: fix
status: todo
created: '2026-03-17'
parent: MRKL-132
priority: 4
---

## Description

Wrap long relationship ID lists in preview with label-aligned continuation lines. IDs are atomic tokens that never split across lines. Supersedes MRKL-114.

## Acceptance Criteria

- [ ] Relationship IDs wrap at preview width with continuation lines aligned to the first ID
- [ ] No task ID is ever split across two lines
- [ ] Works for Children, Blocks, and Blocked by lines
