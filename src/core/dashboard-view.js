/**
 * Validate dashboard calculator input before conversion.
 * @param {{amount:number, unit:'CAMEL'|'PROXY', proxyId?:string}} input
 */
export function validateDashboardInput(input) {
  if (!Number.isFinite(input.amount)) {
    throw new Error('Input amount must be a finite number.');
  }

  if (input.unit !== 'CAMEL' && input.unit !== 'PROXY') {
    throw new Error('Input unit must be camel or proxy.');
  }

  if (input.unit === 'PROXY' && !input.proxyId) {
    throw new Error('Select a proxy before converting proxy units.');
  }
}

/**
 * Apply dashboard-level filtering and sorting to equivalents.
 * @param {{proxyName:string, quantity:number}[]} equivalents
 * @param {{query?:string, sort?:'quantity-desc'|'quantity-asc'|'name-asc'|'name-desc'}} options
 */
export function applyDashboardView(equivalents, options = {}) {
  const query = options.query?.trim().toLowerCase() ?? '';
  const sort = options.sort ?? 'quantity-desc';

  const filtered = query
    ? equivalents.filter((item) => item.proxyName.toLowerCase().includes(query))
    : [...equivalents];

  if (sort === 'quantity-asc') return filtered.sort((a, b) => a.quantity - b.quantity);
  if (sort === 'name-asc') return filtered.sort((a, b) => a.proxyName.localeCompare(b.proxyName));
  if (sort === 'name-desc') return filtered.sort((a, b) => b.proxyName.localeCompare(a.proxyName));

  return filtered.sort((a, b) => b.quantity - a.quantity);
}
