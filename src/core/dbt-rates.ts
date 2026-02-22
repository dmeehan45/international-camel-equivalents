import type { ProxyDefinition } from '../domain/types';

export function getVolatilityPercent(date = new Date()): number {
  return date.getDate() % 7;
}

export function getLiveRate(baseRatePerCamel: number, date = new Date()): number {
  const volatility = getVolatilityPercent(date);
  return round2(baseRatePerCamel * (1 + volatility / 100));
}

export function toCamelBenchmark(proxyQuantity: number, liveRatePerCamel: number): number {
  if (!Number.isFinite(proxyQuantity) || proxyQuantity <= 0) throw new Error('Proxy quantity must be positive.');
  if (!Number.isFinite(liveRatePerCamel) || liveRatePerCamel <= 0) throw new Error('Live rate must be positive.');
  return round2(proxyQuantity / liveRatePerCamel);
}

export function formatAdvisoryDate(date = new Date()): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function buildCuratedSuggestions(
  proxies: ProxyDefinition[],
  region: string,
  ageRange: string,
  occupation: string,
  anecdote: string,
): ProxyDefinition[] {
  if (proxies.length <= 6) return proxies;
  const seed = `${region}|${ageRange}|${occupation}|${anecdote}`.length || 11;
  const start = seed % proxies.length;
  const picks: ProxyDefinition[] = [];
  const seen = new Set<string>();

  for (let i = 0; picks.length < 6 && i < proxies.length * 2; i += 1) {
    const index = (start + i * 7) % proxies.length;
    const proxy = proxies[index];
    if (seen.has(proxy.id)) continue;
    seen.add(proxy.id);
    picks.push(proxy);
  }

  return picks.slice(0, 6);
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
