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
