---
id: MRKL-113
title: create tui - empty blocks should not complete task
type: fix
status: done
created: '2026-03-12'
flag: completed
parent: MRKL-132
priority: 5
---

## Description

Pressing Enter on an empty blocks field in the create TUI incorrectly completes the task instead of advancing to the next field.

## Acceptance Criteria

- [x] pressing eneter on empty blocks input should take the focus to add for acs
- [x] pressing enter on empty acs should still complete ticket
