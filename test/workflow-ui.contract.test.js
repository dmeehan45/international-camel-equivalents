import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const phase1Source = readFileSync(new URL('../src/phases/Phase1Input.tsx', import.meta.url), 'utf8');
const phase2Source = readFileSync(new URL('../src/phases/Phase2Adjudication.tsx', import.meta.url), 'utf8');
const phase3Source = readFileSync(new URL('../src/phases/Phase3Instrument.tsx', import.meta.url), 'utf8');
const phase4Source = readFileSync(new URL('../src/phases/Phase4Docket.tsx', import.meta.url), 'utf8');
const uxCopySource = readFileSync(new URL('../src/content/uxCopy.ts', import.meta.url), 'utf8');

test('workflow contract remains a 4-phase model only', () => {
  assert.match(appSource, /const flowSteps: FlowStep\[] = \['phase1-input', 'phase2-adjudication', 'phase3-instrument', 'phase4-docket'\]/);
  assert.equal(appSource.includes('phase5'), false);
  assert.match(uxCopySource, /Initiate Formal Dowry Proposal/);
  assert.match(uxCopySource, /Adjudicate International Camel Equivalents/);
  assert.match(uxCopySource, /Generate and Execute Dowry Indenture/);
  assert.match(uxCopySource, /Monitor Active Dowry Dockets/);
});

test('each phase exposes one dominant primary CTA', () => {
  assert.equal((phase1Source.match(/<PrimaryActionBar/g) ?? []).length, 1);
  assert.equal((phase2Source.match(/<PrimaryActionBar/g) ?? []).length, 1);
  assert.equal((phase3Source.match(/<PrimaryActionBar/g) ?? []).length, 1);
  assert.equal((phase4Source.match(/<PrimaryActionBar/g) ?? []).length, 1);
});

test('required shell copy includes disclaimer and legal footer elements', () => {
  assert.match(appSource, /uxCopy\.disclaimer\.text/);
  assert.match(appSource, /uxCopy\.disclaimer\.dismissCta/);
  assert.match(appSource, /uxCopy\.legal\.footerLabel/);
  assert.match(appSource, /uxCopy\.legal\.links\.map/);
});

test('phase 1 helper copy stays camel-first and no stale MVP currency examples appear', () => {
  assert.match(uxCopySource, /Examples accepted by the clerk: 2 camels, 5 yaks, 2 cows\./);
  assert.equal(phase1Source.includes('$1000'), false);
  assert.equal(phase1Source.includes('€850'), false);
  assert.equal(phase1Source.includes('USD bid'), false);
  assert.equal(phase1Source.includes('EUR'), false);
});

test('progressive disclosure is present for advanced controls', () => {
  assert.match(phase1Source, /<details className="context-card">/);
  assert.match(phase2Source, /<details className="context-card">/);
  assert.match(phase3Source, /<details className="context-card">/);
  assert.match(phase4Source, /<details className="context-card">/);
});
