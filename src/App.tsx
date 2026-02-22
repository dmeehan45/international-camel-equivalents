import { useEffect, useMemo, useReducer, useState, type Dispatch } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { listTemplates, generateFormalizedMessage } from './core/formalizer.js';
import { buildSharePayload } from './core/share-export.js';
import { buildQrPayload } from './core/share-qr.js';
import { buildHtmlExportDocument, buildImageExportDataUrl, buildPdfExportBlob } from './core/export-artifacts.js';
import { readCustomizerSettings, resolveCamelMultiplier, writeCustomizerSettings } from './core/customizer-settings.js';
import { createHistoryEntry, formatRelativeAge, readBidHistory, writeBidHistory } from './core/history-archive.js';
import { parseBidInput } from './core/bid-parser.js';
import { calculateAdjudicatedCamelValue } from './core/adjudication.js';
import type { CalculationResult, ProxyDefinition } from './domain/types';
import { Phase1Input } from './phases/Phase1Input';
import { Phase2Adjudication } from './phases/Phase2Adjudication';
import { Phase3Instrument } from './phases/Phase3Instrument';
import { Phase4Docket } from './phases/Phase4Docket';
import { DowryFormProvider, useDowryForm, WORKFLOW_STORAGE_KEY } from './store/DowryFormContext';
import { uxCopy } from './content/uxCopy';

type FlowStep = 'phase1-input' | 'phase2-adjudication' | 'phase3-instrument' | 'phase4-docket';
type TopTab = 'top' | 'all' | 'compare';
type RootTab = 'flow' | 'library' | 'archive' | 'premium';

type State = {
  referenceProxies: ProxyDefinition[];
  extensionProxies: ProxyDefinition[];
  mergedProxies: ProxyDefinition[];
  activeRootTab: RootTab;
  flowStep: FlowStep;
  showWelcome: boolean;
  guidedMode: boolean;
  chaosMode: boolean;
  toolsOpen: boolean;
  celebrateOpen: boolean;
  sideQuest: string;
  calcInput: { rawBid: string; amount: string; unit: 'CAMEL' | 'PROXY'; proxyId: string; parseNote: string; parseSource: string };
  dashboardQuery: string;
  dashboardSort: 'quantity-desc' | 'quantity-asc' | 'name-asc' | 'name-desc';
  topTab: TopTab;
  calculation: CalculationResult | null;
  error: string;
  customizer: { locationKey: string; manualMultiplier: string; language: string; reducedMotion: boolean; highContrast: boolean; soundOn: boolean };
  referenceFilters: { query: string; category: string; source: 'all' | 'reference' | 'extension' };
  compare: { amount: string; fromProxyId: string; toProxyId: string; result: string; error: string };
  compareSelected: string[];
  newProxy: { name: string; ratePerCamel: string; category: string; description: string; error: string; success: string };
  formalizer: { template: string; message: string; error: string };
  share: { selectedProxyId: string; text: string; qrPreview: string; error: string };
  history: Array<{ id: string; createdAt: string; amount: number; unit: string; camelValue: number; summary: string }>;
};

type Action =
  | { type: 'setRootTab'; value: RootTab }
  | { type: 'setFlowStep'; value: FlowStep }
  | { type: 'toggleTools' }
  | { type: 'setSideQuest'; value: string }
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
  | { type: 'setReferenceFilter'; field: keyof State['referenceFilters']; value: string }
  | { type: 'setCompareField'; field: keyof State['compare']; value: string }
  | { type: 'toggleCompareSelected'; proxyId: string }
  | { type: 'setNewProxyField'; field: keyof State['newProxy']; value: string }
  | { type: 'setFormalizerField'; field: keyof State['formalizer']; value: string }
  | { type: 'setShare'; text: string; selectedProxyId: string; qrPreview: string; error: string }
  | { type: 'setHistory'; value: State['history'] };

const referenceProxies = proxiesData as ProxyDefinition[];
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
    flowStep: draft?.flowStep ?? 'phase1-input',
    showWelcome: !globalThis.localStorage?.getItem('ccc-welcome-dismissed'),
    guidedMode: draft?.guidedMode ?? true,
    chaosMode: draft?.chaosMode ?? false,
    toolsOpen: false,
    celebrateOpen: false,
    sideQuest: '',
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
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setRootTab': return { ...state, activeRootTab: action.value };
    case 'setFlowStep': return { ...state, flowStep: action.value };
    case 'toggleTools': return { ...state, toolsOpen: !state.toolsOpen };
    case 'setSideQuest': return { ...state, sideQuest: action.value };
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
    dispatch({ type: 'setFlowStep', value: 'phase2-adjudication' });
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

function Stepper({ step, onChange, canNavigateTo }: { step: FlowStep; onChange: (step: FlowStep) => void; canNavigateTo: (step: FlowStep) => boolean }) {
  const steps: FlowStep[] = ['phase1-input', 'phase2-adjudication', 'phase3-instrument', 'phase4-docket'];
  const labels: Record<FlowStep, string> = {
    'phase1-input': 'Petition Intake',
    'phase2-adjudication': 'Valuation Hearing',
    'phase3-instrument': 'Instrument Drafting',
    'phase4-docket': 'Archival Seal',
  };
  const currentIndex = steps.indexOf(step);
  const previousStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;

  return (
    <div className="stepper-wrap">
      <div className="stepper" aria-label="Workflow phases">
        {steps.map((item, index) => {
          const status = index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming';
          return (
            <div key={item} className="stepper-item">
              <button className={step === item ? 'step active' : 'step'} onClick={() => onChange(item)} disabled={!canNavigateTo(item)} aria-current={status === 'current' ? 'step' : undefined}><span>{labels[item]}</span></button>
              {index < steps.length - 1 && <span className="step-arrow" aria-hidden="true">→</span>}
            </div>
          );
        })}
      </div>
      <div className="stepper-nav">
        <button onClick={() => previousStep && onChange(previousStep)} disabled={!previousStep}>← Back</button>
        <button onClick={() => nextStep && onChange(nextStep)} disabled={!nextStep || !canNavigateTo(nextStep)}>Next →</button>
      </div>
    </div>
  );
}

function FlowView({ state, dispatch, draftSaved }: { state: State; dispatch: Dispatch<Action>; draftSaved: boolean }) {
  const { form, dispatchForm, canCalculateIce, minCamelQuantity, maxCamelQuantity, clampCamelQuantity, queue } = useDowryForm();
  const flowSteps: FlowStep[] = ['phase1-input', 'phase2-adjudication', 'phase3-instrument', 'phase4-docket'];
  const navigate = useNavigate();
  const location = useLocation();
  const phasePathMap: Record<FlowStep, string> = { 'phase1-input': '/phase1', 'phase2-adjudication': '/phase2', 'phase3-instrument': '/phase3', 'phase4-docket': '/phase4' };
  const pathPhaseMap: Record<string, FlowStep> = { '/phase1': 'phase1-input', '/phase2': 'phase2-adjudication', '/phase3': 'phase3-instrument', '/phase4': 'phase4-docket' };
  const [scanActionsOpen, setScanActionsOpen] = useState(false);
  const [resultsFiltersOpen, setResultsFiltersOpen] = useState(false);
  const [exportTab, setExportTab] = useState<'text' | 'image' | 'pdf' | 'html'>('text');
  const [exportToast, setExportToast] = useState('');
  const [fiatTraitsEnabled, setFiatTraitsEnabled] = useState(true);
  const [lockedRecommendation, setLockedRecommendation] = useState<ReturnType<typeof computeRecommendation> | null>(null);

  function runStepOneCalculation() {
    if (!canCalculateIce) return;
    setLockedRecommendation(null);
    const guardedQuantity = clampCamelQuantity(form.camelQuantity);
    if (guardedQuantity !== form.camelQuantity) dispatchForm({ type: 'setField', field: 'camelQuantity', value: guardedQuantity });
    dispatch({ type: 'setCalcField', field: 'rawBid', value: `${guardedQuantity} camels` });
    runCalculation(state, dispatch);
  }

  function canOpenFlowStep(target: FlowStep) {
    const currentIndex = flowSteps.indexOf(state.flowStep);
    const targetIndex = flowSteps.indexOf(target);
    if (targetIndex <= currentIndex) return true;
    if (target === 'phase2-adjudication') return Boolean(state.calculation);
    if (target === 'phase3-instrument') return Boolean(state.calculation);
    if (target === 'phase4-docket') return Boolean(state.share.text || state.formalizer.message);
    return false;
  }

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
      const message = generateFormalizedMessage({ template: state.formalizer.template, camelValue: state.calculation.camelValue, proxyQuantity: top.quantity, proxyName: top.proxyName });
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
    };
    return {
      payload,
      qr,
      imageDataUrl: buildImageExportDataUrl(exportInput),
      pdfBlob: buildPdfExportBlob(exportInput),
      htmlDocument: buildHtmlExportDocument(exportInput),
    };
  }

  async function runExportAction(action: 'copy' | 'download' | 'share') {
    try {
      const { payload, qr, imageDataUrl, pdfBlob, htmlDocument } = buildExportArtifacts();
      dispatch({ type: 'setShare', text: payload.shareText, selectedProxyId: payload.selectedProxy.proxyId, qrPreview: qr.preview, error: '' });
      if (action === 'copy') {
        const copyValue = exportTab === 'text' ? payload.shareText : exportTab === 'image' ? imageDataUrl : exportTab === 'html' ? htmlDocument : payload.shareText;
        await navigator.clipboard.writeText(copyValue);
      }

      if (action === 'download') {
        const href = exportTab === 'image'
          ? imageDataUrl
          : URL.createObjectURL(exportTab === 'pdf' ? pdfBlob : new Blob([exportTab === 'html' ? htmlDocument : payload.shareText], { type: exportTab === 'html' ? 'text/html' : 'text/plain' }));
        const ext = exportTab === 'text' ? 'txt' : exportTab;
        const link = document.createElement('a');
        link.href = href;
        link.download = `camel-export.${ext}`;
        link.click();
        if (exportTab !== 'image') URL.revokeObjectURL(href);
      }

      if (action === 'share') {
        if (!navigator.share) throw new Error('Native share is not available in this browser.');
        await navigator.share({ text: payload.shareText, title: 'Camel Courtship Calculator' });
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

      const actionLabel = action === 'copy' ? 'Copied' : action === 'download' ? 'Downloaded' : 'Shared';
      setExportToast(`${actionLabel} ${exportTab.toUpperCase()} export.`);
    } catch (error) {
      dispatch({ type: 'setShare', text: '', selectedProxyId: '', qrPreview: '', error: error instanceof Error ? error.message : uxCopy.errors.exportFailed });
      setExportToast('');
    }
  }

  function saveEntry() {
    try {
      if (!state.calculation) throw new Error('Run a calculation before archiving.');
      const entry = createHistoryEntry({ amount: Number(state.calcInput.amount), unit: state.calcInput.unit, camelValue: state.calculation.camelValue, summary: state.share.text || state.formalizer.message || 'Camel bid summary' });
      const next = [entry, ...state.history];
      writeBidHistory(next);
      dispatch({ type: 'setHistory', value: next });
    } catch (error) {
      dispatch({ type: 'setError', value: error instanceof Error ? error.message : uxCopy.errors.archiveFailed });
    }
  }

  function finalizeBid() {
    if (!recommendation) return;
    setLockedRecommendation(recommendation);
    dispatch({ type: 'setCalculation', value: recommendation.adjustedCalculation });
    dispatch({ type: 'setFormalizerField', field: 'message', value: '' });
    dispatch({ type: 'setShare', text: '', selectedProxyId: recommendation.adjustedCalculation.equivalents[0]?.proxyId ?? '', qrPreview: '', error: '' });
    dispatch({ type: 'setFlowStep', value: 'phase3-instrument' });
  }


  useEffect(() => {
    const fromPath = pathPhaseMap[location.pathname];
    if (!fromPath) {
      navigate(phasePathMap[state.flowStep], { replace: true });
      return;
    }
    if (fromPath !== state.flowStep) {
      if (canOpenFlowStep(fromPath)) dispatch({ type: 'setFlowStep', value: fromPath });
      else navigate(phasePathMap[state.flowStep], { replace: true });
    }
  }, [location.pathname, state.flowStep]);

  useEffect(() => {
    const expectedPath = phasePathMap[state.flowStep];
    if (location.pathname !== expectedPath) navigate(expectedPath, { replace: true });
  }, [state.flowStep, location.pathname]);

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
      <Stepper step={state.flowStep} onChange={(value) => { if (canOpenFlowStep(value)) { dispatch({ type: 'setFlowStep', value }); navigate(phasePathMap[value]); } }} canNavigateTo={canOpenFlowStep} />
      <div className="sticky-chip">Bid summary: {state.calcInput.rawBid} · {draftSaved ? 'Saved' : 'Saving…'}</div>
      <div className="helper">Queued shares: {queue.length}</div>

      {state.flowStep === 'phase1-input' && (
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
      )}

      {state.flowStep === 'phase2-adjudication' && (
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
      )}

      {state.flowStep === 'phase3-instrument' && (
        <Phase3Instrument
          state={state}
          exportTab={exportTab}
          setExportTab={setExportTab}
          generateMessage={generateMessage}
          runExportAction={runExportAction}
          exportToast={exportToast}
          dispatch={dispatch}
          templates={listTemplates()}
        />
      )}

      {state.flowStep === 'phase4-docket' && (
        <Phase4Docket calculation={state.calculation} shareText={state.share.text || state.formalizer.message} exportToast={exportToast} onSaveEntry={saveEntry} />
      )}

      {state.error && <p className="error">{state.error}</p>}
      {state.calcInput.parseNote && <p className="error">{state.calcInput.parseNote}</p>}

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
      {state.newProxy.error && <p className="error">{state.newProxy.error}</p>}
    </section>
  );
}

function ArchiveView({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  return (
    <section className="view-card ccc-card">
      <h2>Archive</h2>
      <button onClick={() => dispatch({ type: 'setRootTab', value: 'flow' })}>Back to flow</button>
      <ul className="list">{state.history.map((entry) => <li key={entry.id}>{entry.summary} · {entry.camelValue} camels · {formatRelativeAge(entry.createdAt)}</li>)}</ul>
      <button onClick={() => { writeBidHistory([]); dispatch({ type: 'setHistory', value: [] }); }}>Clear archive</button>
    </section>
  );
}

function ToolsDrawer({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const filtered = useMemo(() => filterReferenceProxies(state.mergedProxies, state.referenceFilters), [state.mergedProxies, state.referenceFilters]);
  const sideQuestReady = state.flowStep === 'phase3-instrument' || state.flowStep === 'phase4-docket';
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
          {!sideQuestReady && <p className="helper">Unlocks after you finalize and generate a message.</p>}
          {sideQuestReady && <div className="stepper side-quests">{['Personality Quiz', 'Bargaining Mini-Game', 'Maiden Mood Simulator', 'Proxy Parade'].map((item) => <button key={item} className="step" onClick={() => dispatch({ type: 'setSideQuest', value: item })}>{item}</button>)}</div>}
          {sideQuestReady && state.sideQuest && <p className="result">{state.sideQuest} opened as overlay (placeholder).</p>}
        </details>
        <details className="tools-panel">
          <summary>Accessibility</summary>
          <label><input type="checkbox" checked={state.customizer.reducedMotion} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'reducedMotion', value: e.target.checked })} /> Reduced motion</label>
          <label><input type="checkbox" checked={state.customizer.highContrast} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'highContrast', value: e.target.checked })} /> High contrast</label>
          <label><input type="checkbox" checked={state.customizer.soundOn} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'soundOn', value: e.target.checked })} /> Sound on</label>
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
  const { form, queue } = useDowryForm();
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const [draftSaved, setDraftSaved] = useState(true);

  useEffect(() => {
    writeCustomizerSettings({ locationKey: state.customizer.locationKey, manualMultiplier: Number(state.customizer.manualMultiplier), language: state.customizer.language });
  }, [state.customizer.locationKey, state.customizer.manualMultiplier, state.customizer.language]);

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
      <header className="header-row">
        <div>
          <h1>International Camel Equivalents</h1>
          <p>Courtship workflow experience</p>
          <p className="helper">Autosave: {draftSaved ? 'All changes saved' : 'Saving changes…'}</p>
        </div>
        <div>
          <button onClick={() => dispatch({ type: 'toggleTools' })}>Tools</button>
        </div>
      </header>

      {state.showWelcome && (
        <section className="view-card ccc-card overlay">
          <h2>Convert camel bids into equivalents.</h2>
          <button className="ccc-button-primary cta-primary" onClick={() => { dispatch({ type: 'setShowWelcome', value: false }); dispatch({ type: 'setRootTab', value: 'flow' }); globalThis.localStorage?.setItem('ccc-welcome-dismissed', '1'); }}>Start a calculation</button>
          <button onClick={() => { dispatch({ type: 'setShowWelcome', value: false }); dispatch({ type: 'setRootTab', value: 'library' }); globalThis.localStorage?.setItem('ccc-welcome-dismissed', '1'); }}>Browse the Library</button>
          <label><input type="checkbox" checked={state.guidedMode} onChange={(e) => dispatch({ type: 'setGuidedMode', value: e.target.checked })} /> Guided mode</label>
          <label><input type="checkbox" checked={state.chaosMode} onChange={(e) => dispatch({ type: 'setChaosMode', value: e.target.checked })} /> Chaos mode</label>
        </section>
      )}

      {state.activeRootTab === 'flow' && <FlowView state={state} dispatch={dispatch} draftSaved={draftSaved} />}
      {state.activeRootTab === 'library' && <LibraryView state={state} dispatch={dispatch} />}
      {state.activeRootTab === 'archive' && <ArchiveView state={state} dispatch={dispatch} />}
      {state.activeRootTab === 'premium' && <section className="view-card ccc-card"><h2>Premium</h2><button onClick={() => dispatch({ type: 'setRootTab', value: 'flow' })}>Back to flow</button><p>Negotiate this bid (premium feature placeholder).</p><p>69/year with local premium flag.</p></section>}

      <ToolsDrawer state={state} dispatch={dispatch} />
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
