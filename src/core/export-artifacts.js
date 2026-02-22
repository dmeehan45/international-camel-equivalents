function sanitizeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapePdfText(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

export function validateExportInput(input) {
  const camelValue = Number(input?.camelValue);
  const proxyQuantity = Number(input?.proxyQuantity);
  const proxyName = input?.proxyName?.trim();
  const message = input?.message?.trim();

  if (!Number.isFinite(camelValue) || camelValue <= 0) {
    throw new Error('Camel value must be a positive number for export.');
  }

  if (!Number.isFinite(proxyQuantity) || proxyQuantity <= 0 || !proxyName) {
    throw new Error('Proxy equivalent is required for export.');
  }

  return {
    camelValue,
    proxyQuantity,
    proxyName,
    message: message ?? '',
  };
}

export function buildImageExportDataUrl(input) {
  const normalized = validateExportInput(input);
  const lines = [
    'Camel Courtship Calculator',
    `${normalized.camelValue} camels equals ${normalized.proxyQuantity} ${normalized.proxyName}.`,
  ];

  if (normalized.message) {
    lines.push(normalized.message);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="100%" height="100%" fill="#0f172a"/><text x="60" y="140" fill="#f8fafc" font-size="48" font-family="Arial, sans-serif">${sanitizeText(lines[0])}</text><text x="60" y="240" fill="#e2e8f0" font-size="38" font-family="Arial, sans-serif">${sanitizeText(lines[1])}</text><text x="60" y="330" fill="#cbd5e1" font-size="30" font-family="Arial, sans-serif">${sanitizeText(lines[2] ?? '')}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function buildPdfExportBlob(input) {
  const normalized = validateExportInput(input);
  const lines = [
    'Camel Courtship Calculator',
    `${normalized.camelValue} camels equals ${normalized.proxyQuantity} ${normalized.proxyName}.`,
  ];

  if (normalized.message) {
    lines.push(normalized.message);
  }

  const content = lines
    .map((line, index) => `BT /F1 16 Tf 72 ${720 - index * 28} Td (${escapePdfText(line)}) Tj ET`)
    .join('\n');

  const pdf = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000061 00000 n \n0000000118 00000 n \n0000000244 00000 n \n0000000314 00000 n \ntrailer << /Root 1 0 R /Size 6 >>\nstartxref\n${314 + content.length}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}
