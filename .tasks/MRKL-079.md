---
id: MRKL-079
title: cli e2e — non-interactive commands
type: test
status: todo
created: '2026-03-10'
parent: MRKL-056
blocks:
  - MRKL-065
---

## Description

Tier 3 e2e tests in tests/e2e/cli.spec.ts (new file). Spawn the CLI binary (pnpm exec tsx src/cli.ts) via child_process. Test non-interactive commands: 'mrkl create --title foo --type feat' creates a task file in a temp .tasks/ dir, verify file exists with correct frontmatter. 'mrkl done <id>' and 'mrkl close <id>' change task status correctly. Test stdout/stderr/exit codes.

## Acceptance Criteria

- [ ] test: mrkl create with --title and --type flags creates task file
- [ ] test: created task file has correct frontmatter (title, type, status)
- [ ] test: mrkl done <id> sets status to done
- [ ] test: mrkl close <id> sets status to closed
- [ ] test: exit codes are 0 for success
- [ ] tests use temp directory for isolation
- [ ] pnpm test passes
