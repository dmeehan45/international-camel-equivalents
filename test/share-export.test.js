import test from 'node:test';
import assert from 'node:assert/strict';
import { buildShareText, buildShareUrls } from '../src/core/share-export.js';

test('buildShareText creates summary with optional message', () => {
  const text = buildShareText({
    camelValue: 3,
    proxyName: 'Yaks',
    proxyQuantity: 3.75,
    message: 'Let the caravan celebrate.',
  });

  assert.match(text, /3 camels equals 3.75 Yaks/);
  assert.match(text, /Let the caravan celebrate/);
});

test('buildShareText validates required values', () => {
  assert.throws(
    () => buildShareText({ camelValue: 0, proxyName: 'Yaks', proxyQuantity: 1 }),
    /positive number for sharing/,
  );

  assert.throws(
    () => buildShareText({ camelValue: 2, proxyName: '', proxyQuantity: 1 }),
    /Proxy equivalent is required/,
  );
});

test('buildShareUrls returns app link formats', () => {
  const urls = buildShareUrls('Camel bid text');

  assert.match(urls.mailto, /^mailto:/);
  assert.match(urls.sms, /^sms:/);
  assert.match(urls.twitter, /^https:\/\/twitter\.com/);
  assert.match(urls.whatsapp, /^https:\/\/wa\.me/);
});
