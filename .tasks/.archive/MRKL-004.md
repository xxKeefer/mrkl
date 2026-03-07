---
id: MRKL-004
title: implement task module
type: feat
status: todo
created: '2026-03-01'
---
## Description

Implement the task module (`src/task.ts`) that orchestrates config, counter, template, and filesystem operations. This is the core module that all CLI commands delegate to for CRUD operations on task files.

## Acceptance Criteria

- [ ] `createTask(opts)` loads config, gets next ID, renders template, writes file with correct naming format
- [ ] `createTask(opts)` returns the created `TaskData` with all fields populated
- [ ] Task filename follows format: `{PREFIX}-{NNN} {type} - {title}.md`
- [ ] `listTasks(filter)` reads all `.md` files from tasks directory, parses them, returns `TaskData[]`
- [ ] `listTasks(filter)` supports filtering by `type` and `status`
- [ ] `listTasks(filter)` returns empty array when no tasks exist
- [ ] `archiveTask(dir, id)` finds the task file, updates status to `done`, moves it to `.archive/`
- [ ] `archiveTask(dir, id)` throws a clear error if the task ID is not found
