# Parallel Plan: Simplified UX Spec Alignment (Option B)

## Executive overview
We are bringing the simplified 5-page flow closer to the approved UX spec for mobile users who need to complete a humorous dowry proposal in under 2–3 minutes. We will preserve the existing flow while improving interaction fidelity (prefilled text, meaningful equivalent cards), export completeness (.txt + .pdf), explicit navigation affordances, and functional extras. We will also split page rendering into page-specific components to reduce complexity without changing core data contracts.

How we will prove it works:
- Type/build passes.
- Existing automated tests pass.
- New/updated e2e checks for the revised flow pass.
- Manual screenshot verifies updated UI renders.

## Contracts first
### Shared interfaces
- `FlowStepId` remains unchanged: `'page1-landing' | 'page2-basics' | 'page3-offer' | 'page4-proposal' | 'page5-drafts'`.
- `SavedDraft` shape remains unchanged in app state:
  - `id: string`
  - `name: string`
  - `camels: number`
  - `summary: string`
  - `text: string`
  - `createdAt: string`
- New page component contracts (props-only, no global state mutation outside callbacks):
  - `Page1Landing`: `{ uxCopy, howOpen, setHowOpen, onBegin }`
  - `Page2Basics`: `{ uxCopy, form, regions, ageRanges, optionalOpen, setOptionalOpen, dispatchForm, suggestedCamels, onContinue, error }`
  - `Page3Offer`: `{ uxCopy, camelQuantity, suggestedCamels, cards, onSliderChange, onSelectCard, onLockIn }`
  - `Page4Proposal`: `{ uxCopy, proposalText, setProposalText, personalizeOpen, setPersonalizeOpen, customSentence, setCustomSentence, tone, setTone, onGenerate, onCopy, onDownloadTxt, onDownloadPdf, onShare, onDone }`
  - `Page5Drafts`: `{ uxCopy, drafts, selectedDraftId, setSelectedDraftId, onCopyDraft, onShareDraft, onDeleteDraft, extrasOpen, setExtrasOpen, onGenerateRejection, calculationsOpen, setCalculationsOpen, onStartNew }`

### File map (stubs)
- `src/App.tsx` (orchestration only)
- `src/pages/Page1Landing.tsx`
- `src/pages/Page2Basics.tsx`
- `src/pages/Page3Offer.tsx`
- `src/pages/Page4Proposal.tsx`
- `src/pages/Page5Drafts.tsx`
- `src/content/uxCopy.ts` (copy labels)
- `src/app.css` (styles for new page structure)
- `cypress/e2e/master-spec-flow.cy.js` (flow assertions)

## Parallel workstreams

### Workstream 1 — App orchestration split (Agent role: Flow integrator)
- File ownership:
  - `src/App.tsx`
  - `src/pages/Page1Landing.tsx`
  - `src/pages/Page2Basics.tsx`
  - `src/pages/Page3Offer.tsx`
  - `src/pages/Page4Proposal.tsx`
  - `src/pages/Page5Drafts.tsx`
- Inputs: component prop contracts above.
- Outputs: page components + slimmer `App.tsx` wiring.
- Tasks:
  1. Extract page JSX from `App.tsx` into page components.
  2. Keep state in `App.tsx`; pass callbacks/values via props.
  3. Add explicit “Start over” text link for pages 2–5.
- Success criteria:
  - App renders all 5 pages with unchanged route-less flow.
  - `App.tsx` no longer contains large inline page markup blocks.
  - Start-over text link visible on pages 2–5.
- Validation:
  - `npm run build` succeeds.
- Edge/negative tests:
  - Start-over clears form and returns to page1 from page5.

### Workstream 2 — Spec behavior deltas (Agent role: UX behavior engineer)
- File ownership:
  - `src/App.tsx`
  - `src/content/uxCopy.ts`
- Inputs: shared contracts + spec deltas.
- Outputs: behavior fixes and copy updates.
- Tasks:
  1. Prefill proposal text when transitioning from page3 to page4.
  2. Make equivalent cards map to distinct camel values.
  3. Add separate TXT and PDF download actions.
  4. Implement functional extras (rejection letter + calculations log).
  5. Remove fantasy/side-quest terms from user-facing copy in active flow.
- Success criteria:
  - Page4 textarea populated on first arrival.
  - At least 3 equivalent cards change camel value.
  - Both `.txt` and `.pdf` downloads available.
  - Extras controls perform observable actions.
- Validation:
  - `npm run build` succeeds.
  - `rg -n "warrior|artifact|side quest|wizard|dragon|arcane|lunar|enchanted|codex|concordat|relic" src/App.tsx src/content/uxCopy.ts` returns no matches.
- Edge/negative tests:
  - Empty proposal uses generated fallback for copy/share.

### Workstream 3 — Styling alignment (Agent role: UI polish)
- File ownership:
  - `src/app.css`
- Inputs: existing color variables and component class names.
- Outputs: style updates for start-over link, extras panels, download buttons, and calculation log list.
- Tasks:
  1. Add styles for page component wrappers and utility classes.
  2. Ensure full-width mobile buttons, 48px targets, subtle cards, and spacing.
- Success criteria:
  - No layout regression on mobile width.
  - New elements match existing design tokens.
- Validation:
  - `npm run build` succeeds.
- Edge/negative tests:
  - Long proposal text wraps without overflow.

### Workstream 4 — E2E verification updates (Agent role: QA automation)
- File ownership:
  - `cypress/e2e/master-spec-flow.cy.js`
- Inputs: expected UI text and flow behavior.
- Outputs: updated test coverage for changed behaviors.
- Tasks:
  1. Assert Page4 prefilled text appears.
  2. Assert equivalent card click changes slider value.
  3. Assert extras actions render outputs/log.
- Success criteria:
  - Spec flow test passes locally.
- Validation:
  - `npm run test:e2e -- --spec cypress/e2e/master-spec-flow.cy.js` (or equivalent cypress command) passes.
- Edge/negative tests:
  - Validation errors appear for missing name/region.

## Integration plan (no blocking)
- Use prop contracts so each page component can be developed independently after stubs exist.
- Merge order: Workstream 1 (stubs/orchestration) → Workstream 2 (behavior) → Workstream 3 (styles) → Workstream 4 (tests).
- Conflict prevention:
  - Only Workstream 1/2 touch `App.tsx`; coordinate by limiting Workstream 2 to handler logic section.
  - Other workstreams own non-overlapping files.

## Acceptance checklist
- [x] Page 4 is prefilled when opened.
- [x] Equivalent cards produce meaningful camel updates.
- [x] Download supports `.txt` and `.pdf`.
- [x] Start-over link visible on pages 2–5.
- [x] Extras are actionable (rejection + calculations view).
- [x] Fantasy terms removed from active simplified flow copy.
- [x] Build passes.
- [ ] Tests pass (unit/node + targeted e2e).
- [x] Screenshot captured for visual changes.

## Risks + mitigations
- Contract drift between page components and `App.tsx` props.
  - Mitigation: define explicit prop shapes and keep all state in `App.tsx`.
- Hidden coupling with legacy modules.
  - Mitigation: avoid modifying legacy `src/phases/*` behavior; only adjust active simplified flow and targeted copy.
- Browser PDF API variability.
  - Mitigation: fallback to print-dialog based PDF generation using existing browser capabilities and a deterministic text blob fallback naming.
