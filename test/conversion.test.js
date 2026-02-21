import test from 'node:test';
import assert from 'node:assert/strict';
import proxies from '../src/data/proxies.json' with { type: 'json' };
import { calculateIceWithModifiers, toCamelValue, toEquivalents } from '../src/core/conversion.js';

const canonicalCategories = new Set([
  'Mammals and Land Creatures',
  'Aquatic and Marine Life',
  'Birds and Flying Creatures',
  'Reptiles, Insects, and Invertebrates',
  'Mythical and Absurd Concepts',
  'Other Bizarre Items and Collectives',
]);

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

test('proxy categories are canonical and extension metadata is explicit', () => {
  for (const proxy of proxies) {
    assert.ok(canonicalCategories.has(proxy.category));
    assert.ok(proxy.source === 'reference' || proxy.source === 'extension');
    assert.equal(typeof proxy.isExtension, 'boolean');
  }
});

test('modifier pipeline applies camel multiplier before equivalents', () => {
  const result = calculateIceWithModifiers(
    { amount: 1000, unit: 'USD', camelUsdRate: 500 },
    proxies,
    { camelMultiplier: 1.5 },
  );

  assert.equal(result.camelValue, 3);
  const yaks = result.equivalents.find((item) => item.proxyName === 'Yaks');
  assert.equal(yaks.quantity, 3.75);
});

test('proxy override rate is used after camel value is calculated', () => {
  const yak = proxies.find((proxy) => proxy.name === 'Yaks');
  const result = calculateIceWithModifiers(
    { amount: 5, unit: 'PROXY', proxyId: yak.id, camelUsdRate: 500 },
    proxies,
    { proxyRateOverrides: { [yak.id]: 2.5 } },
  );

  assert.equal(result.camelValue, 4);
  const overriddenYak = result.equivalents.find((item) => item.proxyId === yak.id);
  assert.equal(overriddenYak.quantity, 10);
});
