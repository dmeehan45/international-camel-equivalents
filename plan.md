# Parallel Plan: Option B — DBT Domain-First UX Integration

## Executive overview
We are upgrading the existing 5-page flow into the revised “Dowry Proposal Advisory” experience for mobile users who want a fast (<3 minute) satirical process with serious presentation. We will preserve current working functionality (single-flow navigation, proposal generation, share/download, saved docket) while changing the user-facing model to absurd proxy bids benchmarked by DBT live rates.

How we will prove it works:
- Build succeeds with strict TS checks.
- Existing contract tests pass.
- Updated UI contract/e2e checks validate the new proxy-first flow.
- Manual run confirms all 5 pages, side-tool unlock, and robust contract output.

## Contracts first
### Shared interfaces
- `FlowStepId` remains unchanged:
  - `'page1-landing' | 'page2-basics' | 'page3-offer' | 'page4-proposal' | 'page5-drafts'`.
- New DBT domain contract (`src/core/dbt-rates.ts`):
  - `getVolatilityPercent(date?: Date): number`
  - `getLiveRate(baseRatePerCamel: number, date?: Date): number`
  - `toCamelBenchmark(proxyQuantity: number, liveRatePerCamel: number): number`
  - `formatAdvisoryDate(date?: Date): string`
  - `buildCuratedSuggestions(input): ProxyDefinition[]` (4–6 results).
- Shared bid lock contract in app state:
  - `selectedProxyId: string`
  - `proxyQuantity: number (1..100)`
  - `liveRatePerCamel: number`
  - `camelEquivalent: number`
  - `volatilityPercent: number`
- Docket entry contract:
  - `id, name, summary, text, createdAt` (unchanged)
  - `proxyName, proxyQuantity, camelEquivalent, rateLabel` (new additive fields).
- Proposal generator contract:
  - `buildAdvisoryContract(input) => string` (200–300 words target)
  - Must include parties, DBT certification, clauses 1–5, particulars, addendum, signatories.

### UI component contracts/props
- `Page1Landing`: intro copy + begin action.
- `Page2Basics`: required fields + optional drawer + proceed action.
- `Page3Offer`:
  - curated cards,
  - full searchable DBT drawer,
  - quantity slider (1–100),
  - formula preview,
  - lock action.
- `Page4Proposal`:
  - editable contract textarea,
  - enhance drawer (preset/addendum + tone),
  - copy/pdf/share,
  - conclude action.
- `Page5Drafts`:
  - advisory docket cards,
  - view/edit/share/delete,
  - “Further Advisory Tools” section unlocked post-bid.

### Stub file map
- `src/App.tsx`
- `src/content/uxCopy.ts`
- `src/pages/Page1Landing.tsx`
- `src/pages/Page2Basics.tsx`
- `src/pages/Page3Offer.tsx`
- `src/pages/Page4Proposal.tsx`
- `src/pages/Page5Drafts.tsx`
- `src/core/dbt-rates.ts` (new)
- `src/app.css`
- `test/workflow-ui.contract.test.js`
- `cypress/e2e/master-spec-flow.cy.js`

## Parallel workstreams

### Workstream 1 — DBT rate model and typed adapters
**Agent role:** Domain contracts engineer  
**File ownership:** `src/core/dbt-rates.ts`, `src/domain/types.ts` (additive types only)  
**Inputs:** Contracts above + `src/data/proxies.json`  
**Outputs:** deterministic daily volatility/live-rate utilities and curated suggestion selection.

**Tasks**
1. Create `dbt-rates.ts` helpers (volatility/live-rate/date formatting/benchmark conversion).
2. Add additive TS interfaces for locked bid/docket metadata.
3. Ensure live-rate formula uses `baseRate * (1 + (day % 7)/100)`.

**Success criteria**
- Deterministic output for fixed date inputs.
- Benchmark conversion returns finite rounded value.
- Curated suggestions return 4–6 unique proxies.

**Validation**
- `npm run build` succeeds.
- `node -e "import('./src/core/dbt-rates.ts').then(m=>console.log(m.getVolatilityPercent(new Date('2026-02-22'))))"` prints a number.

**Edge/negative tests**
- Invalid rate/quantity guarded.
- Empty preferences still yields suggestions.

---

### Workstream 2 — Proxy-first flow pages (1–3)
**Agent role:** UX flow engineer  
**File ownership:** `src/pages/Page1Landing.tsx`, `src/pages/Page2Basics.tsx`, `src/pages/Page3Offer.tsx`, `src/content/uxCopy.ts` (page1–3 keys only), `src/app.css` (page1–3 classes only)  
**Inputs:** DBT contracts and existing form context  
**Outputs:** new copy + curated cards + full searchable DBT drawer + quantity slider formula preview.

**Tasks**
1. Replace page copy with spec text/tone.
2. Keep required basics fields; update optional drawer labels.
3. Implement ProxyCard selection and searchable categorized library drawer.
4. Add formula preview + volatility text and lock label.

**Success criteria**
- No USD appears in page 1–3 journey.
- User can pick curated proxy or full library item and set quantity 1–100.
- Lock action unavailable or error state when no proxy selected.

**Validation**
- `npm run build` succeeds.
- `npm run test -- test/workflow-ui.contract.test.js` passes.

**Edge/negative tests**
- Search miss shows empty-state text.
- Long proxy names wrap safely.

---

### Workstream 3 — Advisory contract generation (page 4)
**Agent role:** Template/legal-tone engineer  
**File ownership:** `src/pages/Page4Proposal.tsx`, `src/App.tsx` (contract generation + page4 wiring section), `src/content/uxCopy.ts` (page4 keys), `src/design/legal-theme.css` or `src/app.css` (contract typography classes)  
**Inputs:** locked bid metadata + basics particulars  
**Outputs:** robust editable pseudo-legal indenture with enhancement drawer and tone controls.

**Tasks**
1. Replace short proposal template with 200–300 word contract template.
2. Inject DBT certification line with live rate, date, and volatility-adjusted benchmark.
3. Add enhancement controls: preset clause + free-text addendum + tone select.
4. Ensure copy/download/share use edited contract text.

**Success criteria**
- Generated text includes required headings, clauses, and signatory lines.
- Tone selection changes phrasing but not data correctness.
- Editable text remains stable for actions.

**Validation**
- `npm run build` succeeds.
- `npm run test -- test/workflow-ui.contract.test.js` passes.

**Edge/negative tests**
- Missing optional particulars handled gracefully.
- Empty custom addendum does not break template.

---

### Workstream 4 — Docket + side tools unlock (page 5)
**Agent role:** Docket/discovery engineer  
**File ownership:** `src/pages/Page5Drafts.tsx`, `src/App.tsx` (page5 wiring only), `src/content/uxCopy.ts` (page5 keys), `src/app.css` (page5 styles)  
**Inputs:** saved drafts array and lock-state signal  
**Outputs:** advisory docket cards with DBT metadata and post-bid side tools section.

**Tasks**
1. Reframe drafts page as advisory docket.
2. Add proxy/rate/date summary line on each docket card.
3. Replace extras with “Further Advisory Tools” tiles.
4. Gate side tools until first bid is locked/saved.

**Success criteria**
- Side tools not visible before first saved bid.
- Side tools visible after first saved bid.
- View/Edit/Share/Delete remain functional.

**Validation**
- `npm run build` succeeds.
- Manual UI: complete one bid then verify tool unlock.

**Edge/negative tests**
- Empty docket shows clean empty state.
- Deleting a card updates list without reload.

---

### Workstream 5 — Integration, tests, and acceptance
**Agent role:** Integrator/QA  
**File ownership:** `src/App.tsx`, `test/workflow-ui.contract.test.js`, `cypress/e2e/master-spec-flow.cy.js`  
**Inputs:** all contracts above  
**Outputs:** integrated flow + updated automated checks and acceptance report.

**Tasks**
1. Wire DBT helpers into app state and page props.
2. Update contract/e2e tests for proxy-first path and side-tool unlock.
3. Run build/tests and record pass/fail.
4. Produce plan evaluation checklist status.

**Success criteria**
- Build and targeted tests pass.
- Flow completes through page5 with required controls.
- No celebration logic introduced.

**Validation**
- `npm run build`
- `npm run test -- test/workflow-ui.contract.test.js`
- `npm run test -- test/conversion.test.js`
- `npm run test:e2e -- --spec cypress/e2e/master-spec-flow.cy.js` (if environment allows)

**Edge/negative tests**
- Required field errors still shown for missing name/region.
- No-proxy lock attempt blocked with error.

## Integration plan (no blocking)
- Every workstream can start immediately by coding to this contracts section.
- Use additive helpers (`dbt-rates.ts`) so page workstream agents do not wait for `App.tsx` merges.
- Prevent shared-file conflicts:
  - `App.tsx` changes isolated by tagged sections (`// page3`, `// page4`, `// page5`) and merged last.
  - `uxCopy.ts` split by page key ownership (1–3 vs 4 vs 5).
- Merge order (safe but non-blocking): WS1, WS2, WS3, WS4, WS5 final glue.

## Acceptance checklist (mapped 1:1)
- [x] DBT helper module implements volatility and live-rate formula.
- [x] Proxy-first page 3 has curated and full searchable library.
- [x] Quantity slider uses 1–100 and displays formula preview.
- [x] Contract page produces robust pseudo-legal text with required clauses.
- [x] Copy/download/share actions operate on edited contract text.
- [x] Docket displays proxy + camel benchmark metadata.
- [x] Side tools unlock only after first bid.
- [x] Build passes.
- [x] Targeted tests pass (unit/contract).

## Risks + mitigations
- **Contract drift across parallel agents:** keep canonical signatures in this file and import from shared module.
- **Hidden coupling in `App.tsx`:** isolate computation into helper functions and keep page components prop-driven.
- **Copy mismatch with tests:** update UI contract test and cypress assertions in same integration pass.
- **Environment-limited e2e execution:** mark as warning and retain unit/contract coverage if browser runner unavailable.


Environment note: Cypress e2e command is currently blocked because Xvfb is unavailable in this container.
