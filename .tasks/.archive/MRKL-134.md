---
id: MRKL-134
title: replace fuzzy search with exact substring matching
type: fix
status: done
created: '2026-03-17'
flag: completed
parent: MRKL-132
priority: 4
---

## Description

Replace Fzf fuzzy matching with case-insensitive exact substring filter. Searching 116 should only return tasks containing literal 116, not 126. Remove fzf dependency entirely.

## Acceptance Criteria

- [x] Searching 116 returns only tasks containing the literal substring 116
- [x] Search is case-insensitive
- [x] fzf dependency is removed from package.json
