---
id: MRKL-133
title: trim task titles at data layer
type: fix
status: todo
created: '2026-03-17'
parent: MRKL-132
priority: 4
---

## Description

Apply normalizeTitle() in template.ts parse() so all task files get clean titles at read time. Fixes misaligned column dividers caused by whitespace in frontmatter titles.

## Acceptance Criteria

- [ ] A task with title '  foo  ' in frontmatter displays as 'foo' in both list and preview
- [ ] Existing tasks with clean titles are unaffected
