import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBidInput } from '../src/core/bid-parser.js';

test('parseBidInput detects camel quantity', () => {
  const parsed = parseBidInput('2 camels');
  assert.equal(parsed.kind, 'camel');
  assert.equal(parsed.amount, 2);
});

test('parseBidInput detects proxy quantity', () => {
  const parsed = parseBidInput('5 yaks');
  assert.equal(parsed.kind, 'proxy');
  assert.equal(parsed.amount, 5);
  assert.equal(parsed.proxyName, 'yaks');
});

test('parseBidInput returns ambiguity reason for bare number', () => {
  const parsed = parseBidInput('1000');
  assert.equal(parsed.kind, 'ambiguous');
  assert.match(parsed.reason, /add a unit/i);
});
