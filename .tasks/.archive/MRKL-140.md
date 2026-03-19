---
id: MRKL-140
title: temporal base36 ids
type: feat
status: closed
created: '2026-03-19'
flag: >-
  Superseded: scope absorbed into parent MRKL-126 which now implements the
  temporal IDs plan directly
parent: MRKL-126
priority: 3
---

## Description

Replace sequential counter IDs with timestamp-based base36 IDs (ddd-mmmmmm). Eliminates counter, config, sync, merge, git hooks. See .plans/spike_temporal-ids.md

## Acceptance Criteria

- [ ] generateId() produces base36 days-millis format (10 chars)
- [ ] IDs sort lexicographically in chronological order
- [ ] No counter file, config file, sync command, or git hooks
- [ ] Auto-create .tasks/ on first mrkl create
- [ ] Prefix matching for task lookup
- [ ] Existing PREFIX-NNN tasks still load and display
