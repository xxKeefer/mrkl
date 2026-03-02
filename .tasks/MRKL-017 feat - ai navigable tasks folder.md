---
id: MRKL-017
type: feat
status: todo
created: '2026-03-02'
---

## Description

- ai might want to read recently completed tasks for context, but we might want to use hooks to stop
  claude from explore a massvie backlog or archive, maybe we can add a .backlog and .completed
  folder and some commands to move completed tasks older than a configured date into the archive so
  ai can be told to ignore exploring into the folder and commands and configuration for working with
  a back log
  - maybe the .tasks folder can have a .active, .backlog, .complete and .archive
  - recomend ai to not look in .backlog or .archive
  - new tasks default get put in .backlog, start command moves into .active, done comand moves to
    .completed
  - maybe need to run a prd on this i kinda want to prio simplicity

## Acceptance Criteria
