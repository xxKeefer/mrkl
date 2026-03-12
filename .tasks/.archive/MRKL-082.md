---
id: MRKL-082
title: document snapshot update workflow
type: docs
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-056
blocks:
  - MRKL-081
---

## Description

Updated `docs/snapshot-testing.md` to cover the full snapshot testing workflow: quick-reference commands, the two kinds of snapshots (render vs interaction/e2e), updated file locations (list-tui and e2e snapshots now exist), PR review guidance for snapshot diffs, and consistent use of the `-u` shorthand flag.

## Acceptance Criteria

- [x] snapshot update command documented: `pnpm test -- -u`
- [x] explanation of what snapshots represent (render snapshots vs interaction/e2e snapshots)
- [x] guidance on reviewing snapshot diffs in PRs
