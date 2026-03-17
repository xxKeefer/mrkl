---
id: MRKL-138
title: ascii theme option
type: feat
status: todo
created: '2026-03-17'
parent: MRKL-132
priority: 3
---

## Description

Add theme config in mrkl.toml (emoji or ascii) with ASCII text equivalents for all emoji keys. Export getIcon(key) function that reads active theme. Add --no-emoji runtime flag to override config per invocation.

## Acceptance Criteria

- [ ] Setting theme = ascii in mrkl.toml replaces all emoji with ASCII text equivalents
- [ ] 
- [ ] All commands respect the theme setting including list create edit done close prune
- [ ] Default theme is emoji and existing behaviour is unchanged
