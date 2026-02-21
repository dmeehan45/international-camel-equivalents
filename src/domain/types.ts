export type ProxyCategory =
  | 'Mammals and Land Creatures'
  | 'Aquatic and Marine Life'
  | 'Birds and Flying Creatures'
  | 'Reptiles, Insects, and Invertebrates'
  | 'Mythical and Absurd Concepts'
  | 'Other Bizarre Items and Collectives'
  | 'More Mammals and Land Creatures'
  | 'More Aquatic and Marine Life'
  | 'More Birds and Flying Creatures'
  | 'More Reptiles, Insects, and Invertebrates'
  | 'More Mythical and Absurd Concepts'
  | 'More Other Bizarre Items and Collectives';

export interface ProxyDefinition {
  id: string;
  name: string;
  ratePerCamel: number;
  category: ProxyCategory;
  description: string;
}

export interface CalculationInput {
  amount: number;
  unit: 'USD' | 'CAMEL' | 'PROXY';
  proxyId?: string;
  camelUsdRate: number;
}

export interface ProxyEquivalent {
  proxyId: string;
  proxyName: string;
  quantity: number;
}

export interface CalculationResult {
  camelValue: number;
  equivalents: ProxyEquivalent[];
}
