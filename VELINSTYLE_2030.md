# VelinStyle 2030

**Status:** Accepted — Phase 0 Architecture North Star  
**Accepted by:** ADR 0001 (2026-07-28; local strategy docs — see [`docs/strategy/README.md`](./docs/strategy/README.md))  
**Audience:** Maintainers, contributors, product owners  
**Purpose:** Bindende Produktidentität. Keine Featureliste. Keine Versionsnummer.

Dieses Dokument beantwortet nur die fünf Fragen, die jede spätere technische Entscheidung bestimmen.

---

## 1. Was ist VelinStyle?

VelinStyle ist ein **accessibility-first CSS- und Web-Component-Framework**.

Es ist eine klar begrenzte Hybrid-Lösung aus:

| Produkt | Aufgabe |
| --- | --- |
| **Framework Core** | Cascade Layers, Reset, Tokens, Layout, Theme-Basis, Runtime-Grundlagen |
| **Utility Engine** | Kuratiertes, generiertes Utility- und Variant-System |
| **Design System** | Surfaces, Elevation, Density, Motion, State Layers, Layout-Primitives, A11y-Kontrakte |
| **Component APIs** | Web Components und CSS-Komponenten mit vollständigen API-Verträgen |
| **Developer Experience** | CLI, Editor-Support, Playground, Inspector, Generatoren |
| **Enterprise Components** | Robuste Patterns für produktive Anwendungen |
| **Studio** | Langfristig: Theme Builder, Token-/Component-/A11y-Inspector |

VelinStyle ist **kein** reines Utility Framework wie Tailwind, **kein** React-Design-System wie Material UI und **kein** Security-Produkt. Scanner, Search, Highlight und Meta-Tools dürfen differenzieren — sie dürfen die Identität nicht ersetzen.

**Ein Satz:**  
VelinStyle liefert lesbares HTML, tokenbasierte Themes, AAA-fähige Defaults und frameworkneutrale Web Components — mit CLI und maschinenlesbaren Verträgen.

---

## 2. Für wen ist VelinStyle?

### Primäre Zielgruppe

1. **Teams mit Accessibility-Pflicht**  
   Öffentliche Einrichtungen, Gesundheitswesen, Bildung, Enterprise mit WCAG-Anforderungen. Sie brauchen Defaults, Kontrakte und Prüfwerkzeuge — nicht nur Klassen.

2. **Frontend-Teams mit Vanilla HTML oder gemischten Stacks**  
   Sites und Apps, die nicht an React gebunden sind und Web Components als Integrationspfad nutzen wollen.

3. **Produktteams, die lesbares Markup wollen**  
   Semantische Komponentenklassen plus kontrollierte Utilities statt reiner Utility-Sprawl.

### Sekundäre Zielgruppe

- Agenten und KI-Assistenten, die über `velin-agent.json`, `llms.txt` und Component Contracts arbeiten
- Open-Source-Maintainer, die ein CSS+WC-Fundament mit CLI und A11y-Scanner brauchen
- React-Teams, solange der bestehende Adapter gepflegt wird

### Nicht die Zielgruppe (vorerst)

- Teams, die ausschließlich Tailwind-JIT und Arbitrary Values brauchen
- Teams, die ein vollständiges React-Enterprise-Ökosystem wie MUI/Carbon erwarten
- Teams, die native Vue-/Angular-/Svelte-Adapter als Einstiegsvoraussetzung brauchen

---

## 3. Was soll VelinStyle niemals werden?

1. **Ein Tailwind-Klon** mit unbegrenztem Utility-Ausstoß und Arbitrary-Value-Ökonomie als Kernversprechen.
2. **Ein MUI-Klon** mit frameworkgebundener React-Dominanz und riesigem Komponenten-Katalog ohne API-Tiefe.
3. **Ein Security-Produkt**, auch wenn Security-/PII-Scanner ein Differenzierungsmerkmal bleiben.
4. **Eine Sammlung Spezialkomponenten** (Haptic, Demo-Crypto, Einzel-Gadgets) ohne zusammenhängende Architektur.
5. **Ein Adapter-Zoo**, der Vue, Angular, Svelte und Solid pflegt, bevor Web-Component-Integration dokumentiert und getestet ist.
6. **Ein AAA-Zertifikat für Anwendungen**. VelinStyle kann AAA unterstützen und prüfen — die Anwendung bleibt verantwortlich.
7. **Ein Feature-Sammelbecken**, in dem Search, Highlight, Motion, Meta und UI um denselben Produktkern konkurrieren, ohne klare Grenzen.

---

## 4. Welche Probleme löst VelinStyle besser als andere?

| Problem | Warum VelinStyle |
| --- | --- |
| Accessibility als Nachgedanke | A11y ist Schicht, Vertrag und CLI — nicht Blogpost |
| Framework-Lock-in | Web Components + CSS zuerst; React nur Adapter |
| Undokumentierte Komponenten | Jede Komponente soll wie eine kleine Bibliothek dokumentiert werden |
| Theme-Chaos | OKLCH-Tokens, Theme-Overlays, Kontrastverträge |
| Unlesbares Utility-HTML | Semantische Komponenten + kuratierte Utilities |
| Fehlende Qualitätsgates | Scanner, Contrast Checks, Component Contracts, Release Sync |
| KI-blinde UI-Systeme | Maschinenlesbare Meta- und API-Verträge |

**Was andere besser lösen (bewusst akzeptiert):**

- Tailwind: Variant-Ökonomie, JIT, IntelliSense-Reife heute
- Bootstrap: Adoption, Migrationserfahrung, Stabilitätserwartung
- Shoelace: reife WC-API-Breite
- Radix: Headless-A11y-Primitives
- MUI / Carbon / Fluent / Spectrum: Enterprise-Tiefe und Designsystem-Governance

VelinStyle konkurriert nicht über Umfang. Es konkurriert über **Klarheit, Accessibility, WC-Kompatibilität, Designsystem-Qualität und überprüfbare Verträge**.

---

## 5. Warum sollte sich ein Entwickler bewusst dafür entscheiden?

Ein Entwickler wählt VelinStyle, wenn er oder sie:

1. **AAA-fähige Defaults und prüfbare A11y-Kontrakte** wichtiger findet als maximale Utility-Abdeckung.
2. **Frameworkneutrale Web Components** will, statt zuerst einen React-Stack zu verpflichten.
3. **Lesbares HTML** will: `velin-btn`, `velin-card`, deklarative Attribute — nicht nur lange Klassenzeilen.
4. **Tokens und Themes** als Produktkern akzeptiert, nicht als Afterthought.
5. **CLI und Scanner** als Teil der DX will: init, build, tokens, scan, docs, doctor.
6. **Maschinenlesbare Verträge** für Docs, Tests und Agenten braucht.
7. Bereit ist, mit einer kleineren, härteren Komponentenfläche zu starten — und Enterprise-Patterns erst nach stabilen APIs zu erwarten.

**Die bewusste Entscheidung lautet:**  
Qualität, Konsistenz und Architektur vor Featurezahl.

---

## Ableitung: Was danach kommt

Aus diesem Dokument folgen ausschließlich Epics — keine Versions-Roadmap:

1. Framework Core  
2. Utility Engine  
3. Design System  
4. Component APIs  
5. Documentation  
6. Developer Experience  
7. Enterprise Components  
8. Testing & Quality  
9. Studio  

Details, Prioritäten und Issue-Backlog liegen lokal unter dem Monorepo-Ordner `interne_docs/strategy/` (nicht Teil dieses Git-Repos — Hinweis: [`docs/strategy/README.md`](./docs/strategy/README.md)).

---

## Änderungsregeln

- Jede Architekturentscheidung muss gegen dieses Dokument prüfen.
- Features, die gegen Abschnitt 3 verstoßen, werden abgelehnt oder als Experimental markiert.
- Adapter für Vue/Angular/Svelte/Solid entstehen erst nach nachweisbarer Nachfrage und fertigen Integrationsleitfäden.
- AAA-Marketing darf nur beschreiben, was Framework und Tools **unterstützen** — niemals, was eine App „zertifiziert“.

*Phase 0 complete: this file is the accepted product north star (ADR 0001; strategy ADRs are maintainer-local).*
