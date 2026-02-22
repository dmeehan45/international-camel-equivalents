# plan.md — UX Simplification & Master Spec Alignment Plan

## Executive overview
We are tightening the existing 4-phase satirical wizard so it feels calmer, simpler, and more authoritative while preserving absurd humor. The target user is someone who wants a fast, shareable joke flow in under 5 minutes, with minimal decision fatigue.

How we will prove it works:
1. The default experience is a linear `/phase1` → `/phase4` flow with one dominant action per phase.
2. Visual system is simplified to a restrained “bureaucratic legal” palette/typography with consistent spacing and component hierarchy.
3. Optional complexity (filters, side quests, advanced controls) is progressively disclosed and never competes with primary progression.
4. Accessibility and test coverage validate behavior, readability, and regressions.

Current state assessment summary (against the master UX spec):
- **Strongly aligned already**: 4-phase routing exists, step progress exists, persistent disclaimer/footer exist, local persistence exists, and queue/docket concepts exist.
- **Partially aligned**: optional controls still create visual and cognitive load in phases 2–4; copy tone is legal-satirical but not yet consistently “calm + straightforward”; results tooling competes with primary actions.
- **Not aligned enough**: visual language is currently wedding-editorial/multi-accent rather than authoritative navy/gray/gold legal calm; typography and hierarchy are more decorative than bureaucratic.

---

## Contracts first (parallel-safe)

### Shared product contracts
- **Phase order contract**: `phase1-input -> phase2-adjudication -> phase3-instrument -> phase4-docket`.
- **Primary CTA contract**:
  - Phase 1: Proceed to valuation
  - Phase 2: Affirm and seal bid
  - Phase 3: Conclude proceedings / continue to docket
  - Phase 4: Initiate new proceeding
- **Progressive disclosure contract**:
  - Advanced options are collapsed by default.
  - Side quests never appear before Phase 4 context.
  - Result filters/search/sort are hidden behind explicit toggles.

### Shared UI component contracts
- `LegalCard` (new):
  - Props: `{ title?: string; tone?: 'default'|'locked'|'warning'; children: ReactNode; className?: string }`
  - Purpose: single container style for core phase surfaces.
- `PhaseHeader` (new):
  - Props: `{ phaseLabel: string; heading: string; subtitle?: string }`
  - Purpose: normalize typography/spacing and reduce repeated custom markup.
- `PrimaryActionBar` (new):
  - Props: `{ primary: {label: string; onClick: () => void; disabled?: boolean}; secondary?: Array<{label: string; onClick: () => void}> }`
  - Purpose: enforce a single visually dominant action.

### Shared TypeScript/data contracts
- Reuse existing `DowryForm` in `src/domain/types.ts` and context state from `src/store/DowryFormContext.tsx`.
- Add no new persistence keys except:
  - `icea-theme-mode` (`'light' | 'dark' | 'system'`)
  - `icea-ux-version` (string literal for migration-safe defaults)

### Stub file map (for conflict avoidance)
- `src/components/LegalCard.tsx` (new)
- `src/components/PhaseHeader.tsx` (new)
- `src/components/PrimaryActionBar.tsx` (new)
- `src/design/legal-theme.css` (new)
- `src/content/uxCopy.ts` (existing, copy updates only)

---

## Parallel workstreams

## Workstream 1 — Information Architecture & Flow Tightening
**Agent role:** UX flow engineer  
**File ownership:**
- `src/App.tsx`
- `src/store/DowryFormContext.tsx`
- `src/domain/types.ts`

**Inputs:** phase order contract, progressive disclosure contract, persistence contracts from this plan.  
**Outputs:** deterministic navigation guards, calmer defaults, and persistent light/dark mode setting hookup.

### Step-by-step tasks
1. Audit and reduce any non-linear route jumps from primary surfaces.
2. Ensure flow always opens at Phase 1 unless deep-link route is valid and prerequisites exist.
3. Keep advanced tools reachable, but not visible in the default phase canvas.
4. Add subtle autosave status signal (“Saved”) without adding noisy alerts.
5. Wire theme mode persistence key (`icea-theme-mode`) with system fallback.

### Success criteria
- Opening app starts in Phase 1 for first-time user.
- Cannot enter Phase 3/4 without required prior state.
- No more than one primary CTA appears above the fold in each phase.
- Theme preference persists across refresh.

### Validation steps
- `npm test`
- `npm run build`
- Manual: hard refresh on `/`, `/phase3`, `/phase4` and verify guards.

### Edge cases + negative tests
- Corrupt local storage draft should not crash; app resets gracefully.
- Empty form with direct `/phase2` should block progression artifacts.
- Theme key invalid value should fallback to system/light.

---

## Workstream 2 — Visual System Simplification (Calm Bureaucratic Theme)
**Agent role:** design systems engineer  
**File ownership:**
- `src/design/theme.css`
- `src/design/tokens.js`
- `src/design/legal-theme.css` (new)
- `src/app.css`

**Inputs:** design system guidance from master spec + component contracts in this plan.  
**Outputs:** reduced palette, simplified spacing/hierarchy, calm typography, consistent controls.

### Step-by-step tasks
1. Introduce legal palette tokens (navy/gray/gold/off-white/red) while keeping existing token API stable where possible.
2. Normalize typography scale (14 mobile / 16 desktop body; legal serif in document contexts).
3. Reduce decorative effects (soften gradients/shadows; remove visual noise).
4. Align controls to single button hierarchy (primary/secondary/disabled/focus).
5. Apply 8px spacing rhythm and max-width container consistency.

### Success criteria
- All major surfaces use the legal palette and maintain AA-level contrast for core text/actions.
- Visual noise reduced: no competing accent colors on primary workflow card.
- Primary CTA style is consistent in all phases.

### Validation steps
- `npm run build`
- Manual responsive pass at 375px and 1280px widths.
- Optional if available: screenshot diffs for Phase 1 and Phase 2.

### Edge cases + negative tests
- High contrast mode remains legible.
- Reduced motion users are not forced into animated transitions.

---

## Workstream 3 — Phase Component Simplification & Progressive Disclosure
**Agent role:** front-end interaction engineer  
**File ownership:**
- `src/phases/Phase1Input.tsx`
- `src/phases/Phase2Adjudication.tsx`
- `src/phases/Phase3Instrument.tsx`
- `src/phases/Phase4Docket.tsx`
- `src/components/LegalCard.tsx` (new)
- `src/components/PhaseHeader.tsx` (new)
- `src/components/PrimaryActionBar.tsx` (new)

**Inputs:** shared component contracts + primary CTA contract.  
**Outputs:** each phase rendered with less clutter and clearer hierarchy.

### Step-by-step tasks
1. Wrap each phase in `LegalCard`; standardize heading/subtitle via `PhaseHeader`.
2. Move optional controls into collapsed sections (`details`/accordion) by default.
3. Ensure one dominant primary button per phase; keep secondary actions visually subordinate.
4. Keep ridiculous copy via tooltips/footnotes, not large competing blocks.
5. Preserve all existing functionality (formula, export, queue) while simplifying presentation.

### Success criteria
- Each phase has one clear next action.
- Optional tools are hidden by default and discoverable on demand.
- User can complete Phase 1→4 with no detours in under five minutes.

### Validation steps
- `npm test`
- Manual keyboard-only flow through all phases.
- Manual screen reader spot-check (labels and aria-live announcements still meaningful).

### Edge cases + negative tests
- Long names/notes must not overflow containers.
- Empty optional fields do not create blank noisy output in Phase 3 instrument.

---

## Workstream 4 — Content & Microcopy Harmonization
**Agent role:** UX writer/content engineer  
**File ownership:**
- `src/content/uxCopy.ts`
- `src/phases/Phase1Input.tsx` (copy consumption only)
- `src/phases/Phase2Adjudication.tsx` (copy consumption only)
- `src/phases/Phase3Instrument.tsx` (copy consumption only)
- `src/phases/Phase4Docket.tsx` (copy consumption only)

**Inputs:** master specification copy style and tone constraints.  
**Outputs:** concise legalese + absurdity in controlled doses.

### Step-by-step tasks
1. Replace verbose/competing helper text with short, directive copy.
2. Align labels/headings with the four master phase titles and subtitles.
3. Move “unhinged” content into footnotes/tooltips/loading facts instead of core instruction text.
4. Standardize error voice format: `Invalid Declaration: ... (Statute X.Y)`.

### Success criteria
- Core instructions are scannable and calm.
- Required-field instructions are clear and short.
- Humor remains present without obscuring primary actions.

### Validation steps
- `npm test`
- Manual content checklist against master spec sections.

### Edge cases + negative tests
- Very long localized strings don’t break layout.
- Error text remains specific and actionable.

---

## Workstream 5 — Testing, QA, and Accessibility Sign-off
**Agent role:** QA + test automation engineer  
**File ownership:**
- `test/workflow-ui.contract.test.js`
- `test/release-smoke.integration.test.js`
- `test/dashboard-view.test.js`
- `docs/final-qa-signoff-checklist.md`
- `cypress/e2e/master-spec-flow.cy.js` (new if absent)
- `cypress/e2e/accessibility-smoke.cy.js` (new if absent)

**Inputs:** all contracts and success criteria defined above.  
**Outputs:** enforceable test coverage + end-of-cycle QA checklist.

### Step-by-step tasks
1. Add/adjust tests asserting one primary CTA per phase.
2. Add tests that non-essential controls are collapsed/hidden by default.
3. Add formula regression tests for Phase 2 lock-in behavior.
4. Add e2e checks for linear flow, persistence, and phase guard behavior.
5. Update QA checklist with explicit pass/fail criteria and viewport matrix.

### Success criteria
- Unit/integration tests pass.
- E2E tests pass for linear flow and accessibility smoke.
- QA checklist is executable by a reviewer without tribal knowledge.

### Validation steps
- `npm test`
- `npm run test:smoke`
- `npm run test:e2e`

### Edge cases + negative tests
- Offline refresh should preserve local draft state.
- Invalid form values should show humorous but clear errors and block progression.

---

## Integration plan (dependency-free parallel execution)
- All agents start immediately from contracts in this file.
- Shared-file risk is mitigated by:
  1. **Stub-first approach**: Workstream 3 adds new UI wrapper components without forcing immediate adoption in other files.
  2. **Token compatibility**: Workstream 2 changes variables, not semantic class names first.
  3. **Copy isolation**: Workstream 4 primarily edits `uxCopy.ts` and only touches phase files for key mapping.
  4. **Test adapters**: Workstream 5 uses stable selectors/role queries, avoids brittle visual-class coupling.
- Feature flag fallback (if needed): `icea-ux-version = 'v2-calm-legal'` to gate unfinished surfaces.

### Merge order (no waiting required)
1. Workstream 2 (design tokens/css foundation)
2. Workstream 3 (phase UI structure)
3. Workstream 4 (copy harmonization)
4. Workstream 1 (flow guard/persistence glue)
5. Workstream 5 (tests + QA lock)

Conflict prevention:
- Keep ownership boundaries strict.
- If a shared file must be touched, add adapter/new file instead of rewriting existing shared blocks.

---

## Acceptance checklist (1:1 with success criteria)
- [x] App starts in Phase 1 for new users.
- [x] Phase guards block invalid direct navigation to later phases.
- [x] Exactly one primary CTA is visible above the fold per phase.
- [x] Legal palette + calm hierarchy applied consistently.
- [x] Optional/advanced controls are collapsed by default.
- [x] Humor is preserved but secondary to clear instructions.
- [x] Local persistence works (form + theme mode).
- [ ] Unit + smoke + e2e tests pass.
- [ ] QA checklist completed on mobile + desktop.

---

## Risks and mitigations (parallel-specific)
1. **Contract drift between copy and component implementation**
   - Mitigation: keep all label keys centralized in `uxCopy.ts`; phase components consume keys only.
2. **Hidden coupling in shared CSS classes**
   - Mitigation: introduce new utility/component classes (`legal-theme`, `legal-card`) instead of broad selector edits first.
3. **Test fragility due to class/style assertions**
   - Mitigation: prefer role/text/aria-based assertions and explicit data-testid only where necessary.
4. **Merge conflicts in `App.tsx`**
   - Mitigation: isolate routing logic changes into small helper functions; avoid unrelated edits.
5. **Accessibility regressions from visual simplification**
   - Mitigation: require keyboard-flow and focus-visible checks in Workstream 5 before sign-off.

---

## Execution task list (ready to assign)

Use this section as the day-to-day execution board. Every task is independently executable from the contracts above and includes a binary completion check.

### WS1 — Information Architecture & Flow Tightening (owner: Agent-WS1)

- [x] **WS1-T1: Route guard hardening** (`src/App.tsx`)
  - Action: enforce valid deep-link handling for `/phase2`, `/phase3`, `/phase4` using existing prerequisite checks.
  - Done when: direct visit to `/phase3` without prior state returns user to the earliest valid phase.
  - Verify: manual navigation check + `npm test` passes.

- [x] **WS1-T2: Default entry behavior** (`src/App.tsx`)
  - Action: confirm first-run entry lands on `/phase1` with no distracting alternate root surface.
  - Done when: fresh local storage + load `/` opens Phase 1 flow view.
  - Verify: manual browser check + `npm run build` passes.

- [x] **WS1-T3: Autosave status indicator** (`src/App.tsx`)
  - Action: add subtle “Saved” status tied to existing local persistence writes.
  - Done when: editing form fields shows non-intrusive save confirmation.
  - Verify: manual form edit/refresh preserves data.

- [x] **WS1-T4: Theme preference persistence hook** (`src/App.tsx`, optional typed helper in `src/domain/types.ts`)
  - Action: persist `icea-theme-mode` and restore safely with fallback.
  - Done when: switching mode survives refresh; invalid value falls back to default.
  - Verify: manual localStorage toggle test + `npm test`.

### WS2 — Visual System Simplification (owner: Agent-WS2)

- [x] **WS2-T1: Legal palette token pass** (`src/design/tokens.js`, `src/design/theme.css`)
  - Action: implement authoritative navy/gray/gold/off-white/error token set.
  - Done when: primary surfaces and actions resolve to new legal palette tokens.
  - Verify: `npm run build` + visual check in Phase 1 and Phase 2.

- [x] **WS2-T2: Typography and spacing normalization** (`src/app.css`, `src/design/legal-theme.css`)
  - Action: enforce 14px mobile / 16px desktop body scale and 8px rhythm.
  - Done when: body text sizing and spacing are consistent across phases.
  - Verify: manual responsive checks at 375px and 1280px widths.

- [x] **WS2-T3: Primary/secondary control hierarchy cleanup** (`src/app.css`)
  - Action: ensure one visually dominant button style and muted secondary controls.
  - Done when: primary CTA is clearly dominant in each phase card.
  - Verify: manual per-phase UI pass + keyboard focus visibility check.

### WS3 — Phase Component Simplification (owner: Agent-WS3)

- [x] **WS3-T1: Create reusable wrappers** (`src/components/LegalCard.tsx`, `src/components/PhaseHeader.tsx`, `src/components/PrimaryActionBar.tsx`)
  - Action: add component stubs per contract without changing behavior.
  - Done when: components compile and expose contracted props.
  - Verify: `npm run build` succeeds.

- [x] **WS3-T2: Adopt wrappers in Phase 1 + Phase 2** (`src/phases/Phase1Input.tsx`, `src/phases/Phase2Adjudication.tsx`)
  - Action: reduce clutter and keep optional controls collapsed by default.
  - Done when: each phase shows one clear primary action above fold.
  - Verify: manual flow test + `npm test`.

- [x] **WS3-T3: Adopt wrappers in Phase 3 + Phase 4** (`src/phases/Phase3Instrument.tsx`, `src/phases/Phase4Docket.tsx`)
  - Action: keep absurd extras secondary; preserve export and docket behavior.
  - Done when: Phase 3/4 maintain functionality with calmer layout.
  - Verify: manual full run `/phase1 -> /phase4`.

### WS4 — Content & Microcopy Harmonization (owner: Agent-WS4)

- [x] **WS4-T1: Core copy tightening** (`src/content/uxCopy.ts`)
  - Action: shorten instructional copy while preserving legal satire.
  - Done when: instructions are scan-friendly and direct.
  - Verify: manual copy review against master spec headings/subtitles.

- [x] **WS4-T2: Error voice normalization** (`src/content/uxCopy.ts`)
  - Action: convert errors to `Invalid Declaration: ... (Statute X.Y)` style.
  - Done when: all user-facing errors share consistent format.
  - Verify: `npm test` + trigger sample errors in UI.

- [x] **WS4-T3: Unhinged detail placement** (`src/content/uxCopy.ts`, optional phase usage touch-ups)
  - Action: move absurdity to footnotes/tooltips/loading facts instead of primary instructions.
  - Done when: humor remains but does not block task completion.
  - Verify: manual phase walkthrough.

### WS5 — Testing, QA, and A11y Sign-off (owner: Agent-WS5)

- [x] **WS5-T1: Workflow contract tests for CTA dominance** (`test/workflow-ui.contract.test.js`)
  - Action: assert one dominant primary action per phase.
  - Done when: tests fail on duplicate primary CTAs.
  - Verify: `npm test`.

- [x] **WS5-T2: Progressive disclosure test coverage** (`test/dashboard-view.test.js`)
  - Action: assert non-essential controls are hidden/collapsed by default.
  - Done when: tests enforce default-collapsed behavior.
  - Verify: `npm test`.

- [x] **WS5-T3: Smoke + flow e2e updates** (`test/release-smoke.integration.test.js`, `cypress/e2e/*.cy.js`)
  - Action: validate linear progression, guard behavior, persistence.
  - Done when: smoke and e2e scripts pass green.
  - Verify: `npm run test:smoke` and `npm run test:e2e`.

- [x] **WS5-T4: Final QA checklist hardening** (`docs/final-qa-signoff-checklist.md`)
  - Action: map checklist items to concrete pass/fail actions and viewport matrix.
  - Done when: reviewer can execute QA without repo history context.
  - Verify: checklist dry run.

### Suggested execution order (parallel-safe)

1. Start all workstreams at once; each works only in owned files.
2. Merge sequence: WS2 → WS3 → WS4 → WS1 → WS5.
3. Run final gate: `npm test && npm run test:smoke && npm run build` (and `npm run test:e2e` when environment supports Cypress).
