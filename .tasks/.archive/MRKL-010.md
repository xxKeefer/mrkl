---
id: MRKL-010
title: plan-from-task skill
type: feat
status: done
created: '2026-03-01'
---
## Description

Add a `plan-from-task` Claude Code skill and an `install-skills` CLI command.

The skill accepts a task reference (file path or task ID like MRKL-001), reads the mrkl task file,
assesses whether the description and acceptance criteria are sufficient, asks clarifying questions
if needed, then enters plan mode to create an implementation plan. After approval the agent updates
the task file's description and acceptance criteria to match the plan, then implements the changes.
The YAML frontmatter and markdown headings are never modified.

The `install-skills` command copies all bundled skills from the mrkl package's `/skills` directory
into `.claude/skills/` in the current working directory so they are available to Claude Code agents.

## Acceptance Criteria

- [ ] skill is made and resides in `/skills/plan-from-task/SKILL.md` at the repo root
- [ ] a new command `install-skills` exists at `src/commands/install-skills.ts`
- [ ] `install-skills` copies skills from `/skills` into `.claude/skills/` in the calling directory
- [ ] `install-skills` is documented in README.md
- [ ] `install-skills` has no alias
- [ ] `skills` directory added to `files` in `package.json` so it ships with the package
- [ ] tests cover command registration, no-alias constraint, and file copying behaviour
