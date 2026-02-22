import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { DowryForm, QueueItem } from '../domain/types';

export const WORKFLOW_STORAGE_KEY = 'ccc-workflow-draft-v1';

const DEFAULT_FORM: DowryForm = {
  bidName: '',
  bidRegion: '',
  camelQuantity: 10,
  isWarrior: false,
  hobby: '',
  courtshipYears: 0,
  hasArtifact: false,
  quirks: '',
  regionOverride: '',
  traitModifiers: { social: 1, resilience: 1, prestige: 1, ceremony: 1 },
  advancedTrait: 1,
};

type DowryFormAction =
  | { type: 'setField'; field: keyof DowryForm; value: string | number | boolean | DowryForm['traitModifiers'] }
  | { type: 'setTraitModifier'; field: keyof DowryForm['traitModifiers']; value: number }
  | { type: 'resetOptional' }
  | { type: 'resetRecommendation' }
  | { type: 'resetForOriginalBid' }
  | { type: 'hydrate'; value: Partial<DowryForm> }
  | { type: 'setQueue'; value: QueueItem[] }
  | { type: 'enqueueQueue'; value: QueueItem };

type DowryFormContextValue = {
  form: DowryForm;
  queue: QueueItem[];
  canCalculateIce: boolean;
  minCamelQuantity: number;
  maxCamelQuantity: number;
  clampCamelQuantity: (value: number) => number;
  dispatchForm: (action: DowryFormAction) => void;
};

type DowryFormState = {
  form: DowryForm;
  queue: QueueItem[];
};

const DowryFormContext = createContext<DowryFormContextValue | null>(null);

function sanitizeCamelQuantity(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_FORM.camelQuantity;
  return Math.min(200, Math.max(1, Math.round(numeric)));
}

function sanitizeTrait(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.min(1.2, Math.max(0.8, numeric));
}

function sanitizeAdvancedTrait(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.min(1.1, Math.max(0.9, numeric));
}

function sanitizeCourtshipYears(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(50, Math.max(0, Math.round(numeric)));
}

function sanitizeForm(value: Partial<DowryForm> | undefined): DowryForm {
  const traitSource = value?.traitModifiers ?? DEFAULT_FORM.traitModifiers;
  return {
    bidName: typeof value?.bidName === 'string' ? value.bidName : DEFAULT_FORM.bidName,
    bidRegion: typeof value?.bidRegion === 'string' ? value.bidRegion : DEFAULT_FORM.bidRegion,
    camelQuantity: sanitizeCamelQuantity(value?.camelQuantity),
    isWarrior: Boolean(value?.isWarrior),
    hobby: typeof value?.hobby === 'string' ? value.hobby : DEFAULT_FORM.hobby,
    courtshipYears: sanitizeCourtshipYears(value?.courtshipYears),
    hasArtifact: Boolean(value?.hasArtifact),
    quirks: typeof value?.quirks === 'string' ? value.quirks : DEFAULT_FORM.quirks,
    regionOverride: typeof value?.regionOverride === 'string' ? value.regionOverride : DEFAULT_FORM.regionOverride,
    traitModifiers: {
      social: sanitizeTrait(traitSource.social),
      resilience: sanitizeTrait(traitSource.resilience),
      prestige: sanitizeTrait(traitSource.prestige),
      ceremony: sanitizeTrait(traitSource.ceremony),
    },
    advancedTrait: sanitizeAdvancedTrait(value?.advancedTrait),
  };
}

function sanitizeQueue(value: unknown): QueueItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): QueueItem => {
      const status: QueueItem['status'] = item?.status === 'sent' ? 'sent' : 'pending';
      return {
        id: typeof item?.id === 'string' ? item.id : `share-${Date.now()}`,
        createdAt: typeof item?.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
        shareText: typeof item?.shareText === 'string' ? item.shareText : '',
        channel: typeof item?.channel === 'string' ? item.channel : 'unknown',
        status,
      };
    })
    .slice(0, 50);
}

function buildInitialState(): DowryFormState {
  try {
    const raw = globalThis.localStorage?.getItem(WORKFLOW_STORAGE_KEY);
    if (!raw) return { form: DEFAULT_FORM, queue: [] };
    const parsed = JSON.parse(raw) as { dowryForm?: Partial<DowryForm>; queue?: QueueItem[] };
    return {
      form: sanitizeForm(parsed.dowryForm),
      queue: sanitizeQueue(parsed.queue),
    };
  } catch {
    return { form: DEFAULT_FORM, queue: [] };
  }
}

function reducer(state: DowryFormState, action: DowryFormAction): DowryFormState {
  switch (action.type) {
    case 'setField':
      return { ...state, form: { ...state.form, [action.field]: action.value } as DowryForm };
    case 'setTraitModifier':
      return { ...state, form: { ...state.form, traitModifiers: { ...state.form.traitModifiers, [action.field]: sanitizeTrait(action.value) } } };
    case 'resetOptional':
      return { ...state, form: { ...state.form, camelQuantity: 10, isWarrior: false, hobby: '', courtshipYears: 0, hasArtifact: false, quirks: '' } };
    case 'resetRecommendation':
      return { ...state, form: { ...state.form, regionOverride: '', traitModifiers: { social: 1, resilience: 1, prestige: 1, ceremony: 1 }, advancedTrait: 1 } };
    case 'resetForOriginalBid':
      return { ...state, form: { ...state.form, camelQuantity: 10, isWarrior: false, hobby: '', courtshipYears: 0, hasArtifact: false, quirks: '', regionOverride: '', traitModifiers: { social: 1, resilience: 1, prestige: 1, ceremony: 1 }, advancedTrait: 1 } };
    case 'hydrate':
      return { ...state, form: sanitizeForm({ ...state.form, ...action.value }) };
    case 'setQueue':
      return { ...state, queue: sanitizeQueue(action.value) };
    case 'enqueueQueue':
      return { ...state, queue: sanitizeQueue([action.value, ...state.queue]) };
    default:
      return state;
  }
}

export function DowryFormProvider({ children }: { children: ReactNode }) {
  const [state, dispatchForm] = useReducer(reducer, undefined, buildInitialState);
  const value = useMemo(() => ({
    form: state.form,
    queue: state.queue,
    canCalculateIce: Boolean(state.form.bidName.trim() && state.form.bidRegion.trim()),
    minCamelQuantity: 1,
    maxCamelQuantity: 200,
    clampCamelQuantity: (input: number) => sanitizeCamelQuantity(input),
    dispatchForm,
  }), [state.form, state.queue]);

  return <DowryFormContext.Provider value={value}>{children}</DowryFormContext.Provider>;
}

export function useDowryForm() {
  const context = useContext(DowryFormContext);
  if (!context) throw new Error('useDowryForm must be used within DowryFormProvider');
  return context;
}
