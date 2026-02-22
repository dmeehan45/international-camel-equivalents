import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const phase1Source = readFileSync(new URL('../src/phases/Phase1Input.tsx', import.meta.url), 'utf8');
const phase2Source = readFileSync(new URL('../src/phases/Phase2Adjudication.tsx', import.meta.url), 'utf8');
const uxCopySource = readFileSync(new URL('../src/content/uxCopy.ts', import.meta.url), 'utf8');

test('flow surface keeps non-step navigation out of always-visible primary nav', () => {
  assert.equal(appSource.includes('<nav aria-label="Primary" className="route-nav">'), false);
  assert.match(appSource, /<summary>Navigation<\/summary>/);
  assert.match(appSource, /Courtship Flow/);
  assert.match(appSource, /Library/);
  assert.match(appSource, /Archive/);
  assert.match(appSource, /Premium/);
});

test('flow copy uses legal phase framing and updated progression CTAs', () => {
  assert.match(uxCopySource, /Phase I: Petition Intake & Bid Filing/);
  assert.match(uxCopySource, /Proceed to Valuation Hearing/);
  assert.match(uxCopySource, /Affirm and Seal Bid/);
  assert.match(uxCopySource, /Phase IV: Docketing & Archival Seal/);
});

test('step 1 helper copy stays camel-first and no currency examples appear', () => {
  assert.match(uxCopySource, /Examples accepted by the clerk: 2 camels, 5 yaks, 2 cows\./);
  assert.equal(phase1Source.includes('$1000'), false);
  assert.equal(phase1Source.includes('€850'), false);
  assert.equal(phase1Source.includes('USD bid'), false);
  assert.equal(phase1Source.includes('EUR'), false);
});

test('side quests are placed in tools drawer and not inline in results card', () => {
  assert.match(appSource, /<summary>Side Quests<\/summary>/);
  assert.equal(appSource.includes('<h3>Side Quests</h3>'), false);
});


test('phase 1 defaults keep camel bid defaults and required markers', () => {
  assert.match(appSource, /rawBid:[^\n]*'2 camels'/);
  assert.match(appSource, /amount:[^\n]*'2'/);
  assert.match(appSource, /unit: normalizeDraftUnit/);
  assert.match(phase1Source, /labels\.bidName/);
  assert.match(phase1Source, /labels\.bidRegion/);
});

test('validation copy uses statute-style error language', () => {
  assert.match(uxCopySource, /Statute 12\(b\)/);
  assert.match(uxCopySource, /Statute 3\.14/);
  assert.match(uxCopySource, /By order of the Camel Court/);
  assert.match(phase2Source, /uxCopy\.phases\.phase2\.cta/);
});
