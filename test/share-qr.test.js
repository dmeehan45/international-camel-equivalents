import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQrPayload } from '../src/core/share-qr.js';

test('buildQrPayload builds text payload', () => {
  const payload = buildQrPayload({ mode: 'text', shareText: 'Camel share text' });

  assert.equal(payload.mode, 'text');
  assert.equal(payload.value, 'Camel share text');
});

test('buildQrPayload builds link payload', () => {
  const payload = buildQrPayload({ mode: 'link', shareLink: 'https://example.com/share' });

  assert.equal(payload.mode, 'link');
  assert.equal(payload.value, 'https://example.com/share');
});

test('buildQrPayload validates required fields', () => {
  assert.throws(() => buildQrPayload({ mode: 'text', shareText: '   ' }), /Share text is required/);
  assert.throws(() => buildQrPayload({ mode: 'link', shareLink: '' }), /Share link is required/);
});
