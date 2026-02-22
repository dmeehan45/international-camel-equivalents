export type FlowStepId =
  | 'page1-landing'
  | 'page2-basics'
  | 'page3-offer'
  | 'page4-proposal'
  | 'page5-drafts';

export type FlowStepContext = {
  currentStep: FlowStepId;
  hasBasics: boolean;
  hasOffer: boolean;
  hasProposal: boolean;
};

const FLOW_STEPS: FlowStepId[] = ['page1-landing', 'page2-basics', 'page3-offer', 'page4-proposal', 'page5-drafts'];

export const FLOW_STEP_LABELS: Record<FlowStepId, string> = {
  'page1-landing': 'Intro',
  'page2-basics': 'Basics',
  'page3-offer': 'Offer',
  'page4-proposal': 'Text',
  'page5-drafts': 'Drafts',
};

export function getFlowSteps(): FlowStepId[] {
  return FLOW_STEPS;
}

export function canOpenFlowStep(target: FlowStepId, context: FlowStepContext): boolean {
  const targetIndex = FLOW_STEPS.indexOf(target);
  const currentIndex = FLOW_STEPS.indexOf(context.currentStep);
  if (targetIndex === -1 || currentIndex === -1) return false;
  if (targetIndex <= currentIndex) return true;
  if (target === 'page2-basics') return true;
  if (target === 'page3-offer') return context.hasBasics;
  if (target === 'page4-proposal') return context.hasBasics && context.hasOffer;
  if (target === 'page5-drafts') return context.hasProposal;
  return false;
}

export function getNextFlowStep(context: FlowStepContext): FlowStepId | null {
  const index = FLOW_STEPS.indexOf(context.currentStep);
  if (index === -1 || index >= FLOW_STEPS.length - 1) return null;
  return FLOW_STEPS[index + 1];
}

export function getPreviousFlowStep(context: FlowStepContext): FlowStepId | null {
  const index = FLOW_STEPS.indexOf(context.currentStep);
  if (index <= 0) return null;
  return FLOW_STEPS[index - 1];
}
