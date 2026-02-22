const STORAGE_KEY = 'ice-share-intents-v1';
let memoryQueue = [];

function canUseLocalStorage() {
  return typeof globalThis !== 'undefined' && !!globalThis.localStorage;
}

export function readShareQueue() {
  if (!canUseLocalStorage()) {
    return [...memoryQueue];
  }

  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeShareQueue(queue) {
  const safeQueue = Array.isArray(queue) ? queue : [];

  if (!canUseLocalStorage()) {
    memoryQueue = [...safeQueue];
    return;
  }

  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeQueue));
}

export function enqueueShareIntent(intent) {
  const entry = {
    id: intent?.id ?? `share-${Date.now()}`,
    createdAt: intent?.createdAt ?? new Date().toISOString(),
    shareText: intent?.shareText ?? '',
    channel: intent?.channel ?? 'unknown',
    status: intent?.status ?? 'pending',
  };

  const next = [entry, ...readShareQueue()];
  writeShareQueue(next);
  return entry;
}
