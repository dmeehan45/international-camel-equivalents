# plan.md — Dowry Proposal Service Big-Bang Rewrite (5-page UX)

## Executive overview
We are rebuilding the app into a five-page, mobile-first parody drafting flow for users who want a joke dowry proposal in under 2–3 minutes. The experience must feel like a calm online legal form, not a fantasy/game interface.

How we will prove it works:
1. The app exposes exactly 5 pages in sequence: Landing → Basics → Offer → Proposal Text → Drafts.
2. Global UI always shows the slim header, parody footer line, and persistent entertainment disclaimer.
3. Copy removes fantasy/game terms and keeps dry legal humor.
4. A user can complete a full proposal and reuse it from local drafts.

## Contracts first

### Shared interfaces
- `FlowStepId` contract (exact values):
  - `page1-landing`
  - `page2-basics`
  - `page3-offer`
  - `page4-proposal`
  - `page5-drafts`
- Step labels are fixed to: `Intro`, `Basics`, `Offer`, `Text`, `Drafts`.
- `DowryForm` must include fields used by the new flow:
  - required: `bidName`, `bidRegion`, `camelQuantity`
  - optional drawer: `ageRange`, `occupation`, `quirkyFact`
- Draft contract stored in local state list:
  - `{ id: string, name: string, camels: number, summary: string, text: string, createdAt: string }`

### UI contracts
- Header text is always `Dowry Proposal Service`.
- Footer text is always `This is a parody tool. Not legal advice. No actual dowries exchanged.`
- Persistent notice text is always `For entertainment purposes only. Not enforceable.`
- One primary CTA per page.

### Stub file map
- `src/App.tsx` (single flow implementation + page components)
- `src/domain/flow.ts` (5-page flow ids/labels/helpers)
- `src/content/uxCopy.ts` (all tone/copy)
- `src/store/DowryFormContext.tsx` (new optional fields + range)
- `src/domain/types.ts` (`DowryForm` shape update)
- `src/app.css`, `src/design/theme.css`, `src/design/legal-theme.css` (visual system)

## Parallel workstreams

### Workstream 1 — Flow shell and page routing
- **Agent role:** application architect
- **File ownership:** `src/App.tsx`, `src/domain/flow.ts`
- **Inputs:** flow-step contract from this plan
- **Outputs:** deterministic 5-page sequence with back/start-over behavior
- **Tasks:**
  1. Replace legacy root-tab workflow with 5-page flow only.
  2. Add guarded next/back actions and start-over reset.
  3. Keep local draft list and queue actions on page 5.
- **Success criteria:**
  - App displays only the 5 specified pages.
  - Back works on pages 2–5, Start over resets to page 1.
- **Validation:**
  - `npm run build` succeeds.
  - Manual: complete a full run from page 1 to page 5.
- **Edge/negative tests:**
  - Continue is blocked on page 2 without required fields.
  - Proposal generation on page 4 requires name + camel offer.

### Workstream 2 — Content rewrite
- **Agent role:** UX copywriter
- **File ownership:** `src/content/uxCopy.ts`
- **Inputs:** master spec copy requirements
- **Outputs:** plain dry legal tone copy for all pages/errors
- **Tasks:**
  1. Replace fantasy/statute-heavy copy with concise text.
  2. Add strings for all 5 pages and global notices.
  3. Define simple inline errors.
- **Success criteria:**
  - No wizard/dragon/arcane/warrior/artifact/side-quest copy in UI copy file.
  - Required labels and CTA text match spec intent.
- **Validation:**
  - `rg -n "wizard|dragon|arcane|warrior|artifact|side quest|Statute|Invalid Declaration" src/content/uxCopy.ts -S` returns no matches.
- **Edge/negative tests:**
  - Empty required fields produce direct human-readable errors.

### Workstream 3 — Form state contract update
- **Agent role:** state management engineer
- **File ownership:** `src/domain/types.ts`, `src/store/DowryFormContext.tsx`
- **Inputs:** form contract in this plan
- **Outputs:** context supports required + optional basics fields
- **Tasks:**
  1. Add `ageRange`, `occupation`, `quirkyFact` to `DowryForm`.
  2. Update defaults/sanitization/reset behavior.
  3. Update camel slider bounds to 5–100.
- **Success criteria:**
  - Build passes with new form fields.
  - Reset clears optional drawer values.
- **Validation:**
  - `npm run build`
- **Edge/negative tests:**
  - malformed saved JSON should fall back safely.

### Workstream 4 — Visual system simplification
- **Agent role:** design systems engineer
- **File ownership:** `src/app.css`, `src/design/theme.css`, `src/design/legal-theme.css`
- **Inputs:** color/spacing/interaction contract in this plan
- **Outputs:** clean mobile-first legal style UI
- **Tasks:**
  1. Set required palette tokens (navy, gray, muted gold, white).
  2. Ensure full-width mobile buttons and >=48px controls.
  3. Keep only subtle fade animation and minimal shadows.
- **Success criteria:**
  - Buttons and inputs satisfy tap-size requirement.
  - Header/footer/notice are visually distinct and consistent.
- **Validation:**
  - `npm run build`
  - Manual viewport check at ~375px.
- **Edge/negative tests:**
  - reduced-motion users avoid nonessential transitions.

### Workstream 5 — QA and screenshot evidence
- **Agent role:** release QA
- **File ownership:** none (verification + artifacts only)
- **Inputs:** final built app
- **Outputs:** command logs + screenshot artifact
- **Tasks:**
  1. Run build/tests.
  2. Launch app and take a screenshot of updated UI.
- **Success criteria:**
  - Build succeeds and screenshot is captured.
- **Validation:**
  - `npm test`
  - `npm run build`
- **Edge/negative tests:**
  - If browser tool fails, document limitation.

## Integration plan
- Merge order to reduce shared-file conflicts: 2 → 3 → 1 → 4 → 5.
- All workstreams can begin from contracts above without waiting.
- Shared-file risk is limited by strict file ownership and fixed interfaces.

## Acceptance checklist
- [ ] Exactly 5 pages in final flow.
- [ ] Header/footer/persistent entertainment notice match required text exactly.
- [ ] Page 2 has only required fields visible by default with optional drawer.
- [ ] Page 3 has camel slider (5–100) plus equivalent cards.
- [ ] Page 4 supports edit/copy/download/share actions.
- [ ] Page 5 lists drafts with View/Copy/Share/Delete and Start New Proposal.
- [ ] Build and tests executed; results recorded.
- [ ] Screenshot artifact captured for visual change.

## Risks and mitigations
- **Risk:** Contract drift while replacing large `App.tsx`.
  - **Mitigation:** Keep all page copy keys centralized in `uxCopy` and map each page to one render function.
- **Risk:** Legacy tests expect removed UI.
  - **Mitigation:** Run suite; if failures are legacy-coupled, update only tests directly asserting old flow behavior.
- **Risk:** Hidden coupling to old form fields.
  - **Mitigation:** Preserve legacy fields in `DowryForm` while adding new fields to avoid broad breakage.
