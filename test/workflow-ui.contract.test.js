import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const flowSource = readFileSync(new URL('../src/domain/flow.ts', import.meta.url), 'utf8');

test('workflow contract uses 5-page flow ids', () => {
  for (const id of ['page1-landing', 'page2-basics', 'page3-offer', 'page4-proposal', 'page5-drafts']) {
    assert.match(flowSource, new RegExp(`'${id}'`));
  }
  assert.match(appSource, /FLOW_STEP_LABELS/);
});

test('shell includes required global references', () => {
  assert.match(appSource, /uxCopy\.global\.appTitle/);
  assert.match(appSource, /uxCopy\.global\.footer/);
  assert.match(appSource, /uxCopy\.global\.persistentDisclaimer/);
});

test('page actions and disclosure controls are present', () => {
  assert.match(appSource, /uxCopy\.page1\.begin/);
  assert.match(appSource, /uxCopy\.page2\.(addMore|hideMore)/);
  assert.match(appSource, /uxCopy\.page3\.lockIn/);
  assert.match(appSource, /uxCopy\.page4\.done/);
  assert.match(appSource, /uxCopy\.page5\.startNew/);
});

test('app source removes fantasy and game language', () => {
  assert.equal(/wizard|dragon|arcane|warrior|artifact|side quest|Statute|Invalid Declaration/i.test(appSource), false);
});
