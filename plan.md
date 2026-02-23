# Parallel Plan: Page 5 Post-Bid Section — Further Advisory Tools

## Executive overview
We are expanding **Page 5 (Advisory Docket)** with a gated “Further Advisory Tools” section that unlocks only after a user records their first successful bid. The feature targets users who have completed the core journey and are ready for optional, high-flavor add-ons that maintain a polished legal-SaaS tone while delivering absurd proxy humor.

Who this is for:
- Returning users who already understand the base flow and can handle optional complexity.
- Mobile-first users who need modal/sheet interactions that preserve docket context.

How we will prove it works:
- Unlock logic is binary and testable: hidden before first successful bid, visible after.
- Exactly 4 advisory tiles render in a horizontal strip (desktop) and mobile-friendly layout.
- Each tool opens in modal/full-screen sheet with close/back affordances and retains docket context after closing.
- Each tool emits output that can influence future bids/contracts through local persistence and/or explicit “Apply” actions.
- Quiz prototype ships first and fully works end-to-end.

## Contracts first (shared interfaces and stubs)

These contracts are fixed before implementation so all agents can work independently.

### 1) Shared TypeScript contracts
Create/update shared types in `src/domain/types.ts` (or a new `src/domain/advisoryTools.ts` if cleaner):

```ts
export type AdvisoryToolKey =
  | 'proxy_personality_assessment'
  | 'bid_volatility_simulator'
  | 'maiden_response_estimator'
  | 'full_dbt_archive';

export interface AdvisoryToolTile {
  key: AdvisoryToolKey;
  title: string;
  subtitle: string; // e.g. DBT-certified subtitle
  teaser: string;
  icon: 'quiz' | 'simulator' | 'estimator' | 'archive';
  unlockRequirement: 'first_successful_bid';
}

export interface AdvisoryUnlockState {
  hasUnlockedFurtherAdvisoryTools: boolean;
  unlockedAtISO?: string;
}

export interface ProxyAffinityResult {
  proxyId: string;
  proxyName: string;
  rate: number;
  rationale: string;
  snippet: string;
  assessedAtISO: string;
}
```

### 2) localStorage key contract
Centralize constants in `src/core/customizer-settings.js` or `src/core/advisory-tools-storage.ts`:
- `dbt.advisory.unlock.v1` → `AdvisoryUnlockState`
- `dbt.advisory.quiz.lastResult.v1` → `ProxyAffinityResult`
- `dbt.advisory.quiz.applyNextBid.v1` → `{ proxyId: string; source: 'quiz' }`
- `dbt.advisory.forecast.applied.v1` → `{ proposalId: string; rateDeltaDisplay: number; expiresAtISO: string }`

### 3) UI component contracts
New components and props (exact paths):
- `src/components/advisory/AdvisoryToolsStrip.tsx`
  - Props: `{ tiles: AdvisoryToolTile[]; isUnlocked: boolean; onOpenTool: (key: AdvisoryToolKey) => void; }`
- `src/components/advisory/AdvisoryToolShell.tsx`
  - Props: `{ title: string; onClose: () => void; children: ReactNode; mobileFullScreen?: boolean; }`
- `src/components/advisory/tools/ProxyPersonalityAssessmentModal.tsx`
  - Props: `{ isOpen: boolean; onClose: () => void; proxyLibrary: ProxyRecord[]; onApplyToNextBid: (result: ProxyAffinityResult) => void; }`

### 4) Tool behavior contracts
- **Quiz first** is MVP-complete in this iteration.
- Other three tools may launch with contract-complete scaffold + deterministic placeholder logic, but must:
  - Open/close correctly.
  - Show title/header and advisory framing.
  - Emit structured output object and “Apply” action hook.
- No API/network calls; all logic local and deterministic/randomized from local pools.

### 5) Stub file map with exact paths
- `src/phases/Phase4Docket.tsx`
- `src/pages/Page5Drafts.tsx`
- `src/domain/types.ts`
- `src/content/uxCopy.ts`
- `src/components/advisory/AdvisoryToolsStrip.tsx` (new)
- `src/components/advisory/AdvisoryToolShell.tsx` (new)
- `src/components/advisory/tools/ProxyPersonalityAssessmentModal.tsx` (new)
- `src/components/advisory/tools/BidVolatilitySimulatorModal.tsx` (new)
- `src/components/advisory/tools/MaidenResponseEstimatorModal.tsx` (new)
- `src/components/advisory/tools/FullDbtArchiveModal.tsx` (new)
- `src/core/advisory-tools-storage.ts` (new)
- `src/core/advisory-tools-engine.ts` (new)
- `test/workflow-ui.contract.test.js`
- `cypress/e2e/master-spec-flow.cy.js`

---

## Parallel workstreams (independent, no waiting)

## Workstream 1 — Unlock gating + tile host
**Agent role:** Docket flow engineer

**File ownership (exclusive):**
- `src/phases/Phase4Docket.tsx`
- `src/pages/Page5Drafts.tsx`

**Inputs:** Contracts in this `plan.md` only.

**Outputs:**
- Unlock gate wired to first successful bid signal.
- Tile strip mounted with 4 tools and proper desktop/mobile placement.

**Step-by-step tasks:**
1. Add read-only unlock-state selector based on storage key contract.
2. Render locked placeholder text when not unlocked.
3. Render `AdvisoryToolsStrip` with exactly 4 tiles when unlocked.
4. Wire `onOpenTool` state in Page 5 and keep docket list mounted beneath/behind overlays.
5. Ensure close/back returns user to same scroll position/context.

**Success criteria (binary):**
- Before first successful bid: no advisory tiles shown.
- After first successful bid: 4 advisory tiles shown.
- Opening/closing any tool does not navigate away from Page 5.

**Validation steps:**
- `npm run build` (passes)
- `npm run test -- test/workflow-ui.contract.test.js` (passes unlock assertions)
- Manual UI: save first successful bid → revisit Page 5 → tools appear.

**Edge cases + negative tests:**
- Corrupt unlock storage payload falls back to locked state without crash.
- Duplicate successful-bid writes do not duplicate UI state.

---

## Workstream 2 — Shared advisory shell, visual style, and responsive behavior
**Agent role:** UI systems engineer

**File ownership (exclusive):**
- `src/components/advisory/AdvisoryToolsStrip.tsx`
- `src/components/advisory/AdvisoryToolShell.tsx`
- (If needed) scoped styles in `src/app.css` only under `.advisory-tools-*` namespace

**Inputs:** Contracts and tile metadata shape from `plan.md`.

**Outputs:**
- Professional SaaS tile strip with navy border, gold accent, serif subtitle.
- Modal/sheet shell component with subtle fades only.

**Step-by-step tasks:**
1. Implement horizontal scrollable tile row with max 4 cards rendered.
2. Add icon slot + teaser + subtitle styling per card.
3. Implement reusable shell with desktop modal + mobile full-screen sheet fallback.
4. Add back/close affordance always visible and keyboard-accessible.
5. Enforce no animation beyond subtle opacity fade.

**Success criteria (binary):**
- Desktop: tools appear as strip/right-drawer-compatible block.
- Mobile: tools open full-screen sheet and are fully usable.
- Visual style includes navy/gold/serif treatment and remains readable.

**Validation steps:**
- `npm run build` (passes)
- Manual responsive check at 375px and 1280px widths.

**Edge cases + negative tests:**
- Long teaser text truncates gracefully.
- Reduced-motion settings do not break transitions.

---

## Workstream 3 — Proxy Personality Assessment (quiz-first complete)
**Agent role:** Feature implementer (MVP priority)

**File ownership (exclusive):**
- `src/components/advisory/tools/ProxyPersonalityAssessmentModal.tsx`
- `src/core/advisory-tools-engine.ts`
- `src/core/advisory-tools-storage.ts`
- `src/content/uxCopy.ts` (quiz copy keys only)

**Inputs:** Shared contracts + existing proxy library data.

**Outputs:**
- End-to-end 5–7 question quiz with progress, auto-advance, result, and apply-to-next-bid behavior.

**Step-by-step tasks:**
1. Define question pool with category mapping and slight per-run randomization.
2. Implement 5–7 step quiz state machine (single-select, auto-advance).
3. Compute spirit proxy match and generate certified result copy + snippet.
4. Persist result and apply flag using storage contract keys.
5. Add retake/re-certification path that resets quiz state.

**Success criteria (binary):**
- Quiz completes without reload and shows result card.
- “Apply to Next Bid” writes storage payload with selected proxy.
- Retake produces a fresh question order and new assessment timestamp.

**Validation steps:**
- `npm run build` (passes)
- `npm run test -- test/workflow-ui.contract.test.js` (quiz flow assertions pass)
- Manual: complete quiz twice, verify re-certification updates timestamp.

**Edge cases + negative tests:**
- Missing proxy library entries degrade gracefully with fallback proxy.
- User closes modal mid-quiz and reopens: resume policy explicitly enforced (either restart or resume, documented in copy).

---

## Workstream 4 — Remaining three tool scaffolds with output hooks
**Agent role:** Tool scaffolding engineer

**File ownership (exclusive):**
- `src/components/advisory/tools/BidVolatilitySimulatorModal.tsx`
- `src/components/advisory/tools/MaidenResponseEstimatorModal.tsx`
- `src/components/advisory/tools/FullDbtArchiveModal.tsx`
- `src/content/uxCopy.ts` (non-quiz advisory keys only)

**Inputs:** Contracts in `plan.md` only.

**Outputs:**
- Functional modal scaffolds for simulator, estimator, archive.
- Rule-based placeholder engines with structured output and “Apply” hooks.

**Step-by-step tasks:**
1. Implement simulator with 3–5 turns, scenario cards, and simple chart placeholder.
2. Implement estimator with proposal selector + sliders + deterministic percentage result.
3. Implement archive with generated timeline, filter controls, and insight summary.
4. Ensure each tool has “Apply Forecast/Clause/Trend” button wired to no-op callback or storage hook.
5. Ensure headers and outputs match bureaucratic deadpan tone.

**Success criteria (binary):**
- Each tool opens/closes and renders required flow elements.
- Each tool emits structured output object when user taps apply.
- No tool blocks core docket interactions after closing.

**Validation steps:**
- `npm run build` (passes)
- Manual click-through of all three tools.

**Edge cases + negative tests:**
- Empty proposal list path shows non-crashing empty state with guidance.
- Scenario/archive generation does not produce undefined labels.

---

## Workstream 5 — Integration tests, e2e flow, and screenshot evidence
**Agent role:** QA + integration verifier

**File ownership (exclusive):**
- `test/workflow-ui.contract.test.js`
- `cypress/e2e/master-spec-flow.cy.js`
- `docs/final-qa-signoff-checklist.md` (new section only)

**Inputs:** Contracts and behavior defined in this plan.

**Outputs:**
- Automated coverage for unlock gate + quiz MVP.
- Manual signoff checklist + screenshot references.

**Step-by-step tasks:**
1. Add contract tests for locked/unlocked rendering and tile count=4.
2. Add test for quiz completion and apply-to-next-bid storage write.
3. Add e2e path from first successful bid to tool unlock and quiz run.
4. Record manual checks for mobile modal behavior and context retention.
5. Attach screenshot artifacts for Page 5 unlocked strip and quiz result screen.

**Success criteria (binary):**
- All added tests pass locally.
- Screenshot evidence exists for unlocked strip and quiz output.
- Signoff checklist maps each check to a concrete action.

**Validation steps:**
- `npm run build`
- `npm run test -- test/workflow-ui.contract.test.js`
- `npm run test:e2e -- --spec cypress/e2e/master-spec-flow.cy.js`

**Edge cases + negative tests:**
- Verify tools remain hidden after failed/incomplete bid.
- Verify mobile close button always returns to same docket context.

---

## Integration plan that avoids dependencies
- All workstreams can start immediately because contracts, file ownership, and stubs are fixed in this plan.
- Shared-file conflict prevention:
  - `uxCopy.ts` split by namespace ownership: WS3 edits `advisory.quiz.*`; WS4 edits `advisory.simulator.*`, `advisory.estimator.*`, `advisory.archive.*`.
  - No other shared files overlap.
- Use adapter pattern to avoid cross-editing:
  - WS3/WS4 both call stable helpers from `advisory-tools-engine.ts`; if helper missing, tool component can include temporary local adapter and later switch import in same file only.
- Merge order (no blocking required):
  1. WS2 (shared shell + visuals)
  2. WS1 (host + gating)
  3. WS3 and WS4 in parallel
  4. WS5 final verification pass
- Feature flag optional fallback (if needed): `advisoryToolsV1Enabled` local constant in Page 5 defaults true in dev.

## Acceptance checklist (mapped 1:1 to success criteria)
- [ ] AC1: Advisory tools hidden pre-first-successful-bid.
- [ ] AC2: Advisory tools visible post-first-successful-bid.
- [ ] AC3: Exactly 4 tiles render with official styling.
- [ ] AC4: Tools open in modal/sheet and close back to same docket context.
- [ ] AC5: Quiz runs 5–7 questions with step progress and auto-advance.
- [ ] AC6: Quiz result provides certified proxy output + shareable snippet.
- [ ] AC7: “Apply to Next Bid” persists proxy suggestion payload.
- [ ] AC8: Volatility simulator scaffold emits forecast output + apply action.
- [ ] AC9: Maiden estimator scaffold emits probability output + clause action.
- [ ] AC10: Archive scaffold emits trend insight + apply action.
- [ ] AC11: Contract tests cover unlock gate + quiz apply path.
- [ ] AC12: E2E verifies first-bid unlock and quiz completion.
- [ ] AC13: Screenshot artifacts captured for unlocked strip + quiz output.

## Risks and mitigations (parallel-work specific)
- **Risk: contract drift across tool payloads.**
  - Mitigation: strict shared interfaces in `types.ts`; PR checks fail if tool outputs are `any`.
- **Risk: hidden coupling to existing docket state shape.**
  - Mitigation: WS1 introduces an adapter function at boundary (`mapDocketToAdvisoryInputs`) and keeps internals local.
- **Risk: merge conflicts in `uxCopy.ts`.**
  - Mitigation: namespaced key ownership per workstream and alphabetical insertion blocks.
- **Risk: modal behavior differs on mobile vs desktop.**
  - Mitigation: single reusable `AdvisoryToolShell` with breakpoint prop; test both 375px and desktop widths.
- **Risk: over-scoping beyond MVP.**
  - Mitigation: enforce “quiz-first complete, others scaffolded but functional” in acceptance criteria.
