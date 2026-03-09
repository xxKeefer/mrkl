---
id: MRKL-055
title: grouped epic display and dependency indicators in list view
type: feat
status: done
created: '2026-03-08'
flag: completed
---

## Description

Update both plain and TUI list views to group children under epics and show blocking/blocked-by indicators.

## Acceptance Criteria

- [x] plain list groups children under parent with tree-style indentation
- [x] plain list shows blocked by indicator on tasks with active blockers
- [x] plain list shows blocks indicator on tasks blocking others
- [x] TUI list shows same grouping and indicators
- [x] TUI preview pane shows Relationships section with parent, children, blocks, blocked-by
- [x] only active (non-archived) blockers appear in indicators
