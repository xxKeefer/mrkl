---
id: MRKL-090
title: edit command should support modifying relationships
type: fix
status: done
created: '2026-03-10'
flag: completed
priority: 3
---

## Description

The edit command (both CLI flags and interactive TUI) does not support adding/removing blocks relationships or changing/removing parent. Users must manually edit task markdown files to modify these fields. Add --blocks, --parent, and --no-parent flags to the edit CLI, and add relationship fields to the interactive edit TUI.

## Acceptance Criteria

- [x] edit command accepts --blocks flag to set/update blocks list
- [x] edit command accepts --parent flag to set/change parent
- [x] edit command accepts --no-parent flag to remove parent
- [x] interactive edit TUI includes fields for parent and blocks
- [x] existing tests pass (pnpm test)
- [x] typecheck passes (pnpm typecheck)
