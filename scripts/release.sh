#!/usr/bin/env bash
set -euo pipefail

version="${1:?Usage: npm run release -- x.y.z}"

npm version "$version" --no-git-tag-version --allow-same-version
npx changelogen
git add -A
git commit -m "chore: release v$version"
git push
gh release create "v$version" --generate-notes
