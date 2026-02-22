# Camel Courtship Calculator – Implementation Plan (Option B)

## Scope of this commit
This initial commit creates foundational assets from the spec:
1. Canonical proxy data set (`src/data/proxies.json`).
2. Core conversion engine (`src/core/conversion.js`).
3. Shared domain types (`src/domain/types.ts`).
4. Redux slice blueprint (`src/store/slices/README.md`).

## Milestone sequence
1. Scaffold React + TypeScript app shell and Redux store wiring.
2. Implement Home/Dashboard calculator using the conversion engine.
3. Build Reference Library search/sort/add-proxy flow with local persistence.
4. Add customizer, formalizer, share/export, premium mock, and leaderboard.
5. Add PWA service worker + IndexedDB integration.
6. Add i18n and accessibility refinements.

## Constraints encountered
Package installation via npm registry is blocked in this environment (`403 Forbidden`).
So this commit focuses on framework-agnostic core logic and data assets that can be wired in once dependency installation is available.


## Full build plan before Option A execution

### Phase 0 — Stabilize foundations (current cycle)
- Align default camel baseline to `$500` across UX entry points.
- Ensure calculator accepts `USD`, `CAMEL`, and `PROXY` input sources.
- Preserve deterministic conversion behavior in `src/core/conversion.js`.

### Phase 1 — Home/Dashboard (MVP complete)
- Build a React/TypeScript dashboard using the existing conversion engine.
- Add sortable/filterable equivalent table and lightweight chart placeholder.
- Add input validation and user-friendly errors (no silent failures).

### Phase 2 — Reference Library
- Add searchable proxy catalog from `src/data/proxies.json`.
- Implement compare tool (`how many X in 1 Y`) using shared conversion math.
- Support offline read access to the catalog.

### Phase 3 — Bid Customizer
- Add location presets and modifier controls (`camelMultiplier`, `proxyRateOverrides`).
- Add custom proxy creation flow with explicit extension metadata.
- Persist customizations locally first, then optional sync strategy.

### Phase 4 — Message Formalizer
- Ship initial templates (formal letter, poem, emoji story).
- Insert calculated ICE + selected equivalents into generated output.
- Add editable preview with localization hooks.

### Phase 5 — Sharing/Export
- Export generated bid as plain text and image/PDF artifacts.
- Add share-link/QR scaffold and offline queue behavior.

### Phase 6 — PWA, i18n, and accessibility hardening
- Service worker + IndexedDB support for offline-first behavior.
- i18n plumbing for 20+ language targets and RTL readiness.
- Accessibility pass: keyboard navigation, contrast, reduced-motion defaults.

### Phase 7 — Quality and release readiness
- Expand unit coverage around conversion + modifiers + formatting.
- Add integration checks for dashboard/reference/customizer flows.
- Finalize release checklist and deployment handoff notes.


## Progress snapshot after next phase

### Completed
- Phase 0: baseline alignment to `$500` and multi-unit calculator input (`USD`, `CAMEL`, `PROXY`).
- Phase 1: dashboard filtering/sorting with visible error states.
- Phase 2: reference compare tool (`how many X in 1 Y`) implemented.
- Phase 3 (partial): bid customizer controls for `camelMultiplier` and single-proxy rate override.

### Remaining to complete
- Phase 3 (remaining): location presets, custom proxy authoring flow, and local persistence of customizations.
- Phase 4: message formalizer templates + editable/localized preview.
- Phase 5: export/share flows (text/image/PDF, QR, offline queue scaffold).
- Phase 6: PWA service worker, IndexedDB offline-first storage, and i18n/accessibility hardening.
- Phase 7: deeper integration tests and release-readiness checklist.
