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


/**
 * Build full share payload from latest calculation state.
 * @param {{camelValue:number,equivalents:{proxyId:string,proxyName:string,quantity:number}[]}} result
 * @param {{proxyId?:string,message?:string}} [options]
 */
export function buildSharePayload(result, options = {}) {
  if (!result || !Number.isFinite(Number(result.camelValue)) || Number(result.camelValue) <= 0) {
    throw new Error('Run a valid conversion first to build share text.');
  }

  const equivalents = Array.isArray(result.equivalents) ? result.equivalents : [];
  if (equivalents.length === 0) {
    throw new Error('Proxy equivalent is required for sharing.');
  }

  const selectedProxy = equivalents.find((item) => item.proxyId === options.proxyId) ?? equivalents[0];
  const shareText = buildShareText({
    camelValue: result.camelValue,
    proxyName: selectedProxy.proxyName,
    proxyQuantity: selectedProxy.quantity,
    message: options.message,
  });

  return {
    shareText,
    urls: buildShareUrls(shareText),
    selectedProxy,
  };
}
