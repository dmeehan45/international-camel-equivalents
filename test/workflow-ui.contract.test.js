import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const flowSource = readFileSync(new URL('../src/domain/flow.ts', import.meta.url), 'utf8');
const phase1Source = readFileSync(new URL('../src/phases/Phase1Input.tsx', import.meta.url), 'utf8');
const phase2Source = readFileSync(new URL('../src/phases/Phase2Adjudication.tsx', import.meta.url), 'utf8');
const phase3Source = readFileSync(new URL('../src/phases/Phase3Instrument.tsx', import.meta.url), 'utf8');
const phase4Source = readFileSync(new URL('../src/phases/Phase4Docket.tsx', import.meta.url), 'utf8');
const uxCopySource = readFileSync(new URL('../src/content/uxCopy.ts', import.meta.url), 'utf8');


test('workflow contract uses card-based flow with optional tune step', () => {
  assert.match(flowSource, /'card1-basics'/);
  assert.match(flowSource, /'card2-adjudication'/);
  assert.match(flowSource, /'card3-review'/);
  assert.match(flowSource, /'card4-tune'/);
  assert.match(flowSource, /'card5-instrument'/);
  assert.match(flowSource, /'card6-queue'/);
  assert.match(appSource, /FLOW_STEP_LABELS/);
});

test('each card surface exposes one dominant primary CTA', () => {
  assert.equal((phase1Source.match(/<PrimaryActionBar/g) ?? []).length, 1);
  assert.equal((phase2Source.match(/<PrimaryActionBar/g) ?? []).length, 1);
  assert.equal((phase3Source.match(/<PrimaryActionBar/g) ?? []).length, 1);
  assert.equal((phase4Source.match(/<PrimaryActionBar/g) ?? []).length, 1);
});

test('required shell copy includes disclaimer toast and legal footer elements', () => {
  assert.match(appSource, /uxCopy\.disclaimer\.text/);
  assert.match(appSource, /uxCopy\.disclaimer\.dismissCta/);
  assert.match(appSource, /uxCopy\.legal\.footerLabel/);
  assert.match(appSource, /uxCopy\.legal\.links\.map/);
  assert.match(appSource, /shell-toast/);
});

test('phase 1 helper copy stays camel-first and no stale currency examples appear', () => {
  assert.match(uxCopySource, /Examples: 2 camels, 5 yaks, 2 cows\./);
  assert.equal(phase1Source.includes('$1000'), false);
  assert.equal(phase1Source.includes('€850'), false);
  assert.equal(phase1Source.includes('USD bid'), false);
  assert.equal(phase1Source.includes('EUR'), false);
});

test('progressive disclosure now uses optional detail drawers', () => {
  assert.match(phase1Source, /More details\?/);
  assert.match(phase2Source, /Tweak details/);
  assert.match(phase3Source, /More details\?/);
  assert.match(phase4Source, /Bored\? Try a side quest/);
});
