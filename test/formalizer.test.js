import test from 'node:test';
import assert from 'node:assert/strict';
import { generateFormalizedMessage, listTemplates } from '../src/core/formalizer.js';

test('listTemplates exposes expected template names', () => {
  const templates = listTemplates();
  assert.deepEqual(templates, ['formal', 'poetic', 'emoji', 'rap']);
});

test('generateFormalizedMessage creates message for formal template', () => {
  const message = generateFormalizedMessage({
    template: 'formal',
    camelValue: 3,
    proxyName: 'Yaks',
    proxyQuantity: 3.75,
  });

  assert.match(message, /3 camels/);
  assert.match(message, /3.75 Yaks/);
});

test('generateFormalizedMessage validates template and input values', () => {
  assert.throws(
    () => generateFormalizedMessage({ template: 'missing', camelValue: 2, proxyName: 'Yaks', proxyQuantity: 1 }),
    /Unknown message template selected/,
  );

  assert.throws(
    () => generateFormalizedMessage({ template: 'formal', camelValue: 0, proxyName: 'Yaks', proxyQuantity: 1 }),
    /Camel value must be a positive number/,
  );
});
