const SETTINGS_KEY = 'ccc-customizer-settings-v1';

export const locationPresets = {
  default: { label: 'Default Oasis', camelMultiplier: 1 },
  gulf: { label: 'Gulf Grand Bazaar', camelMultiplier: 1.2 },
  mountain: { label: 'Mountain Caravan Route', camelMultiplier: 0.9 },
  coastal: { label: 'Coastal Trade Port', camelMultiplier: 1.05 },
  metropolis: { label: 'Metropolis Ceremony District', camelMultiplier: 1.35 },
};

export function resolveCamelMultiplier(settings) {
  const locationKey = settings?.locationKey ?? 'default';
  const locationMultiplier = locationPresets[locationKey]?.camelMultiplier ?? 1;
  const manualMultiplier = Number(settings?.manualMultiplier ?? 1);

  if (!Number.isFinite(manualMultiplier) || manualMultiplier <= 0) {
    throw new Error('Camel multiplier must be greater than zero.');
  }

  return Math.round((locationMultiplier * manualMultiplier + Number.EPSILON) * 100) / 100;
}

export function readCustomizerSettings(storage = globalThis?.localStorage) {
  if (!storage) return { locationKey: 'default', manualMultiplier: 1, language: 'en' };

  try {
    const raw = storage.getItem(SETTINGS_KEY);
    if (!raw) return { locationKey: 'default', manualMultiplier: 1, language: 'en' };

    const parsed = JSON.parse(raw);
    return {
      locationKey: typeof parsed.locationKey === 'string' ? parsed.locationKey : 'default',
      manualMultiplier: Number(parsed.manualMultiplier ?? 1),
      language: typeof parsed.language === 'string' ? parsed.language : 'en',
    };
  } catch {
    return { locationKey: 'default', manualMultiplier: 1, language: 'en' };
  }
}

export function writeCustomizerSettings(settings, storage = globalThis?.localStorage) {
  if (!storage) return;
  storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export { SETTINGS_KEY };
