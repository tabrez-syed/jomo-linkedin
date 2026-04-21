#!/usr/bin/env bash
#
# Open a pull request for the current branch and fill title/body from
# the commits. Does NOT enable auto-merge — run ./scripts/dev/arm-pr.sh
# when iteration is done and you want GitHub to squash-merge once CI
# is green.
#
# Why the split: GitHub disables auto-merge on any new push to the PR
# head branch. If ship-pr.sh armed auto-merge at open time, every
# follow-up fix push would silently cancel it. Two explicit steps keep
# the arm timing in the author's hands.
#
# Usage (from inside a working branch):
#   ./scripts/dev/ship-pr.sh
#
# Prerequisites:
#   - gh CLI authenticated
#   - The current branch is pushed or has commits to push
#

set -euo pipefail

BRANCH=$(git symbolic-ref --short HEAD)

if [ "$BRANCH" = "main" ]; then
  echo "ERROR: refuse to ship from main. Create a feature branch first." >&2
  exit 1
fi

if ! git diff --quiet origin/"$BRANCH" -- 2>/dev/null; then
  git push -u origin "$BRANCH"
elif ! git rev-parse --verify "origin/$BRANCH" >/dev/null 2>&1; then
  git push -u origin "$BRANCH"
fi

gh pr create --fill
