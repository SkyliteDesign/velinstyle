# SSR / CSR / Hydration caveats

**Planning-ID:** VS-196 / [#29](https://github.com/SkyliteDesign/velinstyle/issues/29)  
**WC guide:** [web-components-integration.md](./web-components-integration.md)

## Model

VelinStyle Web Components are **CSR-first**: custom elements upgrade in the browser. Server HTML should be valid light-DOM / placeholders, not a promise of full shadow behavior on the server.

## Vanilla

1. Render markup with `velin-*` tags and critical CSS (including placeholders).
2. Load the component runtime after first paint or via `type="module"`.
3. Expect a brief pre-upgrade state — style unknown elements (`:not(:defined)`) / `wc-placeholder.css`.
4. Do not assume Shadow DOM contents exist during SSR.

## React (`@velinstyle/react`)

- Prefer client components / `useEffect` registration where the host framework is SSR-by-default.
- Avoid reading shadow internals during SSR.
- Event props (`onVelinClose`) bind after hydration.

## Next.js (sketch)

- Import CSS in the root layout.
- Load/register components in Client Components only.
- For App Router, mark interactive islands `"use client"`.
- Do not put custom element constructors in Server Component modules.

## Astro (sketch)

- Default: ship CSS globally; hydrate islands with `client:load` / `client:visible` for interactive `velin-*`.
- Static pages can include inert markup + CSS only.

## Risks

| Risk | Mitigation |
| --- | --- |
| CLS on upgrade | placeholders / min-height |
| Double init | register once; idempotent `customElements.define` |
| Overlay scroll lock on navigations | ADR 0013 cleanup on disconnect |
| SEO | Meaningful light-DOM text; don’t hide primary content only in shadow |

## Honesty

Using VelinStyle does not make an SSR app “AAA certified”. See ADR 0005.
