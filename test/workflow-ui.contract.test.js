import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const flowSource = readFileSync(new URL('../src/domain/flow.ts', import.meta.url), 'utf8');
const pageSources = [
  readFileSync(new URL('../src/pages/Page1Landing.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/pages/Page2Basics.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/pages/Page3Offer.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/pages/Page4Proposal.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/pages/Page5Drafts.tsx', import.meta.url), 'utf8'),
].join('\n');
const copySource = readFileSync(new URL('../src/content/uxCopy.ts', import.meta.url), 'utf8');
const legalThemeSource = readFileSync(new URL('../src/design/legal-theme.css', import.meta.url), 'utf8');

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
  assert.match(pageSources, /copy\.page1\.begin/);
  assert.match(pageSources, /copy\.page2\.(addMore|hideMore)/);
  assert.match(pageSources, /copy\.page3\.lockIn/);
  assert.match(pageSources, /copy\.page4\.done/);
  assert.match(pageSources, /copy\.page5\.startNew/);
});

test('contract styling and seal affordances exist', () => {
  assert.match(legalThemeSource, /DBT CERTIFIED SEAL/);
  assert.match(legalThemeSource, /Times New Roman/);
  assert.match(pageSources, /legal-shell-contract/);
});

test('tooltips, volatility notice, and post-bid unlock hooks exist', () => {
  assert.match(pageSources, /aria-label=\{`\$\{card\.name\}\. \$\{card\.description\}`\}/);
  assert.match(copySource, /volatilityAlert/);
  assert.match(copySource, /New Advisory Tools Available/);
});

test('copy keeps legalese + footnote coverage and avoids USD fields', () => {
  assert.match(copySource, /DBT v2\.026/);
  assert.match(pageSources, /legal-footnote/);
  assert.equal(/USD bid|\$\d|EUR/i.test(`${appSource}\n${pageSources}\n${copySource}`), false);
});
