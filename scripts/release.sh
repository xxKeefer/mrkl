#!/usr/bin/env bash
set -euo pipefail

version="${1:?Usage: pnpm release x.y.z}"

pnpm version "$version" --no-git-tag-version --allow-same-version
pnpm exec changelogen
git add -A
git commit -m "chore: release v$version"
git push
gh release create "v$version" --generate-notes
