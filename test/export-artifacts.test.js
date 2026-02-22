import test from 'node:test';
import assert from 'node:assert/strict';
import { buildImageExportDataUrl, buildPdfExportBlob, validateExportInput } from '../src/core/export-artifacts.js';

test('validateExportInput normalizes valid payload', () => {
  const normalized = validateExportInput({
    camelValue: '3',
    proxyName: 'Yaks',
    proxyQuantity: '5',
    message: '  Caravan approved.  ',
  });

  assert.equal(normalized.camelValue, 3);
  assert.equal(normalized.proxyQuantity, 5);
  assert.equal(normalized.proxyName, 'Yaks');
  assert.equal(normalized.message, 'Caravan approved.');
});

test('validateExportInput rejects invalid payload', () => {
  assert.throws(() => validateExportInput({ camelValue: 0, proxyName: 'Yaks', proxyQuantity: 1 }), /positive number for export/);
  assert.throws(() => validateExportInput({ camelValue: 1, proxyName: '', proxyQuantity: 1 }), /Proxy equivalent is required for export/);
});

test('buildImageExportDataUrl returns SVG data URL', () => {
  const dataUrl = buildImageExportDataUrl({
    camelValue: 2,
    proxyName: 'Goldfish',
    proxyQuantity: 120,
    message: 'Long live the caravan.',
  });

  assert.match(dataUrl, /^data:image\/svg\+xml/);
  assert.match(decodeURIComponent(dataUrl), /Goldfish/);
});

test('buildPdfExportBlob returns PDF blob', async () => {
  const blob = buildPdfExportBlob({
    camelValue: 2,
    proxyName: 'Goldfish',
    proxyQuantity: 120,
  });

  assert.equal(blob.type, 'application/pdf');
  const content = await blob.text();
  assert.match(content, /%PDF-1\.4/);
});
