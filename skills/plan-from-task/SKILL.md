---
name: plan-from-task
description: Generate and execute implementation plans from mrkl task files (.tasks/ directory). Use when user references a task ID (e.g., MRKL-001, PROJ-042) or a @path to a .tasks/ markdown file and wants to plan or implement it.
---

# Plan From Task

Create implementation plans from mrkl task files and execute them.

## Quick start

The user provides a task reference in one of two forms:

- **File path**: `@".tasks/PROJ-001 feat - user auth.md"` or `implement .tasks/PROJ-001...`
- **Task ID**: `PROJ-001` or `mrkl-042` (case-insensitive)

## Workflow

### 1. Locate and read the task

- **File path given**: read the file directly
- **Task ID given**: glob for `.tasks/<ID>*.md` (case-insensitive) and read the match

Parse the YAML frontmatter and markdown body. Task files follow this structure:

```markdown
---
id: PROJ-001
type: feat
status: todo
created: '2026-03-01'
---

## Description

[What needs to be done]

## Acceptance Criteria

- [ ] first criterion
- [ ] second criterion
```

### 2. Assess completeness

If the description or acceptance criteria are too vague to plan from:

- Ask the user targeted clarifying questions about scope, approach, or constraints
- Gather enough context to produce a concrete implementation plan

### 3. Plan the implementation

1. Enter plan mode
2. Explore the codebase to understand relevant architecture and patterns
3. Write a step-by-step implementation plan that addresses every acceptance criterion
4. Present the plan for user approval

### 4. Execute the plan

After approval, implement in this order:

1. **Update the task file first** — rewrite the `## Description` body and `## Acceptance Criteria`
   checklist to reflect the refined, concrete plan of what will be delivered.
   The task file doubles as the PR description, so make it clear and accurate.
2. Then implement the code changes following the plan.

## Rules

- **NEVER modify YAML frontmatter** — `id`, `type`, `status`, `created` are immutable
- **NEVER modify markdown headings** — `## Description` and `## Acceptance Criteria` must stay as-is
- You MAY rewrite the content under those headings to match the approved plan
- Use `- [ ]` checkbox format for acceptance criteria
- Follow existing codebase conventions discovered during exploration
