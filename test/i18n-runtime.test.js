import test from 'node:test';
import assert from 'node:assert/strict';

import { createI18n, getLocaleDirection } from '../src/core/i18n-runtime.js';

test('createI18n falls back to english for missing locale keys', () => {
  const i18n = createI18n('fr');
  assert.equal(i18n.t('convert'), 'Convert');
});

test('createI18n supports rtl detection', () => {
  const i18n = createI18n('ar');
  assert.equal(i18n.isRtl(), true);
  assert.equal(getLocaleDirection('ar'), 'rtl');
  assert.equal(getLocaleDirection('en'), 'ltr');
});

test('createI18n supports interpolation functions', () => {
  const i18n = createI18n('en');
  assert.equal(i18n.t('showingProxies', { showing: 4, total: 8 }), 'Showing 4 of 8 proxies.');
});
