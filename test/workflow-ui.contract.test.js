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
const advisoryStripSource = readFileSync(new URL('../src/components/advisory/AdvisoryToolsStrip.tsx', import.meta.url), 'utf8');
const advisoryQuizSource = readFileSync(new URL('../src/components/advisory/tools/ProxyPersonalityAssessmentModal.tsx', import.meta.url), 'utf8');
const advisoryVolatilitySource = readFileSync(new URL('../src/components/advisory/tools/BidVolatilitySimulatorModal.tsx', import.meta.url), 'utf8');
const advisoryEstimatorSource = readFileSync(new URL('../src/components/advisory/tools/MaidenResponseEstimatorModal.tsx', import.meta.url), 'utf8');
const advisoryArchiveSource = readFileSync(new URL('../src/components/advisory/tools/FullDbtArchiveModal.tsx', import.meta.url), 'utf8');
const advisoryStorageSource = readFileSync(new URL('../src/core/advisory-tools-storage.ts', import.meta.url), 'utf8');
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

test('advisory tool contracts include four-tile strip and full apply actions', () => {
  assert.match(advisoryStripSource, /slice\(0, 4\)/);
  assert.match(advisoryStripSource, /DBT-Certified Module|subtitle/);
  assert.match(advisoryQuizSource, /Apply to Next Bid/);
  assert.match(advisoryVolatilitySource, /Apply Forecast/);
  assert.match(advisoryEstimatorSource, /Generate Contingency Clause/);
  assert.match(advisoryArchiveSource, /Apply Trend to Bid/);
  assert.match(advisoryStorageSource, /dbt\.advisory\.quiz\.applyNextBid\.v1/);
  assert.match(advisoryStorageSource, /dbt\.advisory\.forecast\.applied\.v1/);
  assert.match(advisoryStorageSource, /dbt\.advisory\.estimate\.applied\.v1/);
  assert.match(advisoryStorageSource, /dbt\.advisory\.archive\.applied\.v1/);
  assert.match(advisoryStorageSource, /dbt\.advisory\.unlock\.v1/);
});

test('copy keeps legalese + footnote coverage and avoids USD fields', () => {
  assert.match(copySource, /DBT v2\.026/);
  assert.match(pageSources, /legal-footnote/);
  assert.equal(/USD bid|\$\d|EUR/i.test(`${appSource}\n${pageSources}\n${copySource}`), false);
});
