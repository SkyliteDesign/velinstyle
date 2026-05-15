# Security policy

## Supported versions

We address security issues in the **latest minor release** on the `main` branch (currently **0.6.x**). Older tags may not receive backports unless the issue is critical.

## Reporting a vulnerability

**Please do not open a public GitHub issue** for undisclosed security vulnerabilities.

Preferred options:

1. [GitHub Security Advisories](https://github.com/SkyliteDesign/velinstyle/security/advisories/new) (private report to maintainers), or  
2. If you cannot use GitHub: open a **draft** issue with only a minimal description and ask for a private channel, or contact the repository owners through their public GitHub profile.

Include: affected version or commit, reproduction steps, impact assessment, and suggested fix if you have one.

## Scope (what we consider in scope)

**In scope**

- XSS or injection vectors in **VelinStyle Web Components** or **CLI output** when used as documented (e.g. unsafe HTML passed where the API expects text, `javascript:` URLs where URLs are allowed).
- CSP / Trusted Types integration with `escapeHTML()`, `sanitizeURL()`, and related helpers in [`components/sanitize.js`](components/sanitize.js).
- `velin-persist` storage handling, key validation, and quota issues that could affect user data integrity.
- **CLI scanner** (`velinstyle scan`) false negatives that could hide exploitable patterns in *generated VelinStyle code paths* (not generic app code review).
- **`velinstyle prefix`:** with `--write`, it modifies matched source files on disk; supply only trusted JSON map files (`--map` / `velinstyle-prefix-map.json`). The command does not execute map contents—only `JSON.parse`—but incorrect mappings can break markup or styling.

**Out of scope**

- Vulnerabilities in **your application code** (e.g. reflecting user input into `innerHTML` without sanitization) unless VelinStyle documentation explicitly misleads developers into an unsafe pattern.
- Third-party icon CDNs or fonts loaded by your site.
- Denial-of-service via oversized CSS or SVG uploads you choose to host.

## Hardening documentation

See the in-repo docs:

- [`docs/security.html`](docs/security.html) — CSP, XSS utilities, `.velin-user-content`, external links  

Extended documentation (including a dedicated Security page in the site navigation) lives on [velinstyle.info](https://velinstyle.info) in the separate `velinstyle-site` repository.

## Disclosure

We will acknowledge receipt as soon as practical, investigate, and coordinate a fix and release. Credit will be given in the changelog unless you prefer to remain anonymous.
