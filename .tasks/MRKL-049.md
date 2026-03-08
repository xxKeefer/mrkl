---
id: MRKL-049
title: add parent and blocks fields to taskdata types
type: feat
status: todo
created: '2026-03-08'
---

## Description

Extend TaskData, CreateTaskOpts, and EditTaskResult with optional parent and blocks fields. Update template render/parse to handle new frontmatter.

## Acceptance Criteria

- [ ] parent?: string added to TaskData, CreateTaskOpts, EditTaskResult
- [ ] blocks?: string[] added to TaskData, CreateTaskOpts, EditTaskResult
- [ ] render() writes parent and blocks to frontmatter when present, omits when not set
- [ ] parse() reads parent and blocks from frontmatter
- [ ] round-trip tests pass for tasks with and without relationships
