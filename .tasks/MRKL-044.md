---
id: MRKL-044
title: liking of tasks
type: feat
status: todo
created: '2026-03-07'
---

## Description

**this ticket really needs think about. launch /write-a-prd**

allow linking of tasks with various commands to allow for thinks like blocking flags

to begin we should have the link flags blocked, blocking and flagged

new frontmatter field: link: one of blocked, blocking or flagged linked: for blocked or blocking a
list of ticket ids. for flagged a text description of the flag

## Acceptance Criteria

- [ ] create command should have flags for this
- [ ] create command intractive should support this
- [ ] frontmatter should include new fields when card is linked
- [ ] adding ticket ids to a blocked link should update each ticket with a link:blocking,
      linked:ticket-id-of-blocked
- [ ] adding ticket ids to a blocking link should update each ticket with a link:blocked,
      linked:ticket-id-of-blocking
