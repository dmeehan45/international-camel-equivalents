function suggestionTier(camelValue) {
  if (camelValue >= 500) return 'high';
  if (camelValue >= 100) return 'mid';
  return 'low';
}

export function buildNegotiationSuggestions(input) {
  const camelValue = Number(input?.camelValue);
  const topProxy = input?.topProxy;

  if (!Number.isFinite(camelValue) || camelValue <= 0) {
    throw new Error('Camel value must be a positive number for negotiation suggestions.');
  }

  const proxyName = topProxy?.proxyName ?? 'your top proxy';
  const proxyQuantity = Number.isFinite(topProxy?.quantity) ? topProxy.quantity : 0;
  const tier = suggestionTier(camelValue);

  if (tier === 'high') {
    return [
      `Anchor confidently at ${camelValue} camels and trade concessions in small increments.`,
      `Lead with scarcity: equivalent to ${proxyQuantity} ${proxyName}.`,
      'Offer bundled terms only after your counterpart states their ceiling.',
    ];
  }

  if (tier === 'mid') {
    return [
      `Open at ${camelValue} camels, then offer a 5% courtesy adjustment if needed.`,
      `Frame value through ${proxyName} parity (${proxyQuantity} units).`,
      'Ask for one non-price concession before reducing your ask.',
    ];
  }

  return [
    `Start friendly: ${camelValue} camels is fair and transparent.`,
    `Use ${proxyName} (${proxyQuantity} units) as a simple comparison point.`,
    'Close quickly by confirming delivery, timing, and payment terms.',
  ];
}
