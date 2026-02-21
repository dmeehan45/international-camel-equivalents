import test from 'node:test';
import assert from 'node:assert/strict';
import proxies from '../src/data/proxies.json' with { type: 'json' };
import { toCamelValue, toEquivalents } from '../src/core/conversion.js';

test('USD converts to camels at configured rate', () => {
  const camelValue = toCamelValue({ amount: 1000, unit: 'USD', camelUsdRate: 500 }, proxies);
  assert.equal(camelValue, 2);
});

test('Proxy amount converts to camel value', () => {
  const yak = proxies.find((proxy) => proxy.name === 'Yaks');
  const camelValue = toCamelValue(
    { amount: 5, unit: 'PROXY', proxyId: yak.id, camelUsdRate: 500 },
    proxies,
  );

  assert.equal(camelValue, 4);
});

test('Equivalent quantities are rounded to two decimals', () => {
  const equivalents = toEquivalents(1.234, proxies);
  const yaks = equivalents.find((item) => item.proxyName === 'Yaks');
  assert.equal(yaks.quantity, 1.54);
});

test('Negative values throw whimsical validation error', () => {
  assert.throws(
    () => toCamelValue({ amount: -1, unit: 'CAMEL', camelUsdRate: 500 }, proxies),
    /negative camels/,
  );
});
