---
id: MRKL-049
title: add parent and blocks fields to taskdata types
type: feat
status: done
created: '2026-03-08'
flag: completed
---

## Description

Extend TaskData, CreateTaskOpts, and EditTaskResult with optional parent and blocks fields. Update template render/parse to handle new frontmatter.

## Acceptance Criteria

- [x] parent?: string added to TaskData, CreateTaskOpts, EditTaskResult
- [x] blocks?: string[] added to TaskData, CreateTaskOpts, EditTaskResult
- [x] render() writes parent and blocks to frontmatter when present, omits when not set
- [x] parse() reads parent and blocks from frontmatter
- [x] round-trip tests pass for tasks with and without relationships
