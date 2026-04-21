# Directives — jomo-linkedin

Updated at weekly triage meetings. Read by all analysis prompts before producing recommendations or filing tickets.

Last updated: 2026-04-21

## Active Bets

**One feature, shipped.** The only bet right now is getting the pared-down extension into the Chrome Web Store. End-of-feed pause-gate + session timer, nothing else. Anything that expands scope is parked by default.

**Native-first.** Features that duplicate LinkedIn's own settings (autoplay, display density, etc.) do not belong in this extension. Link users to LinkedIn's native toggle instead.

## Parked Themes

- **Garden / usage history UI** — Parked: 2026-04-21. Why: stats duplicate willpower-style dashboards that didn't help in the old version. Revisit only if store users ask for it.
- **Iframe nudge runtime / intervention platform** — Parked: 2026-04-21. Why: over-built for a one-feature extension. The deprecated repo has it if we ever need the pattern.
- **jomo-twitter, jomo-reddit, jomo-youtube** — Parked: 2026-04-21. Why: ship the LinkedIn one first, learn, then decide whether to extract a core or stay per-platform. Revisit after Chrome Web Store approval of this one.

## Thresholds

- **Permission scope:** any manifest addition beyond `host_permissions: ['*://*.linkedin.com/*']` and `storage` requires a written justification in the PR body. Default answer is to cut the feature, not expand scope.
- **Bundle size:** production `.output/` over 200 KB warrants investigation. We're shipping ~one feature; the extension should be small.

## Standing Instructions

- Every new module lands with a failing test first. No exceptions for pure functions.
- Deep link `https://www.linkedin.com/mypreferences/d/autoplay-videos` is the canonical reference in onboarding copy — do not reimplement autoplay blocking.
- When porting a file from the archived `BoxcarsAI/jomo-linkedin` repo, import chains that pull in `lib/database*`, `lib/nudge-*`, `lib/*metrics*`, `lib/garden-state*`, `lib/blocked-video-tracker*`, `lib/visibility-*` get surgically broken — those modules are not ported.
