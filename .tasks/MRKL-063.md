---
id: MRKL-063
title: import and export tasks
type: feat
status: todo
created: '2026-03-09'
---

## Description

Add import/export commands supporting JSON and CSV formats. Enables interop with external tools and prevents markdown format lock-in.

## Acceptance Criteria

- [ ] mrkl export --format json writes all active tasks to stdout
- [ ] mrkl export --format csv writes all active tasks to stdout
- [ ] mrkl import reads JSON or CSV from stdin and creates tasks
- [ ] round-trip export then import preserves all task data
- [ ] handles edge cases: empty task list, duplicate IDs on import
