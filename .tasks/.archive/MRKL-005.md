---
id: MRKL-005
title: implement cli commands
type: feat
status: todo
created: '2026-03-01'
---
## Description

Wire up the CLI command implementations in `src/commands/` to call the real task module functions. Ensure `mrkl init`, `mrkl create`, `mrkl list`, and `mrkl done` work end-to-end. Add input validation for task types and clear error messages.

## Acceptance Criteria

- [ ] `mrkl init` calls `initConfig` and reports success
- [ ] `mrkl init --prefix VON` passes the prefix option through
- [ ] `mrkl create feat "add login"` creates a task file via `createTask`
- [ ] `mrkl create` validates the type argument against the allowed conventional commit types
- [ ] `mrkl list` displays all active tasks with ID, type, status, and title
- [ ] `mrkl list --type feat` filters by type
- [ ] `mrkl list --status todo` filters by status
- [ ] `mrkl done MRKL-001` archives the task via `archiveTask`
- [ ] All commands show clear error messages when run without `mrkl init` first
