---
id: MRKL-055
title: grouped epic display and dependency indicators in list view
type: feat
status: todo
created: '2026-03-08'
---

## Description

Update both plain and TUI list views to group children under epics and show blocking/blocked-by indicators.

## Acceptance Criteria

- [ ] plain list groups children under parent with tree-style indentation
- [ ] plain list shows blocked by indicator on tasks with active blockers
- [ ] plain list shows blocks indicator on tasks blocking others
- [ ] TUI list shows same grouping and indicators
- [ ] TUI preview pane shows Relationships section with parent, children, blocks, blocked-by
- [ ] only active (non-archived) blockers appear in indicators
