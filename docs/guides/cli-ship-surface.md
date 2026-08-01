# CLI ship surface (create · serve · doctor · check · scan · review · wc)

Beginner-oriented command guide for day-to-day shipping. Full table: [`../generated/cli/commands.md`](../generated/cli/commands.md)

> Package: `@birdapi/velinstyle`. Alias: `validate` → `check`.

---

## Recommended loop

```bash
velinstyle create landing ./my-site      # or dashboard | docs | auth
cd my-site
velinstyle serve .                       # http://127.0.0.1:4173
velinstyle doctor
velinstyle check . --profile marketing
```

---

## Commands

### `create <kind> [dir]`

**Purpose:** Opinionated scaffold + vendor copy of CSS/JS.  
**Kinds:** `landing` · `dashboard` · `docs` · `auth`  
**Flags:** `--theme` · `--no-copy`

```bash
velinstyle create dashboard ./admin --theme ocean
```

### `serve [dir]`

Static preview (default port **4173**). `--port` to override.

### `doctor`

Environment honesty: CSS/vendor present? Framework dist? Windows ESM hints?  
Non-zero only on hard errors; missing config is often info.

### `scan [path]`

Static rules: a11y, security, CSS honesty, PII.  
Flags: `--format` · `--severity` · `--only` · `--fix` …

```bash
velinstyle scan index.html --severity warning
```

### `review [file]`

Design-intelligence gate (beta).  
Flags: `--profile` · `--prompt` · `--json`

```bash
velinstyle review index.html --profile app
```

### `check [path]`

Runs **doctor → blueprint --strict → scan → review**.  
Flags: `--json` · `--sarif` · `--profile`

```bash
velinstyle check . --profile docs --json
```

**Do not** run on huge demo/docs trees expecting green — use on scaffolds or single pages.

### `wc api <tag>`

Human-readable API from source + link to generated Markdown.

```bash
velinstyle wc api velin-data-table
```

### `plan` / `scaffold`

Prompt Engine (beta): plan JSON vs HTML output. See [`design-intelligence.md`](design-intelligence.md).

### `skills` / `workflow` / `meta`

AI foundation — see [`ai-skills.md`](ai-skills.md) and [velin-meta](https://velinstyle.info/docs/guides/velin-meta.html).

---

## Common errors

| Error | Fix |
|-------|-----|
| Command not found on npm 1.1.0 | Use 1.2 CLI / local clone |
| `npx velinstyle` 404 | Use `@birdapi/velinstyle` |
| check flood of findings | Narrow path / profile |
| blueprint --strict fails | Unknown class — align with CSS |

More: [`../../TROUBLESHOOTING.md`](../../TROUBLESHOOTING.md)
