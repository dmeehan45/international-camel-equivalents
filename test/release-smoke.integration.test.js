import test from 'node:test';
import assert from 'node:assert/strict';
import proxies from '../src/data/proxies.json' with { type: 'json' };
import { calculateIceWithModifiers } from '../src/core/conversion.js';
import { generateFormalizedMessage } from '../src/core/formalizer.js';
import { buildSharePayload } from '../src/core/share-export.js';
import { createHistoryEntry, readBidHistory, writeBidHistory } from '../src/core/history-archive.js';

test('release smoke flow: calculate → formalize → share → archive', () => {
  const yaks = proxies.find((proxy) => proxy.name === 'Yaks');
  assert.ok(yaks);

  const calculation = calculateIceWithModifiers(
    { amount: 2, unit: 'CAMEL' },
    proxies,
    { camelMultiplier: 1.2 },
  );

  assert.equal(calculation.camelValue, 2.4);
  const topEquivalent = calculation.equivalents[0];
  assert.ok(topEquivalent);

  const proxyCalculation = calculateIceWithModifiers(
    { amount: 5, unit: 'PROXY', proxyId: yaks.id },
    proxies,
  );
  assert.equal(proxyCalculation.camelValue, 4);

  const message = generateFormalizedMessage({
    template: 'formal',
    camelValue: calculation.camelValue,
    proxyName: topEquivalent.proxyName,
    proxyQuantity: topEquivalent.quantity,
  });
  assert.match(message, /2.4 camels/);

  const sharePayload = buildSharePayload(calculation, {
    proxyId: topEquivalent.proxyId,
    message,
  });
  assert.match(sharePayload.shareText, /Camel Courtship Calculator/);
  assert.match(sharePayload.shareText, /Honored families/);
  assert.equal(sharePayload.selectedProxy.proxyId, topEquivalent.proxyId);

  const memoryStorage = {
    data: new Map(),
    getItem(key) {
      return this.data.has(key) ? this.data.get(key) : null;
    },
    setItem(key, value) {
      this.data.set(key, value);
    },
  };

  const entry = createHistoryEntry({
    amount: 2,
    unit: 'CAMEL',
    camelValue: calculation.camelValue,
    summary: sharePayload.shareText,
  });
  writeBidHistory([entry], memoryStorage);

  const history = readBidHistory(memoryStorage);
  assert.equal(history.length, 1);
  assert.equal(history[0].camelValue, 2.4);
  assert.match(history[0].summary, /Camel Courtship Calculator/);
});
