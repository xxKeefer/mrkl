---
id: MRKL-024
title: prune command
type: feat
status: done
created: '2026-03-02'
---

## Description

takes a date YYYY-MM-DD or YYYYMMDD and deletes all tasks from the the .archive before or on that
date

## Acceptance Criteria

- [ ] `parseCutoffDate` validates and normalizes YYYY-MM-DD and YYYYMMDD input
- [ ] `pruneTasks` identifies archived tasks created on or before cutoff date
- [ ] `executePrune` deletes specified files from archive directory
- [ ] `prune` command with required positional date argument
- [ ] `--force` / `-f` flag skips confirmation prompt
- [ ] `p` shorthand alias registered in CLI
- [ ] handles unquoted YAML dates (Date objects from gray-matter)
- [ ] preview lists tasks before confirming deletion
- [ ] all new and existing tests pass
- [ ] project builds without errors
