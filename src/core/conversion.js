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

/**
 * Calculate ICE using deterministic modifier order:
 * 1) base camel value
 * 2) camel multiplier
 * 3) proxy rate overrides
 * 4) equivalent projection
 * @param {{amount:number, unit:'USD'|'CAMEL'|'PROXY', camelUsdRate:number, proxyId?:string}} input
 * @param {ProxyDefinition[]} proxies
 * @param {{camelMultiplier?:number, proxyRateOverrides?:Record<string, number>}} [modifiers]
 */
export function calculateIceWithModifiers(input, proxies, modifiers = {}) {
  const baseCamelValue = toCamelValue(input, proxies);
  const camelMultiplier = modifiers.camelMultiplier ?? 1;
  if (camelMultiplier <= 0) throw new Error('Camel multiplier must be greater than zero.');

  const adjustedCamelValue = round2(baseCamelValue * camelMultiplier);
  const proxyRateOverrides = modifiers.proxyRateOverrides ?? {};

  const adjustedProxies = proxies.map((proxy) => {
    const overrideRate = proxyRateOverrides[proxy.id];
    if (overrideRate === undefined) return proxy;
    if (overrideRate <= 0) throw new Error('Proxy override rate must be greater than zero.');

    return { ...proxy, ratePerCamel: overrideRate };
  });

  return {
    camelValue: adjustedCamelValue,
    equivalents: toEquivalents(adjustedCamelValue, adjustedProxies),
  };
}


/**
 * Compare proxy units by converting through camel value.
 * @param {{fromProxyId:string,toProxyId:string,amount:number}} input
 * @param {ProxyDefinition[]} proxies
 * @returns {number}
 */
export function compareProxyUnits(input, proxies) {
  if (!Number.isFinite(input.amount)) throw new Error('Input amount must be a finite number.');
  if (input.amount < 0) throw new Error("That's worth negative camels—time to up your game!");

  const fromProxy = proxies.find((item) => item.id === input.fromProxyId);
  const toProxy = proxies.find((item) => item.id === input.toProxyId);

  if (!fromProxy || !toProxy) throw new Error('Unknown proxy selected.');
  if (fromProxy.ratePerCamel <= 0 || toProxy.ratePerCamel <= 0) {
    throw new Error('Proxy rate must be greater than zero.');
  }

  const camelValue = input.amount / fromProxy.ratePerCamel;
  return round2(camelValue * toProxy.ratePerCamel);
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
