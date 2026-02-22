export const CANONICAL_PROXY_CATEGORIES = [
  'Mammals and Land Creatures',
  'Aquatic and Marine Life',
  'Birds and Flying Creatures',
  'Reptiles, Insects, and Invertebrates',
  'Mythical and Absurd Concepts',
  'Other Bizarre Items and Collectives',
];

export const MIN_REFERENCE_PROXY_COUNT = 100;

/**
 * Filter proxies for reference-library style views.
 * @param {{id:string,name:string,category?:string,source?:string}[]} proxies
 * @param {{query?:string, category?:string, source?:'reference'|'extension'|'all'}} filters
 */
export function filterReferenceProxies(proxies, filters = {}) {
  const query = filters.query?.trim().toLowerCase() ?? '';
  const category = filters.category?.trim() ?? '';
  const source = filters.source ?? 'all';

  return proxies
    .filter((proxy) => {
      if (query && !proxy.name.toLowerCase().includes(query)) return false;
      if (category && proxy.category !== category) return false;
      if (source !== 'all' && proxy.source !== source) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Build a human-readable compare sentence.
 * @param {{amount:number, fromName:string, toName:string, quantity:number}} input
 */
export function buildCompareSummary(input) {
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new Error('Compare amount must be zero or greater.');
  }
  if (!Number.isFinite(input.quantity) || input.quantity < 0) {
    throw new Error('Compare result must be zero or greater.');
  }
  const fromName = input.fromName?.trim();
  const toName = input.toName?.trim();
  if (!fromName || !toName) {
    throw new Error('Compare proxy names are required.');
  }

  return `${input.amount} ${fromName} equals ${input.quantity} ${toName}.`;
}


/**
 * Validate baseline reference catalog quality.
 * @param {{category?:string}[]} proxies
 */
export function validateReferenceCatalog(proxies) {
  if (!Array.isArray(proxies) || proxies.length < MIN_REFERENCE_PROXY_COUNT) {
    throw new Error(`Reference catalog must include at least ${MIN_REFERENCE_PROXY_COUNT} proxies.`);
  }

  for (const proxy of proxies) {
    if (!CANONICAL_PROXY_CATEGORIES.includes(proxy.category)) {
      throw new Error('Reference catalog contains a non-canonical category.');
    }
  }
}
