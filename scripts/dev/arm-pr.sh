#!/usr/bin/env bash
#
# Enable auto-merge (squash) on the current branch's open pull request.
# Run this when iteration is done — GitHub will complete the squash
# merge server-side once required checks pass.
#
# Separate from ship-pr.sh because GitHub disables auto-merge on any
# push to the PR head branch. Keep this step for the end of iteration,
# after any fix pushes and visual review.
#
# Usage (from inside a working branch with an open PR):
#   ./scripts/dev/arm-pr.sh
#
# Prerequisites:
#   - gh CLI authenticated
#   - Current branch has an open PR (created via ship-pr.sh)
#   - Ruleset on main requires at least one status check — auto-merge
#     needs a required check to wait for
#

set -euo pipefail

BRANCH=$(git symbolic-ref --short HEAD)

if [ "$BRANCH" = "main" ]; then
  echo "ERROR: cannot arm auto-merge from main." >&2
  exit 1
fi

gh pr merge --auto --squash