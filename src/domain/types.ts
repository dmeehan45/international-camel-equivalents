export type ProxyCategory =
  | 'Mammals and Land Creatures'
  | 'Aquatic and Marine Life'
  | 'Birds and Flying Creatures'
  | 'Reptiles, Insects, and Invertebrates'
  | 'Mythical and Absurd Concepts'
  | 'Other Bizarre Items and Collectives';

export type ProxySource = 'reference' | 'extension';

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
  unit: 'CAMEL' | 'PROXY';
  proxyId?: string;
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

export interface ConversionModifiers {
  camelMultiplier?: number;
  proxyRateOverrides?: Record<string, number>;
}

export interface PhaseProgress {
  currentStep: 'phase1-input' | 'phase2-adjudication' | 'phase3-instrument' | 'phase4-docket';
  completedSteps: Array<'phase1-input' | 'phase2-adjudication' | 'phase3-instrument' | 'phase4-docket'>;
}

export interface DowryForm {
  bidName: string;
  bidRegion: string;
  camelQuantity: number;
  isWarrior: boolean;
  hobby: string;
  courtshipYears: number;
  hasArtifact: boolean;
  quirks: string;
  regionOverride: string;
  traitModifiers: {
    social: number;
    resilience: number;
    prestige: number;
    ceremony: number;
  };
  advancedTrait: number;
}

export interface QueueItem {
  id: string;
  createdAt: string;
  shareText: string;
  channel: string;
  status: 'pending' | 'sent';
}
