# Camel Courtship Calculator — Option A Stage Gates

This plan converts the master build spec into **incremental, reviewable gates**.

## Why Option A
Option A keeps the existing tested core logic (`src/core/*`) stable while layering product features around it in small slices.

## Stage Gate sequence

### Gate 1 — Spec lock + delivery guardrails (current gate)
**Goal**: Freeze scope and define objective completion criteria for each gate.

**Deliverables**
- Stage-gate plan document (this file).
- Traceability map from build-spec feature groups to gate ownership.
- Explicit pass/fail checks and evidence commands per gate.

**Exit criteria**
- Each major spec area is assigned to exactly one primary gate.
- Each gate has measurable completion checks.
- Team agreement on gate order and no hidden scope.

---

### Gate 2 — Home/Dashboard hardening
**Goal**: Fully stabilize calculator flow (input → ICE → equivalents) for reliable MVP use.

**Scope**
- Input validation and error clarity.
- Sort/filter UX consistency.
- Deterministic modifier application (location + manual + override).

**Exit checks**
- Unit tests for conversion/customizer paths pass.
- Manual smoke: USD/CAMEL/PROXY conversions match expected values.

---

### Gate 3 — Reference Library completion
**Goal**: Finish search, compare, and local extension management behavior.

**Scope**
- Search and compare reliability.
- Proxy extension creation/merge/persistence.
- Data quality checks for canonical categories and minimum catalog size.

**Exit checks**
- Proxy-library and compare tests pass.
- Manual smoke: add extension proxy, refresh, and re-use it in compare.

---

### Gate 4 — Messaging + sharing baseline
**Goal**: Complete formalization and sharing baseline without backend coupling.

**Scope**
- Template generation reliability.
- Share text + URL generation and clipboard/open-app behaviors.
- Basic history archive workflow from latest valid bid.

**Exit checks**
- Formalizer/share/history tests pass.
- Manual smoke: generate message and share payload from latest calculation.

---

### Gate 5 — PWA + offline local-first data
**Goal**: Deliver installable/offline behavior and stronger local persistence.

**Scope**
- Manifest + service worker.
- IndexedDB-backed persistence adapters with safe fallback.
- Offline read/write for calculator/reference/history essentials.

**Exit checks**
- App installs as PWA.
- Core flows function offline in browser devtools offline mode.

---

### Gate 6 — Spec-completion modules (premium/mock + inane extras)
**Goal**: Add remaining spec modules behind safe feature flags.

**Scope**
- Premium mock (AI negotiation + local premium flag) and mock leaderboard.
- Celebration extras (soundboard/effects/easter eggs) as optional toggles.
- Export enhancements (image/PDF scaffolding where supported).

**Exit checks**
- Feature toggles can disable extras without affecting core calculator.
- No regressions in core conversion/compare/formalizer/share flows.

---

## Build-spec traceability map

| Build-spec area | Primary gate |
|---|---|
| Core ICE Calculator + equivalents | Gate 2 |
| Reference Library + compare + generator | Gate 3 |
| Bid Customizer controls and modifiers | Gate 2 |
| Message Formalizer | Gate 4 |
| Sharing/Export baseline | Gate 4 |
| Historical archive/time capsule | Gate 4 |
| PWA/offline/installability | Gate 5 |
| Premium mock + leaderboard | Gate 6 |
| Inane optional extras | Gate 6 |
| i18n/a11y hardening | Gate 5 (core), Gate 6 (extras) |

## Verification baseline command set
Use these commands at each gate close:

```bash
npm test
```

For UI gates, add browser smoke checks for affected flows and document observed results in PR notes.
