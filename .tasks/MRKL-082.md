---
id: MRKL-082
title: document snapshot update workflow
type: docs
status: todo
created: '2026-03-10'
parent: MRKL-056
blocks:
  - MRKL-081
---

## Description

Add a section to the project README or a TESTING.md file documenting the snapshot testing workflow: how to run tests (pnpm test), how to update snapshots (pnpm test -- -u), what the snapshots represent (xterm-headless rendered screens), and how to review snapshot diffs in PRs.

## Acceptance Criteria

- [ ] snapshot update command documented: pnpm test -- -u
- [ ] explanation of what snapshots represent
- [ ] guidance on reviewing snapshot diffs
