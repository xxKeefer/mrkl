---
id: MRKL-058
title: snapshot testing for tui screens
type: test
status: closed
created: '2026-03-09'
flag: covered by mrkl-056 now
---

## Description

Add terminal snapshot testing for all TUI screens (create-tui, list-tui, edit-tui). Test at multiple terminal widths to catch overflow and visual bugs. Depends on MRKL-056 e2e infrastructure.

## Acceptance Criteria

- [ ] create-tui screens snapshot tested
- [ ] list-tui screens snapshot tested
- [ ] snapshots tested at 80col, 120col, and narrow (40col) widths
- [ ] snapshot update workflow documented
