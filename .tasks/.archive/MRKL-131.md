---
id: MRKL-131
title: collision warning in create and list
type: feat
status: closed
created: '2026-03-17'
flag: superseded by MRKL-140 temporal IDs — merge infrastructure being removed
parent: MRKL-126
priority: 3
blocks:
  - MRKL-128
---

## Description

Add a lightweight collision check at the start of mrkl create and mrkl list that warns users of unresolved ID collisions and prompts to run mrkl sync.

## Acceptance Criteria

- [ ] mrkl create checks for duplicate IDs before creating a new task
- [ ] mrkl list shows a warning banner if collisions are detected
- [ ] Warning includes the colliding IDs and suggests mrkl sync
- [ ] No performance impact when no collisions exist (filename scan only)
