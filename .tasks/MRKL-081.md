---
id: MRKL-081
title: cli e2e — interactive list and edit flows
type: test
status: todo
created: '2026-03-10'
parent: MRKL-056
blocks:
  - MRKL-080
---

## Description

Tier 3 e2e tests in tests/e2e/cli.spec.ts. Use node-pty. Test 'mrkl list': verify list renders with pre-seeded tasks, navigate to select a task, verify output. Test 'mrkl edit <id>': verify edit form pre-populated with task data, modify title, submit, verify task file updated on disk.

## Acceptance Criteria

- [ ] test: mrkl list renders pre-seeded tasks
- [ ] test: selecting a task in list returns correct task
- [ ] test: mrkl edit shows pre-populated form
- [ ] test: modifying and submitting edit updates task file
- [ ] pnpm test passes
