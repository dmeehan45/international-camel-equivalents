import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDashboardView, validateDashboardInput } from '../src/core/dashboard-view.js';

test('validateDashboardInput requires proxy selection for PROXY unit', () => {
  assert.throws(
    () => validateDashboardInput({ amount: 1, unit: 'PROXY', proxyId: '' }),
    /Select a proxy/,
  );
});

test('validateDashboardInput rejects non-finite amount', () => {
  assert.throws(
    () => validateDashboardInput({ amount: Number.NaN, unit: 'USD' }),
    /finite number/,
  );
});

test('applyDashboardView filters by query and sorts by quantity asc', () => {
  const items = [
    { proxyName: 'Yaks', quantity: 5 },
    { proxyName: 'Young Zebras', quantity: 2 },
    { proxyName: 'Goldfish', quantity: 30 },
  ];

  const visible = applyDashboardView(items, { query: 'y', sort: 'quantity-asc' });
  assert.deepEqual(visible.map((item) => item.proxyName), ['Young Zebras', 'Yaks']);
});

test('applyDashboardView defaults to quantity descending', () => {
  const items = [
    { proxyName: 'A', quantity: 1 },
    { proxyName: 'B', quantity: 3 },
    { proxyName: 'C', quantity: 2 },
  ];

  const visible = applyDashboardView(items);
  assert.deepEqual(visible.map((item) => item.quantity), [3, 2, 1]);
});
