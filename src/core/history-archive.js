const HISTORY_KEY = 'ccc-bid-history-v1';
const DOCKET_READ_KEY = 'ccc-docket-read-v1';
const MAX_ITEMS = 50;

export function readBidHistory(storage = globalThis?.localStorage) {
  if (!storage) return [];

  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeBidHistory(entries, storage = globalThis?.localStorage) {
  if (!storage) return;
  storage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_ITEMS)));
}

export function createHistoryEntry(input) {
  const camelValue = Number(input.camelValue);
  const amount = Number(input.amount);
  const unit = input.unit;
  const summary = input.summary?.trim();

  if (!Number.isFinite(camelValue) || camelValue <= 0) {
    throw new Error('Camel value must be a positive number to archive.');
  }

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Input amount must be zero or greater to archive.');
  }

  if (!summary) throw new Error('History summary is required.');

  return {
    id: `bid-${Date.now()}`,
    createdAt: new Date().toISOString(),
    amount,
    unit,
    camelValue,
    summary,
  };
}

export function formatRelativeAge(isoTimestamp, now = Date.now()) {
  const then = new Date(isoTimestamp).getTime();
  if (!Number.isFinite(then)) return 'unknown age';

  const minutes = Math.max(0, Math.floor((now - then) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

export function readDocketReadIds(storage = globalThis?.localStorage) {
  if (!storage) return [];

  try {
    const raw = storage.getItem(DOCKET_READ_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function writeDocketReadIds(ids, storage = globalThis?.localStorage) {
  if (!storage) return;
  storage.setItem(DOCKET_READ_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
}

export function buildDocketEntries(historyEntries, readIds = [], now = Date.now()) {
  const readSet = new Set(readIds);
  return historyEntries.map((entry, index) => {
    const ageMinutes = Math.max(0, Math.floor((now - new Date(entry.createdAt).getTime()) / 60000));
    const status = ageMinutes < 5 ? 'Filed' : ageMinutes < 30 ? 'Under Review' : 'Closed';
    const timerText = ageMinutes < 1 ? 'Timer: 00:59 remaining' : `Timer: 00:${String(Math.max(0, 59 - (ageMinutes % 60))).padStart(2, '0')} remaining`;
    return {
      ...entry,
      docketNumber: `DCK-${new Date(entry.createdAt).getFullYear()}-${String(index + 1).padStart(3, '0')}`,
      status,
      timerText,
      ageText: formatRelativeAge(entry.createdAt, now),
      unread: !readSet.has(entry.id),
    };
  });
}
