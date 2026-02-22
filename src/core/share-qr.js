export function buildQrPayload(input) {
  const mode = input?.mode === 'link' ? 'link' : 'text';
  const shareText = input?.shareText?.trim() ?? '';
  const shareLink = input?.shareLink?.trim() ?? '';

  if (mode === 'text') {
    if (!shareText) {
      throw new Error('Share text is required to generate a QR payload.');
    }

    return {
      mode,
      value: shareText,
      preview: `QR text payload (${shareText.length} chars)`,
    };
  }

  if (!shareLink) {
    throw new Error('Share link is required to generate a QR payload.');
  }

  return {
    mode,
    value: shareLink,
    preview: `QR link payload: ${shareLink}`,
  };
}
