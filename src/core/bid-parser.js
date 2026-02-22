function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function parseBidInput(rawInput) {
  const raw = rawInput.trim();
  if (!raw) return { kind: 'ambiguous', raw, reason: 'Enter a bid value first.' };

  const usdMatch = raw.match(/^\s*(?:USD\s*)?\$\s*([\d,.]+)\s*$/i) ?? raw.match(/^\s*([\d,.]+)\s*(USD)\s*$/i);
  if (usdMatch) {
    const amount = Number(usdMatch[1].replace(/,/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) {
      return { kind: 'ambiguous', raw, reason: 'Currency amount must be a positive number.' };
    }
    return { kind: 'currency', amount: round2(amount), currency: 'USD', normalizedAmount: round2(amount), raw };
  }

  const eurMatch = raw.match(/^\s*(?:EUR\s*)?€\s*([\d,.]+)\s*$/i) ?? raw.match(/^\s*([\d,.]+)\s*(EUR)\s*$/i);
  if (eurMatch) {
    const amount = Number(eurMatch[1].replace(/,/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) {
      return { kind: 'ambiguous', raw, reason: 'Currency amount must be a positive number.' };
    }
    const normalizedAmount = round2(amount * 1.08);
    return { kind: 'currency', amount: round2(amount), currency: 'EUR', normalizedAmount, raw };
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
    return { kind: 'proxy', amount: round2(amount), proxyName, raw };
  }

  if (/^[\d,.]+$/.test(raw)) {
    return { kind: 'ambiguous', raw, reason: 'Is this currency or a proxy quantity?' };
  }

  return { kind: 'ambiguous', raw, reason: "I couldn't parse that. Try '$1000' or '5 yaks'." };
}
