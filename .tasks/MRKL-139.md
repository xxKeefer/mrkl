---
id: MRKL-139
title: plain mode search and multi-value filters
type: feat
status: todo
created: '2026-03-17'
parent: MRKL-132
priority: 3
blocks:
  - MRKL-134
  - MRKL-136
---

## Description

Add --search flag for exact substring filtering in plain mode. Support comma-separated multi-values for --status and --type. --search sets initial query in TUI mode. All flags are combinable.

## Acceptance Criteria

- [ ] mrkl list --plain --search auth outputs only tasks containing auth in id title or description
- [ ] 
- [ ] 
- [ ] 
- [ ] All flags --sort --search --status --type --no-emoji are combinable
