---
id: MRKL-024
type: feat
status: done
created: '2026-03-02'
---

## Description

takes a date YYYY-MM-DD or YYYYMMDD and deletes all tasks from the the .archive before or on that
date

## Acceptance Criteria

- [x] `parseCutoffDate` validates and normalizes YYYY-MM-DD and YYYYMMDD input
- [x] `pruneTasks` identifies archived tasks created on or before cutoff date
- [x] `executePrune` deletes specified files from archive directory
- [x] `prune` command with required positional date argument
- [x] `--force` / `-f` flag skips confirmation prompt
- [x] `p` shorthand alias registered in CLI
- [x] handles unquoted YAML dates (Date objects from gray-matter)
- [x] preview lists tasks before confirming deletion
- [x] all new and existing tests pass
- [x] project builds without errors
