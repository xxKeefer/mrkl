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
pnpm install

# Run tests
pnpm test

# Run CLI in development
pnpm tsx src/cli.ts list

# Build
pnpm build
```

## Releasing

Releases are handled by the **Release & Publish** GitHub Action.

### How to trigger

1. Go to the **Actions** tab in GitHub
2. Select **Release & Publish** from the workflow list
3. Click **Run workflow**
4. Enter the version bump — either a semver keyword (`patch`, `minor`, `major`) or an explicit version (`1.2.3`)

### What it does

1. Runs tests and typechecking (fails fast before any version changes)
2. Builds the package
3. Bumps the version in `package.json`
4. Generates changelog entries via `changelogen`
5. Commits the version bump + changelog, tags, and pushes to `main`
6. Creates a GitHub Release with the changelog notes
7. Publishes to npm with provenance

### Prerequisites

- **`RELEASE_TOKEN`** — a GitHub PAT with `contents: write` permission, stored as a repository secret. Required so the bot push can bypass branch protection.
- **npm OIDC trusted publishing** — configured in npm so the `id-token: write` permission enables provenance-signed publishes without a manual npm token.

### Semver guidance

- **patch** (`0.2.8` → `0.2.9`) — bug fixes, docs, internal chores
- **minor** (`0.2.9` → `0.3.0`) — new features, backwards-compatible changes
- **major** (`0.3.0` → `1.0.0`) — breaking changes

### Failure recovery

If the `publish` job fails after the `release` job succeeds, the GitHub Release and tag still exist. Re-run just the `publish` job from the Actions UI.

## Task Workflow

mrkl uses its own tool for task tracking. If you're working with git worktrees or need to create tasks, see [docs/workflow.md](docs/workflow.md) for the full guide on separating planning from execution.
