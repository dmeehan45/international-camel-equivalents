import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import type { DowryForm, QueueItem } from '../domain/types';

export const WORKFLOW_STORAGE_KEY = 'icea-workflow-state-v2';

type DowryFormState = {
  form: DowryForm;
  queue: QueueItem[];
};

type DowryFormAction =
  | { type: 'setField'; field: keyof DowryForm; value: string | number | boolean | DowryForm['traitModifiers'] }
  | { type: 'resetOptional' }
  | { type: 'setQueue'; value: QueueItem[] }
  | { type: 'enqueueQueue'; value: QueueItem };

type DowryFormContextValue = {
  form: DowryForm;
  queue: QueueItem[];
  canCalculateIce: boolean;
  minCamelQuantity: number;
  maxCamelQuantity: number;
  clampCamelQuantity: (input: number) => number;
  dispatchForm: Dispatch<DowryFormAction>;
};

const DEFAULT_FORM: DowryForm = {
  bidName: '',
  bidRegion: '',
  camelQuantity: 18,
  isWarrior: false,
  hobby: '',
  courtshipYears: 0,
  hasArtifact: false,
  quirks: '',
  ageRange: '',
  occupation: '',
  quirkyFact: '',
  regionOverride: '',
  traitModifiers: {
    social: 1,
    resilience: 1,
    prestige: 1,
    ceremony: 1,
  },
  advancedTrait: 1,
};

const DowryFormContext = createContext<DowryFormContextValue | null>(null);

function sanitizeCamelQuantity(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_FORM.camelQuantity;
  return Math.min(100, Math.max(5, Math.round(n)));
}

function sanitizeForm(value: Partial<DowryForm> | undefined): DowryForm {
  const traitSource = value?.traitModifiers ?? DEFAULT_FORM.traitModifiers;
  return {
    ...DEFAULT_FORM,
    ...value,
    bidName: typeof value?.bidName === 'string' ? value.bidName : DEFAULT_FORM.bidName,
    bidRegion: typeof value?.bidRegion === 'string' ? value.bidRegion : DEFAULT_FORM.bidRegion,
    camelQuantity: sanitizeCamelQuantity(value?.camelQuantity),
    hobby: typeof value?.hobby === 'string' ? value.hobby : DEFAULT_FORM.hobby,
    quirks: typeof value?.quirks === 'string' ? value.quirks : DEFAULT_FORM.quirks,
    ageRange: typeof value?.ageRange === 'string' ? value.ageRange : DEFAULT_FORM.ageRange,
    occupation: typeof value?.occupation === 'string' ? value.occupation : DEFAULT_FORM.occupation,
    quirkyFact: typeof value?.quirkyFact === 'string' ? value.quirkyFact : DEFAULT_FORM.quirkyFact,
    regionOverride: typeof value?.regionOverride === 'string' ? value.regionOverride : DEFAULT_FORM.regionOverride,
    traitModifiers: {
      social: Number(traitSource.social) || 1,
      resilience: Number(traitSource.resilience) || 1,
      prestige: Number(traitSource.prestige) || 1,
      ceremony: Number(traitSource.ceremony) || 1,
    },
    advancedTrait: Number(value?.advancedTrait) || 1,
    courtshipYears: Number(value?.courtshipYears) || 0,
    isWarrior: Boolean(value?.isWarrior),
    hasArtifact: Boolean(value?.hasArtifact),
  };
}

function sanitizeQueue(value: unknown): QueueItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): QueueItem => ({
      id: typeof item?.id === 'string' ? item.id : `share-${Date.now()}`,
      createdAt: typeof item?.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      shareText: typeof item?.shareText === 'string' ? item.shareText : '',
      channel: typeof item?.channel === 'string' ? item.channel : 'unknown',
      status: item?.status === 'sent' ? 'sent' : 'pending',
    }))
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
    case 'resetOptional':
      return {
        ...state,
        form: {
          ...state.form,
          ageRange: '',
          occupation: '',
          quirkyFact: '',
        },
      };
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
    minCamelQuantity: 5,
    maxCamelQuantity: 100,
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
