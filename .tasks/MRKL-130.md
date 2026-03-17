---
id: MRKL-130
title: frontmatter merge strategy
type: feat
status: todo
created: '2026-03-17'
parent: MRKL-126
priority: 4
blocks:
  - MRKL-128
---

## Description

Extend mrkl sync to detect and resolve frontmatter conflicts when the same task is edited on two branches, applying field-level merge rules.

## Acceptance Criteria

- [ ] Detects git conflict markers in task files or duplicate task entries with same ID but different content
- [ ] status: most advanced wins (todo < in-progress < done < closed)
- [ ] priority: lower number wins
- [ ] blocks/acceptance_criteria: union, deduplicated
- [ ] title/description/type/parent: flagged for manual resolution when both sides changed
- [ ] Prints summary of auto-resolved and manually-flagged fields
