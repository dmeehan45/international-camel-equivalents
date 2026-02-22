import test from 'node:test';
import assert from 'node:assert/strict';
import proxies from '../src/data/proxies.json' with { type: 'json' };
import { calculateIceWithModifiers, compareProxyUnits, toCamelValue, toEquivalents } from '../src/core/conversion.js';

const canonicalCategories = new Set([
  'Mammals and Land Creatures',
  'Aquatic and Marine Life',
  'Birds and Flying Creatures',
  'Reptiles, Insects, and Invertebrates',
  'Mythical and Absurd Concepts',
  'Other Bizarre Items and Collectives',
]);

test('CAMEL input returns camel amount directly', () => {
  const camelValue = toCamelValue({ amount: 2, unit: 'CAMEL' }, proxies);
  assert.equal(camelValue, 2);
});

test('Proxy amount converts to camel value', () => {
  const yak = proxies.find((proxy) => proxy.name === 'Yaks');
  const camelValue = toCamelValue(
    { amount: 5, unit: 'PROXY', proxyId: yak.id },
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
    () => toCamelValue({ amount: -1, unit: 'CAMEL' }, proxies),
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
    { amount: 2, unit: 'CAMEL' },
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
    { amount: 5, unit: 'PROXY', proxyId: yak.id },
    proxies,
    { proxyRateOverrides: { [yak.id]: 2.5 } },
  );

  assert.equal(result.camelValue, 4);
  const overriddenYak = result.equivalents.find((item) => item.proxyId === yak.id);
  assert.equal(overriddenYak.quantity, 10);
});


test('Reference scenario: 3 elephants equals 20 camels', () => {
  const elephants = proxies.find((proxy) => proxy.name === 'Elephants');
  const camelValue = toCamelValue(
    { amount: 3, unit: 'PROXY', proxyId: elephants.id },
    proxies,
  );

  assert.equal(camelValue, 20);
});


test('Unknown proxy id is rejected with a clear error', () => {
  assert.throws(
    () => toCamelValue({ amount: 3, unit: 'PROXY', proxyId: 'missing-proxy' }, proxies),
    /Unknown proxy selected/,
  );
});


test('compare tool converts one proxy into another proxy units', () => {
  const elephants = proxies.find((proxy) => proxy.name === 'Elephants');
  const yaks = proxies.find((proxy) => proxy.name === 'Yaks');

  const equivalentYaks = compareProxyUnits(
    { fromProxyId: elephants.id, toProxyId: yaks.id, amount: 3 },
    proxies,
  );

  assert.equal(equivalentYaks, 25);
});

test('compare tool rejects missing proxy ids', () => {
  const yaks = proxies.find((proxy) => proxy.name === 'Yaks');

  assert.throws(
    () => compareProxyUnits({ fromProxyId: 'missing', toProxyId: yaks.id, amount: 1 }, proxies),
    /Unknown proxy selected/,
  );
});


test('customizer scenario applies multiplier and override together', () => {
  const elephants = proxies.find((proxy) => proxy.name === 'Elephants');
  const yaks = proxies.find((proxy) => proxy.name === 'Yaks');

  const result = calculateIceWithModifiers(
    { amount: 3, unit: 'PROXY', proxyId: elephants.id },
    proxies,
    { camelMultiplier: 1.1, proxyRateOverrides: { [yaks.id]: 2 } },
  );

  assert.equal(result.camelValue, 22);
  const yakEquivalent = result.equivalents.find((item) => item.proxyId === yaks.id);
  assert.equal(yakEquivalent.quantity, 44);
});


test('toEquivalents rejects non-finite camel value', () => {
  assert.throws(() => toEquivalents(Number.NaN, proxies), /finite number/);
});

test('toEquivalents rejects invalid proxy rate', () => {
  const invalid = [{ id: 'broken', name: 'Broken proxy', ratePerCamel: 0 }];
  assert.throws(() => toEquivalents(1, invalid), /greater than zero/);
});


test('camel and proxy conversions stay within camel/proxy unit model', () => {
  const elephants = proxies.find((proxy) => proxy.name === 'Elephants');
  const camelFromProxy = toCamelValue(
    { amount: 3, unit: 'PROXY', proxyId: elephants.id },
    proxies,
  );
  const camelFromCamel = toCamelValue({ amount: 3, unit: 'CAMEL' }, proxies);

  assert.equal(camelFromProxy, 20);
  assert.equal(camelFromCamel, 3);
});
