# Linear Flow UX Rework: Evaluation + Task Set

## Evaluation verdict
Status: **In progress (core flow delivered; hardening and polish underway)**.

The current implementation now lands in the workflow and uses camel-first messaging, but still needs cleanup to fully match the target linear UX:

- Flow and tools drawer patterns are in place, with non-workflow destinations grouped under drawer navigation.
- Step progression copy exists for a single dominant CTA per step, but visual hierarchy and secondary controls still need tuning.
- Side quests are now delayed and presented from the tools area after the core flow progresses.
- Bid parsing and defaults are camel/proxy-oriented, and remaining currency-like edge cases should stay covered by tests.

## Goal state for this rework
A single guided workflow with one primary action per step, plus non-step functionality behind one collapsible tools menu. The sequence is **initial camel bid → finalize bid → side quests after generation**.

---

## Task set

### 1) Enforce a single linear home surface
- [x] Make app launch directly into **Step 1: Enter Camel Bid**.
- [x] Keep only the workflow frame visible by default: header, stepper, current step card, and tools toggle.
- [x] Remove always-visible top-level feature tabs from the default surface.
- [x] Keep non-workflow destinations discoverable only from the tools drawer.

**Definition of done:** users can start and complete the flow without seeing library/archive/premium buttons on the main surface.

### 2) Convert bid model to camel-first (remove dollars)
- [x] Replace bid input labeling and helper text to camel-based language.
- [x] Remove USD/EUR parsing and currency normalization paths.
- [x] Update parser behavior to accept camel quantity and proxy quantities only.
- [x] Rename base-rate copy away from `$500` references and use camel-relative phrasing.
- [x] Update defaults and persisted draft state so initial values are camel-based.

**Definition of done:** no currency symbol examples or USD units are part of Step 1 logic/UI.

### 3) One primary action per step
- [x] Step 1 (Bid): keep only one primary CTA (`Calculate ICE`) and move helpers into secondary text.
- [x] Step 2 (Context): keep only one primary CTA (`Continue to Results`) with optional collapsible cards.
- [x] Step 3 (Results): keep only one primary CTA (`Continue to Message`) and move compare/filter/search into drawers/collapsibles.
- [x] Step 4 (Message): keep only one primary CTA (`Continue to Share`) and keep template switching secondary.
- [x] Step 5 (Share): keep one primary CTA by tab (`Copy` by default).

**Definition of done:** each step has one visually dominant action and no competing primary controls.

### 4) Move all non-step options into the collapsible tools menu
- [x] Relocate side quests, proxy generator, archive utilities, premium entry points, and extra quick actions into tools.
- [x] Keep tools accessible globally as a drawer/bottom-sheet, but never mixed into the active step card by default.
- [x] Add concise summaries for collapsed tool sections to preserve discoverability.

**Definition of done:** on the main workflow card, every visible option supports the current step only.

### 5) Results simplification and progressive disclosure
- [ ] Default results to ICE headline + compact top picks only.
- [ ] Keep “All/Compare/Search/Filter” in secondary panels (drawer/sheet) instead of inline clutter.
- [ ] Keep celebration/parade/charts hidden behind explicit “Celebrate” opt-in.

**Definition of done:** results screen reads as a calm instrument panel first, extras second.

### 6) Side quests as post-results optional overlays
- [x] Trigger side quests only after a successful result.
- [x] Present side quests as optional tiles under a collapsed strip or in tools.
- [x] Open side quests as overlays so users keep their place in the main flow.

**Definition of done:** side quests never compete with required flow actions.

### 7) Accessibility and UX defaults
- [ ] Keep reduced motion/sound-off/high-contrast settings in tools and preserve current sensible defaults.
- [ ] Ensure reduced-motion preference is respected in animations.
- [ ] Add clear labels for what affects calculation vs presentation.

**Definition of done:** accessibility controls are always available but never clutter the active step.

### 8) Navigation and data continuity
- [ ] Keep forward/back navigation without losing form inputs.
- [ ] Show persistent bid summary chip across steps.
- [ ] Keep silent autosave with a subtle “Saved” indicator.

**Definition of done:** users never lose context or entered data when moving between steps.

### 9) Update test coverage for the new constraints
- [x] Add/adjust parser tests for camel/proxy-only input.
- [ ] Add UI tests for one-primary-action-per-step rule.
- [ ] Add UI tests asserting non-step controls are hidden from the main step surface.
- [ ] Add regression tests for tools drawer access to moved functionality.

**Definition of done:** tests enforce linearity rules and prevent reintroduction of dashboard clutter.

### 10) Final polish pass
- [ ] Verify labels, helper text, and examples for camel-first wording.
- [ ] Verify no currency references remain in flow copy.
- [ ] Verify mobile drawer behavior for tools and filter panels.

**Definition of done:** the flow feels simple, linear, and consistent across desktop/mobile.
