---
id: MRKL-099
title: doctor command for task file healing
type: feat
status: todo
created: '2026-03-10'
---

## Description

Add a doctor command that scans all task files and reports/fixes issues: missing required frontmatter fields (backfill defaults like priority=3), invalid field values, orphaned parent/blocks references, and malformed markdown structure. Should have a --fix flag to auto-repair vs dry-run report mode.

## Acceptance Criteria

- [ ] doctor command registered in cli.ts with alias
- [ ] reports missing frontmatter fields with suggested defaults
- [ ] reports invalid field values (bad type, status, priority range)
- [ ] reports orphaned parent/blocks references
- [ ] 
- [ ] dry-run mode (no --fix) only reports without modifying files
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
