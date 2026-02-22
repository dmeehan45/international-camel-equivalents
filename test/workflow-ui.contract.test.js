import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

test('flow surface keeps non-step navigation out of always-visible primary nav', () => {
  assert.equal(appSource.includes('<nav aria-label="Primary" className="route-nav">'), false);
  assert.match(appSource, /<summary>Navigation<\/summary>/);
  assert.match(appSource, /Courtship Flow/);
  assert.match(appSource, /Library/);
  assert.match(appSource, /Archive/);
  assert.match(appSource, /Premium/);
});

test('flow steps retain one dominant primary CTA for linear progression', () => {
  assert.match(appSource, /Step 1: Enter camel bid/);
  assert.match(appSource, /Calculate ICE/);
  assert.match(appSource, /Continue to Results/);
  assert.match(appSource, /Continue to Message/);
  assert.match(appSource, /Continue to Share/);
});

test('flow copy is camel-first and avoids currency examples', () => {
  assert.match(appSource, /Examples: 2 camels, 5 yaks, 2 cows/);
  assert.equal(appSource.includes('$1000'), false);
  assert.equal(appSource.includes('€850'), false);
  assert.equal(appSource.includes('USD bid'), false);
  assert.equal(appSource.includes('EUR'), false);
});

test('side quests are placed in tools drawer and not inline in results card', () => {
  assert.match(appSource, /<summary>Side Quests<\/summary>/);
  assert.equal(appSource.includes('<h3>Side Quests</h3>'), false);
});


test('step 1 defaults use initial camel bid copy and values', () => {
  assert.match(appSource, /Step 1: Enter camel bid/);
  assert.match(appSource, /Examples: 2 camels, 5 yaks, 2 cows/);
  assert.match(appSource, /rawBid:[^\n]*'2 camels'/);
  assert.match(appSource, /amount:[^\n]*'2'/);
  assert.match(appSource, /unit: normalizeDraftUnit/);
});

test('flow source omits base-rate and dollar artifacts', () => {
  assert.equal(appSource.includes('base-rate'), false);
  assert.equal(appSource.includes('base rate'), false);
  assert.equal(appSource.includes('$500'), false);
  assert.equal(appSource.includes('dollar'), false);
  assert.equal(appSource.includes('USD'), false);
});
