# jomo-linkedin

Chrome extension. One small moment of friction on LinkedIn: a session timer and an end-of-page "keep going?" prompt.

Part of the [Creative Factory](https://github.com/users/tabrez-syed/projects/1). See `mission.md` for what we're building and `docs/constitution.md` for how we work.

## Develop

```bash
npm install
npm run dev    # WXT launches a Chrome profile with the extension side-loaded
```

Visit linkedin.com/feed, confirm the timer appears, scroll to the end of the feed, confirm the pause-gate prompt fires.

## Build

```bash
npm run build    # outputs .output/chrome-mv3
```

## Test

```bash
npm test
```

## License

MIT.
