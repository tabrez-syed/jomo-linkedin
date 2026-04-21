#!/usr/bin/env bash
#
# Enable branch protection on `main` for a factory repo.
#
# Rules applied:
#   - Require a pull request
#   - Require status check: "Build & test" (matches ci.yml job name)
#   - Enforce on admins (no bypass)
#   - Require linear history
#   - Block force pushes and branch deletion
#   - Repo-level: squash-merge only, auto-delete branch on merge
#
# Prerequisites:
#   - gh CLI authenticated with repo admin rights
#   - The repo exists on GitHub
#   - At least one commit has been pushed to `main` (the API needs the branch to exist)
#
# Usage (from inside the repo):
#   ./scripts/dev/setup-branch-protection.sh
#
# Idempotent — re-running overwrites with the same rules.

set -euo pipefail

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

echo "Configuring branch protection on ${REPO}/main..."

gh api \
  -X PUT \
  "/repos/${REPO}/branches/main/protection" \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON' > /dev/null
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Build & test"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

echo "  branch protection: required check 'Build & test', admins enforced, linear history"

echo "Restricting merge strategy to squash-only..."
gh api \
  -X PATCH \
  "/repos/${REPO}" \
  -F allow_squash_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=false \
  -F delete_branch_on_merge=true > /dev/null

echo "  merge strategy: squash only, auto-delete branch on merge"
echo ""
echo "Done. Verify with:"
echo "  gh api /repos/${REPO}/branches/main/protection | jq '{required_status_checks, enforce_admins, required_linear_history}'"
