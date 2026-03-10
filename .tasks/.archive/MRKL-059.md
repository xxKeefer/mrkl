---
id: MRKL-059
title: standardize test colocation
type: chore
status: done
created: '2026-03-09'
flag: completed
---

## Description

Move integration tests from tests/ to colocated spec files next to their source. Align all test files to the *.spec.ts sibling convention per CLAUDE.md.

## Acceptance Criteria

- [x] tests/task.test.ts merged into src/task.spec.ts
- [x] tests/config.test.ts becomes src/config.spec.ts
- [x] tests/counter.test.ts becomes src/counter.spec.ts
- [x] tests/template.test.ts becomes src/template.spec.ts
- [x] tests/cli.test.ts becomes src/cli.spec.ts
- [x] tests/ directory only contains e2e or integration tests
- [x] vitest config updated if needed
- [x] all 196+ tests still pass
