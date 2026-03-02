# Contributing to mrkl

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

## Branch Protection

The `main` branch is protected with the following rules:

| Rule | Setting |
|------|---------|
| Required status check | `ci` must pass |
| Branch up-to-date | Required before merge |
| Force pushes | Blocked |
| Branch deletion | Blocked |
| Admin bypass | Allowed (for emergencies) |
| Required reviews | None (solo project) |

You cannot push directly to `main`. All changes go through pull requests.

## Merge Strategy

This repo uses **squash merge only**. When your PR is merged:

- All commits are squashed into a single commit on `main`
- The feature branch is automatically deleted
- The squash commit message should follow [conventional commits](https://www.conventionalcommits.org/)

This keeps `main` history clean — one commit per PR.

## Making a Contribution

1. Fork the repo
2. Create your branch from `main` (`git checkout -b feat/my-feature main`)
3. Make your changes
4. Commit using [conventional commits](https://www.conventionalcommits.org/) (e.g., `feat: add search`, `fix: handle empty input`)
5. Push to your branch (`git push -u origin feat/my-feature`)
6. Open a Pull Request — the PR template will prompt for a summary and test plan

The `ci` workflow (typecheck, test, build) runs automatically on your PR. It must pass before merging.

## Development Setup

```sh
git clone https://github.com/xxKeefer/mrkl.git
cd mrkl
npm install

# Run tests
npm test

# Run CLI in development
npx tsx src/cli.ts list

# Build
npm run build
```

## Task Workflow

mrkl uses its own tool for task tracking. If you're working with git worktrees or need to create tasks, see [docs/workflow.md](docs/workflow.md) for the full guide on separating planning from execution.
