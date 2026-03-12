---
id: MRKL-116
title: improve test coverage for high-risk commands
type: test
status: todo
created: '2026-03-12'
---

## Description

Parent epic. 3 high-risk commands (create, list, edit) and 1 medium-risk command (prune) have no command-level specs. TUI interaction is already covered in create-tui.spec.ts and list-tui.spec.ts — these tasks target the CLI-flag / non-interactive paths and error handling at the command layer. Also adds code coverage tooling to CI.

## Acceptance Criteria

