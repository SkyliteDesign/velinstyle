# VelinStyle FAQ

Short answers for first-time users. Deep dives: [`GETTING_STARTED.md`](GETTING_STARTED.md) · [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) · [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

### What is VelinStyle?

An accessibility-first **CSS + Web Components** framework with a **CLI**, plus **Design Intelligence** and **AI Skills** (beta). Not just utility classes.

### Is it like Tailwind / Bootstrap / shadcn?

| Closest mental model | Difference |
|----------------------|------------|
| Bootstrap | Semantic BEM + tokens, optional WCs, no jQuery chrome |
| Tailwind | Utilities exist, but **component-first** classes are preferred — avoids 10–15-class “sprawl” buttons |
| shadcn | Copy/scaffold patterns via CLI + blueprints, not a React-only kit |

**Tailwind sprawl:** heavy utility composition turns markup into a class salad. VelinStyle ships ready semantic components (`velin-btn velin-btn--primary`) with a11y defaults; utilities stay for tweaks. See the [Migration Guide](https://velinstyle.info/docs/migration.html).

### Which npm version should I install?

- Current line: **1.2.2** (`@birdapi/velinstyle@1.2.2`)  
- Prefer a pinned published tag for production; use a local clone for the latest ship-surface commands (`create`, `check`, `production`, …)

### Does AAA mean my app is certified?

**No.** Defaults are **AAA-oriented**. Your markup, content, and flows still need review. See the [a11y matrix](https://velinstyle.info/docs/getting-started/accessibility.html).

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
