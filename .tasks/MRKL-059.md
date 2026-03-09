---
id: MRKL-059
title: standardize test colocation
type: chore
status: todo
created: '2026-03-09'
---

## Description

Move integration tests from tests/ to colocated spec files next to their source. Align all test files to the *.spec.ts sibling convention per CLAUDE.md.

## Acceptance Criteria

- [ ] tests/task.test.ts merged into src/task.spec.ts
- [ ] tests/config.test.ts becomes src/config.spec.ts
- [ ] tests/counter.test.ts becomes src/counter.spec.ts
- [ ] tests/template.test.ts becomes src/template.spec.ts
- [ ] tests/cli.test.ts becomes src/cli.spec.ts
- [ ] tests/ directory only contains e2e or integration tests
- [ ] vitest config updated if needed
- [ ] all 196+ tests still pass
