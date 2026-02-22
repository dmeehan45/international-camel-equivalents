const PREMIUM_KEY = 'ccc-premium-state-v1';

export function readPremiumState(storage = globalThis?.localStorage) {
  if (!storage) return { subscribed: false };

  try {
    const raw = storage.getItem(PREMIUM_KEY);
    if (!raw) return { subscribed: false };
    const parsed = JSON.parse(raw);
    return { subscribed: Boolean(parsed?.subscribed) };
  } catch {
    return { subscribed: false };
  }
}

export function writePremiumState(state, storage = globalThis?.localStorage) {
  if (!storage) return;
  storage.setItem(PREMIUM_KEY, JSON.stringify({ subscribed: Boolean(state?.subscribed) }));
}

export function isPremiumEnabled(state) {
  return Boolean(state?.subscribed);
}

export function getPremiumGateMessage(featureName = 'This feature') {
  return `${featureName} is available for Premium subscribers. Enable Premium to unlock it.`;
}

export { PREMIUM_KEY };
