import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAdjudicatedCamelValue } from '../src/core/adjudication.js';
import { validateDashboardInput } from '../src/core/dashboard-view.js';

test('adjudication formula applies base * regionFactor + traitBonuses deterministically', () => {
  const result = calculateAdjudicatedCamelValue({
    baseCamelValue: 10,
    regionFactor: 1.2,
    traitBonuses: 0.35,
  });

  assert.deepEqual(result, { adjustedCamelValue: 12.35 });
});

test('adjudication formula rounds to two decimals and handles negative trait bonuses', () => {
  const result = calculateAdjudicatedCamelValue({
    baseCamelValue: 7.777,
    regionFactor: 1.05,
    traitBonuses: -0.112,
  });

  assert.equal(result.adjustedCamelValue, 8.05);
});

test('adjudication formula keeps zero base deterministic with fiat-only bonuses', () => {
  const result = calculateAdjudicatedCamelValue({
    baseCamelValue: 0,
    regionFactor: 1.3,
    traitBonuses: 0.4,
  });

  assert.equal(result.adjustedCamelValue, 0.4);
});

test('adjudication formula rounds half-up on trailing thousandths', () => {
  const result = calculateAdjudicatedCamelValue({
    baseCamelValue: 2.345,
    regionFactor: 1,
    traitBonuses: 0,
  });

  assert.equal(result.adjustedCamelValue, 2.35);
});

test('adjudication formula preserves sign for net negative outcomes', () => {
  const result = calculateAdjudicatedCamelValue({
    baseCamelValue: 1,
    regionFactor: 0.2,
    traitBonuses: -1.5,
  });

  assert.equal(result.adjustedCamelValue, -1.3);
});

test('validation boundaries accept finite zero amount and camel unit', () => {
  assert.doesNotThrow(() => validateDashboardInput({ amount: 0, unit: 'CAMEL' }));
});

test('validation boundaries reject infinity and unsupported units', () => {
  assert.throws(() => validateDashboardInput({ amount: Number.POSITIVE_INFINITY, unit: 'CAMEL' }), /finite number/);
  assert.throws(() => validateDashboardInput({ amount: 1, unit: 'GOAT' }), /camel or proxy/);
});

test('validation boundaries require proxy id only for proxy unit', () => {
  assert.throws(() => validateDashboardInput({ amount: 2, unit: 'PROXY' }), /Select a proxy/);
  assert.doesNotThrow(() => validateDashboardInput({ amount: 2, unit: 'PROXY', proxyId: 'yak' }));
});
