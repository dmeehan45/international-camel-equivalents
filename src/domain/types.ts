import type { FlowStepId } from './flow';

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
  currentStep: FlowStepId;
  completedSteps: FlowStepId[];
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
  ageRange: string;
  occupation: string;
  quirkyFact: string;
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


export interface LockedBid {
  selectedProxyId: string;
  proxyQuantity: number;
  liveRatePerCamel: number;
  camelEquivalent: number;
  volatilityPercent: number;
}

export interface DocketBidMeta {
  proxyName: string;
  proxyQuantity: number;
  camelEquivalent: number;
  rateLabel: string;
}

export type AdvisoryToolKey =
  | 'proxy_personality_assessment'
  | 'bid_volatility_simulator'
  | 'maiden_response_estimator'
  | 'full_dbt_archive';

export interface AdvisoryToolTile {
  key: AdvisoryToolKey;
  title: string;
  subtitle: string;
  teaser: string;
  icon: 'quiz' | 'simulator' | 'estimator' | 'archive';
  unlockRequirement: 'first_successful_bid';
}

export interface AdvisoryUnlockState {
  hasUnlockedFurtherAdvisoryTools: boolean;
  unlockedAtISO?: string;
}

export interface ProxyAffinityResult {
  proxyId: string;
  proxyName: string;
  rate: number;
  rationale: string;
  snippet: string;
  assessedAtISO: string;
}
