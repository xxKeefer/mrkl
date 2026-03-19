---
id: MRKL-126
title: temporal base36 ids
type: feat
status: in-progress
created: '2026-03-15'
priority: 3
---

## Description

Replace sequential counter IDs with temporal base36 IDs (`ddd-mmmmmm`). Eliminates counter, config, sync, merge, and git hooks — solving multiplayer workflow by making ID collisions near-impossible. Implementation plan: `.plans/plan_temporal-ids.md`

## Acceptance Criteria

- [ ] `generateId()` produces `{base36 days}-{base36 millis}` format (10 chars)
- [ ] IDs sort lexicographically in chronological order
- [ ] No counter file, config file, sync command, or git hooks
- [ ] Auto-create `.tasks/` on first `mrkl create`
- [ ] Prefix matching for task lookup
- [ ] Existing `PREFIX-NNN` tasks still load and display
- [ ] All tests pass, lint clean, typecheck clean
