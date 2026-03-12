---
id: MRKL-122
title: integrate code coverage tooling into ci
type: chore
status: todo
created: '2026-03-12'
parent: MRKL-116
---

## Description

Add vitest coverage configuration (v8 or istanbul provider) and wire it into the CI pipeline. Configure coverage thresholds as a ratchet — set them to current coverage levels so they can only go up. Add a coverage report step to the GitHub Actions workflow that runs on PRs. Consider adding a coverage badge to README.

## Acceptance Criteria

- [ ] vitest.config includes coverage provider and threshold config
- [ ] pnpm test:coverage script exists in package.json
- [ ] CI workflow runs coverage on PRs and fails if below threshold
- [ ] coverage thresholds set to current baseline (not aspirational)
- [ ] pnpm lint && pnpm typecheck pass
