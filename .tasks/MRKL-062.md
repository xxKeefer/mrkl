---
id: MRKL-062
title: decompose create-tui into focused modules
type: refactor
status: todo
created: '2026-03-09'
priority: 2
---

## Description

create-tui.ts has 41 symbols — the densest file in the project. Break it into smaller, focused modules (field renderers, navigation, validation) to reduce complexity and improve testability.

## Acceptance Criteria

- [ ] create-tui.ts symbol count reduced by at least 50%
- [ ] extracted modules are individually testable
- [ ] existing create-tui.spec.ts tests still pass
- [ ] no user-facing behavior changes
