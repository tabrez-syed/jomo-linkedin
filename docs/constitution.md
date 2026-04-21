## Constitution — Boxcars AI

Operating playbook for all Creative Factory projects. Every AI session, every project, every week: this is how we work.

## Philosophy

Ship first, iterate on feedback. The cost of inaction always exceeds the cost of a reversible mistake.

Keep systems lightweight. Process exists to reduce friction, not to feel productive. If a system doesn't earn its keep within two weeks, kill it.

Everything runs in weekly cycles. A week is the atomic unit of planning. If something can't be scoped to a week, break it down until it can.

Automate what repeats. The second time you do something manually, write the script. The third time should never require a human.

Test what runs unattended. Autonomous systems earn trust through test coverage, not human oversight. TDD is how we ship fast without shipping broken.

Privacy is non-negotiable. No analytics that track individuals. No data collection beyond what the product requires to function. This is a constraint, not a preference.

Each product does one thing. A second feature is a signal to consider a second product. Thin products ship faster and compound into a portfolio.

Prefer native. If the platform, OS, or browser already offers a feature, link users to it instead of rebuilding it. We build what the platform won't — anything that runs against their engagement metrics is ours.

Minimum surface. Ask for the fewest permissions, dependencies, and APIs the feature actually needs. When a feature requires a new permission or a heavier data store, the default answer is to cut the feature, not expand the scope.

## Systems

- **Task tracking**: GitHub Issues + GitHub Projects. Every task is an issue in the project's repo. All factory projects feed into a single [Factory project board](https://github.com/users/tabrez-syed/projects/1) for cross-project visibility.
- **Source control**: Git. One repo per project. Commit messages follow conventional commits (`feat:`, `fix:`, `chore:`).
- **AI execution**: Claude Code with broad permissions, sandbox mode, sub-agents for parallel work.
- **Documentation**: `mission.md` (per project), `CLAUDE.md` (project config), `constitution.md` (this file, shared across projects).
- **Reporting**: Weekly reports in `reports/` folder, one per week, named `YYYY-WNN.md`.

### Working with GitHub Issues

Issues are the atomic unit of work. Use the `gh` CLI from any session:

```bash
# Create an issue
gh issue create -R tabrez-syed/aphasia --title "Fix hover bug on El Pais" --label "bug"

# List open issues
gh issue list -R tabrez-syed/aphasia

# Close an issue from a commit
git commit -m "fix: hover translation on news sites, closes #18"

# Add to the Factory project board
gh project item-add 1 --owner tabrez-syed --url <issue-url>

# See the full Factory board
gh project item-list 1 --owner tabrez-syed
```

**Issue conventions:**
- Title starts with what's broken or what's needed — not "Ticket:" or "Task:"
- Body has enough context for a cold-start session to pick it up
- Use labels: `bug`, `enhancement`, `documentation`
- Use `Closes #N` in pull-request bodies to auto-close issues on merge
- Automated processes tag issues with `origin:<process>` to distinguish machine-filed work

## Development Workflow

All code changes go through a pull request gated by CI. `main` is a protected branch; direct pushes are rejected by ruleset. The pattern is the same in every factory project:

- **Branch per change.** Work on `feat/<slug>`, `fix/<slug>`, or `chore/<slug>`. One branch, one PR, one idea.
- **CI is the required gate.** A GitHub Actions workflow runs the project's build and test suite on every PR. The default-branch ruleset requires the check to pass and requires a PR — no admin bypass.
- **Squash merges only.** History on `main` is one commit per PR. Linear history required.
- **Auto-merge is the default, armed explicitly.** `scripts/dev/ship-pr.sh` pushes and opens the PR. Iterate and push fixes freely. When the work is done, run `scripts/dev/arm-pr.sh` — this enables auto-merge and GitHub completes the squash server-side once CI is green. Two steps rather than one because GitHub disables auto-merge on any push to the PR head branch; arming at open time would silently cancel it on every follow-up fix. An AI session can still end cleanly after arming — the merge doesn't require the session to stay alive.
- **Issues close via the PR body.** Put `Closes #N` in the PR description, not in commit messages.
- **Main-branch CI failure files an issue.** A second workflow job opens an `origin:ci` issue when CI breaks on a main-branch push — this catches cases where a bad merge lands despite PR checks.

**What this trades off:** a typo fix now costs a branch + PR + wait for CI. The cost is bounded — a few minutes, fully automated — and in exchange the platform enforces that no broken code reaches `main` and no deploy goes live unvalidated. For factory projects running on autonomous cron-driven sessions, that enforcement is the only reliable safety net.

The per-project implementation (CI workflow file, ruleset setup command, `ship-pr.sh`, `arm-pr.sh`) is a copyable starter kit. See `docs/buildprocess.md` in the aphasia repo for the origin story and the full blueprint.

## Test-Driven Development

Every project builds for autonomous operation. Code runs unattended, so the test suite is the primary safety net — not human review.

**TDD is the default.** Write tests first, watch them fail, then implement. This applies to:
- Schemas and data validation
- Pure functions and transforms
- Pipeline steps (crawl, enrich, classify, publish)
- Ops scripts and collectors
- Any code path that an automated process will execute

**What tests must cover:**
- **Contracts**: Schema validation tests confirm that data flowing between pipeline stages matches the expected shape. When a schema changes, tests break before production does.
- **Transforms**: Pure function tests with edge cases. These are cheap to write and catch the most regressions.
- **Integration**: End-to-end tests for each pipeline with mocked external dependencies (HTTP, APIs). Verify the full flow, not just individual steps.
- **Regression**: When a bug is found in production, write a test that reproduces it before fixing it. The test suite should accumulate every failure mode the system has encountered.

**When to skip TDD:** Exploratory work, one-off scripts, and prototypes. But if a prototype graduates to a recurring process, it gets tests before it ships.

**LLM-dependent tests:** Tests that call an LLM are expensive and non-deterministic. Gate them behind an environment variable. Run them in CI where the key is available; skip them locally when iterating fast. Always have a deterministic fixture-based test alongside any LLM test.

## Automation Model

Every recurring process is a script that Claude Code can execute. The execution environment is Claude Code — either triggered by cron, GitHub Actions, or a human session. Claude Code is the universal runtime because it provides sub-agents, tool use, web access, and judgment that shell scripts alone cannot.

**Process anatomy — every automated process follows this pattern:**

1. **Single-purpose script.** One script, one job. Lives in a known directory (e.g., `scripts/ops/`, `scripts/editorial/`). Executable, documented, and testable in isolation.

2. **Run log.** Every process logs its outcome to an append-only log: `completed`, `skipped`, or `failed` with a reason. The run log is the control plane — any process can check whether it or another process ran recently.

3. **Recency guard.** Before executing, a process checks the run log. If a completed run exists within its cadence window, it logs `skipped` and exits. This makes processes idempotent and safe to over-schedule. Use `--force` to override.

4. **Prerequisite check.** Before doing its main work, a process verifies its inputs exist and are fresh. If prerequisites fail, the process files a GitHub Issue describing the failure and exits. Nothing fails silently.

5. **Originator label.** All issues created by automated processes carry an `origin:<process>` label. This distinguishes machine-generated work from human-filed work and lets the groomer filter by source.

**Scheduling:** Cron entries (local or hosted) call the existing shell scripts. The recency guard means manual runs and scheduled runs coexist without conflict. A process that ran manually mid-week gets skipped by the weekend cron.

**GitHub Actions** is appropriate for deterministic pipelines that don't need LLM reasoning at runtime (crawling, file transforms, report collection). For processes that require judgment, web search, or issue manipulation, use Claude Code invoked via cron or manual session.

## Error Escalation

Errors are not swallowed. Every failure becomes a trackable issue with enough context to diagnose and fix without reproducing the failure.

**The escalation path:**

1. **Log the failure.** The process logs `failed` with a reason to the run log. This is the minimum — it always happens, even if subsequent steps fail.

2. **File an issue.** The process creates a GitHub Issue with:
   - A clear title: `[process-name] failed: <one-line summary>`
   - The full error message and stack trace in the body
   - What inputs the process was working with (dates, file paths)
   - The `origin:<process>` label
   - `bug` label if it blocks downstream processes

3. **Don't retry blindly.** If a process fails, it stops. It does not retry in a loop. The issue exists so the next session (human or groomer) can diagnose the root cause and decide whether to retry, fix, or deprioritize.

4. **Downstream awareness.** Processes that depend on upstream outputs check freshness via the run log or file timestamps. If an upstream process failed, the downstream process files its own prerequisite-failure issue and exits rather than operating on stale data.

**The principle:** A failed process that files a detailed issue is more valuable than a failed process that retries three times and partially succeeds. GitHub Issues is the escalation system. The groomer is the triage function.

## How Sessions Work

Every new AI session follows this boot sequence:

1. Read `mission.md` to load project identity and current objectives.
2. Read the most recent weekly report in `reports/` for state of play.
3. Check GitHub Issues for open tasks, priorities, and blockers: `gh issue list -R tabrez-syed/aphasia`
4. Propose a session plan: what to work on, in what order, and why.
5. If the path is obvious, act. If scope is ambiguous, ask for alignment before starting.

No session should spend its first ten minutes figuring out what the project even is. The documents exist so cold starts are fast.

## Decision Authority

**CEO (AI in-session) can:**
- Execute planned tasks and close them on completion
- Create new issues for discovered work
- Make technical decisions (architecture, dependencies, tooling)
- Draft content, copy, and assets
- Refactor, reorganize, and clean up without asking

**Board (human founder) approves:**
- Scope changes that alter the mission or current epic
- Public-facing actions: publishing to stores, posting to social media, sending emails
- New milestones or epics
- Any spending (services, APIs, domains)

**Default posture:** Act, then report. Don't block on approval for decisions that are cheap to reverse. When in doubt, do the work and flag it in the next report.

## Project Lifecycle

Mission --> Epics --> Cycles --> Tasks

- **Mission**: What this project is and why it exists. Static. Rarely changes. Lives in `mission.md`.
- **Epics**: Themes of work with 3-6 week horizons. A project runs 1-2 epics at a time.
- **Cycles**: Weekly sprints. Each cycle has a single clear goal stated in one sentence.
- **Tasks**: GitHub Issues. Small enough to finish in one session. Labeled and tracked on the Factory board.

Vision is implicit in the mission and epics. We don't maintain a separate vision document; the epics *are* the near-term vision.

## Roles (Sub-agents)

Spin these up as needed. Most sessions only need one or two.

- **Dev**: Write code, run tests, build and package releases.
- **Marketing**: Draft store listings, write copy, generate screenshots and assets.
- **Research**: Competitive analysis, user feedback synthesis, channel scouting.
- **Ops**: Automation scripts, process improvements, reporting.

Roles are hats, not people. A single session might wear all four.

## Weekly Report Format

Filed in `reports/YYYY-WNN.md`. Keep it tight.

```
## Week of [date]

**Shipped**: What went out the door.

**Next**: What the next cycle targets.

**Blockers**: Anything stalled and why.

**Key metric**: One number that matters this week (downloads, reviews, build time — whatever is relevant).
```

No narrative padding. If a section is empty, write "None" and move on.

## Principles

1. **Momentum over perfection.** A shipped feature teaches more than a planned one. Iterate in public.
2. **Decide by default.** Reversible decisions don't need approval. Act, report, adjust.
3. **One week, one goal.** If the cycle goal isn't clear in one sentence, the scope is wrong.
4. **Automate the second time.** Manual work is a prototype for a script.
5. **Respect the user.** Ship things you'd trust with your own data. No dark patterns, no surveillance, no growth hacks that trade user trust for metrics.
