import {
  calculateIceWithModifiers as calculateIceWithModifiersUntyped,
  compareProxyUnits as compareProxyUnitsUntyped,
  toCamelValue as toCamelValueUntyped,
  toEquivalents as toEquivalentsUntyped,
} from './conversion.js';
import { applyDashboardView as applyDashboardViewUntyped, validateDashboardInput } from './dashboard-view.js';
import {
  createProxyDefinition as createProxyDefinitionUntyped,
  mergeWithExtensions as mergeWithExtensionsUntyped,
  readProxyExtensions,
  writeProxyExtensions,
} from './proxy-library.js';
import type {
  CalculationInput,
  CalculationResult,
  ConversionModifiers,
  ProxyDefinition,
  ProxyEquivalent,
} from '../domain/types';

export { readProxyExtensions, validateDashboardInput, writeProxyExtensions };

export type DashboardSort = 'quantity-desc' | 'quantity-asc' | 'name-asc' | 'name-desc';

function normalizeProxyDefinition(item: unknown): ProxyDefinition {
  const value = item as Partial<ProxyDefinition>;

  return {
    id: String(value.id ?? ''),
    name: String(value.name ?? ''),
    ratePerCamel: Number(value.ratePerCamel ?? NaN),
    category: String(value.category ?? '') as ProxyDefinition['category'],
    description: String(value.description ?? ''),
    source: value.source === 'extension' ? 'extension' : 'reference',
    isExtension: Boolean(value.isExtension),
  };
}

function normalizeProxyEquivalent(item: unknown): ProxyEquivalent {
  const value = item as Partial<ProxyEquivalent>;

  return {
    proxyId: String(value.proxyId ?? ''),
    proxyName: String(value.proxyName ?? ''),
    quantity: Number(value.quantity ?? NaN),
  };
}

function normalizeResult(result: unknown): CalculationResult {
  const value = result as Partial<CalculationResult>;
  const equivalents = Array.isArray(value.equivalents)
    ? value.equivalents.map(normalizeProxyEquivalent)
    : [];

  return {
    camelValue: Number(value.camelValue ?? NaN),
    equivalents,
  };
}

export function toCamelValue(input: CalculationInput, proxies: ProxyDefinition[]): number {
  return Number(toCamelValueUntyped(input, proxies));
}

export function toEquivalents(camelValue: number, proxies: ProxyDefinition[]): ProxyEquivalent[] {
  const equivalents = toEquivalentsUntyped(camelValue, proxies);
  return Array.isArray(equivalents) ? equivalents.map(normalizeProxyEquivalent) : [];
}

export function calculateIceWithModifiers(
  input: CalculationInput,
  proxies: ProxyDefinition[],
  modifiers: ConversionModifiers = {},
): CalculationResult {
  return normalizeResult(calculateIceWithModifiersUntyped(input, proxies, modifiers));
}

export function applyDashboardView(
  equivalents: ProxyEquivalent[],
  options: { query?: string; sort?: DashboardSort } = {},
): ProxyEquivalent[] {
  const visible = applyDashboardViewUntyped(equivalents, options);
  return Array.isArray(visible) ? visible.map(normalizeProxyEquivalent) : [];
}

export function compareProxyUnits(
  input: { fromProxyId: string; toProxyId: string; amount: number },
  proxies: ProxyDefinition[],
): number {
  return Number(compareProxyUnitsUntyped(input, proxies));
}

export function createProxyDefinition(
  input: { name: string; ratePerCamel: number; category: string; description: string },
  existingProxies: ProxyDefinition[],
): ProxyDefinition {
  return normalizeProxyDefinition(createProxyDefinitionUntyped(input, existingProxies));
}

export function mergeWithExtensions(
  referenceProxies: ProxyDefinition[],
  extensionProxies: ProxyDefinition[],
): ProxyDefinition[] {
  const merged = mergeWithExtensionsUntyped(referenceProxies, extensionProxies);
  return Array.isArray(merged) ? merged.map(normalizeProxyDefinition) : [];
}
