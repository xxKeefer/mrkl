---
id: MRKL-126
title: temporal base36 ids
type: feat
status: done
created: '2026-03-15'
flag: completed
priority: 3
---

## Description

Replace sequential counter IDs with temporal base36 IDs (`ddd-mmmmmm`). Eliminates counter, config, sync, merge, and git hooks — solving multiplayer workflow by making ID collisions near-impossible. Implementation plan: `.plans/plan_temporal-ids.md`

## Acceptance Criteria

- [x] `generateId()` produces `{base36 days}-{base36 millis}` format (10 chars)
- [x] IDs sort lexicographically in chronological order
- [x] No counter file, config file, sync command, or git hooks
- [x] Auto-create `.tasks/` on first `mrkl create`
- [x] Prefix matching for task lookup
- [x] Existing `PREFIX-NNN` tasks still load and display
- [x] All tests pass, lint clean, typecheck clean
