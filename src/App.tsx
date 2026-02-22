import { useEffect, useMemo, useReducer, type Dispatch } from 'react';
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
  calcInput: { rawBid: string; amount: string; unit: 'USD' | 'CAMEL' | 'PROXY'; proxyId: string; camelUsdRate: string; parseNote: string; parseSource: string };
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

function buildInitialState(): State {
  const extensionProxies = readStoredExtensions() as ProxyDefinition[];
  const mergedProxies = mergeWithExtensions(referenceProxies, extensionProxies);
  const customizer = readCustomizerSettings();
  const draft = readDraft();

  return {
    referenceProxies,
    extensionProxies,
    mergedProxies,
    activeRootTab: draft?.activeRootTab ?? 'flow',
    flowStep: draft?.flowStep ?? 'bid',
    showWelcome: !globalThis.localStorage?.getItem('ccc-welcome-dismissed'),
    guidedMode: draft?.guidedMode ?? true,
    chaosMode: draft?.chaosMode ?? false,
    toolsOpen: false,
    celebrateOpen: false,
    sideQuest: '',
    calcInput: {
      rawBid: draft?.calcInput?.rawBid ?? '$1000',
      amount: draft?.calcInput?.amount ?? '1000',
      unit: draft?.calcInput?.unit ?? 'USD',
      proxyId: draft?.calcInput?.proxyId ?? mergedProxies[0]?.id ?? '',
      camelUsdRate: draft?.calcInput?.camelUsdRate ?? '500',
      parseNote: '',
      parseSource: '',
    },
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
    const reason = parsed.reason ?? "I couldn't parse that. Try '$1000' or '5 yaks'.";
    dispatch({ type: 'setCalcField', field: 'parseNote', value: reason });
    dispatch({ type: 'setError', value: reason });
    return false;
  }

  if (parsed.kind === 'currency') {
    dispatch({ type: 'setCalcField', field: 'amount', value: String(parsed.normalizedAmount) });
    dispatch({ type: 'setCalcField', field: 'unit', value: 'USD' });
    dispatch({ type: 'setCalcField', field: 'parseSource', value: parsed.currency === 'EUR' ? `Detected EUR and normalized to ${parsed.normalizedAmount} USD.` : 'Detected USD bid.' });
    dispatch({ type: 'setCalcField', field: 'parseNote', value: '' });
    return true;
  }

  const match = state.mergedProxies.find((proxy) => proxy.name.toLowerCase().includes(parsed.proxyName.toLowerCase()) || parsed.proxyName.toLowerCase().includes(proxy.name.toLowerCase()));
  if (!match) {
    dispatch({ type: 'setError', value: `Couldn't map "${parsed.proxyName}". Is that currency or a proxy?` });
    dispatch({ type: 'setCalcField', field: 'parseNote', value: 'Use a known proxy or switch to currency format.' });
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
    const result = calculateIceWithModifiers({ amount: Number(state.calcInput.amount), unit: state.calcInput.unit, proxyId: state.calcInput.proxyId, camelUsdRate: Number(state.calcInput.camelUsdRate) }, state.mergedProxies, { camelMultiplier });
    dispatch({ type: 'setCalculation', value: result });
    dispatch({ type: 'setError', value: '' });
    dispatch({ type: 'setFlowStep', value: 'results' });
  } catch (error) {
    dispatch({ type: 'setError', value: error instanceof Error ? error.message : 'Calculation failed.' });
  }
}

function Stepper({ step, onChange }: { step: FlowStep; onChange: (step: FlowStep) => void }) {
  const steps: FlowStep[] = ['bid', 'context', 'results', 'message', 'share'];
  return <div className="stepper">{steps.map((item) => <button key={item} className={step === item ? 'step active' : 'step'} onClick={() => onChange(item)}>{item}</button>)}</div>;
}

function FlowView({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const visibleEquivalents = useMemo(() => {
    if (!state.calculation) return [];
    return applyDashboardView(state.calculation.equivalents, { query: state.dashboardQuery, sort: state.dashboardSort });
  }, [state.calculation, state.dashboardQuery, state.dashboardSort]);

  const topPicks = useMemo(() => visibleEquivalents.slice(0, 12), [visibleEquivalents]);

  function runCompare() {
    try {
      const quantity = compareProxyUnits({ fromProxyId: state.compare.fromProxyId, toProxyId: state.compare.toProxyId, amount: Number(state.compare.amount) }, state.mergedProxies);
      const from = state.mergedProxies.find((item) => item.id === state.compare.fromProxyId);
      const to = state.mergedProxies.find((item) => item.id === state.compare.toProxyId);
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

  function generateShare() {
    try {
      if (!state.calculation) throw new Error('Run a calculation first.');
      const payload = buildSharePayload(state.calculation, { proxyId: state.share.selectedProxyId || state.calculation.equivalents[0]?.proxyId, message: state.formalizer.message });
      const qr = buildQrPayload({ mode: 'text', shareText: payload.shareText });
      dispatch({ type: 'setShare', text: payload.shareText, selectedProxyId: payload.selectedProxy.proxyId, qrPreview: qr.preview, error: '' });
    } catch (error) {
      dispatch({ type: 'setShare', text: '', selectedProxyId: '', qrPreview: '', error: error instanceof Error ? error.message : 'Share build failed.' });
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
    <section className="view-card">
      <Stepper step={state.flowStep} onChange={(value) => dispatch({ type: 'setFlowStep', value })} />
      <div className="sticky-chip">Bid summary: {state.calcInput.rawBid} · 1 camel = ${state.calcInput.camelUsdRate}</div>

      {state.flowStep === 'bid' && (
        <>
          <h2>Step 1: Enter the bid</h2>
          <label>What&apos;s the bid?<input value={state.calcInput.rawBid} onChange={(e) => dispatch({ type: 'setCalcField', field: 'rawBid', value: e.target.value })} placeholder="$1000, €850, 5 yaks" /></label>
          <p className="helper">Examples: $1000, €850, 5 yaks, 2 cows · Try an example</p>
          <label>Base rate (affects calculation)<input value={state.calcInput.camelUsdRate} onChange={(e) => dispatch({ type: 'setCalcField', field: 'camelUsdRate', value: e.target.value })} /></label>
          <button onClick={() => runCalculation(state, dispatch)}>Calculate ICE</button>
          {state.calcInput.parseSource && <p className="result">{state.calcInput.parseSource}</p>}
        </>
      )}

      {state.flowStep === 'context' && (
        <>
          <h2>Step 2: Context</h2>
          <div className="grid">
            <label>Region & customs<select value={state.customizer.locationKey} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'locationKey', value: e.target.value })}>{Object.entries(locationPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}</select></label>
            <label>Manual multiplier<select value={state.customizer.manualMultiplier} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'manualMultiplier', value: e.target.value })}><option value="0.8">0.8</option><option value="1">1.0</option><option value="1.2">1.2</option></select></label>
            <label>Language<select value={state.customizer.language} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'language', value: e.target.value })}><option value="en">English</option><option value="ar">Arabic</option><option value="fr">French</option></select></label>
          </div>
          <details><summary>Scan object to add proxy</summary><p>Camera scan is optional. Use photo upload or manual entry if you prefer.</p></details>
        </>
      )}

      {state.flowStep === 'results' && (
        <>
          <h2>Step 3: Results</h2>
          {state.calculation ? <p className="hero">{state.calculation.camelValue.toFixed(2)} camels</p> : <p>Run a bid to see results.</p>}
          <p>Based on 1 camel = ${state.calcInput.camelUsdRate}</p>
          <div className="stepper">
            <button className={state.topTab === 'top' ? 'step active' : 'step'} onClick={() => dispatch({ type: 'setTopTab', value: 'top' })}>Top picks</button>
            <button className={state.topTab === 'all' ? 'step active' : 'step'} onClick={() => dispatch({ type: 'setTopTab', value: 'all' })}>All</button>
            <button className={state.topTab === 'compare' ? 'step active' : 'step'} onClick={() => dispatch({ type: 'setTopTab', value: 'compare' })}>Compare</button>
          </div>
          {state.topTab !== 'compare' && (
            <table><thead><tr><th>Select</th><th>Proxy</th><th>Quantity</th></tr></thead><tbody>{(state.topTab === 'top' ? topPicks : visibleEquivalents).slice(0, 20).map((item) => <tr key={item.proxyId}><td><input type="checkbox" checked={state.compareSelected.includes(item.proxyId)} onChange={() => dispatch({ type: 'toggleCompareSelected', proxyId: item.proxyId })} /></td><td>{item.proxyName}</td><td>{item.quantity}</td></tr>)}</tbody></table>
          )}
          {state.topTab === 'compare' && (
            <div>
              <div className="grid">
                <label>Amount<input value={state.compare.amount} onChange={(e) => dispatch({ type: 'setCompareField', field: 'amount', value: e.target.value })} /></label>
                <label>From<select value={state.compare.fromProxyId} onChange={(e) => dispatch({ type: 'setCompareField', field: 'fromProxyId', value: e.target.value })}>{state.mergedProxies.map((proxy) => <option key={proxy.id} value={proxy.id}>{proxy.name}</option>)}</select></label>
                <label>To<select value={state.compare.toProxyId} onChange={(e) => dispatch({ type: 'setCompareField', field: 'toProxyId', value: e.target.value })}>{state.mergedProxies.map((proxy) => <option key={proxy.id} value={proxy.id}>{proxy.name}</option>)}</select></label>
              </div>
              <button onClick={runCompare}>Compare</button>
              {state.compare.result && <p className="result">{state.compare.result}</p>}
            </div>
          )}
          <details><summary>Celebrate</summary><p>Show parade / show chart (collapsed by default).</p></details>
          <h3>Side Quests</h3>
          <div className="stepper">{['Personality Quiz', 'Bargaining Mini-Game', 'Maiden Mood Simulator', 'Proxy Parade'].map((item) => <button key={item} className="step" onClick={() => dispatch({ type: 'setSideQuest', value: item })}>{item}</button>)}</div>
          {state.sideQuest && <p className="result">{state.sideQuest} opened as overlay (placeholder).</p>}
        </>
      )}

      {state.flowStep === 'message' && (
        <>
          <h2>Step 4: Formalize</h2>
          <label>Template<select value={state.formalizer.template} onChange={(e) => dispatch({ type: 'setFormalizerField', field: 'template', value: e.target.value })}>{listTemplates().map((template) => <option key={template} value={template}>{template}</option>)}</select></label>
          <button onClick={generateMessage}>Generate message</button>
          {state.formalizer.message && <pre>{state.formalizer.message}</pre>}
        </>
      )}

      {state.flowStep === 'share' && (
        <>
          <h2>Step 5: Share & Export</h2>
          <div className="stepper"><button className="step active">Text</button><button className="step">Image</button><button className="step">PDF</button><button className="step">HTML</button></div>
          <button onClick={generateShare}>Copy</button> <button>Download</button> <button>Share</button>
          {state.share.text && <pre>{state.share.text}</pre>}
          {state.share.qrPreview && <p className="result">{state.share.qrPreview}</p>}
          <button onClick={saveEntry}>Save to Archive</button>
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
    <section className="view-card">
      <h2>Library</h2>
      <p>Search, filter, browse, and generate custom proxies.</p>
      <div className="grid">
        <label>Search<input value={state.referenceFilters.query} onChange={(e) => dispatch({ type: 'setReferenceFilter', field: 'query', value: e.target.value })} /></label>
        <label>Category<select value={state.referenceFilters.category} onChange={(e) => dispatch({ type: 'setReferenceFilter', field: 'category', value: e.target.value })}><option value="">All</option>{CANONICAL_PROXY_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        <label>Source<select value={state.referenceFilters.source} onChange={(e) => dispatch({ type: 'setReferenceFilter', field: 'source', value: e.target.value })}><option value="all">All</option><option value="reference">Reference only</option><option value="extension">Custom only</option></select></label>
      </div>
      <p>{filtered.length} proxies in library</p>
      <ul className="list">{filtered.map((proxy) => <li key={proxy.id}>{proxy.name} · {proxy.category}</li>)}</ul>

      <h3>Proxy Generator</h3>
      <div className="grid">
        <label>Name<input value={state.newProxy.name} onChange={(e) => dispatch({ type: 'setNewProxyField', field: 'name', value: e.target.value })} /></label>
        <label>Rate<input value={state.newProxy.ratePerCamel} onChange={(e) => dispatch({ type: 'setNewProxyField', field: 'ratePerCamel', value: e.target.value })} /></label>
        <label>Category<input value={state.newProxy.category} onChange={(e) => dispatch({ type: 'setNewProxyField', field: 'category', value: e.target.value })} placeholder="e.g. livestock" /></label>
      </div>
      <label>Description<textarea value={state.newProxy.description} onChange={(e) => dispatch({ type: 'setNewProxyField', field: 'description', value: e.target.value })} /></label>
      <button onClick={saveProxy}>Add custom proxy</button>
      {state.newProxy.success && <p className="result">{state.newProxy.success}</p>}
      {state.newProxy.error && <p className="error">{state.newProxy.error}</p>}
    </section>
  );
}

function ToolsDrawer({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  return (
    <aside className={state.toolsOpen ? 'tools open' : 'tools'}>
      <h3>Tools Drawer</h3>
      <p>Quick actions</p>
      <button onClick={() => dispatch({ type: 'setRootTab', value: 'library' })}>Open Library</button>
      <button onClick={() => dispatch({ type: 'setReferenceFilter', field: 'query', value: '' })}>Clear library search</button>
      <button onClick={() => dispatch({ type: 'setFlowStep', value: 'results' })}>Jump to results step</button>
      <h4>Accessibility</h4>
      <label><input type="checkbox" checked={state.customizer.reducedMotion} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'reducedMotion', value: e.target.checked })} /> Reduced motion</label>
      <label><input type="checkbox" checked={state.customizer.highContrast} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'highContrast', value: e.target.checked })} /> High contrast</label>
      <label><input type="checkbox" checked={state.customizer.soundOn} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'soundOn', value: e.target.checked })} /> Sound on</label>
    </aside>
  );
}

function ArchiveView({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  return (
    <section className="view-card">
      <h2>Archive</h2>
      <ul className="list">{state.history.map((entry) => <li key={entry.id}>{entry.summary} · {entry.camelValue} camels · {formatRelativeAge(entry.createdAt)}</li>)}</ul>
      <button onClick={() => { writeBidHistory([]); dispatch({ type: 'setHistory', value: [] }); }}>Clear archive</button>
    </section>
  );
}

export function App() {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);

  useEffect(() => {
    writeCustomizerSettings({ locationKey: state.customizer.locationKey, manualMultiplier: Number(state.customizer.manualMultiplier), language: state.customizer.language });
  }, [state.customizer.locationKey, state.customizer.manualMultiplier, state.customizer.language]);

  useEffect(() => {
    globalThis.localStorage?.setItem(DRAFT_KEY, JSON.stringify({
      activeRootTab: state.activeRootTab,
      flowStep: state.flowStep,
      guidedMode: state.guidedMode,
      chaosMode: state.chaosMode,
      calcInput: { rawBid: state.calcInput.rawBid, amount: state.calcInput.amount, unit: state.calcInput.unit, proxyId: state.calcInput.proxyId, camelUsdRate: state.calcInput.camelUsdRate },
    }));
  }, [state.activeRootTab, state.flowStep, state.guidedMode, state.chaosMode, state.calcInput]);

  return (
    <main className="app-shell">
      <header className="header-row">
        <div>
          <h1>International Camel Equivalents</h1>
          <p>Courtship workflow experience</p>
        </div>
        <div>
          <button onClick={() => dispatch({ type: 'toggleTools' })}>Tools</button>
        </div>
      </header>
      <nav aria-label="Primary" className="route-nav">
        <button className={state.activeRootTab === 'flow' ? 'active' : ''} onClick={() => dispatch({ type: 'setRootTab', value: 'flow' })}>Courtship Flow</button>
        <button className={state.activeRootTab === 'library' ? 'active' : ''} onClick={() => dispatch({ type: 'setRootTab', value: 'library' })}>Library</button>
        <button className={state.activeRootTab === 'archive' ? 'active' : ''} onClick={() => dispatch({ type: 'setRootTab', value: 'archive' })}>Archive</button>
        <button className={state.activeRootTab === 'premium' ? 'active' : ''} onClick={() => dispatch({ type: 'setRootTab', value: 'premium' })}>Premium</button>
      </nav>

      {state.showWelcome && (
        <section className="view-card overlay">
          <h2>Convert any bid into camels. Then into… unfortunate equivalents.</h2>
          <button onClick={() => { dispatch({ type: 'setShowWelcome', value: false }); dispatch({ type: 'setRootTab', value: 'flow' }); globalThis.localStorage?.setItem('ccc-welcome-dismissed', '1'); }}>Start a calculation</button>
          <button onClick={() => { dispatch({ type: 'setShowWelcome', value: false }); dispatch({ type: 'setRootTab', value: 'library' }); globalThis.localStorage?.setItem('ccc-welcome-dismissed', '1'); }}>Browse the Library</button>
          <label><input type="checkbox" checked={state.guidedMode} onChange={(e) => dispatch({ type: 'setGuidedMode', value: e.target.checked })} /> Guided mode</label>
          <label><input type="checkbox" checked={state.chaosMode} onChange={(e) => dispatch({ type: 'setChaosMode', value: e.target.checked })} /> Chaos mode</label>
        </section>
      )}

      {state.activeRootTab === 'flow' && <FlowView state={state} dispatch={dispatch} />}
      {state.activeRootTab === 'library' && <LibraryView state={state} dispatch={dispatch} />}
      {state.activeRootTab === 'archive' && <ArchiveView state={state} dispatch={dispatch} />}
      {state.activeRootTab === 'premium' && <section className="view-card"><h2>Premium</h2><p>Negotiate this bid (premium feature placeholder).</p><p>$69/year with local premium flag.</p></section>}

      <ToolsDrawer state={state} dispatch={dispatch} />
    </main>
  );
}
