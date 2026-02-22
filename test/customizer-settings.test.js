import test from 'node:test';
import assert from 'node:assert/strict';
import {
  locationPresets,
  readCustomizerSettings,
  resolveCamelMultiplier,
  writeCustomizerSettings,
} from '../src/core/customizer-settings.js';

test('resolveCamelMultiplier combines location and manual multiplier', () => {
  const value = resolveCamelMultiplier({ locationKey: 'gulf', manualMultiplier: 1.1 });
  assert.equal(value, 1.32);
});

test('resolveCamelMultiplier rejects invalid manual multiplier', () => {
  assert.throws(() => resolveCamelMultiplier({ locationKey: 'default', manualMultiplier: 0 }), /greater than zero/);
});

test('read/write customizer settings round-trip', () => {
  const memoryStorage = {
    data: new Map(),
    getItem(key) {
      return this.data.has(key) ? this.data.get(key) : null;
    },
    setItem(key, value) {
      this.data.set(key, value);
    },
  };

  const settings = { locationKey: 'coastal', manualMultiplier: 1.2, language: 'fr' };
  writeCustomizerSettings(settings, memoryStorage);
  assert.deepEqual(readCustomizerSettings(memoryStorage), settings);
});

test('location presets include default baseline', () => {
  assert.equal(locationPresets.default.camelMultiplier, 1);
});
