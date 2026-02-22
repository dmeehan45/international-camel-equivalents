const LEADERBOARD_KEY = 'ccc-leaderboard-v1';
const MAX_ENTRIES = 100;

export function defaultLeaderboardEntries() {
  return [
    { id: 'seed-1', name: 'DesertFox', score: 980, camelValue: 420, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'seed-2', name: 'OasisOracle', score: 870, camelValue: 315, createdAt: '2026-01-02T00:00:00.000Z' },
    { id: 'seed-3', name: 'DuneDiplomat', score: 760, camelValue: 220, createdAt: '2026-01-03T00:00:00.000Z' },
  ];
}

export function sortLeaderboardEntries(entries) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export function readLeaderboard(storage = globalThis?.localStorage) {
  if (!storage) return defaultLeaderboardEntries();

  try {
    const raw = storage.getItem(LEADERBOARD_KEY);
    if (!raw) return defaultLeaderboardEntries();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortLeaderboardEntries(parsed) : defaultLeaderboardEntries();
  } catch {
    return defaultLeaderboardEntries();
  }
}

export function writeLeaderboard(entries, storage = globalThis?.localStorage) {
  if (!storage) return;
  const sorted = sortLeaderboardEntries(entries).slice(0, MAX_ENTRIES);
  storage.setItem(LEADERBOARD_KEY, JSON.stringify(sorted));
}

export function createLeaderboardEntry(input, now = new Date()) {
  const name = input?.name?.trim();
  if (!name) throw new Error('Display name is required.');

  const camelValue = Number(input?.camelValue);
  if (!Number.isFinite(camelValue) || camelValue <= 0) {
    throw new Error('Camel value must be a positive number.');
  }

  const score = Math.round(camelValue * 2 + Math.min(camelValue, 500));

  return {
    id: `rank-${now.getTime()}`,
    name,
    score,
    camelValue,
    createdAt: now.toISOString(),
  };
}

export function submitLeaderboardEntry(entries, entry) {
  return sortLeaderboardEntries([entry, ...entries]).slice(0, MAX_ENTRIES);
}

export { LEADERBOARD_KEY };
