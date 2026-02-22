# React/TypeScript Migration — Phase 0 Baseline

This document captures the migration guardrails and baseline behavior before scaffolding the React + TypeScript app shell.

## Scope of Phase 0

- Establish a stable baseline on the current branch.
- Define non-negotiable migration guardrails.
- Define objective "done" criteria for the full migration.

## Baseline checks (recorded)

### Test suite

- `npm test` → **pass** (`54/54` tests).
- `npm run test:integration` → **pass** (release smoke + proxy library checks).

## Guardrails for migration PRs

1. Keep `src/core/*.js` behavior unchanged during initial shell migration.
2. Integrate through typed boundaries in React/TypeScript code (adapters or explicit boundary typing), not by weakening domain models.
3. Keep migration incremental by vertical slices (Home first, then remaining routes).
4. Every phase must keep automated tests green and add verification for newly migrated UI paths.
5. No direct commits to `main`; all changes go through focused feature branches and PRs.

## Full-migration done criteria

A migration is complete only when all criteria below are met:

1. **Shell + routes**: React app shell with routes for Home, Reference, Customizer, Formalizer, Share, and Archive.
2. **No inline business logic in HTML**: `index.html` is mount-only.
3. **Core parity**: React shell calls existing `src/core/*.js` logic (or typed wrappers) with no behavioral regressions.
4. **Type safety**: TypeScript production build passes without relaxing core domain contracts to broad `string`/optional ids solely to satisfy UI boundary mismatches.
5. **Feature parity**: each route supports its baseline workflows (calculate, compare/formalize, share, archive, reference, customizer).
6. **Verification**: automated tests pass and build succeeds in CI/Vercel.

## Key risk called out from previous failed attempt

The previous failure class was JS→TS boundary inference mismatch. To avoid recurrence:

- Treat outputs from JS modules as typed at the boundary before state updates.
- Preserve strong `ProxyDefinition`/`ProxyEquivalent` contracts in domain types where possible.
- Avoid using global type loosening as the first-line fix for view-specific inference errors.
