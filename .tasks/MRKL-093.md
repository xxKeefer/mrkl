---
id: MRKL-093
title: add priority to template render and parse
type: feat
status: todo
created: '2026-03-10'
parent: MRKL-091
blocks:
  - MRKL-094
  - MRKL-095
---

## Description

Update render() in template.ts to include priority in frontmatter when present (omit when 3/normal to keep files clean). Update parse() to read priority from frontmatter, defaulting to 3 when absent. Existing task files without priority should parse as priority 3.

## Acceptance Criteria

- [ ] render() writes priority to frontmatter when value is not 3
- [ ] render() omits priority from frontmatter when value is 3 or undefined
- [ ] parse() reads priority from frontmatter as number
- [ ] parse() defaults priority to 3 when field is absent
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
