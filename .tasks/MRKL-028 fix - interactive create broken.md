---
id: MRKL-028
type: fix
status: todo
created: '2026-03-02'
---

## Description

interactive create fails when finishing accs submission

### Example interaction in temrinal

```bash
★★ planning-sprint-3  🌿 planning/sprint-3 via  v24.5.0
🕙 22:58:10 🖥 : mrkl c

✔ Task type
chore

✔ Task title
clean up old prd file

✔ Description (optional, enter to skip)
archive it somewhere out of the repo

■ Acceptance criterion (Esc to skip)


 ERROR  Cannot read properties of undefined (reading 'trim')                                                            10:59:17 PM


★★ planning-sprint-3  🌿 planning/sprint-3 via  v24.5.0  took 44s
🕙 22:59:17 💔 :  mrkl c

✔ Task type
fix

✔ Task title
interactive create fails with no acs

✔ Description (optional, enter to skip)
if you provide no acs by pressing escape without submitting any you get an error

✔ Acceptance criterion (Esc to skip)
interactive create should be able to accept no acs

■ Criterion #2 (Esc to finish)


 ERROR  Cannot read properties of undefined (reading 'trim')
```

## Acceptance Criteria

- [ ] submitting no acs by pressing esc imediately at ac step should create task without error
- [ ] submitting one acs by pressing esc at ac step should create task without error
- [ ] submitting two or more acs by pressing escat ac step should create task without error
- [ ] test cases should cover expect functioning behaviour
