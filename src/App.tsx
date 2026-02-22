import { useEffect, useMemo, useReducer, useState, type Dispatch } from 'react';
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
import { locationPresets, readCustomizerSettings, resolveCamelMultiplier, writeCustomizerSettings } from './core/customizer-settings.js';
import { createHistoryEntry, formatRelativeAge, readBidHistory, writeBidHistory } from './core/history-archive.js';
import { parseBidInput } from './core/bid-parser.js';
import type { CalculationResult, ProxyDefinition } from './domain/types';

type FlowStep = 'bid' | 'context' | 'results' | 'message' | 'share';
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
const DRAFT_KEY = 'ccc-workflow-draft-v1';

function readDraft() {
  try {
    const raw = globalThis.localStorage?.getItem(DRAFT_KEY);
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
    flowStep: draft?.flowStep ?? 'bid',
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
    const reason = parsed.reason ?? "I couldn't parse that. Try '2 camels' or '5 yaks'.";
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
    dispatch({ type: 'setError', value: `Couldn't map "${parsed.proxyName}" to a known proxy.` });
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
    dispatch({ type: 'setFlowStep', value: 'context' });
  } catch (error) {
    dispatch({ type: 'setError', value: error instanceof Error ? error.message : 'Calculation failed.' });
  }
}

function Stepper({ step, onChange, canNavigateTo }: { step: FlowStep; onChange: (step: FlowStep) => void; canNavigateTo: (step: FlowStep) => boolean }) {
  const steps: FlowStep[] = ['bid', 'context', 'results', 'message', 'share'];
  const labels: Record<FlowStep, string> = {
    bid: 'Bid',
    context: 'Context',
    results: 'Results',
    message: 'Message',
    share: 'Share',
  };
  const currentIndex = steps.indexOf(step);
  const previousStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;

  return (
    <div className="stepper-wrap">
      <div className="stepper" aria-label="Workflow steps">
        {steps.map((item, index) => {
          const status = index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming';
          return (
            <div key={item} className="stepper-item">
              <button
                className={step === item ? 'step active' : 'step'}
                onClick={() => onChange(item)}
                disabled={!canNavigateTo(item)}
                aria-current={status === 'current' ? 'step' : undefined}
              >
                <span>{labels[item]}</span>
              </button>
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
  const flowSteps: FlowStep[] = ['bid', 'context', 'results', 'message', 'share'];
  const [scanActionsOpen, setScanActionsOpen] = useState(false);
  const [resultsFiltersOpen, setResultsFiltersOpen] = useState(false);
  const [exportTab, setExportTab] = useState<'text' | 'image' | 'pdf' | 'html'>('text');
  const [exportToast, setExportToast] = useState('');
  const [bidName, setBidName] = useState('');
  const [bidRegion, setBidRegion] = useState('');
  const [camelQuantity, setCamelQuantity] = useState(10);
  const [isWarrior, setIsWarrior] = useState(false);
  const [hobby, setHobby] = useState('');
  const [courtshipYears, setCourtshipYears] = useState(0);
  const [hasArtifact, setHasArtifact] = useState(false);
  const [quirks, setQuirks] = useState('');

  const minCamelQuantity = 1;
  const maxCamelQuantity = 200;
  const canCalculateIce = Boolean(bidName.trim() && bidRegion.trim());

  function clampCamelQuantity(value: number) {
    return Math.min(maxCamelQuantity, Math.max(minCamelQuantity, value));
  }

  function runStepOneCalculation() {
    if (!canCalculateIce) return;
    const guardedQuantity = clampCamelQuantity(camelQuantity);
    if (guardedQuantity !== camelQuantity) setCamelQuantity(guardedQuantity);
    dispatch({ type: 'setCalcField', field: 'rawBid', value: `${guardedQuantity} camels` });
    runCalculation(state, dispatch);
  }

  function canOpenFlowStep(target: FlowStep) {
    const currentIndex = flowSteps.indexOf(state.flowStep);
    const targetIndex = flowSteps.indexOf(target);
    if (targetIndex <= currentIndex) return true;
    if (target === 'context') return Boolean(state.calculation);
    if (target === 'results') return Boolean(state.calculation);
    if (target === 'message') return Boolean(state.calculation);
    if (target === 'share') return Boolean(state.formalizer.message || state.calculation);
    return false;
  }

  const visibleEquivalents = useMemo(() => {
    if (!state.calculation) return [];
    return applyDashboardView(state.calculation.equivalents, { query: state.dashboardQuery, sort: state.dashboardSort });
  }, [state.calculation, state.dashboardQuery, state.dashboardSort]);

  const topPicks = useMemo(() => visibleEquivalents.slice(0, 12), [visibleEquivalents]);
  const effectiveMultiplier = resolveCamelMultiplier({ locationKey: state.customizer.locationKey, manualMultiplier: Number(state.customizer.manualMultiplier) });
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
      dispatch({ type: 'setCompareField', field: 'error', value: error instanceof Error ? error.message : 'Compare failed.' });
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
      dispatch({ type: 'setFormalizerField', field: 'error', value: error instanceof Error ? error.message : 'Failed to generate message.' });
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

      const actionLabel = action === 'copy' ? 'Copied' : action === 'download' ? 'Downloaded' : 'Shared';
      setExportToast(`${actionLabel} ${exportTab.toUpperCase()} export.`);
    } catch (error) {
      dispatch({ type: 'setShare', text: '', selectedProxyId: '', qrPreview: '', error: error instanceof Error ? error.message : 'Export failed.' });
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
      dispatch({ type: 'setError', value: error instanceof Error ? error.message : 'Unable to archive entry.' });
    }
  }

  return (
    <section className="view-card ccc-card flow-surface">
      <Stepper step={state.flowStep} onChange={(value) => dispatch({ type: 'setFlowStep', value })} canNavigateTo={canOpenFlowStep} />
      <div className="sticky-chip">Bid summary: {state.calcInput.rawBid} · {draftSaved ? 'Saved' : 'Saving…'}</div>

      {state.flowStep === 'bid' && (
        <>
          <h2>Step 1: Enter camel bid</h2>
          <div className="grid">
            <label>Name<input className="ccc-input" value={bidName} onChange={(e) => setBidName(e.target.value)} placeholder="e.g. Layla" /></label>
            <label>Region<select className="ccc-input" value={bidRegion} onChange={(e) => setBidRegion(e.target.value)}><option value="">Choose region</option>{Object.entries(locationPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}</select></label>
          </div>
          <label>Camel quantity: {camelQuantity}
            <input
              className="ccc-input"
              type="range"
              min={minCamelQuantity}
              max={maxCamelQuantity}
              value={camelQuantity}
              onChange={(e) => setCamelQuantity(clampCamelQuantity(Number(e.target.value)))}
            />
          </label>
          <p className="helper">Set the primary camel quantity, then calculate ICE. Guardrails keep the value between {minCamelQuantity} and {maxCamelQuantity} camels.</p>

          <div className="context-cards">
            <details className="context-card">
              <summary>Warrior status (optional)</summary>
              <label><input type="checkbox" checked={isWarrior} onChange={(e) => setIsWarrior(e.target.checked)} /> Includes warrior context</label>
            </details>
            <details className="context-card">
              <summary>Hobby (optional)</summary>
              <label>Hobby<input className="ccc-input" value={hobby} onChange={(e) => setHobby(e.target.value)} placeholder="e.g. falconry" /></label>
            </details>
            <details className="context-card">
              <summary>Courtship length (optional)</summary>
              <label>Courtship years<input className="ccc-input" type="number" min="0" max="50" value={courtshipYears} onChange={(e) => setCourtshipYears(Math.min(50, Math.max(0, Number(e.target.value) || 0)))} /></label>
            </details>
            <details className="context-card">
              <summary>Artifact included (optional)</summary>
              <label><input type="checkbox" checked={hasArtifact} onChange={(e) => setHasArtifact(e.target.checked)} /> Includes ceremonial artifact</label>
            </details>
            <details className="context-card">
              <summary>Quirks (optional)</summary>
              <label>Quirks<textarea className="ccc-input" value={quirks} onChange={(e) => setQuirks(e.target.value)} placeholder="Add any notable details" /></label>
            </details>
          </div>

          <button className="ccc-button-primary cta-primary" onClick={runStepOneCalculation} disabled={!canCalculateIce}>Calculate ICE</button>
          <button className="cta-secondary" type="button" onClick={() => { setCamelQuantity(10); setIsWarrior(false); setHobby(''); setCourtshipYears(0); setHasArtifact(false); setQuirks(''); }}>Reset optional details</button>
          {state.calcInput.parseSource && <p className="result">{state.calcInput.parseSource}</p>}
        </>
      )}

      {state.flowStep === 'context' && (
        <>
          <h2>Step 2: Context</h2>
          <div className="context-cards">
            <details className="context-card" open>
              <summary>Region &amp; customs · {effectiveMultiplier.toFixed(2)}x</summary>
              <div className="grid">
                <label>Preset<select value={state.customizer.locationKey} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'locationKey', value: e.target.value })}>{Object.entries(locationPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}</select></label>
                <label>Manual multiplier<select value={state.customizer.manualMultiplier} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'manualMultiplier', value: e.target.value })}><option value="0.8">0.8</option><option value="1">1.0</option><option value="1.2">1.2</option></select></label>
              </div>
            </details>

            <details className="context-card">
              <summary>Language · {state.customizer.language.toUpperCase()}</summary>
              <label>Language<select value={state.customizer.language} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'language', value: e.target.value })}><option value="en">English</option><option value="ar">Arabic</option><option value="fr">French</option></select></label>
              <p className="helper">{languagePreview[state.customizer.language] ?? languagePreview.en}</p>
            </details>

            <details className="context-card">
              <summary>Scan object to add proxy (optional)</summary>
              <p className="helper">Permission only when you tap scan. Fallbacks: upload photo or manual add.</p>
              {!scanActionsOpen && <button type="button" onClick={() => setScanActionsOpen(true)}>Start scan options</button>}
              {scanActionsOpen && (
                <div className="stepper">
                  <button type="button">Scan now</button>
                  <button type="button">Upload photo</button>
                  <button type="button">Manual add</button>
                  <button type="button" onClick={() => setScanActionsOpen(false)}>Close</button>
                </div>
              )}
            </details>
          </div>
          <button className="ccc-button-primary cta-primary" onClick={() => dispatch({ type: 'setFlowStep', value: 'results' })}>Continue to Results</button>
        </>
      )}

      {state.flowStep === 'results' && (
        <>
          <h2>Step 3: Results</h2>
          {state.calculation ? <p className="hero">{state.calculation.camelValue.toFixed(2)} camels</p> : <p>Run a bid to see results.</p>}
          <p className="helper">Detection: {state.calcInput.rawBid} · Affects message/export: templates and share format only.</p>

          <div className="stepper">
            <button className={state.topTab === 'top' ? 'step active' : 'step'} onClick={() => dispatch({ type: 'setTopTab', value: 'top' })}>Top picks</button>
            <button className={state.topTab === 'all' ? 'step active' : 'step'} onClick={() => dispatch({ type: 'setTopTab', value: 'all' })}>All</button>
            <button className={state.topTab === 'compare' ? 'step active' : 'step'} onClick={() => dispatch({ type: 'setTopTab', value: 'compare' })}>Compare</button>
            <button className="step" onClick={() => setResultsFiltersOpen((value) => !value)}>{resultsFiltersOpen ? 'Hide filters' : 'Show filters'}</button>
          </div>

          {resultsFiltersOpen && (
            <section className="context-card">
              <h3>Result tools</h3>
              <div className="grid">
                <label>Search<input className="ccc-input" value={state.dashboardQuery} onChange={(e) => dispatch({ type: 'setDashboardQuery', value: e.target.value })} /></label>
                <label>Sort<select className="ccc-input" value={state.dashboardSort} onChange={(e) => dispatch({ type: 'setDashboardSort', value: e.target.value as State['dashboardSort'] })}><option value="quantity-desc">Quantity (high to low)</option><option value="quantity-asc">Quantity (low to high)</option><option value="name-asc">Name (A-Z)</option><option value="name-desc">Name (Z-A)</option></select></label>
              </div>
            </section>
          )}

          <table><thead><tr><th>Select</th><th>Proxy</th><th>Quantity</th></tr></thead><tbody>{(state.topTab === 'top' ? topPicks : visibleEquivalents).slice(0, 12).map((item) => <tr key={item.proxyId}><td><input type="checkbox" checked={state.compareSelected.includes(item.proxyId)} onChange={() => dispatch({ type: 'toggleCompareSelected', proxyId: item.proxyId })} /></td><td>{item.proxyName}</td><td>{item.quantity}</td></tr>)}</tbody></table>

          {state.compareSelected.length > 0 && (
            <section className="compare-panel" aria-label="Compare selected proxies">
              <h3>Compare selected ({state.compareSelected.length})</h3>
              <label>Amount<input className="ccc-input" value={state.compare.amount} onChange={(e) => dispatch({ type: 'setCompareField', field: 'amount', value: e.target.value })} /></label>
              <button onClick={runCompare} disabled={state.compareSelected.length < 2}>Compare selected</button>
              {state.compare.result && <p className="result">{state.compare.result}</p>}
              {state.compare.error && <p className="error">{state.compare.error}</p>}
            </section>
          )}

          <details className={state.chaosMode ? 'celebrate-strip chaos-surface' : 'celebrate-strip'} onToggle={(event) => dispatch({ type: 'setCelebrateOpen', value: (event.currentTarget as HTMLDetailsElement).open })}><summary>Celebrate</summary>{state.celebrateOpen && <p>Show parade / show chart.</p>}</details>
          <button className="ccc-button-primary cta-primary" onClick={() => dispatch({ type: 'setFlowStep', value: 'message' })}>Continue to Message</button>
        </>
      )}

      {state.flowStep === 'message' && (
        <>
          <h2>Step 4: Formalize</h2>
          <label>Template<select className="ccc-input" value={state.formalizer.template} onChange={(e) => dispatch({ type: 'setFormalizerField', field: 'template', value: e.target.value })}>{listTemplates().map((template) => <option key={template} value={template}>{template}</option>)}</select></label>
          <button onClick={generateMessage}>Generate message</button>
          {state.formalizer.message && <pre>{state.formalizer.message}</pre>}
          <button className="ccc-button-primary cta-primary" onClick={() => dispatch({ type: 'setFlowStep', value: 'share' })}>Continue to Share</button>
        </>
      )}

      {state.flowStep === 'share' && (
        <>
          <h2>Step 5: Share & Export</h2>
          <div className="stepper">
            <button className={exportTab === 'text' ? 'step active' : 'step'} onClick={() => setExportTab('text')}>Text</button>
            <button className={exportTab === 'image' ? 'step active' : 'step'} onClick={() => setExportTab('image')}>Image</button>
            <button className={exportTab === 'pdf' ? 'step active' : 'step'} onClick={() => setExportTab('pdf')}>PDF</button>
            <button className={exportTab === 'html' ? 'step active' : 'step'} onClick={() => setExportTab('html')}>HTML</button>
          </div>
          <button className="ccc-button-primary cta-primary" onClick={() => runExportAction('copy')}>Copy</button>
          <button onClick={() => runExportAction('download')}>Download</button>
          <button onClick={() => runExportAction('share')}>Share</button>
          {state.share.text && <pre>{state.share.text}</pre>}
          {state.share.qrPreview && <p className="result">{state.share.qrPreview}</p>}
          {exportToast && <p className="helper">{exportToast}</p>}
          {exportToast && <button onClick={saveEntry}>Save to Archive</button>}
        </>
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
      dispatch({ type: 'setNewProxyField', field: 'error', value: error instanceof Error ? error.message : 'Unable to create proxy.' });
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
          <div className="stepper side-quests">{['Personality Quiz', 'Bargaining Mini-Game', 'Maiden Mood Simulator', 'Proxy Parade'].map((item) => <button key={item} className="step" onClick={() => dispatch({ type: 'setSideQuest', value: item })}>{item}</button>)}</div>
          {state.sideQuest && <p className="result">{state.sideQuest} opened as overlay (placeholder).</p>}
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

export function App() {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const [draftSaved, setDraftSaved] = useState(true);

  useEffect(() => {
    writeCustomizerSettings({ locationKey: state.customizer.locationKey, manualMultiplier: Number(state.customizer.manualMultiplier), language: state.customizer.language });
  }, [state.customizer.locationKey, state.customizer.manualMultiplier, state.customizer.language]);

  useEffect(() => {
    setDraftSaved(false);
    globalThis.localStorage?.setItem(DRAFT_KEY, JSON.stringify({
      flowStep: state.flowStep,
      guidedMode: state.guidedMode,
      chaosMode: state.chaosMode,
      calcInput: { rawBid: state.calcInput.rawBid, amount: state.calcInput.amount, unit: state.calcInput.unit, proxyId: state.calcInput.proxyId },
    }));
    const timeoutId = globalThis.setTimeout(() => setDraftSaved(true), 200);
    return () => globalThis.clearTimeout(timeoutId);
  }, [state.flowStep, state.guidedMode, state.chaosMode, state.calcInput]);

  return (
    <main className={`app-shell ccc-app ${state.chaosMode ? 'chaos-mode' : ''}`}>
      <header className="header-row">
        <div>
          <h1>International Camel Equivalents</h1>
          <p>Courtship workflow experience</p>
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
