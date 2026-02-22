import test from 'node:test';
import assert from 'node:assert/strict';
import { enqueueShareIntent, readShareQueue, writeShareQueue } from '../src/core/share-queue.js';

function createMemoryStorage() {
  return {
    data: new Map(),
    getItem(key) {
      return this.data.has(key) ? this.data.get(key) : null;
    },
    setItem(key, value) {
      this.data.set(key, value);
    },
  };
}

test('queue persistence/load writes to and reads from localStorage in insertion order', () => {
  const originalStorage = globalThis.localStorage;
  const storage = createMemoryStorage();
  globalThis.localStorage = storage;

  try {
    writeShareQueue([]);
    const first = enqueueShareIntent({ id: 'a', channel: 'copy', shareText: 'A', createdAt: '2026-01-01T00:00:00.000Z' });
    const second = enqueueShareIntent({ id: 'b', channel: 'download', shareText: 'B', createdAt: '2026-01-01T00:01:00.000Z' });
    const queue = readShareQueue();

    assert.equal(queue.length, 2);
    assert.equal(queue[0].id, second.id);
    assert.equal(queue[1].id, first.id);
  } finally {
    if (originalStorage === undefined) {
      // @ts-ignore cleanup for node tests
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = originalStorage;
    }
  }
});

test('queue load gracefully handles malformed persisted payloads', () => {
  const originalStorage = globalThis.localStorage;
  const storage = createMemoryStorage();
  globalThis.localStorage = storage;

  try {
    storage.setItem('ice-share-intents-v1', '{bad-json');
    assert.deepEqual(readShareQueue(), []);

    storage.setItem('ice-share-intents-v1', JSON.stringify({ not: 'an-array' }));
    assert.deepEqual(readShareQueue(), []);
  } finally {
    if (originalStorage === undefined) {
      // @ts-ignore cleanup for node tests
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = originalStorage;
    }
  }
});
