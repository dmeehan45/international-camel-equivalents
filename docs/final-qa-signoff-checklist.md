# Final QA sign-off checklist

## Manual checklist (binary pass/fail)

- [ ] **Mobile layout sanity (375x812):** verify all four phase routes (`/phase1` → `/phase4`) render without clipped primary CTA buttons.
- [ ] **Desktop layout sanity (1280x800):** verify phase header, legal card, and primary action bar stay visually ordered with one dominant CTA per phase.
- [ ] **No stale MVP copy:** verify no currency examples such as `$1000`, `€850`, `USD bid`, or `EUR` appear in phase copy.
- [ ] **Progressive disclosure:** verify advanced controls are collapsed by default in Phases 1–4 and can be expanded intentionally.
- [ ] **Phase guard behavior:** direct navigation to `/phase3` and `/phase4` without prerequisites redirects to the earliest valid phase.
- [ ] **Theme persistence:** set theme mode in Tools, refresh, and confirm visual mode persists.
- [ ] **Exports/share fallback:** in Phase III, force a share failure path and confirm queue fallback still captures pending share intent.
- [ ] **Autosave continuity:** edit Phase I fields, refresh, and verify values persist with “Saved/Saving” indicator behavior.

## Suggested execution commands

```bash
npm test
npm run test:smoke
npm run build
npm run test:e2e
```

Expected result:
- Unit + contract tests pass in `npm test`.
- Smoke integration passes in `npm run test:smoke`.
- Production build succeeds in `npm run build`.
- Cypress e2e runs `master-spec-flow.cy.js` and `accessibility-smoke.cy.js` with green checks (when browser environment is available).
