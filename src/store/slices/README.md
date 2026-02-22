# App State Blueprint (Option A migration)

This folder documents the current minimal global-state approach used in the React + TypeScript migration.

## Implemented shared state (single reducer in `src/App.tsx`)
- `calcInput`: Home input fields (`amount`, `unit`, `proxyId`, `camelUsdRate`).
- `calculation`: latest camel/equivalent result.
- `dashboardQuery` + `dashboardSort`: Home table controls.
- `referenceFilters` + `compare`: Reference route search/filter/compare controls.
- `customizer`: location/manual multiplier settings persisted via customizer storage core helpers.
- `extensionProxies` + `mergedProxies`: custom proxy authoring and merged reference catalog.
- `formalizer`, `share`, `history`: formalized message, share payload preview, archive list.

## Why this is intentionally minimal
- Keeps one source of truth during migration.
- Avoids overbuilding Redux slices before route behavior parity is complete.
- Uses existing `src/core/*.js` modules through `src/core/typed-core.ts` for conversion/proxy behavior.

## Next step after parity
Extract this reducer into dedicated state modules only if complexity warrants it.
