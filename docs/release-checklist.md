# MVP Release Checklist

Use this checklist before cutting an MVP release.

## Quality gates

- [ ] Run unit and regression tests (`npm test`).
- [ ] Run release smoke integration checks (`npm run test:smoke`).
- [ ] Run full integration alias (`npm run test:integration`).

## Offline sanity check

- [ ] Install dependencies with lockfile (`npm ci`).
- [ ] Run test commands without requiring network-only services.
- [ ] Confirm local storage features work when offline (history + proxy extensions).

## Installability check

- [ ] Clone a clean workspace.
- [ ] Install with `npm ci`.
- [ ] Verify tests pass using the CI sequence below.

## Accessibility (a11y) sanity check

- [ ] Verify keyboard navigation still reaches main interactions.
- [ ] Verify key text remains understandable and visible at normal zoom.
- [ ] Confirm no release change removed semantic labels in core flows.


## Performance sanity check

- [ ] Confirm each phase route lazy-loads without blocking interaction (target: visible fallback under 200ms locally).
- [ ] In Phase II, verify results filtering and sorting stay responsive while typing with 100+ equivalent rows.
- [ ] In Phase IV, verify docket queue expand/collapse remains instant with 25+ archived items.

## Localization sanity check

- [ ] Confirm no hard-coded locale formatting assumptions were introduced.
- [ ] Confirm conversion, formalization, and sharing text still handles non-English proxy names.
- [ ] Confirm punctuation/number formatting in generated messages remains readable.

## CI-friendly command sequence

Run commands in this order:

1. `npm ci`
2. `npm run test:smoke`
3. `npm run test:integration`
4. `npm test`

This sequence front-loads the end-to-end smoke flow, then integration alias coverage, then full test suite.
