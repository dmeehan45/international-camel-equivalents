import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAdjudicatedCamelValue } from '../src/core/adjudication.js';

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
