const templateMap = {
  formal: ({ camelValue, proxyName, proxyQuantity }) =>
    `Honored families, this bid stands at ${camelValue} camels, equivalent to ${proxyQuantity} ${proxyName}. May this agreement be prosperous.`,
  poetic: ({ camelValue, proxyName, proxyQuantity }) =>
    `Across the dunes of destiny, ${camelValue} camels rise; in moonlit measure, ${proxyQuantity} ${proxyName} sing of union.`,
  emoji: ({ camelValue, proxyName, proxyQuantity }) =>
    `🐪 ${camelValue} camels = ${proxyQuantity} ${proxyName} 🎉💍 Let the caravan celebrate!`,
  rap: ({ camelValue, proxyName, proxyQuantity }) =>
    `Yo, we counted ${camelValue} camels on the beat, flipped to ${proxyQuantity} ${proxyName}, now the bid is complete.`,
};

export function listTemplates() {
  return Object.keys(templateMap);
}

export function generateFormalizedMessage(input) {
  const template = input?.template ?? 'formal';
  const format = templateMap[template];
  if (!format) throw new Error('Unknown message template selected.');

  const camelValue = Number(input.camelValue);
  const proxyQuantity = Number(input.proxyQuantity);
  const proxyName = input.proxyName?.trim();

  if (!Number.isFinite(camelValue) || camelValue <= 0) {
    throw new Error('Camel value must be a positive number.');
  }

  if (!Number.isFinite(proxyQuantity) || proxyQuantity <= 0) {
    throw new Error('Proxy equivalent must be a positive number.');
  }

  if (!proxyName) {
    throw new Error('Proxy name is required for message formalization.');
  }

  return format({ camelValue, proxyName, proxyQuantity });
}

export function generateEditableInstrument(input) {
  const message = generateFormalizedMessage(input);
  return `${message}\n\n[Insert family witness details]\n[Insert filing date]\n[Insert officiant signature]`;
}
