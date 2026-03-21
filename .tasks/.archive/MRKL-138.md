---
id: MRKL-138
title: ascii theme option
type: feat
status: done
created: '2026-03-17'
flag: completed
parent: MRKL-132
priority: 3
---

## Description

Add theme config in mrkl.toml (emoji or ascii) with ASCII text equivalents for all emoji keys. Export getIcon(key) function that reads active theme. Add --no-emoji runtime flag to override config per invocation.

## Acceptance Criteria

- [x] Setting theme = ascii in mrkl.toml replaces all emoji with ASCII text equivalents
- [x] All commands respect the theme setting including list create edit done close prune
- [x] Default theme is emoji and existing behaviour is unchanged
