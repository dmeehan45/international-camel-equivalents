import test from 'node:test';
import assert from 'node:assert/strict';
import proxies from '../src/data/proxies.json' with { type: 'json' };
import {
  CANONICAL_PROXY_CATEGORIES,
  MIN_REFERENCE_PROXY_COUNT,
  buildCompareSummary,
  filterReferenceProxies,
  validateReferenceCatalog,
} from '../src/core/reference-library.js';

test('filterReferenceProxies filters by query and sorts by name', () => {
  const filtered = filterReferenceProxies(proxies, { query: 'yak' });
  assert.ok(filtered.length > 0);
  assert.equal(filtered[0].name, 'Yaks');
});

test('filterReferenceProxies can filter by source', () => {
  const subset = [
    { id: 'a', name: 'A', source: 'reference', category: 'Mammals and Land Creatures' },
    { id: 'b', name: 'B', source: 'extension', category: 'Mammals and Land Creatures' },
  ];

  const filtered = filterReferenceProxies(subset, { source: 'extension' });
  assert.deepEqual(filtered.map((item) => item.id), ['b']);
});

test('buildCompareSummary formats a compare sentence', () => {
  const text = buildCompareSummary({ amount: 2, fromName: 'Yaks', toName: 'Goldfish', quantity: 100 });
  assert.equal(text, '2 Yaks equals 100 Goldfish.');
});

test('buildCompareSummary validates required values', () => {
  assert.throws(
    () => buildCompareSummary({ amount: -1, fromName: 'Yaks', toName: 'Goldfish', quantity: 1 }),
    /zero or greater/,
  );
  assert.throws(
    () => buildCompareSummary({ amount: 1, fromName: '', toName: 'Goldfish', quantity: 1 }),
    /names are required/,
  );
});


test('validateReferenceCatalog accepts canonical large catalog', () => {
  assert.doesNotThrow(() => validateReferenceCatalog(proxies));
  assert.equal(MIN_REFERENCE_PROXY_COUNT, 100);
  assert.equal(CANONICAL_PROXY_CATEGORIES.length, 6);
});

test('validateReferenceCatalog rejects too-small catalogs', () => {
  assert.throws(
    () => validateReferenceCatalog(proxies.slice(0, 10)),
    /at least 100 proxies/,
  );
});

test('validateReferenceCatalog rejects non-canonical categories', () => {
  const mutated = [...proxies];
  mutated[0] = { ...mutated[0], category: 'Non Canonical Category' };
  assert.throws(
    () => validateReferenceCatalog(mutated),
    /non-canonical category/,
  );
});
