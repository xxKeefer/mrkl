---
id: MRKL-057
title: emoji key
type: feat
status: done
created: '2026-03-09'
flag: completed
---

## Description

a shared emoji key constant file for use with in response messages that is documented in the readme

| emoji | key        | definition                          |
| ----- | ---------- | ----------------------------------- |
| 🟢    | success    | something succeeded                 |
| 🔴    | error      | something failed                    |
| ✅    | done       | task done                           |
| ❌    | closed     | task closed                         |
| 🚧    | blocks     | is blocking something               |
| 🛑    | blocked_by | is blocked by something             |
| 📝    | create     | created task                        |
| ✏️    | update     | updated task                        |
| 🧹    | delete     | deleted permanently                 |
| 📭    | empty      | nothing to show                     |
| 🎉    | celebrate  | celebrate something                 |
| 🧩    | module     | relates to extra plugins or modules |
| ✌️    | quit       | escaped early, nothing changed      |
| 🔎    | found      | found something                     |
| ❓    | not_found  | could not find something            |
| 🚩    | flag       | been flagged with a message         |

If any other keys should exist or aren't covered prompt the user to consider more keys

create a custom console logger with a type for every key and replace any default consola messages with the correct `logger.<key>`

## Acceptance Criteria

- [x] emoji key exists
- [x] readme updated with definitions
- [x] all messages audited across cli and tuis for consistancy
- [x] consola prompt is not
