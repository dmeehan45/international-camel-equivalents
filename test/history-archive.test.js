import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createHistoryEntry,
  formatRelativeAge,
  readBidHistory,
  writeBidHistory,
} from '../src/core/history-archive.js';

test('createHistoryEntry builds normalized archive entry', () => {
  const entry = createHistoryEntry({
    amount: 1000,
    unit: 'USD',
    camelValue: 2,
    summary: '2 camels • top proxy Yaks (2.5)',
  });

  assert.equal(entry.camelValue, 2);
  assert.equal(entry.unit, 'USD');
  assert.match(entry.id, /^bid-/);
});

test('createHistoryEntry validates required values', () => {
  assert.throws(
    () => createHistoryEntry({ amount: 1000, unit: 'USD', camelValue: 0, summary: 'bad' }),
    /positive number to archive/,
  );
});

test('history storage read/write round-trip', () => {
  const memoryStorage = {
    data: new Map(),
    getItem(key) {
      return this.data.has(key) ? this.data.get(key) : null;
    },
    setItem(key, value) {
      this.data.set(key, value);
    },
  };

  const items = [{ id: 'bid-1', createdAt: new Date().toISOString(), summary: 'sample' }];
  writeBidHistory(items, memoryStorage);
  assert.deepEqual(readBidHistory(memoryStorage), items);
});

test('formatRelativeAge returns human-readable labels', () => {
  const now = Date.UTC(2026, 1, 22, 0, 0, 0);
  const fiveMinutesAgo = new Date(now - 5 * 60 * 1000).toISOString();
  assert.equal(formatRelativeAge(fiveMinutesAgo, now), '5 minutes ago');
});
