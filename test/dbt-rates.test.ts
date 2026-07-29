import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCuratedSuggestions, formatAdvisoryDate, getLiveRate, getVolatilityPercent, toCamelBenchmark } from '../src/core/dbt-rates.ts';
import type { ProxyDefinition } from '../src/domain/types.ts';

import proxies from '../src/data/proxies.json' with { type: 'json' };

const library = proxies as ProxyDefinition[];

test('volatility is derived from the day of the month and stays within 0-6%', () => {
  for (let day = 1; day <= 31; day += 1) {
    const percent = getVolatilityPercent(new Date(2026, 6, day));
    assert.ok(percent >= 0 && percent <= 6, `day ${day} produced ${percent}`);
  }
  assert.equal(getVolatilityPercent(new Date(2026, 1, 22)), 1);
});

test('live rate applies the volatility uplift to the base rate', () => {
  // 22nd → 22 % 7 === 1 → +1%
  assert.equal(getLiveRate(1.25, new Date(2026, 1, 22)), 1.26);
  // 7th → 7 % 7 === 0 → unchanged
  assert.equal(getLiveRate(1.25, new Date(2026, 1, 7)), 1.25);
});

test('camel benchmark divides the bid quantity by the live rate', () => {
  // This is the calculation the Offer page displays; the copy must read as division.
  assert.equal(toCamelBenchmark(18, 15.62), 1.15);
  assert.equal(toCamelBenchmark(10, 2), 5);
});

test('camel benchmark rejects non-positive input instead of returning NaN', () => {
  assert.throws(() => toCamelBenchmark(0, 1.25), /Proxy quantity must be positive/);
  assert.throws(() => toCamelBenchmark(-3, 1.25), /Proxy quantity must be positive/);
  assert.throws(() => toCamelBenchmark(18, 0), /Live rate must be positive/);
  assert.throws(() => toCamelBenchmark(Number.NaN, 1.25), /Proxy quantity must be positive/);
});

test('advisory date is formatted from the supplied date, never hardcoded', () => {
  assert.equal(formatAdvisoryDate(new Date(2026, 1, 22)), 'February 22, 2026');
  assert.equal(formatAdvisoryDate(new Date(2026, 6, 29)), 'July 29, 2026');
});

test('curated suggestions return exactly six distinct proxies from the real library', () => {
  const picks = buildCuratedSuggestions(library, 'Kenya', '30-39', 'Analyst', 'keeps bees');
  assert.equal(picks.length, 6);
  assert.equal(new Set(picks.map((p) => p.id)).size, 6);
  picks.forEach((pick) => {
    assert.ok(library.some((item) => item.id === pick.id), `${pick.id} is not in the proxy library`);
  });
});

test('curated suggestions are deterministic for the same profile', () => {
  const first = buildCuratedSuggestions(library, 'India', '20-29', 'Bard', 'collects spoons');
  const second = buildCuratedSuggestions(library, 'India', '20-29', 'Bard', 'collects spoons');
  assert.deepEqual(first.map((p) => p.id), second.map((p) => p.id));
});
