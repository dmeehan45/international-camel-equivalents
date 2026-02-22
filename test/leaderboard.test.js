import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLeaderboardEntry,
  defaultLeaderboardEntries,
  sortLeaderboardEntries,
  submitLeaderboardEntry,
} from '../src/core/leaderboard.js';

test('default leaderboard has seeded entries', () => {
  assert.equal(defaultLeaderboardEntries().length > 0, true);
});

test('createLeaderboardEntry validates input and computes score', () => {
  const entry = createLeaderboardEntry(
    { name: 'NewBidder', camelValue: 200 },
    new Date('2026-01-05T00:00:00.000Z'),
  );

  assert.equal(entry.name, 'NewBidder');
  assert.equal(entry.score, 600);
});

test('submitLeaderboardEntry sorts descending by score', () => {
  const entries = [
    { id: 'a', name: 'A', score: 300, camelValue: 100, createdAt: '2026-01-02T00:00:00.000Z' },
    { id: 'b', name: 'B', score: 500, camelValue: 200, createdAt: '2026-01-03T00:00:00.000Z' },
  ];
  const submission = { id: 'c', name: 'C', score: 450, camelValue: 150, createdAt: '2026-01-01T00:00:00.000Z' };

  const ranked = submitLeaderboardEntry(entries, submission);
  assert.deepEqual(ranked.map((entry) => entry.name), ['B', 'C', 'A']);
});

test('sortLeaderboardEntries uses createdAt as tie-breaker', () => {
  const ranked = sortLeaderboardEntries([
    { id: 'late', name: 'Late', score: 500, camelValue: 120, createdAt: '2026-01-03T00:00:00.000Z' },
    { id: 'early', name: 'Early', score: 500, camelValue: 120, createdAt: '2026-01-01T00:00:00.000Z' },
  ]);

  assert.deepEqual(ranked.map((entry) => entry.name), ['Early', 'Late']);
});
