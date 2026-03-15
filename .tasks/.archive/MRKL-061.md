---
id: MRKL-061
title: create command unit tests
type: test
status: closed
created: '2026-03-09'
flag: Superseded by MRKL-117 under test coverage epic MRKL-116
priority: 3
---

## Description

create.ts has 5 symbols but no spec file — the only command without unit tests. Add create.spec.ts covering arg parsing, default type behavior, and edge cases.

## Acceptance Criteria

- [ ] src/commands/create.spec.ts exists
- [ ] tests cover type argument parsing
- [ ] tests cover title argument
- [ ] tests cover --desc, --ac, --parent, --blocks flags
- [ ] tests cover default type when none provided (relates to MRKL-041)
