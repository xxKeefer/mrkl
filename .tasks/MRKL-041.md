---
id: MRKL-041
title: create function should default to feat if not type provided
type: feat
status: todo
created: '2026-03-07'
priority: 5
---

## Description

When running mrkl create without specifying a type, default to feat instead of requiring the user to choose.

## Acceptance Criteria

- [ ] Running mrkl create 'my title' without a type argument creates a feat task|TUI still allows type selection when invoked interactively|Existing explicit type arguments still work
