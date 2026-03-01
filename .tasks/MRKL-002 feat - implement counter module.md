---
id: MRKL-002
type: feat
status: todo
created: 2026-03-01
---

## Description

Implement the counter module (`src/counter.ts`) that manages the `mrkl_counter` file for auto-incrementing task IDs. The module provides atomic read-and-increment operations.

## Acceptance Criteria

- [ ] `nextId(dir)` reads the current counter, increments it, writes back, and returns the new value
- [ ] `nextId(dir)` initializes from 0 if the counter file does not exist (first call returns 1)
- [ ] `nextId(dir)` persists the updated value so subsequent calls continue incrementing
- [ ] `currentId(dir)` returns the current counter value without modifying it
- [ ] `currentId(dir)` returns 0 if the counter file does not exist
