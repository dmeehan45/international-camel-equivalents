function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function parseBidInput(rawInput) {
  const raw = rawInput.trim();
  if (!raw) return { kind: 'ambiguous', raw, reason: 'Enter a bid value first.' };

  const camelMatch = raw.match(/^\s*([\d,.]+)\s*(camel|camels)\s*$/i);
  if (camelMatch) {
    const amount = Number(camelMatch[1].replace(/,/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) {
      return { kind: 'ambiguous', raw, reason: 'Camel quantity must be a positive number.' };
    }
    return { kind: 'camel', amount: round2(amount), raw };
  }

  const proxyMatch = raw.match(/^\s*([\d,.]+)\s+(.+?)\s*$/i);
  if (proxyMatch) {
    const amount = Number(proxyMatch[1].replace(/,/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) {
      return { kind: 'ambiguous', raw, reason: 'Proxy quantity must be a positive number.' };
    }
    const proxyName = proxyMatch[2].trim();
    if (proxyName.length < 2) {
      return { kind: 'ambiguous', raw, reason: 'Proxy name is too short to map.' };
    }

    const currencyLikeProxy = /^(usd|eur|gbp|aed|sar|dollars?|bucks?|euros?|pounds?)$/i;
    if (currencyLikeProxy.test(proxyName)) {
      return { kind: 'ambiguous', raw, reason: 'Use camel or proxy quantities only (example: "2 camels" or "5 yaks").' };
    }

    return { kind: 'proxy', amount: round2(amount), proxyName, raw };
  }

  if (/^[\d,.]+$/.test(raw)) {
    return { kind: 'ambiguous', raw, reason: 'Add a unit like "camels" or a proxy name (example: "5 yaks").' };
  }

  return { kind: 'ambiguous', raw, reason: "By order of the Camel Court, that filing is indecipherable. Try '2 camels' or '5 yaks'." };
}
