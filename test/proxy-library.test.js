import test from 'node:test';
import assert from 'node:assert/strict';
import { createProxyDefinition, mergeWithExtensions, readStoredExtensions, writeStoredExtensions } from '../src/core/proxy-library.js';

test('createProxyDefinition creates extension metadata and unique id', () => {
  const existing = [{ id: 'ext-quantum-camels' }];
  const created = createProxyDefinition(
    {
      name: 'Quantum Camels',
      ratePerCamel: 3.5,
      category: 'Mythical and Absurd Concepts',
      description: 'Teleporting humps',
    },
    existing,
  );

  assert.equal(created.id, 'ext-quantum-camels-2');
  assert.equal(created.source, 'extension');
  assert.equal(created.isExtension, true);
});

test('mergeWithExtensions keeps base proxies and adds non-conflicting extensions', () => {
  const base = [{ id: 'yak', name: 'Yaks', ratePerCamel: 1.25 }];
  const merged = mergeWithExtensions(base, [
    { id: 'yak', name: 'Duplicate yak', ratePerCamel: 999 },
    { id: 'ext-zebra-ninjas', name: 'Zebra ninjas', ratePerCamel: 2.2 },
  ]);

  assert.equal(merged.length, 2);
  assert.equal(merged[0].name, 'Yaks');
  assert.equal(merged[1].source, 'extension');
});

test('read/write extension storage round-trips JSON payload', () => {
  const memoryStorage = {
    data: new Map(),
    getItem(key) {
      return this.data.has(key) ? this.data.get(key) : null;
    },
    setItem(key, value) {
      this.data.set(key, value);
    },
  };

  const payload = [{ id: 'ext-portal-potatoes', name: 'Portal potatoes', ratePerCamel: 5.43 }];
  writeStoredExtensions(payload, memoryStorage);
  const loaded = readStoredExtensions(memoryStorage);

  assert.deepEqual(loaded, payload);
});
