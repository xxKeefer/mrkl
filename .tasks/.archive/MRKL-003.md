---
id: MRKL-003
title: implement template module
type: feat
status: todo
created: '2026-03-01'
---

## Description

Implement the template module (`src/template.ts`) that renders `TaskData` objects to structured markdown strings with YAML frontmatter, and parses markdown content back into `TaskData` objects. Uses `gray-matter` for frontmatter handling.

## Acceptance Criteria

- [ ] `render(task)` produces a string with correct YAML frontmatter (id, type, status, created)
- [ ] `render(task)` includes a `## Description` section with the task description
- [ ] `render(task)` includes a `## Acceptance Criteria` section with items as `- [ ]` checklist
- [ ] `render(task)` handles empty description and empty acceptance criteria gracefully
- [ ] `parse(content)` extracts frontmatter fields into a `TaskData` object
- [ ] `parse(content)` extracts acceptance criteria checklist items
- [ ] `render` and `parse` round-trip correctly
