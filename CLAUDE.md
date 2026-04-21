# jomo-linkedin

Platform-native friction for LinkedIn — pause-gate prompt at end of feed plus an in-page session timer.

Read `mission.md` for what this project is. Read `docs/constitution.md` for how we work.

## First Session

1. Read `mission.md` to understand what we're building.
2. Check open issues: `gh issue list -R tabrez-syed/jomo-linkedin`
3. If no issues exist, create initial tasks as GitHub Issues for the first deliverable (likely: port keeper files from archived `BoxcarsAI/jomo-linkedin`).
4. Pick the first issue, branch (`feat/<issue>-<slug>`), build it with TDD, and ship it via `./scripts/dev/ship-pr.sh`.

Every session should leave issues current — close finished ones by putting `Closes #N` in the PR body, file new ones for discovered work.

## Dev Flow

`main` is protected. All changes go through a PR gated by CI. The loop:

```bash
git checkout -b feat/<issue>-<slug>    # type/issue-short-slug
# ... edit, test, commit ...
./scripts/dev/ship-pr.sh               # pushes branch, opens PR (no auto-merge yet)
# ... iterate, push fixes ...
./scripts/dev/arm-pr.sh                # enables auto-merge when work is done
```

Two-step because GitHub disables auto-merge on any push to the PR head branch. `ship-pr.sh` opens the PR; `arm-pr.sh` arms it at the end of iteration. Put `Closes #N` in the PR body so issues close on merge.

If CI fails on `main`, a `bug,origin:ci` issue opens automatically. Treat it as a blocker.

## Dev Commands

```bash
npm install           # first run
npm run dev           # launch WXT dev mode with Chrome profile
npm run build         # production build → .output/
npm test              # vitest run
npm run test:watch    # vitest watch mode
```

## Architecture

```
entrypoints/
  linkedin-timer.content/   # content script injected on linkedin.com/*
    index.ts                # wires up timer + pause-gate on the feed
    style.css               # timer widget styles
  onboarding/               # one-screen onboarding on install
    index.html
    main.ts
    style.css
  shared/
    theme.css               # design tokens shared across chrome UI
  background.ts             # minimal service worker: opens onboarding on install, settings get/set

components/
  Stopwatch.ts              # pure session timer logic

lib/
  pause-gate-controller.ts  # end-of-page prompt controller
  pause-gate-copy.ts        # prompt copy strings
  observe-target.ts         # mutation observer helper for end-of-feed sentinel
  scroll-tracker.ts         # scroll/visibility heuristics
  utils.ts                  # small shared helpers
  message-types.ts          # chrome.runtime.sendMessage contract (SETTINGS_GET/SET only)
  interventions/types.ts    # type contracts for pause-gate render callback

public/
  # fonts + background image used by onboarding
```

No Dexie, no IndexedDB, no metrics pipeline. Settings persist via `chrome.storage.local` only.

## Testing

TDD is required. Every new module gets a failing test first.

- Unit tests: vitest, colocated as `*.test.ts` next to the module.
- DOM-dependent tests: vitest with the `jsdom` environment.
- No Playwright — this is a Chrome extension, not a web app.

Manual verification loop for content-script behavior:
1. `npm run dev` — WXT launches a dedicated Chrome profile with the extension side-loaded.
2. Navigate to linkedin.com/feed.
3. Confirm timer appears, scroll to end of feed, confirm pause-gate fires.

## Ops

Follows the process pattern from `docs/constitution.md`:
- `ops/directives.md` — active bets, thresholds, standing instructions (updated at triage meetings)
- `scripts/ops/run-log.js` — shared recency guard + outcome logging
- `ops/run-log.jsonl` — tracks all process runs

No collector → briefing → meeting pipeline yet. Add one if/when the extension is live in the store and we want weekly analytics ingestion.

## Task Tracking

All work tracked via GitHub Issues on [tabrez-syed/jomo-linkedin](https://github.com/tabrez-syed/jomo-linkedin). Part of the [Factory project board](https://github.com/users/tabrez-syed/projects/1).

```bash
gh issue list -R tabrez-syed/jomo-linkedin                    # See open issues
gh issue create -R tabrez-syed/jomo-linkedin -t "Title"       # Create issue
gh issue close <number> -R tabrez-syed/jomo-linkedin          # Close issue
```

Close issues by putting `Closes #N` in the PR body; merging the PR auto-closes the issue.

## Archived predecessor

This repo replaces `github.com/BoxcarsAI/jomo-linkedin`, which has been archived. That repo accumulated features beyond the single-friction-moment bet (nudge registry, iframe runtime, garden view, Dexie metrics, video blocker). Cherry-picked keepers are in this repo's `components/`, `lib/`, and `entrypoints/`; everything else was deliberately left behind.
