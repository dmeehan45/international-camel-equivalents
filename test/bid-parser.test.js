import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBidInput } from '../src/core/bid-parser.js';

test('parseBidInput detects USD currency', () => {
  const parsed = parseBidInput('$1000');
  assert.equal(parsed.kind, 'currency');
  assert.equal(parsed.currency, 'USD');
  assert.equal(parsed.normalizedAmount, 1000);
});

test('parseBidInput detects EUR and normalizes to USD', () => {
  const parsed = parseBidInput('€850');
  assert.equal(parsed.kind, 'currency');
  assert.equal(parsed.currency, 'EUR');
  assert.equal(parsed.normalizedAmount, 918);
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
  assert.match(parsed.reason, /currency or a proxy/i);
});
