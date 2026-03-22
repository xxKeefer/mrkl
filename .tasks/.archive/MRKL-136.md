---
id: MRKL-136
title: sort system for tui and plain mode
type: feat
status: done
created: '2026-03-17'
flag: completed
parent: MRKL-132
priority: 4
---

## Description

Add sorting by priority, status, created date, has-blocks, and is-blocked. TUI uses s to cycle sort field and d to toggle direction. Plain mode gets --sort field:direction flag. Default sort order: epics by priority desc, then children sorted by blocking-first then priority desc, then standalone tasks sorted by blocking-first then priority desc. When a named sort is active, tasks display flat instead of epic-grouped.

## Acceptance Criteria

- [x] Pressing s cycles through none, priority, status, created, blocks, blocked, none
- [x] Pressing d toggles ascending and descending direction
- [x] When sorting is active tasks display in flat sorted order not epic-grouped
- [x] When sort is none tasks display in epic-grouped order
- [x] Status bar shows current sort field and direction
- [x] mrkl list --plain --sort priority:desc outputs tasks sorted by priority descending
- [x] Direction defaults to desc when omitted from --sort
