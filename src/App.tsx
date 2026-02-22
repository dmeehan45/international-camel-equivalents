import { Suspense, lazy, useEffect, useMemo, useReducer, useState, type Dispatch } from 'react';
import { useLocation } from 'react-router-dom';
import proxiesData from './data/proxies.json';
import {
  applyDashboardView,
  calculateIceWithModifiers,
  compareProxyUnits,
  createProxyDefinition,
  mergeWithExtensions,
  readStoredExtensions,
  validateDashboardInput,
  writeStoredExtensions,
} from './core/typed-core';
import { buildCompareSummary, CANONICAL_PROXY_CATEGORIES, filterReferenceProxies } from './core/reference-library.js';
import { listTemplates, generateEditableInstrument } from './core/formalizer.js';
import { buildSharePayload } from './core/share-export.js';
import { buildQrPayload } from './core/share-qr.js';
import { buildHtmlExportDocument, buildImageExportDataUrl, buildPdfExportBlob } from './core/export-artifacts.js';
import { readCustomizerSettings, resolveCamelMultiplier, writeCustomizerSettings } from './core/customizer-settings.js';
import { createHistoryEntry, formatRelativeAge, readBidHistory, readDocketReadIds, writeBidHistory, writeDocketReadIds } from './core/history-archive.js';
import { parseBidInput } from './core/bid-parser.js';
import { calculateAdjudicatedCamelValue } from './core/adjudication.js';
import type { CalculationResult, ProxyDefinition } from './domain/types';
import {
  FLOW_STEP_LABELS,
  canOpenFlowStep,
  getFlowSteps,
  getNextFlowStep,
  getPreviousFlowStep,
  type FlowStepContext,
  type FlowStepId,
} from './domain/flow';
import { DowryFormProvider, useDowryForm, WORKFLOW_STORAGE_KEY } from './store/DowryFormContext';
import { uxCopy } from './content/uxCopy';
import { ErrorMessage } from './components/ErrorMessage';
import { LoadingFactRotator } from './components/LoadingFactRotator';

type TopTab = 'top' | 'all' | 'compare';
type RootTab = 'flow' | 'library' | 'archive' | 'premium';

type State = {
  referenceProxies: ProxyDefinition[];
  extensionProxies: ProxyDefinition[];
  mergedProxies: ProxyDefinition[];
  activeRootTab: RootTab;
  flowStep: FlowStepId;
  showWelcome: boolean;
  guidedMode: boolean;
  chaosMode: boolean;
  toolsOpen: boolean;
  celebrateOpen: boolean;
  calcInput: { rawBid: string; amount: string; unit: 'CAMEL' | 'PROXY'; proxyId: string; parseNote: string; parseSource: string };
  dashboardQuery: string;
  dashboardSort: 'quantity-desc' | 'quantity-asc' | 'name-asc' | 'name-desc';
  topTab: TopTab;
  calculation: CalculationResult | null;
  error: string;
  customizer: { locationKey: string; manualMultiplier: string; language: string; reducedMotion: boolean; highContrast: boolean; soundOn: boolean };
  showLoadingFacts: boolean;
  referenceFilters: { query: string; category: string; source: 'all' | 'reference' | 'extension' };
  compare: { amount: string; fromProxyId: string; toProxyId: string; result: string; error: string };
  compareSelected: string[];
  newProxy: { name: string; ratePerCamel: string; category: string; description: string; error: string; success: string };
  formalizer: { template: string; message: string; error: string };
  share: { selectedProxyId: string; text: string; qrPreview: string; error: string };
  history: Array<{ id: string; createdAt: string; amount: number; unit: string; camelValue: number; summary: string }>;
  docketReadIds: string[];
};

type Action =
  | { type: 'setRootTab'; value: RootTab }
  | { type: 'setFlowStep'; value: FlowStepId }
  | { type: 'toggleTools' }
  | { type: 'setCelebrateOpen'; value: boolean }
  | { type: 'setShowWelcome'; value: boolean }
  | { type: 'setGuidedMode'; value: boolean }
  | { type: 'setChaosMode'; value: boolean }
  | { type: 'setCalcField'; field: keyof State['calcInput']; value: string }
  | { type: 'setDashboardQuery'; value: string }
  | { type: 'setDashboardSort'; value: State['dashboardSort'] }
  | { type: 'setTopTab'; value: TopTab }
  | { type: 'setCalculation'; value: CalculationResult | null }
  | { type: 'setError'; value: string }
  | { type: 'hydrateExtensions'; value: ProxyDefinition[] }
  | { type: 'setCustomizerField'; field: keyof State['customizer']; value: string | boolean }
  | { type: 'setShowLoadingFacts'; value: boolean }
  | { type: 'setReferenceFilter'; field: keyof State['referenceFilters']; value: string }
  | { type: 'setCompareField'; field: keyof State['compare']; value: string }
  | { type: 'toggleCompareSelected'; proxyId: string }
  | { type: 'setNewProxyField'; field: keyof State['newProxy']; value: string }
  | { type: 'setFormalizerField'; field: keyof State['formalizer']; value: string }
  | { type: 'setShare'; text: string; selectedProxyId: string; qrPreview: string; error: string }
  | { type: 'setHistory'; value: State['history'] }
  | { type: 'setDocketReadIds'; value: string[] };

const referenceProxies = proxiesData as ProxyDefinition[];

function normalizeDraftFlowStep(step: unknown): FlowStepId {
  const flowSteps = new Set<FlowStepId>(['card1-basics', 'card2-adjudication', 'card3-review', 'card4-tune', 'card5-instrument', 'card6-queue']);
  return typeof step === 'string' && flowSteps.has(step as FlowStepId) ? (step as FlowStepId) : 'card1-basics';
}
function readDraft() {
  try {
    const raw = globalThis.localStorage?.getItem(WORKFLOW_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<State>;
  } catch {
    return null;
  }
}


function normalizeDraftUnit(unit: unknown): 'CAMEL' | 'PROXY' {
  return unit === 'PROXY' ? 'PROXY' : 'CAMEL';
}

function normalizeDraftCalcInput(draft: Partial<State> | null, mergedProxies: ProxyDefinition[]) {
  const draftCalcInput = draft?.calcInput;
  const proxyId = typeof draftCalcInput?.proxyId === 'string' && draftCalcInput.proxyId
    ? draftCalcInput.proxyId
    : mergedProxies[0]?.id ?? '';

  return {
    rawBid: typeof draftCalcInput?.rawBid === 'string' && draftCalcInput.rawBid ? draftCalcInput.rawBid : '2 camels',
    amount: typeof draftCalcInput?.amount === 'string' && draftCalcInput.amount ? draftCalcInput.amount : '2',
    unit: normalizeDraftUnit(draftCalcInput?.unit),
    proxyId,
    parseNote: '',
    parseSource: '',
  };
}

function buildInitialState(): State {
  const extensionProxies = readStoredExtensions() as ProxyDefinition[];
  const mergedProxies = mergeWithExtensions(referenceProxies, extensionProxies);
  const customizer = readCustomizerSettings();
  const draft = readDraft();

  return {
    referenceProxies,
    extensionProxies,
    mergedProxies,
    activeRootTab: 'flow',
    flowStep: normalizeDraftFlowStep(draft?.flowStep),
    showWelcome: false,
    guidedMode: draft?.guidedMode ?? true,
    chaosMode: draft?.chaosMode ?? false,
    toolsOpen: false,
    celebrateOpen: false,
    calcInput: normalizeDraftCalcInput(draft, mergedProxies),
    dashboardQuery: '',
    dashboardSort: 'quantity-desc',
    topTab: 'top',
    calculation: null,
    error: '',
    customizer: {
      locationKey: customizer.locationKey ?? 'default',
      manualMultiplier: String(customizer.manualMultiplier ?? 1),
      language: customizer.language ?? 'en',
      reducedMotion: true,
      highContrast: false,
      soundOn: false,
    },
    showLoadingFacts: true,
    referenceFilters: { query: '', category: '', source: 'all' },
    compare: {
      amount: '1',
      fromProxyId: mergedProxies[0]?.id ?? '',
      toProxyId: mergedProxies[1]?.id ?? mergedProxies[0]?.id ?? '',
      result: '',
      error: '',
    },
    compareSelected: [],
    newProxy: { name: '', ratePerCamel: '', category: CANONICAL_PROXY_CATEGORIES[0], description: '', error: '', success: '' },
    formalizer: { template: listTemplates()[0] ?? 'formal', message: '', error: '' },
    share: { selectedProxyId: '', text: '', qrPreview: '', error: '' },
    history: readBidHistory(),
    docketReadIds: readDocketReadIds(),
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setRootTab': return { ...state, activeRootTab: action.value };
    case 'setFlowStep': return { ...state, flowStep: action.value };
    case 'toggleTools': return { ...state, toolsOpen: !state.toolsOpen };
    case 'setCelebrateOpen': return { ...state, celebrateOpen: action.value };
    case 'setShowWelcome': return { ...state, showWelcome: action.value };
    case 'setGuidedMode': return { ...state, guidedMode: action.value };
    case 'setChaosMode': return { ...state, chaosMode: action.value };
    case 'setCalcField': return { ...state, calcInput: { ...state.calcInput, [action.field]: action.value } };
    case 'setDashboardQuery': return { ...state, dashboardQuery: action.value };
    case 'setDashboardSort': return { ...state, dashboardSort: action.value };
    case 'setTopTab': return { ...state, topTab: action.value };
    case 'setCalculation': return { ...state, calculation: action.value };
    case 'setError': return { ...state, error: action.value };
    case 'hydrateExtensions': {
      const merged = mergeWithExtensions(state.referenceProxies, action.value);
      return { ...state, extensionProxies: action.value, mergedProxies: merged };
    }
    case 'setCustomizerField': return { ...state, customizer: { ...state.customizer, [action.field]: action.value } };
    case 'setShowLoadingFacts': return { ...state, showLoadingFacts: action.value };
    case 'setReferenceFilter': return { ...state, referenceFilters: { ...state.referenceFilters, [action.field]: action.value } as State['referenceFilters'] };
    case 'setCompareField': return { ...state, compare: { ...state.compare, [action.field]: action.value } };
    case 'toggleCompareSelected':
      return {
        ...state,
        compareSelected: state.compareSelected.includes(action.proxyId)
          ? state.compareSelected.filter((id) => id !== action.proxyId)
          : [...state.compareSelected, action.proxyId],
      };
    case 'setNewProxyField': return { ...state, newProxy: { ...state.newProxy, [action.field]: action.value } };
    case 'setFormalizerField': return { ...state, formalizer: { ...state.formalizer, [action.field]: action.value } };
    case 'setShare': return { ...state, share: { text: action.text, selectedProxyId: action.selectedProxyId, qrPreview: action.qrPreview, error: action.error } };
    case 'setHistory': return { ...state, history: action.value };
    case 'setDocketReadIds': return { ...state, docketReadIds: action.value };
    default: return state;
  }
}

function runParsedBid(state: State, dispatch: Dispatch<Action>) {
  const parsed = parseBidInput(state.calcInput.rawBid);
  if (parsed.kind === 'ambiguous') {
    const reason = parsed.reason ?? uxCopy.errors.parseUnknown;
    dispatch({ type: 'setCalcField', field: 'parseNote', value: reason });
    dispatch({ type: 'setError', value: reason });
    return false;
  }

  if (parsed.kind === 'camel') {
    dispatch({ type: 'setCalcField', field: 'amount', value: String(parsed.amount) });
    dispatch({ type: 'setCalcField', field: 'unit', value: 'CAMEL' });
    dispatch({ type: 'setCalcField', field: 'parseSource', value: 'Detected camel bid input.' });
    dispatch({ type: 'setCalcField', field: 'parseNote', value: '' });
    return true;
  }

  const match = state.mergedProxies.find((proxy) => proxy.name.toLowerCase().includes(parsed.proxyName.toLowerCase()) || parsed.proxyName.toLowerCase().includes(proxy.name.toLowerCase()));
  if (!match) {
    dispatch({ type: 'setError', value: uxCopy.errors.proxyNotFound(parsed.proxyName) });
    dispatch({ type: 'setCalcField', field: 'parseNote', value: 'Use camel format like "2 camels" or a known proxy like "5 yaks".' });
    return false;
  }

  dispatch({ type: 'setCalcField', field: 'amount', value: String(parsed.amount) });
  dispatch({ type: 'setCalcField', field: 'unit', value: 'PROXY' });
  dispatch({ type: 'setCalcField', field: 'proxyId', value: match.id });
  dispatch({ type: 'setCalcField', field: 'parseSource', value: `Mapped to proxy: ${match.name}.` });
  dispatch({ type: 'setCalcField', field: 'parseNote', value: '' });
  return true;
}

function runCalculation(state: State, dispatch: Dispatch<Action>) {
  if (!runParsedBid(state, dispatch)) return;
  try {
    validateDashboardInput({ amount: Number(state.calcInput.amount), unit: state.calcInput.unit, proxyId: state.calcInput.proxyId });
    const camelMultiplier = resolveCamelMultiplier({ locationKey: state.customizer.locationKey, manualMultiplier: Number(state.customizer.manualMultiplier) });
    const result = calculateIceWithModifiers({ amount: Number(state.calcInput.amount), unit: state.calcInput.unit, proxyId: state.calcInput.proxyId }, state.mergedProxies, { camelMultiplier });
    dispatch({ type: 'setCalculation', value: result });
    dispatch({ type: 'setError', value: '' });
    dispatch({ type: 'setFlowStep', value: 'card2-adjudication' });
  } catch (error) {
    dispatch({ type: 'setError', value: error instanceof Error ? error.message : uxCopy.errors.calculationFailed });
  }
}

type RecommendationInputs = {
  baseCalculation: CalculationResult;
  regionFactor: number;
  traitBonuses: number;
};

function computeRecommendation({ baseCalculation, regionFactor, traitBonuses }: RecommendationInputs) {
  const { adjustedCamelValue } = calculateAdjudicatedCamelValue({
    baseCamelValue: baseCalculation.camelValue,
    regionFactor,
    traitBonuses,
  });
  const ratio = baseCalculation.camelValue === 0 ? 1 : adjustedCamelValue / baseCalculation.camelValue;
  const adjustedEquivalents = baseCalculation.equivalents
    .map((item) => ({ ...item, quantity: Number((item.quantity * ratio).toFixed(2)) }))
    .sort((a, b) => b.quantity - a.quantity);

  const adjustedCalculation = {
    camelValue: adjustedCamelValue,
    equivalents: adjustedEquivalents,
  } as CalculationResult;

  return {
    regionFactor,
    traitBonuses,
    adjustedCamelValue,
    adjustedCalculation,
  };
}

function Stepper({ step, flowContext, onChange }: { step: FlowStepId; flowContext: FlowStepContext; onChange: (step: FlowStepId) => void }) {
  const steps = getFlowSteps(flowContext.includeTuneStep);
  const currentIndex = steps.indexOf(step);
  const previousStep = getPreviousFlowStep(flowContext);
  const nextStep = getNextFlowStep(flowContext);

  return (
    <div className="stepper-wrap">
      <div className="stepper" aria-label="Workflow phases">
        {steps.map((item, index) => {
          const status = index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming';
          return (
            <div key={item} className="stepper-item">
              <button className={step === item ? 'step active' : 'step'} onClick={() => onChange(item)} disabled={!canOpenFlowStep(item, flowContext)} aria-current={status === 'current' ? 'step' : undefined}><span>{FLOW_STEP_LABELS[item]}</span></button>
              {index < steps.length - 1 && <span className="step-arrow" aria-hidden="true">→</span>}
            </div>
          );
        })}
      </div>
      <div className="stepper-nav">
        <button onClick={() => previousStep && onChange(previousStep)} disabled={!previousStep}>← Back</button>
        <button onClick={() => nextStep && onChange(nextStep)} disabled={!nextStep || !canOpenFlowStep(nextStep, flowContext)}>Next →</button>
      </div>
    </div>
  );
}

function FixedShellHeader({ state, dispatch, draftSaved }: { state: State; dispatch: Dispatch<Action>; draftSaved: boolean }) {
  const flowSteps = getFlowSteps(false);

  return (
    <header className="fixed-header" role="banner">
      <div className="fixed-header-top">
        <div>
          <h1>International Camel Equivalents</h1>
          <p>Courtship workflow experience</p>
        </div>
        <div className="fixed-header-actions">
          <p className="helper">Autosave: {draftSaved ? 'All changes saved' : 'Saving changes…'}</p>
          <button onClick={() => dispatch({ type: 'toggleTools' })}>Tools</button>
        </div>
      </div>
      <nav className="phase-progress" aria-label="Wizard phase progress">
        {flowSteps.map((flowStep, index) => (
          <button
            key={flowStep}
            className={state.flowStep === flowStep ? 'step active' : 'step'}
            onClick={() => {
              dispatch({ type: 'setRootTab', value: 'flow' });
              dispatch({ type: 'setFlowStep', value: flowStep });
            }}
          >
            <span>{FLOW_STEP_LABELS[flowStep]}</span>
            <small>{index + 1}/{flowSteps.length}</small>
          </button>
        ))}
      </nav>
    </header>
  );
}

function LegalPlaceholderPage({ title, summary }: { title: string; summary: string }) {
  return (
    <section className="view-card ccc-card legal-placeholder">
      <h2>{title}</h2>
      <p>{summary}</p>
      <p className="helper">Placeholder page: legal counsel is currently out negotiating with a particularly litigious camel.</p>
    </section>
  );
}


function FlowView({ state, dispatch, draftSaved }: { state: State; dispatch: Dispatch<Action>; draftSaved: boolean }) {
  const { form, dispatchForm, canCalculateIce, minCamelQuantity, maxCamelQuantity, clampCamelQuantity, queue } = useDowryForm();
  const [scanActionsOpen, setScanActionsOpen] = useState(false);
  const [resultsFiltersOpen, setResultsFiltersOpen] = useState(false);
  const [exportTab, setExportTab] = useState<'text' | 'image' | 'pdf' | 'html'>('text');
  const [exportToast, setExportToast] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [fiatTraitsEnabled, setFiatTraitsEnabled] = useState(true);
  const [lockedRecommendation, setLockedRecommendation] = useState<ReturnType<typeof computeRecommendation> | null>(null);
  const templates = useMemo(() => listTemplates(), []);
  const queuedSharePreview = useMemo(() => queue.slice(0, 3).map((item) => item.channel || item.id).join(', '), [queue]);

  function runStepOneCalculation() {
    if (!canCalculateIce) return;
    setLockedRecommendation(null);
    const guardedQuantity = clampCamelQuantity(form.camelQuantity);
    if (guardedQuantity !== form.camelQuantity) dispatchForm({ type: 'setField', field: 'camelQuantity', value: guardedQuantity });
    dispatch({ type: 'setCalcField', field: 'rawBid', value: `${guardedQuantity} camels` });
    runCalculation(state, dispatch);
  }

  const userChoseTweak = Boolean(form.regionOverride)
    || !fiatTraitsEnabled
    || form.advancedTrait !== 1
    || form.traitModifiers.social !== 1
    || form.traitModifiers.resilience !== 1
    || form.traitModifiers.prestige !== 1
    || form.traitModifiers.ceremony !== 1;

  const flowContext: FlowStepContext = {
    currentStep: state.flowStep,
    hasCalculation: Boolean(state.calculation),
    hasShareDraft: Boolean(state.share.text || state.formalizer.message),
    includeTuneStep: userChoseTweak,
  };

  const visibleEquivalents = useMemo(() => {
    if (!state.calculation) return [];
    return applyDashboardView(state.calculation.equivalents, { query: state.dashboardQuery, sort: state.dashboardSort });
  }, [state.calculation, state.dashboardQuery, state.dashboardSort]);

  const topPicks = useMemo(() => visibleEquivalents.slice(0, 12), [visibleEquivalents]);
  const effectiveMultiplier = resolveCamelMultiplier({ locationKey: state.customizer.locationKey, manualMultiplier: Number(state.customizer.manualMultiplier) });
  const recommendation = useMemo(() => {
    if (!state.calculation) return null;
    const activeRegionKey = form.regionOverride || state.customizer.locationKey;
    const regionFactor = resolveCamelMultiplier({ locationKey: activeRegionKey, manualMultiplier: Number(state.customizer.manualMultiplier) });
    const traitBonuses = fiatTraitsEnabled
      ? Number((
        (form.traitModifiers.social - 1)
        + (form.traitModifiers.resilience - 1)
        + (form.traitModifiers.prestige - 1)
        + ((form.traitModifiers.ceremony * form.advancedTrait) - 1)
      ).toFixed(2))
      : 0;

    return computeRecommendation({
      baseCalculation: state.calculation,
      regionFactor,
      traitBonuses,
    });
  }, [fiatTraitsEnabled, form.advancedTrait, form.regionOverride, form.traitModifiers, state.calculation, state.customizer.locationKey, state.customizer.manualMultiplier]);
  const languagePreview: Record<string, string> = {
    en: 'Preview: “This bid equals 2.4 camels.”',
    ar: 'Preview: "هذا العرض يساوي 2.4 من الإبل."',
    fr: 'Aperçu : « Cette offre équivaut à 2,4 chameaux. »',
  };

  function runCompare() {
    try {
      if (state.compareSelected.length < 2) throw new Error('Select at least two proxies to compare.');
      const [fromProxyId, toProxyId] = state.compareSelected;
      const quantity = compareProxyUnits({ fromProxyId, toProxyId, amount: Number(state.compare.amount) }, state.mergedProxies);
      const from = state.mergedProxies.find((item) => item.id === fromProxyId);
      const to = state.mergedProxies.find((item) => item.id === toProxyId);
      if (!from || !to) throw new Error('Select valid proxies.');
      dispatch({ type: 'setCompareField', field: 'result', value: buildCompareSummary({ amount: Number(state.compare.amount), quantity, fromName: from.name, toName: to.name }) });
      dispatch({ type: 'setCompareField', field: 'error', value: '' });
    } catch (error) {
      dispatch({ type: 'setCompareField', field: 'error', value: error instanceof Error ? error.message : uxCopy.errors.compareFailed });
    }
  }

  function generateMessage() {
    try {
      if (!state.calculation) throw new Error('Run a calculation first.');
      const top = state.calculation.equivalents[0];
      const message = generateEditableInstrument({ template: state.formalizer.template, camelValue: state.calculation.camelValue, proxyQuantity: top.quantity, proxyName: top.proxyName });
      dispatch({ type: 'setFormalizerField', field: 'message', value: message });
      dispatch({ type: 'setFormalizerField', field: 'error', value: '' });
    } catch (error) {
      dispatch({ type: 'setFormalizerField', field: 'error', value: error instanceof Error ? error.message : uxCopy.errors.formalizerFailed });
    }
  }

  function buildExportArtifacts() {
    if (!state.calculation) throw new Error('Run a calculation first.');
    const payload = buildSharePayload(state.calculation, { proxyId: state.share.selectedProxyId || state.calculation.equivalents[0]?.proxyId, message: state.formalizer.message });
    const qr = buildQrPayload({ mode: 'text', shareText: payload.shareText });
    const exportInput = {
      camelValue: state.calculation.camelValue,
      proxyQuantity: payload.selectedProxy.quantity,
      proxyName: payload.selectedProxy.proxyName,
      message: state.formalizer.message,
      qrLabel: qr.preview,
      barcodeLabel: `BID-${Math.round(state.calculation.camelValue * 100)}-${payload.selectedProxy.proxyId.toUpperCase()}`,
    };
    return {
      payload,
      qr,
      imageDataUrl: buildImageExportDataUrl(exportInput),
      pdfBlob: buildPdfExportBlob(exportInput),
      htmlDocument: buildHtmlExportDocument(exportInput),
    };
  }

  async function runExportAction(action: 'copy' | 'download' | 'share', forcedTab?: 'text' | 'image' | 'pdf' | 'html') {
    setLoadingAction(action === 'download' ? 'Preparing export packet' : action === 'share' ? 'Preparing share packet' : 'Preparing clipboard packet');
    try {
      const { payload, qr, imageDataUrl, pdfBlob, htmlDocument } = buildExportArtifacts();
      dispatch({ type: 'setShare', text: payload.shareText, selectedProxyId: payload.selectedProxy.proxyId, qrPreview: qr.preview, error: '' });
      const activeTab = forcedTab ?? exportTab;
      if (action === 'copy') {
        const copyValue = activeTab === 'text' ? payload.shareText : activeTab === 'image' ? imageDataUrl : activeTab === 'html' ? htmlDocument : payload.shareText;
        await navigator.clipboard.writeText(copyValue);
      }

      if (action === 'download') {
        const href = activeTab === 'image'
          ? imageDataUrl
          : URL.createObjectURL(activeTab === 'pdf' ? pdfBlob : new Blob([activeTab === 'html' ? htmlDocument : payload.shareText], { type: activeTab === 'html' ? 'text/html' : 'text/plain' }));
        const ext = activeTab === 'text' ? 'txt' : activeTab;
        const link = document.createElement('a');
        link.href = href;
        link.download = `camel-export.${ext}`;
        link.click();
        if (activeTab !== 'image') URL.revokeObjectURL(href);
      }

      const canNativeShare = typeof (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share === 'function';
      if (action === 'share') {
        if (canNativeShare) {
          await navigator.share({ text: payload.shareText, title: 'Camel Courtship Calculator' });
        } else {
          await navigator.clipboard.writeText(payload.shareText);
          setExportToast('Web Share unavailable. Copied text export instead.');
        }
      }

      dispatchForm({
        type: 'enqueueQueue',
        value: {
          id: `share-${Date.now()}`,
          createdAt: new Date().toISOString(),
          shareText: payload.shareText,
          channel: action,
          status: action === 'share' ? 'sent' : 'pending',
        },
      });

      const actionLabel = action === 'copy' ? 'Copied' : action === 'download' ? 'Downloaded' : canNativeShare ? 'Shared' : 'Copied';
      if (action !== 'share' || canNativeShare) setExportToast(`${actionLabel} ${activeTab.toUpperCase()} export.`);
    } catch (error) {
      dispatch({ type: 'setShare', text: '', selectedProxyId: '', qrPreview: '', error: error instanceof Error ? error.message : uxCopy.errors.exportFailed });
      setExportToast('');
    } finally {
      setLoadingAction(null);
    }
  }

  function saveEntry() {
    setLoadingAction('Archiving docket entry');
    try {
      if (!state.calculation) throw new Error('Run a calculation before archiving.');
      const entry = createHistoryEntry({ amount: Number(state.calcInput.amount), unit: state.calcInput.unit, camelValue: state.calculation.camelValue, summary: state.share.text || state.formalizer.message || 'Camel bid summary' });
      const next = [entry, ...state.history];
      writeBidHistory(next);
      dispatch({ type: 'setHistory', value: next });
    } catch (error) {
      dispatch({ type: 'setError', value: error instanceof Error ? error.message : uxCopy.errors.archiveFailed });
    } finally {
      setLoadingAction(null);
    }
  }

  function finalizeBid() {
    if (!recommendation) return;
    setLockedRecommendation(recommendation);
    dispatch({ type: 'setCalculation', value: recommendation.adjustedCalculation });
    dispatch({ type: 'setFormalizerField', field: 'message', value: '' });
    dispatch({ type: 'setShare', text: '', selectedProxyId: recommendation.adjustedCalculation.equivalents[0]?.proxyId ?? '', qrPreview: '', error: '' });
    dispatch({ type: 'setFlowStep', value: userChoseTweak ? 'card4-tune' : 'card5-instrument' });
  }



  useEffect(() => {
    if (state.flowStep !== 'card5-instrument') return;
    if (!state.calculation || state.formalizer.message) return;
    generateMessage();
  }, [state.flowStep, state.calculation, state.formalizer.template]);

  function resetToOriginalBid() {
    setLockedRecommendation(null);
    setFiatTraitsEnabled(true);
    dispatchForm({ type: 'resetForOriginalBid' });
    dispatch({ type: 'setCalcField', field: 'rawBid', value: '10 camels' });
    dispatch({ type: 'setCalcField', field: 'amount', value: '10' });
    dispatch({ type: 'setCalcField', field: 'unit', value: 'CAMEL' });
    runCalculation({
      ...state,
      calcInput: { ...state.calcInput, rawBid: '10 camels', amount: '10', unit: 'CAMEL' },
      customizer: { ...state.customizer, locationKey: 'global-default', manualMultiplier: '1' },
    }, dispatch);
  }

  return (
    <section className="view-card ccc-card flow-surface">
      <Stepper step={state.flowStep} flowContext={flowContext} onChange={(value) => { if (canOpenFlowStep(value, flowContext)) dispatch({ type: 'setFlowStep', value }); }} />
      <div className="sticky-chip">Bid summary: {state.calcInput.rawBid} · {draftSaved ? 'Saved' : 'Saving…'}</div>
      <div className="helper" aria-live="polite">Queued shares: {queue.length}{queuedSharePreview ? ` (${queuedSharePreview})` : ''}</div>

      {state.flowStep === 'card1-basics' && (
        <Suspense fallback={<p className="helper" role="status" aria-live="polite">Loading Phase I…</p>}>
          <Phase1Input
          bidName={form.bidName}
          bidRegion={form.bidRegion}
          camelQuantity={form.camelQuantity}
          minCamelQuantity={minCamelQuantity}
          maxCamelQuantity={maxCamelQuantity}
          canCalculateIce={canCalculateIce}
          isWarrior={form.isWarrior}
          hobby={form.hobby}
          courtshipYears={form.courtshipYears}
          hasArtifact={form.hasArtifact}
          quirks={form.quirks}
          parseSource={state.calcInput.parseSource}
          setBidName={(value) => dispatchForm({ type: 'setField', field: 'bidName', value })}
          setBidRegion={(value) => dispatchForm({ type: 'setField', field: 'bidRegion', value })}
          setCamelQuantity={(value) => dispatchForm({ type: 'setField', field: 'camelQuantity', value })}
          clampCamelQuantity={clampCamelQuantity}
          setIsWarrior={(value) => dispatchForm({ type: 'setField', field: 'isWarrior', value })}
          setHobby={(value) => dispatchForm({ type: 'setField', field: 'hobby', value })}
          setCourtshipYears={(value) => dispatchForm({ type: 'setField', field: 'courtshipYears', value })}
          setHasArtifact={(value) => dispatchForm({ type: 'setField', field: 'hasArtifact', value })}
          setQuirks={(value) => dispatchForm({ type: 'setField', field: 'quirks', value })}
          onCalculate={runStepOneCalculation}
          onResetOptional={() => dispatchForm({ type: 'resetOptional' })}
          />
        </Suspense>
      )}

      {state.flowStep === 'card2-adjudication' && (
        <Suspense fallback={<p className="helper" role="status" aria-live="polite">Loading Phase II…</p>}>
          <Phase2Adjudication
          state={state}
          effectiveMultiplier={effectiveMultiplier}
          recommendation={recommendation}
          regionOverride={form.regionOverride}
          setRegionOverride={(value) => dispatchForm({ type: 'setField', field: 'regionOverride', value })}
          traitModifiers={form.traitModifiers}
          setTraitModifiers={(value) => dispatchForm({ type: 'setField', field: 'traitModifiers', value: typeof value === 'function' ? value(form.traitModifiers) : value })}
          advancedTrait={form.advancedTrait}
          setAdvancedTrait={(value) => dispatchForm({ type: 'setField', field: 'advancedTrait', value })}
          fiatTraitsEnabled={fiatTraitsEnabled}
          setFiatTraitsEnabled={setFiatTraitsEnabled}
          adjudicationLocked={Boolean(lockedRecommendation)}
          lockedRecommendation={lockedRecommendation}
          languagePreview={languagePreview}
          scanActionsOpen={scanActionsOpen}
          setScanActionsOpen={setScanActionsOpen}
          resultsFiltersOpen={resultsFiltersOpen}
          setResultsFiltersOpen={setResultsFiltersOpen}
          topPicks={topPicks}
          visibleEquivalents={visibleEquivalents}
          runCompare={runCompare}
          finalizeBid={finalizeBid}
          resetToOriginalBid={resetToOriginalBid}
          dispatch={dispatch}
          />
        </Suspense>
      )}

      {(state.flowStep === 'card3-review' || state.flowStep === 'card4-tune') && (
        <Suspense fallback={<p className="helper" role="status" aria-live="polite">Loading Review…</p>}>
          <Phase2Adjudication
          state={state}
          effectiveMultiplier={effectiveMultiplier}
          recommendation={recommendation}
          regionOverride={form.regionOverride}
          setRegionOverride={(value) => dispatchForm({ type: 'setField', field: 'regionOverride', value })}
          traitModifiers={form.traitModifiers}
          setTraitModifiers={(value) => dispatchForm({ type: 'setField', field: 'traitModifiers', value: typeof value === 'function' ? value(form.traitModifiers) : value })}
          advancedTrait={form.advancedTrait}
          setAdvancedTrait={(value) => dispatchForm({ type: 'setField', field: 'advancedTrait', value })}
          fiatTraitsEnabled={fiatTraitsEnabled}
          setFiatTraitsEnabled={setFiatTraitsEnabled}
          adjudicationLocked={Boolean(lockedRecommendation)}
          lockedRecommendation={lockedRecommendation}
          languagePreview={languagePreview}
          scanActionsOpen={scanActionsOpen}
          setScanActionsOpen={setScanActionsOpen}
          resultsFiltersOpen={resultsFiltersOpen}
          setResultsFiltersOpen={setResultsFiltersOpen}
          topPicks={topPicks}
          visibleEquivalents={visibleEquivalents}
          runCompare={runCompare}
          finalizeBid={() => dispatch({ type: 'setFlowStep', value: state.flowStep === 'card3-review' && userChoseTweak ? 'card4-tune' : 'card5-instrument' })}
          resetToOriginalBid={resetToOriginalBid}
          dispatch={dispatch}
          />
        </Suspense>
      )}

      {state.flowStep === 'card5-instrument' && (
        <Suspense fallback={<p className="helper" role="status" aria-live="polite">Loading Phase III…</p>}>
          <Phase3Instrument
          state={state}
          exportTab={exportTab}
          setExportTab={setExportTab}
          generateMessage={generateMessage}
          runExportAction={runExportAction}
          onCompleteInstrument={() => dispatch({ type: 'setFlowStep', value: 'card6-queue' })}
          exportToast={exportToast}
          dispatch={dispatch}
            templates={templates}
          />
        </Suspense>
      )}

      {state.showLoadingFacts && (
        <LoadingFactRotator active={Boolean(loadingAction)} actionLabel={loadingAction ?? 'Processing'} facts={uxCopy.loadingFacts} />
      )}

      {state.flowStep === 'card6-queue' && (
        <Suspense fallback={<p className="helper" role="status" aria-live="polite">Loading Phase IV…</p>}>
          <Phase4Docket calculation={state.calculation} shareText={state.share.text || state.formalizer.message} exportToast={exportToast} onSaveEntry={saveEntry} history={state.history} docketReadIds={state.docketReadIds} onMarkDocketRead={(id) => {
            const next = Array.from(new Set([id, ...state.docketReadIds]));
            writeDocketReadIds(next);
            dispatch({ type: 'setDocketReadIds', value: next });
          }} onInitiateProceeding={() => { dispatch({ type: 'setFlowStep', value: 'card1-basics' }); }} />
        </Suspense>
      )}

      <ErrorMessage message={state.error} statute="Statute 15" />
      <ErrorMessage message={state.calcInput.parseNote} statute="Statute 1.7" />

    </section>
  );
}

function LibraryView({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const filtered = useMemo(() => filterReferenceProxies(state.mergedProxies, state.referenceFilters), [state.mergedProxies, state.referenceFilters]);

  function saveProxy() {
    try {
      const created = createProxyDefinition({ name: state.newProxy.name, ratePerCamel: Number(state.newProxy.ratePerCamel), category: state.newProxy.category, description: state.newProxy.description }, state.mergedProxies);
      const next = [...state.extensionProxies, created];
      writeStoredExtensions(next);
      dispatch({ type: 'hydrateExtensions', value: next });
      dispatch({ type: 'setNewProxyField', field: 'success', value: `Added ${created.name}` });
      dispatch({ type: 'setNewProxyField', field: 'error', value: '' });
    } catch (error) {
      dispatch({ type: 'setNewProxyField', field: 'error', value: error instanceof Error ? error.message : uxCopy.errors.createProxyFailed });
    }
  }

  return (
    <section className="view-card ccc-card">
      <h2>Library</h2>
      <button onClick={() => dispatch({ type: 'setRootTab', value: 'flow' })}>Back to flow</button>
      <p>Search, filter, browse, and generate custom proxies.</p>
      <div className="grid">
        <label>Search<input className="ccc-input" value={state.referenceFilters.query} onChange={(e) => dispatch({ type: 'setReferenceFilter', field: 'query', value: e.target.value })} /></label>
        <label>Category<select className="ccc-input" value={state.referenceFilters.category} onChange={(e) => dispatch({ type: 'setReferenceFilter', field: 'category', value: e.target.value })}><option value="">All</option>{CANONICAL_PROXY_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        <label>Source<select className="ccc-input" value={state.referenceFilters.source} onChange={(e) => dispatch({ type: 'setReferenceFilter', field: 'source', value: e.target.value })}><option value="all">All</option><option value="reference">Reference only</option><option value="extension">Custom only</option></select></label>
      </div>
      <p>{filtered.length} proxies in library</p>
      <ul className="list">{filtered.map((proxy) => <li key={proxy.id}>{proxy.name} · {proxy.category}</li>)}</ul>

      <h3>Proxy Generator</h3>
      <div className="grid">
        <label>Name<input className="ccc-input" value={state.newProxy.name} onChange={(e) => dispatch({ type: 'setNewProxyField', field: 'name', value: e.target.value })} /></label>
        <label>Rate<input className="ccc-input" value={state.newProxy.ratePerCamel} onChange={(e) => dispatch({ type: 'setNewProxyField', field: 'ratePerCamel', value: e.target.value })} /></label>
        <label>Category<input className="ccc-input" value={state.newProxy.category} onChange={(e) => dispatch({ type: 'setNewProxyField', field: 'category', value: e.target.value })} placeholder="e.g. livestock" /></label>
      </div>
      <label>Description<textarea className="ccc-input" value={state.newProxy.description} onChange={(e) => dispatch({ type: 'setNewProxyField', field: 'description', value: e.target.value })} /></label>
      <button onClick={saveProxy}>Add custom proxy</button>
      {state.newProxy.success && <p className="result">{state.newProxy.success}</p>}
      <ErrorMessage message={state.newProxy.error} statute="Statute 5" />
    </section>
  );
}

function ArchiveView({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  return (
    <section className="view-card ccc-card">
      <h2>Archive</h2>
      <button onClick={() => dispatch({ type: 'setRootTab', value: 'flow' })}>Back to flow</button>
      <ul className="list">{state.history.map((entry) => <li key={entry.id}>{entry.summary} · {entry.camelValue} camels · {formatRelativeAge(entry.createdAt)}</li>)}</ul>
      <button onClick={() => { writeBidHistory([]); writeDocketReadIds([]); dispatch({ type: 'setHistory', value: [] }); dispatch({ type: 'setDocketReadIds', value: [] }); }}>Clear archive</button>
    </section>
  );
}

function ToolsDrawer({ state, dispatch, themeMode, setThemeMode }: { state: State; dispatch: Dispatch<Action>; themeMode: 'light' | 'dark' | 'system'; setThemeMode: (value: 'light' | 'dark' | 'system') => void }) {
  const filtered = useMemo(() => filterReferenceProxies(state.mergedProxies, state.referenceFilters), [state.mergedProxies, state.referenceFilters]);
  return (
    <>
      <aside className={state.toolsOpen ? 'tools open desktop-tools' : 'tools desktop-tools'}>
        <h3>Tools</h3>
        <details open className="tools-panel">
          <summary>Navigation</summary>
          <button onClick={() => dispatch({ type: 'setRootTab', value: 'flow' })}>Courtship Flow</button>
          <button onClick={() => dispatch({ type: 'setRootTab', value: 'library' })}>Library</button>
          <button onClick={() => dispatch({ type: 'setRootTab', value: 'archive' })}>Archive</button>
          <button onClick={() => dispatch({ type: 'setRootTab', value: 'premium' })}>Premium</button>
        </details>
        <details className="tools-panel">
          <summary>Side Quests</summary>
          <p className="helper">Optional modules now open from Phase 4 docket cards.</p>
          <button onClick={() => { dispatch({ type: 'setRootTab', value: 'flow' }); dispatch({ type: 'setFlowStep', value: 'card6-queue' }); }}>Go to Phase 4 modules</button>
        </details>
        <details className="tools-panel">
          <summary>Theme</summary>
          <label>Display mode
            <select className="ccc-input" value={themeMode} onChange={(e) => setThemeMode(e.target.value as 'light' | 'dark' | 'system')}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </details>
        <details className="tools-panel">
          <summary>Accessibility</summary>
          <label><input type="checkbox" checked={state.customizer.reducedMotion} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'reducedMotion', value: e.target.checked })} /> Reduced motion</label>
          <label><input type="checkbox" checked={state.customizer.highContrast} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'highContrast', value: e.target.checked })} /> High contrast</label>
          <label><input type="checkbox" checked={state.customizer.soundOn} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'soundOn', value: e.target.checked })} /> Sound on</label>
          <label><input type="checkbox" checked={state.showLoadingFacts} onChange={(e) => dispatch({ type: 'setShowLoadingFacts', value: e.target.checked })} /> Loading fact rotator</label>
        </details>
        <details className="tools-panel">
          <summary>Library snapshot ({filtered.length})</summary>
          <p className="helper">Use Library tab from this drawer for full search and generator.</p>
        </details>
      </aside>
      <section className={state.toolsOpen ? 'tools open mobile-tools' : 'tools mobile-tools'}>
        <h3>Tools</h3>
      </section>
    </>
  );
}

function AppShell() {
  const location = useLocation();
  const { form, queue } = useDowryForm();
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const [draftSaved, setDraftSaved] = useState(true);
  const [showDisclaimerToast, setShowDisclaimerToast] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    const stored = globalThis.localStorage?.getItem('icea-theme-mode');
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });

  const legalPage = {
    '/fine-print': { title: 'Fine Print', summary: 'All obligations are subject to weather, whim, and committee interpretation.' },
    '/privacy-theater': { title: 'Privacy Theater', summary: 'We theatrically whisper your bid to no one in particular behind velvet curtains.' },
    '/terms-of-camelage': { title: 'Terms of Camelage', summary: 'By proceeding, you agree that camels may be represented by metaphor, proxy, or interpretive dance.' },
  }[location.pathname];

  useEffect(() => {
    writeCustomizerSettings({ locationKey: state.customizer.locationKey, manualMultiplier: Number(state.customizer.manualMultiplier), language: state.customizer.language });
  }, [state.customizer.locationKey, state.customizer.manualMultiplier, state.customizer.language]);

  useEffect(() => {
    const alreadyDismissed = Boolean(globalThis.localStorage?.getItem(uxCopy.disclaimer.key));
    const alreadyShownThisSession = Boolean(globalThis.sessionStorage?.getItem(uxCopy.disclaimer.sessionKey));
    if (alreadyDismissed || alreadyShownThisSession) return;
    setShowDisclaimerToast(true);
    globalThis.sessionStorage?.setItem(uxCopy.disclaimer.sessionKey, '1');
  }, []);


  useEffect(() => {
    globalThis.localStorage?.setItem('icea-theme-mode', themeMode);
    const prefersDark = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const resolved = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
    document.documentElement.setAttribute('data-theme', resolved);
  }, [themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('reduced-motion-enabled', state.customizer.reducedMotion);
    root.classList.toggle('high-contrast-enabled', state.customizer.highContrast);
    return () => {
      root.classList.remove('reduced-motion-enabled');
      root.classList.remove('high-contrast-enabled');
    };
  }, [state.customizer.reducedMotion, state.customizer.highContrast]);

  useEffect(() => {
    setDraftSaved(false);
    const timeoutId = globalThis.setTimeout(() => {
      globalThis.localStorage?.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify({
        flowStep: state.flowStep,
        guidedMode: state.guidedMode,
        chaosMode: state.chaosMode,
        calcInput: { rawBid: state.calcInput.rawBid, amount: state.calcInput.amount, unit: state.calcInput.unit, proxyId: state.calcInput.proxyId },
        dowryForm: form,
        queue,
      }));
      setDraftSaved(true);
    }, 350);
    return () => globalThis.clearTimeout(timeoutId);
  }, [state.flowStep, state.guidedMode, state.chaosMode, state.calcInput, form, queue]);

  return (
    <main className={`app-shell ccc-app ${state.chaosMode ? 'chaos-mode' : ''}`}>
      <FixedShellHeader state={state} dispatch={dispatch} draftSaved={draftSaved} />

      {showDisclaimerToast && (
        <section className="shell-disclaimer shell-toast" role="status" aria-live="polite" aria-label="Playful disclaimer">
          <p>{uxCopy.disclaimer.text}</p>
          <button onClick={() => {
            setShowDisclaimerToast(false);
            globalThis.localStorage?.setItem(uxCopy.disclaimer.key, '1');
          }}>
            {uxCopy.disclaimer.dismissCta}
          </button>
          <p className="helper">{uxCopy.disclaimer.footnote}</p>
        </section>
      )}

      {state.showWelcome && (
        <section className="view-card ccc-card overlay">
          <h2>Convert camel bids into equivalents.</h2>
          <button className="ccc-button-primary cta-primary" onClick={() => { dispatch({ type: 'setShowWelcome', value: false }); dispatch({ type: 'setRootTab', value: 'flow' }); globalThis.localStorage?.setItem('ccc-welcome-dismissed', '1'); }}>Start a calculation</button>
          <button onClick={() => { dispatch({ type: 'setShowWelcome', value: false }); dispatch({ type: 'setRootTab', value: 'library' }); globalThis.localStorage?.setItem('ccc-welcome-dismissed', '1'); }}>Browse the Library</button>
          <label><input type="checkbox" checked={state.guidedMode} onChange={(e) => dispatch({ type: 'setGuidedMode', value: e.target.checked })} /> Guided mode</label>
          <label><input type="checkbox" checked={state.chaosMode} onChange={(e) => dispatch({ type: 'setChaosMode', value: e.target.checked })} /> Chaos mode</label>
        </section>
      )}

      {legalPage && <LegalPlaceholderPage title={legalPage.title} summary={legalPage.summary} />}
      {!legalPage && state.activeRootTab === 'flow' && <FlowView state={state} dispatch={dispatch} draftSaved={draftSaved} />}
      {!legalPage && state.activeRootTab === 'library' && <LibraryView state={state} dispatch={dispatch} />}
      {!legalPage && state.activeRootTab === 'archive' && <ArchiveView state={state} dispatch={dispatch} />}
      {!legalPage && state.activeRootTab === 'premium' && <section className="view-card ccc-card"><h2>Premium</h2><button onClick={() => dispatch({ type: 'setRootTab', value: 'flow' })}>Back to flow</button><p>Negotiate this bid (premium feature placeholder).</p><p>69/year with local premium flag.</p></section>}

      <footer className="legal-footer">
        <p>{uxCopy.legal.footerLabel}</p>
        <div>
          {uxCopy.legal.links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
        </div>
        <details className="legal-footer-mobile-note">
          <summary>{uxCopy.legal.mobileFootnoteSummary}</summary>
          <p className="helper">{uxCopy.legal.mobileFootnote}</p>
        </details>
      </footer>

      <ToolsDrawer state={state} dispatch={dispatch} themeMode={themeMode} setThemeMode={setThemeMode} />
    </main>
  );
}

export function App() {
  return (
    <DowryFormProvider>
      <AppShell />
    </DowryFormProvider>
  );
}
const Phase1Input = lazy(async () => import('./phases/Phase1Input').then((module) => ({ default: module.Phase1Input })));
const Phase2Adjudication = lazy(async () => import('./phases/Phase2Adjudication').then((module) => ({ default: module.Phase2Adjudication })));
const Phase3Instrument = lazy(async () => import('./phases/Phase3Instrument').then((module) => ({ default: module.Phase3Instrument })));
const Phase4Docket = lazy(async () => import('./phases/Phase4Docket').then((module) => ({ default: module.Phase4Docket })));
