import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArchiveEntries, sampleAcrossCategories } from '../src/core/advisory-tools-engine.ts';
import type { ProxyDefinition } from '../src/domain/types.ts';

import proxies from '../src/data/proxies.json' with { type: 'json' };

const library = proxies as ProxyDefinition[];
const allCategories = [...new Set(library.map((proxy) => proxy.category))];
const FIXED_NOW = Date.UTC(2026, 6, 29);

test('the archive covers every category offered by the filter', () => {
  // Regression: the ledger was built from the first four proxies, all of which
  // are mammals, so five of the six filter options returned nothing at all.
  const entries = buildArchiveEntries(library, FIXED_NOW);
  const covered = new Set(entries.map((entry) => entry.category));
  allCategories.forEach((category) => {
    assert.ok(covered.has(category), `no archive records for category: ${category}`);
  });
});

test('filtering the archive by any single category yields records', () => {
  const entries = buildArchiveEntries(library, FIXED_NOW);
  allCategories.forEach((category) => {
    const matching = entries.filter((entry) => entry.category === category);
    assert.ok(matching.length > 0, `category ${category} filters down to an empty ledger`);
  });
});

test('sampleAcrossCategories takes up to N per category, not N off the front', () => {
  const sample = sampleAcrossCategories(library, 3);
  const counts = new Map<string, number>();
  sample.forEach((proxy) => counts.set(proxy.category, (counts.get(proxy.category) || 0) + 1));

  assert.equal(counts.size, allCategories.length);
  [...counts.values()].forEach((count) => assert.ok(count <= 3, 'took more than the per-category cap'));
  assert.ok(sample.length > 4, 'sample is no broader than the old first-four behavior');
});

test('archive entries carry positive rates and a readable date label', () => {
  const entries = buildArchiveEntries(library, FIXED_NOW, 3);
  assert.ok(entries.length > 0);
  entries.forEach((entry) => {
    assert.ok(entry.rate >= 0.1, `non-positive rate for ${entry.proxyName}`);
    assert.ok(entry.dateLabel.length > 0);
    assert.ok(entry.note.includes(entry.proxyName));
  });
});

test('archive entry ids are unique so React keys do not collide', () => {
  const entries = buildArchiveEntries(library, FIXED_NOW);
  assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length);
});
