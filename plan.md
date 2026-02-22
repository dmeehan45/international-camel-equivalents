# Parallel Plan: Absurdity UX Compliance Sweep

## Executive overview
We are running a focused UX compliance sweep to align the 5-page Dowry Proposal app with the **Absurdity UX Checklist**: a polished legal-SaaS shell that treats absurd proxy bidding with deadpan seriousness.

Audience: first-time mobile users who should complete the core flow in under 3 minutes without confusion, while discovering layered humor.

How we will prove it works:
- A checklist-to-implementation trace shows every High-priority UX standard mapped to specific files and UI behavior.
- Automated build + targeted tests pass.
- Manual UX walkthrough verifies visual/copy/interaction standards on Pages 1–5.
- Export/share artifacts preserve the “official absurd” presentation.

## Current-state review (from repo inspection)
Observed strengths:
- Proxy-first selection flow, search drawer, slider, and formula preview already exist on Page 3.
- Page 4 already supports editable contract text with personalization controls and export/share actions.
- Centralized copy dictionary exists (`uxCopy`) for consistent legalese updates.

Observed gaps relative to checklist:
- No explicit faux-legal seal/watermark requirement enforcement in contract/PDF surfaces.
- No explicit contract-only serif typography contract in page/component plan.
- No explicit tooltip standard for proxy blurbs/ARIA treatment in the sweep contract.
- No explicit global footnote coverage target (1–2 per page) and DBT reference count target in acceptance checks.
- No explicit post-bid unlock verification contract tied to Page 5 side tools messaging.

## Contracts first
These contracts make all workstreams independent and prevent drift.

### UX compliance contract (shared checklist schema)
Each checklist item tracked as:
- `id`: stable key (e.g., `visual.seal`, `copy.footnotes`, `flow.post_bid_unlock`)
- `priority`: `high | medium | low`
- `status`: `pass | fail | partial | n/a`
- `evidence`: file path(s) + UI action
- `ownerWorkstream`: WS1..WS5
- `fixPath`: exact file path(s) to change (if failing)

Source-of-truth artifact:
- `docs/ux-absurdity-compliance-matrix.md`

### Shared UI/copy contracts
- All pages must contain at least one pseudo-legal phrase.
- Every page must expose 1–2 fine-print/footnote elements.
- Page 3 proxy cards/library must support tooltip text (hover/tap) and accessible labels.
- Page 4 contract preview/export must render serif legal text and include seal/watermark treatment.
- Page 5 side tools must remain hidden until first bid is saved, then display unlock messaging.

### Shared test contract
- Contract tests remain in:
  - `test/workflow-ui.contract.test.js`
- E2E path remains in:
  - `cypress/e2e/master-spec-flow.cy.js`
- Visual/manual evidence checklist added in:
  - `docs/final-qa-signoff-checklist.md` (append UX sweep section)

### Stub file map
- `docs/ux-absurdity-compliance-matrix.md` (new)
- `plan.md` (this file)
- `src/design/legal-theme.css`
- `src/app.css`
- `src/content/uxCopy.ts`
- `src/pages/Page3Offer.tsx`
- `src/pages/Page4Proposal.tsx`
- `src/pages/Page5Drafts.tsx`
- `src/components/LegalCard.tsx`
- `test/workflow-ui.contract.test.js`
- `cypress/e2e/master-spec-flow.cy.js`
- `docs/final-qa-signoff-checklist.md`

## Parallel workstreams

### Workstream 1 — Compliance matrix + audit baseline
**Agent role:** UX standards auditor  
**File ownership:** `docs/ux-absurdity-compliance-matrix.md` (new), `docs/final-qa-signoff-checklist.md` (UX section only)  
**Inputs:** Absurdity UX Checklist text + shared contracts above  
**Outputs:** explicit pass/fail baseline with evidence and remediation targets.

**Step-by-step tasks**
1. Create matrix with every checklist item (High/Medium/Low) and stable IDs.
2. Record baseline status from current implementation with evidence links.
3. Mark each failing item with `fixPath` and mapped workstream owner.
4. Add signoff checklist entries that mirror only High-priority IDs.

**Success criteria**
- Matrix includes 100% of checklist items.
- Every High-priority item has status + evidence + owner.
- No ambiguous entries (“looks good”, “maybe” disallowed).

**Validation steps**
- `npm run build` (must still pass; docs-only changes should not break build).
- Manual read-through: all High-priority IDs present in both matrix and signoff list.

**Edge cases + negative tests**
- If an item is not applicable, mark `n/a` with reason and reviewer action.
- If evidence is missing, item must remain `fail`, not `partial`.

---

### Workstream 2 — Visual shell compliance (legal SaaS styling)
**Agent role:** Design-system implementer  
**File ownership:** `src/design/legal-theme.css`, `src/app.css`, `src/components/LegalCard.tsx`  
**Inputs:** WS1 matrix IDs for visual category + shared UI contracts  
**Outputs:** legal shell styling updates (seal, border, serif scoping, spacing/grid consistency).

**Step-by-step tasks**
1. Add faux-legal border/seal/watermark classes for contract and card surfaces.
2. Scope serif typography to contract preview/export containers only.
3. Ensure mobile spacing/grid rules hit 16–24px rhythm and prevent horizontal overflow.
4. Add/confirm visual token hooks for subtle gold accents and high-contrast fallback behavior.

**Success criteria**
- Contract area visually differs with serif + official seal treatment.
- Non-contract UI remains sans-serif.
- Mobile view has no horizontal scroll on all 5 pages.

**Validation steps**
- `npm run build`
- `npm run test -- test/workflow-ui.contract.test.js`
- Manual responsive check in browser devtools at 375px width.

**Edge cases + negative tests**
- High-contrast mode must remain readable when gold accents are suppressed.
- Very long contract content must not clip watermark/seal.

---

### Workstream 3 — Copy, legalese, and footnote coverage
**Agent role:** Content systems editor  
**File ownership:** `src/content/uxCopy.ts`  
**Inputs:** WS1 matrix IDs for copy/language + page contracts  
**Outputs:** checklist-compliant pompous legalese, advisory errors, placeholders, and footnotes.

**Step-by-step tasks**
1. Add/normalize pseudo-legal phrasing on each page header/subtitle set.
2. Ensure 1–2 dry-ironic footnotes per page in copy model.
3. Add/verify absurd advisory error copy and dynamic placeholders.
4. Ensure DBT/Bureau references hit target count across flow.

**Success criteria**
- Every page has at least one legalese phrase and one footnote.
- Error messages remain helpful while preserving tone.
- Copy references DBT/Bureau in at least 5 flow locations.

**Validation steps**
- `npm run build`
- `npm run test -- test/workflow-ui.contract.test.js`
- Grep check: `rg "DBT|Bureau of Absurd Exchanges" src/content/uxCopy.ts` returns >=5 matches.

**Edge cases + negative tests**
- Required-field messaging remains clear (no joke-only errors).
- Footnotes do not overflow small screens.

---

### Workstream 4 — Interaction delight + guardrails
**Agent role:** Interaction engineer  
**File ownership:** `src/pages/Page3Offer.tsx`, `src/pages/Page4Proposal.tsx`, `src/pages/Page5Drafts.tsx`  
**Inputs:** WS1 matrix IDs for interactions/flow + existing props contracts  
**Outputs:** tooltip discoverability, volatility feedback, editable contract guard toasts, post-bid unlock behavior.

**Step-by-step tasks**
1. Add proxy tooltip behavior for hover/tap/long-press with accessible semantics.
2. Ensure Page 3 volatility updates/alerts are surfaced subtly on load/refresh.
3. Add advisory warning toast when contract edits could affect certification.
4. Confirm Page 5 side tools are gated pre-bid and unlock with explicit “new tools” message post-bid.

**Success criteria**
- Tooltips work via mouse and touch interaction.
- Contract edit warning appears on first edit in session.
- Side tools hidden before first saved bid and visible after.

**Validation steps**
- `npm run build`
- `npm run test -- test/workflow-ui.contract.test.js`
- Manual flow: complete first bid, verify unlock transition text.

**Edge cases + negative tests**
- Empty library search still shows clear empty-state copy.
- Re-editing contract should not spam repeated toasts.

---

### Workstream 5 — QA automation + integration evidence
**Agent role:** Integrator/QA lead  
**File ownership:** `test/workflow-ui.contract.test.js`, `cypress/e2e/master-spec-flow.cy.js`, `docs/final-qa-signoff-checklist.md` (execution results only)  
**Inputs:** contracts + completed artifacts from WS1–WS4  
**Outputs:** automated checks and manual QA record mapped 1:1 to checklist IDs.

**Step-by-step tasks**
1. Extend tests for: serif contract scope, tooltip availability, post-bid unlock gate, legalese/footnote presence.
2. Update Cypress happy path with checks for DBT volatility and contract clause coverage.
3. Run and record pass/fail with known environment limitations.
4. Mark final statuses in signoff checklist referencing matrix IDs.

**Success criteria**
- All new assertions map directly to matrix IDs.
- Test failures identify exact violated standard.
- Signoff checklist has no unowned High-priority failures.

**Validation steps**
- `npm run build`
- `npm run test -- test/workflow-ui.contract.test.js`
- `npm run test:e2e -- --spec cypress/e2e/master-spec-flow.cy.js` (if environment supports browser runtime)

**Edge cases + negative tests**
- E2E should assert no horizontal scrolling on mobile viewport.
- Export/share paths must not drop absurd clauses.

## Integration plan (dependency-free execution)
- WS1 defines matrix IDs first, but WS2–WS5 can start immediately using provisional IDs listed in this plan and reconcile by stable keys.
- Conflict prevention:
  - Copy-only changes isolated to `uxCopy.ts` (WS3).
  - Interaction logic isolated to page files (WS4).
  - Visual tokens/styles isolated to CSS + `LegalCard` (WS2).
  - Tests isolated to test directories (WS5).
- Merge order (recommended, not blocking): WS1 → WS2/WS3/WS4 in parallel → WS5 final assertion pass.
- If shared file collision occurs, resolve by moving additions into new scoped helper blocks/classes rather than editing existing lines broadly.

## Acceptance checklist (1:1 with workstream success criteria)
- [x] AC1: Compliance matrix includes every checklist item with evidence and owner.
- [x] AC2: All High-priority visual standards pass (seal, serif scoping, spacing, no mobile overflow).
- [x] AC3: All High-priority copy standards pass (legalese per page, footnotes per page, clause quality).
- [x] AC4: All High-priority interaction standards pass (live volatility cues, proxy sync, drawer discoverability, post-bid unlock).
- [x] AC5: Automated tests assert key standards and pass in CI-compatible environment.
- [x] AC6: Manual walkthrough confirms <3 minute happy path and zero confusion blockers.

## Risks + mitigations (parallel-specific)
- **Risk: Contract drift between checklist IDs and tests.**  
  **Mitigation:** WS1 owns stable IDs; WS5 must reference IDs directly in test names/comments.
- **Risk: Style regressions from shared CSS edits.**  
  **Mitigation:** WS2 uses prefixed classes (`legal-shell-*`) and avoids global element selectors.
- **Risk: Humor over-rotation hurting clarity.**  
  **Mitigation:** WS3 keeps required-field and error copy plain-first, joke-second.
- **Risk: Hidden coupling in page state for unlock logic.**  
  **Mitigation:** WS4 gates by existing saved-bid signal only; no new global state unless contract is amended.
- **Risk: E2E environment instability.**  
  **Mitigation:** WS5 treats E2E as best-effort, records limitation, and preserves deterministic contract tests as required gate.
