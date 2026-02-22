import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPremiumGateMessage,
  isPremiumEnabled,
  readPremiumState,
  writePremiumState,
} from '../src/core/premium-state.js';

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
  };
}

test('premium state defaults to unsubscribed', () => {
  const storage = createMemoryStorage();
  assert.deepEqual(readPremiumState(storage), { subscribed: false });
});

test('premium state persists subscribed flag', () => {
  const storage = createMemoryStorage();
  writePremiumState({ subscribed: true }, storage);
  const state = readPremiumState(storage);
  assert.equal(isPremiumEnabled(state), true);
});

test('premium gate message includes feature name', () => {
  const message = getPremiumGateMessage('Leaderboard submissions');
  assert.match(message, /Leaderboard submissions/);
});
