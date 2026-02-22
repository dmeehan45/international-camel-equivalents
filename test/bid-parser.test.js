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


test('parseBidInput rejects currency-like labels', () => {
  const usd = parseBidInput('100 usd');
  const dollar = parseBidInput('250 dollars');
  const euroSymbol = parseBidInput('€850');

  assert.equal(usd.kind, 'ambiguous');
  assert.match(usd.reason, /camels|proxy|parse/i);
  assert.equal(dollar.kind, 'ambiguous');
  assert.match(dollar.reason, /camels|proxy|parse/i);
  assert.equal(euroSymbol.kind, 'ambiguous');
  assert.match(euroSymbol.reason, /camels|proxy|parse/i);
});

test('parseBidInput accepts camel and proxy expressions with decimals', () => {
  const camel = parseBidInput('1.5 camels');
  const proxy = parseBidInput('2.25 mountain goats');

  assert.equal(camel.kind, 'camel');
  assert.equal(camel.amount, 1.5);
  assert.equal(proxy.kind, 'proxy');
  assert.equal(proxy.amount, 2.25);
  assert.equal(proxy.proxyName, 'mountain goats');
});
