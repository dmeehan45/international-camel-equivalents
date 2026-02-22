const STORAGE_KEY = 'ccc-proxy-extensions-v1';

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function createProxyDefinition(input, existingProxies) {
  const name = input.name?.trim();
  if (!name) throw new Error('Proxy name is required.');

  const ratePerCamel = Number(input.ratePerCamel);
  if (!Number.isFinite(ratePerCamel) || ratePerCamel <= 0) {
    throw new Error('Proxy rate must be a positive number.');
  }

  const category = input.category?.trim();
  if (!category) throw new Error('Proxy category is required.');

  const description = input.description?.trim();
  if (!description) throw new Error('Proxy description is required.');

  const idBase = toSlug(name);
  const prefix = idBase ? `ext-${idBase}` : 'ext-proxy';
  let candidateId = prefix;
  let suffix = 2;

  const existingIds = new Set(existingProxies.map((proxy) => proxy.id));
  while (existingIds.has(candidateId)) {
    candidateId = `${prefix}-${suffix}`;
    suffix += 1;
  }

  return {
    id: candidateId,
    name,
    ratePerCamel,
    category,
    description,
    source: 'extension',
    isExtension: true,
  };
}

export function mergeWithExtensions(baseProxies, extensionProxies) {
  const byId = new Map(baseProxies.map((proxy) => [proxy.id, proxy]));

  for (const proxy of extensionProxies) {
    if (!proxy?.id || byId.has(proxy.id)) continue;
    byId.set(proxy.id, {
      ...proxy,
      source: 'extension',
      isExtension: true,
    });
  }

  return Array.from(byId.values());
}

export function readStoredExtensions(storage = globalThis?.localStorage) {
  if (!storage) return [];

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeStoredExtensions(extensionProxies, storage = globalThis?.localStorage) {
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(extensionProxies));
}

export { STORAGE_KEY };
