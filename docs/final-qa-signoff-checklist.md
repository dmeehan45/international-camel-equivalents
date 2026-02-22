# Final QA sign-off checklist

## Manual checklist

- [ ] Mobile layout sanity: verify all four phase routes (`/phase1` → `/phase4`) on a narrow viewport (375x812) without clipped primary CTA buttons.
- [ ] No stale MVP copy: verify no currency examples such as `$1000`, `€850`, `USD bid`, or `EUR` appear in phase copy.
- [ ] Exports/share fallback: in Phase III, force a share failure path and confirm queue fallback still captures a pending share intent.
- [ ] Phase completion analytics events firing: verify analytics events emit when advancing to Phase II, III, and IV in sequence.

## Suggested execution commands

```bash
npm test
npm run test:e2e
```

Expected result:
- Unit + contract tests pass in `npm test`.
- Cypress runs both `master-spec-flow.cy.js` and `accessibility-smoke.cy.js` with green checks.
