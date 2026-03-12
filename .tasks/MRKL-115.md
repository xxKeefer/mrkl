---
id: MRKL-115
title: flaky test
type: perf
status: todo
created: '2026-03-12'
---

## Description

ci job failed once on github, passed again on second run with no changes 


### log from ci
src/tui/list-tui.spec.ts > interaction snapshots > initial render shows task list with first item selected: src/tui/list-tui.spec.ts#L337
Error: Snapshot `interaction snapshots > initial render shows task list with first item selected 1` mismatched

- Expected
+ Received

@@ -2,22 +2,6 @@
                                                                                  
  >                                                                               
  ────────────────────────────────────────────┬───────────────────────────────────
  ID          STATUS    TITLE                          │ Preview                  
  ────────────────────────────────────────────┼───────────────────────────────────
- MRKL-001    todo      Auth epic                      │ MRKL-001 feat todo       
- MRKL-002    in-progre…Fix login bug                  │ Auth epic                
- MRKL-003    todo      Auth tests                     │                          
- MRKL-004    done      Update CI config               │                          
- MRKL-005    todo      Dashboard layout               │                          
-                                             │                                   
-                                             │                                   
-                                             │                                   
-                                             │                                   
-                                             │                                   
-                                             │                                   
-                                             │                                   
-                                             │                                   
-                                             │                                   
-                                             │                                   
- ────────────────────────────────────────────┴───────────────────────────────────
- 5/5 tasks  ↑↓: navigate  Tab: switch  Enter: select  Esc: quit  Type to search  "
+ MRKL-001    todo      Auth epic                      │ MRKL-001 feat todo       "

 ❯ src/tui/list-tui.spec.ts:337:20

## Acceptance Criteria

