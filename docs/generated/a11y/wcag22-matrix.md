# WCAG 2.2 conformance matrix (VelinStyle framework)

Framework helpers mapped to WCAG 2.2 success criteria. **Using VelinStyle does not certify your application.**

| Criterion | Level | VelinStyle module / sample |
|-----------|-------|----------------------------|
| 2.4.11 Focus Not Obscured (Minimum) | AA | `src/a11y/focus-not-obscured.css` |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA | `src/a11y/focus-not-obscured.css` |
| 2.4.13 Focus Appearance | AAA | `src/a11y/focus-appearance.css` |
| 2.5.7 Dragging Movements | AA | `samples/wcag22-dragging.html`, `dragging-alternatives.css` |
| 2.5.8 Target Size (Minimum) | AA | `src/a11y/target-size.css`, Web Components |
| 3.2.6 Consistent Help | A | `src/a11y/consistent-help.css` |
| 3.3.2 Labels or Instructions | A | `src/a11y/authentication.css`, forms |
| 3.3.8 Accessible Authentication (Minimum) | AA | `samples/wcag22-auth.html` |

Run `npm run test:a11y` and `npx velinstyle scan --only a11y` on your pages.
