---
id: MRKL-006
type: test
status: done
created: 2026-03-01T00:00:00.000Z
---
## Description

Implement the test suites for all core modules using vitest. Tests should use temporary directories for filesystem isolation. Follow TDD principles — each placeholder test in `tests/` should be filled in with real assertions verifying the module's public interface.

## Acceptance Criteria

- [ ] `tests/config.test.ts` covers loadConfig, initConfig, defaults, idempotency, and error cases
- [ ] `tests/counter.test.ts` covers nextId, currentId, initialization from zero, and persistence
- [ ] `tests/template.test.ts` covers render output, parse extraction, and round-trip correctness
- [ ] `tests/task.test.ts` covers createTask, listTasks filtering, archiveTask, and error cases
- [ ] All tests use temporary directories and clean up after themselves
- [ ] All tests pass with `npm test`
