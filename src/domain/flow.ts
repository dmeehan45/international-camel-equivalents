export type FlowStepId =
  | 'card1-basics'
  | 'card2-adjudication'
  | 'card3-review'
  | 'card4-tune'
  | 'card5-instrument'
  | 'card6-queue';

export type FlowStepContext = {
  currentStep: FlowStepId;
  hasCalculation: boolean;
  hasShareDraft: boolean;
  includeTuneStep: boolean;
};

const BASE_STEPS: FlowStepId[] = [
  'card1-basics',
  'card2-adjudication',
  'card3-review',
  'card5-instrument',
  'card6-queue',
];

export const FLOW_STEP_LABELS: Record<FlowStepId, string> = {
  'card1-basics': 'Card 1 · Basics',
  'card2-adjudication': 'Card 2 · Equivalent',
  'card3-review': 'Card 3 · Confirm',
  'card4-tune': 'Card 4 · Tune (optional)',
  'card5-instrument': 'Card 5 · Proposal',
  'card6-queue': 'Card 6 · Queue',
};

export function getFlowSteps(includeTuneStep: boolean): FlowStepId[] {
  if (!includeTuneStep) return BASE_STEPS;
  return ['card1-basics', 'card2-adjudication', 'card3-review', 'card4-tune', 'card5-instrument', 'card6-queue'];
}

export function isFlowStepComplete(step: FlowStepId, context: FlowStepContext): boolean {
  if (step === 'card1-basics') return context.hasCalculation;
  if (step === 'card2-adjudication') return context.hasCalculation;
  if (step === 'card3-review') return context.hasCalculation;
  if (step === 'card4-tune') return !context.includeTuneStep || context.hasCalculation;
  if (step === 'card5-instrument') return context.hasShareDraft;
  if (step === 'card6-queue') return context.hasShareDraft;
  return false;
}

export function canOpenFlowStep(target: FlowStepId, context: FlowStepContext): boolean {
  const flowSteps = getFlowSteps(context.includeTuneStep);
  const currentIndex = flowSteps.indexOf(context.currentStep);
  const targetIndex = flowSteps.indexOf(target);
  if (targetIndex === -1 || currentIndex === -1) return false;
  if (targetIndex <= currentIndex) return true;

  const stepsBeforeTarget = flowSteps.slice(0, targetIndex);
  return stepsBeforeTarget.every((step) => isFlowStepComplete(step, context));
}

export function getNextFlowStep(context: FlowStepContext): FlowStepId | null {
  const flowSteps = getFlowSteps(context.includeTuneStep);
  const currentIndex = flowSteps.indexOf(context.currentStep);
  if (currentIndex === -1 || currentIndex >= flowSteps.length - 1) return null;
  return flowSteps[currentIndex + 1];
}

export function getPreviousFlowStep(context: FlowStepContext): FlowStepId | null {
  const flowSteps = getFlowSteps(context.includeTuneStep);
  const currentIndex = flowSteps.indexOf(context.currentStep);
  if (currentIndex <= 0) return null;
  return flowSteps[currentIndex - 1];
}
