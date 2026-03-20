---
id: MRKL-128
title: sync command - id collision detection and renumbering
type: feat
status: closed
created: '2026-03-17'
flag: superseded by MRKL-140 temporal IDs — merge infrastructure being removed
parent: MRKL-126
priority: 5
blocks:
  - MRKL-127
---

## Description

Build mrkl sync command that detects duplicate task IDs after merge, renumbers incoming tasks (main wins), updates parent/blocks refs, and prints a renumber map.

## Acceptance Criteria

- [ ] Scans .tasks/ and .tasks/.archive/ for duplicate IDs
- [ ] Main task keeps the ID; incoming task gets next available ID
- [ ] Renumbered tasks have id field, filename (including verbose mode), and all parent/blocks refs updated
- [ ] Prints old ID to new ID mapping
- [ ] No-op with nothing to sync message when no collisions exist
- [ ] Idempotent - safe to run multiple times
