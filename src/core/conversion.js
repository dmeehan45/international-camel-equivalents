/**
 * @typedef {{id:string,name:string,ratePerCamel:number}} ProxyDefinition
 */

/**
 * Convert an input amount into camel value.
 * @param {{amount:number, unit:'USD'|'CAMEL'|'PROXY', camelUsdRate:number, proxyId?:string}} input
 * @param {ProxyDefinition[]} proxies
 * @returns {number}
 */
export function toCamelValue(input, proxies) {
  if (!Number.isFinite(input.amount)) throw new Error('Input amount must be a finite number.');
  if (input.amount < 0) throw new Error("That's worth negative camels—time to up your game!");
  if (input.camelUsdRate <= 0) throw new Error('Camel USD rate must be greater than zero.');

  if (input.unit === 'CAMEL') return round2(input.amount);
  if (input.unit === 'USD') return round2(input.amount / input.camelUsdRate);

  const proxy = proxies.find((item) => item.id === input.proxyId);
  if (!proxy) throw new Error('Unknown proxy selected.');
  if (proxy.ratePerCamel <= 0) throw new Error('Proxy rate must be greater than zero.');

  return round2(input.amount / proxy.ratePerCamel);
}

/**
 * Return equivalent quantities for all proxies.
 * @param {number} camelValue
 * @param {ProxyDefinition[]} proxies
 */
export function toEquivalents(camelValue, proxies) {
  return proxies.map((proxy) => ({
    proxyId: proxy.id,
    proxyName: proxy.name,
    quantity: round2(camelValue * proxy.ratePerCamel),
  }));
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
