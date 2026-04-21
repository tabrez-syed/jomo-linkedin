# Jomo LinkedIn

A Chrome extension that adds one small moment of friction to LinkedIn. Two features, nothing else:

1. **Session timer** — a small widget shows how long the current LinkedIn session has been going. Seeing the number is the point.
2. **End-of-page pause-gate** — when you reach the end of the feed, a prompt asks if you want to keep going. It names how long you've been here. Yes loads the next page; no closes the moment.

That's the product. No history, no stats dashboard, no nudge registry, no grayscale mode, no video-blocking — LinkedIn's own autoplay toggle handles that. If a feature duplicates a platform setting, it doesn't belong here.

## Why

LinkedIn is designed to remove friction. The feed pages forever, videos play themselves, every action pulls toward the next. Willpower loses against design.

Jomo's bet is that a single moment of explicit choice — _do I want the next page or not?_ — is enough to break autopilot for people who already want to use LinkedIn with intention. Not a blocker, not shame, not a streak. One question, at the moment it matters.

## Success criteria

- Extension ships in the Chrome Web Store, passes review on the first or second try (Mirlo precedent: minimal permissions = fast approval).
- The manifest requests only `host_permissions: ['*://*.linkedin.com/*']` and `storage`. Nothing else.
- Onboarding is one screen with three elements: what the timer does, what the pause-gate does, and a deep link to LinkedIn's native autoplay-off toggle.
- The entire codebase is small enough that a reader understands it in a single session.

## Operating stance

- Test-driven. Every file has a sibling `.test.ts` or a test in `tests/` before the implementation is written.
- If a feature suggests itself, the default answer is "no" — and if it survives that, it probably wants to be its own product (the `jomo-twitter` / `jomo-reddit` line-extension pattern).
- Native features beat re-implementations. When the platform already offers a toggle, we link to it.

## Part of the Creative Factory

- Vault product page: `[[Product-Jomo]]`
- Area: `[[Area-Creative Factory]]` — Active tier
- Marketing surface: zenist.org/jomo (Astro site, separate repo at `~/dev/mandalivia/anti-feed/jomo`)
- Factory board: https://github.com/users/tabrez-syed/projects/1
- Constitution: `docs/constitution.md` (shared across factory products)

## History

This project previously lived at `github.com/BoxcarsAI/jomo-linkedin` as a larger, multi-feature extension (nudge registry, iframe runtime, garden usage view, Dexie-backed metrics, video blocker). That repo is archived. This one is the pared-down successor — same core idea, nothing else.
