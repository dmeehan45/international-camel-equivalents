export type ProxyCategory =
  | 'Mammals and Land Creatures'
  | 'Aquatic and Marine Life'
  | 'Birds and Flying Creatures'
  | 'Reptiles, Insects, and Invertebrates'
  | 'Mythical and Absurd Concepts'
  | 'Other Bizarre Items and Collectives';

/**
 * Keep source open-ended for UI-layer drafts while still documenting known values.
 */
export type ProxySource = 'reference' | 'extension' | string;

export interface ProxyDefinition {
  id: string;
  name: string;
  ratePerCamel: number;
  category: ProxyCategory;
  description: string;
  source?: ProxySource;
  isExtension?: boolean;
}

export interface CalculationInput {
  amount: number;
  unit: 'USD' | 'CAMEL' | 'PROXY';
  proxyId?: string;
  camelUsdRate: number;
}

export interface ProxyEquivalent {
  proxyId?: string;
  proxyName: string;
  quantity: number;
}

export interface CalculationResult {
  camelValue: number;
  equivalents: ProxyEquivalent[];
}

export interface ConversionModifiers {
  camelMultiplier?: number;
  proxyRateOverrides?: Record<string, number>;
}
