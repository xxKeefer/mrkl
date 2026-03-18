---
id: MRKL-140
title: list tui column misalignment from emoji visual width
type: fix
status: todo
created: '2026-03-18'
priority: 3
---

## Description

padOrTruncate uses .length (code units) instead of visual width for columns, causing the divider and title columns to shift when emoji combinations have different code unit counts (e.g. ⏫🚧 vs ⏹️🛑)

## Acceptance Criteria

- [ ] divider line is vertically aligned regardless of emoji in status column
