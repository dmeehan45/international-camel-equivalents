# Absurdity UX Compliance Matrix

| id | priority | status | evidence | ownerWorkstream | fixPath |
| --- | --- | --- | --- | --- | --- |
| visual.seal | high | pass | Contract shell + PDF include DBT seal treatment. | WS2 | `src/design/legal-theme.css`, `src/App.tsx`, `src/pages/Page4Proposal.tsx` |
| visual.serif_contract_only | high | pass | Serif scoped to `.contract-text`; surrounding UI remains sans-serif. | WS2 | `src/design/legal-theme.css` |
| visual.white_space_mobile_grid | high | pass | Mobile spacing + no horizontal overflow updates in app shell/card styles. | WS2 | `src/app.css` |
| visual.tooltips_proxy | high | pass | Proxy cards include hover/tap tooltip text via `title` + ARIA labels. | WS4 | `src/pages/Page3Offer.tsx` |
| copy.advisory_phrasing_each_page | high | pass | Page headers and helper copy include DBT/legalese language across flow. | WS3 | `src/content/uxCopy.ts` |
| copy.footnotes_each_page | high | pass | Page1–Page5 footnotes added and rendered in each page component. | WS3/WS4 | `src/content/uxCopy.ts`, `src/pages/Page1Landing.tsx`, `src/pages/Page2Basics.tsx`, `src/pages/Page3Offer.tsx`, `src/pages/Page4Proposal.tsx`, `src/pages/Page5Drafts.tsx` |
| copy.contract_clauses_absurd | high | pass | Existing generator includes 5 clauses with absurd/legal blend. | WS3 | `src/App.tsx` |
| flow.live_rate_updates | high | pass | Volatility badge populated from current date-derived DBT formula. | WS4 | `src/App.tsx`, `src/pages/Page3Offer.tsx` |
| flow.proxy_selection_sync | high | pass | Proxy selection + slider + camel formula remain synchronized. | WS4 | `src/App.tsx`, `src/pages/Page3Offer.tsx` |
| flow.drawer_discoverability | high | pass | Full library CTA retained and tested in e2e flow. | WS4 | `src/pages/Page3Offer.tsx`, `cypress/e2e/master-spec-flow.cy.js` |
| flow.post_bid_unlock | high | pass | Side tools hidden pre-bid and unlock message shown post-save. | WS4 | `src/pages/Page5Drafts.tsx` |
| feature.camel_benchmark_only | high | pass | No USD inputs, summary remains proxy ≈ camel equivalents. | WS5 | `src/App.tsx`, `src/pages/Page3Offer.tsx` |

## Notes
- This sweep targets high-priority checklist items first.
- Medium/low items are preserved in `plan.md` backlog for follow-up passes.
