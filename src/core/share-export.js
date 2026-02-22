export function buildShareText(input) {
  const camelValue = Number(input?.camelValue);
  const proxyQuantity = Number(input?.proxyQuantity);
  const proxyName = input?.proxyName?.trim();
  const message = input?.message?.trim() ?? '';

  if (!Number.isFinite(camelValue) || camelValue <= 0) {
    throw new Error('Camel value must be a positive number for sharing.');
  }

  if (!Number.isFinite(proxyQuantity) || proxyQuantity <= 0 || !proxyName) {
    throw new Error('Proxy equivalent is required for sharing.');
  }

  const summary = `Camel Courtship Calculator: ${camelValue} camels equals ${proxyQuantity} ${proxyName}.`;
  return message ? `${summary}\n\n${message}` : summary;
}

export function buildShareUrls(shareText) {
  const encoded = encodeURIComponent(shareText);

  return {
    mailto: `mailto:?subject=${encodeURIComponent('Camel Courtship Bid')}&body=${encoded}`,
    sms: `sms:?body=${encoded}`,
    twitter: `https://twitter.com/intent/tweet?text=${encoded}`,
    whatsapp: `https://wa.me/?text=${encoded}`,
  };
}
