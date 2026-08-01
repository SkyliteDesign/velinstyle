# VelinStyle FAQ

Short answers for first-time users. Deep dives: [`GETTING_STARTED.md`](GETTING_STARTED.md) · [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) · [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

### What is VelinStyle?

An accessibility-first **CSS + Web Components** framework with a **CLI**, plus **Design Intelligence** and **AI Skills** (beta). Not just utility classes.

### Is it like Tailwind / Bootstrap / shadcn?

| Closest mental model | Difference |
|----------------------|------------|
| Bootstrap | Semantic BEM + tokens, optional WCs, no jQuery chrome |
| Tailwind | Utilities exist, but readable component classes are preferred |
| shadcn | Copy/scaffold patterns via CLI + blueprints, not a React-only kit |

### Which npm version should I install?

- Registry **latest today:** often **1.1.0** until the 1.2 cut publishes  
- This repo’s `package.json` may already say **1.2.0** (prep tree)  
- Prefer the published tag for production; use a local clone for 1.2 ship-surface commands (`create`, `check`, …)

### Does AAA mean my app is certified?

**No.** Defaults are **AAA-oriented**. Your markup, content, and flows still need review. See the [a11y matrix](https://velinstyle.info/docs/a11y.html).

### What can I ship today?

**Strong:** marketing landings, docs shells, simple admin starters (`create` + `check`).  
**Not yet primary:** large multipage shop + enterprise admin without custom work.

### Do I need a bundler?

No. CDN CSS + optional component bundle works. Vite/React are optional (`@velinstyle/react`, `templates/vite-react-velinstyle`).

### CSS classes vs Web Components?

Use **CSS/BEM** for look. Upgrade to a **`<velin-*>`** element only when you need behavior (modals, search, tables, toasts).

### What is `velinstyle check`?

`doctor` + blueprint `--strict` + `scan` + `review`. Use on **consumer projects**, not as a single gate over an entire docs site full of demos.

### What is Design Intelligence?

Plan → page/section registries → constraints → **review**. Encodes “what a good page is” beyond class lists. **Beta.** Guide: [`docs/guides/design-intelligence.md`](docs/guides/design-intelligence.md)

### What are AI Skills?

Machine-readable skill records + workflows so agents and humans share the same VelinStyle vocabulary. **Foundation / beta.** They assist; they do not replace you. Guide: [`docs/guides/ai-skills.md`](docs/guides/ai-skills.md)

### Where is the full CLI list?

`npx @birdapi/velinstyle --help` · generated: [`docs/generated/cli/commands.md`](docs/generated/cli/commands.md) · site: [CLI reference](https://velinstyle.info/docs/extend/cli.html)

### How do I customize themes?

`data-velin-theme="…"` on `<html>`, optional `data-velin-contrast="aa"`. Tokens via CSS variables / `velinstyle tokens`. See [design tokens guide](https://velinstyle.info/docs/guides/design-tokens.html).

### React?

[`packages/react/README.md`](packages/react/README.md) — typed wrappers for all canonical tags.

### License?

MIT — [`LICENSE`](LICENSE)
