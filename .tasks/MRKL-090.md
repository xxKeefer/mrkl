---
id: MRKL-090
title: edit command should support modifying relationships
type: fix
status: todo
created: '2026-03-10'
---

## Description

The edit command (both CLI flags and interactive TUI) does not support adding/removing blocks relationships or changing/removing parent. Users must manually edit task markdown files to modify these fields. Add --blocks, --parent, and --no-parent flags to the edit CLI, and add relationship fields to the interactive edit TUI.

## Acceptance Criteria

- [ ] edit command accepts --blocks flag to set/update blocks list
- [ ] edit command accepts --parent flag to set/change parent
- [ ] edit command accepts --no-parent flag to remove parent
- [ ] interactive edit TUI includes fields for parent and blocks
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
