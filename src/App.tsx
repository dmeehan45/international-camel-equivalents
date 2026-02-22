import { useEffect, useMemo, useReducer, type Dispatch } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
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
import {
  buildCompareSummary,
  CANONICAL_PROXY_CATEGORIES,
  filterReferenceProxies,
} from './core/reference-library.js';
import { listTemplates, generateFormalizedMessage } from './core/formalizer.js';
import { buildSharePayload } from './core/share-export.js';
import { buildQrPayload } from './core/share-qr.js';
import { locationPresets, readCustomizerSettings, resolveCamelMultiplier, writeCustomizerSettings } from './core/customizer-settings.js';
import { createHistoryEntry, formatRelativeAge, readBidHistory, writeBidHistory } from './core/history-archive.js';
import type { CalculationResult, ProxyDefinition } from './domain/types';

type State = {
  referenceProxies: ProxyDefinition[];
  extensionProxies: ProxyDefinition[];
  mergedProxies: ProxyDefinition[];
  calcInput: { amount: string; unit: 'USD' | 'CAMEL' | 'PROXY'; proxyId: string; camelUsdRate: string };
  dashboardQuery: string;
  dashboardSort: 'quantity-desc' | 'quantity-asc' | 'name-asc' | 'name-desc';
  calculation: CalculationResult | null;
  error: string;
  customizer: { locationKey: string; manualMultiplier: string; language: string };
  referenceFilters: { query: string; category: string; source: 'all' | 'reference' | 'extension' };
  compare: { amount: string; fromProxyId: string; toProxyId: string; result: string; error: string };
  newProxy: { name: string; ratePerCamel: string; category: string; description: string; error: string; success: string };
  formalizer: { template: string; message: string; error: string };
  share: { selectedProxyId: string; text: string; qrPreview: string; error: string };
  history: Array<{ id: string; createdAt: string; amount: number; unit: string; camelValue: number; summary: string }>;
};

type Action =
  | { type: 'setCalcField'; field: keyof State['calcInput']; value: string }
  | { type: 'setDashboardQuery'; value: string }
  | { type: 'setDashboardSort'; value: State['dashboardSort'] }
  | { type: 'setCalculation'; value: CalculationResult | null }
  | { type: 'setError'; value: string }
  | { type: 'hydrateExtensions'; value: ProxyDefinition[] }
  | { type: 'setCustomizerField'; field: keyof State['customizer']; value: string }
  | { type: 'setReferenceFilter'; field: keyof State['referenceFilters']; value: string }
  | { type: 'setCompareField'; field: keyof State['compare']; value: string }
  | { type: 'setNewProxyField'; field: keyof State['newProxy']; value: string }
  | { type: 'setFormalizerField'; field: keyof State['formalizer']; value: string }
  | { type: 'setShare'; text: string; selectedProxyId: string; qrPreview: string; error: string }
  | { type: 'setHistory'; value: State['history'] };

const referenceProxies = proxiesData as ProxyDefinition[];

function buildInitialState(): State {
  const extensionProxies = readStoredExtensions() as ProxyDefinition[];
  const mergedProxies = mergeWithExtensions(referenceProxies, extensionProxies);
  const customizer = readCustomizerSettings();

  return {
    referenceProxies,
    extensionProxies,
    mergedProxies,
    calcInput: { amount: '500', unit: 'USD', proxyId: mergedProxies[0]?.id ?? '', camelUsdRate: '500' },
    dashboardQuery: '',
    dashboardSort: 'quantity-desc',
    calculation: null,
    error: '',
    customizer: {
      locationKey: customizer.locationKey ?? 'default',
      manualMultiplier: String(customizer.manualMultiplier ?? 1),
      language: customizer.language ?? 'en',
    },
    referenceFilters: { query: '', category: '', source: 'all' },
    compare: {
      amount: '1',
      fromProxyId: mergedProxies[0]?.id ?? '',
      toProxyId: mergedProxies[1]?.id ?? mergedProxies[0]?.id ?? '',
      result: '',
      error: '',
    },
    newProxy: { name: '', ratePerCamel: '', category: CANONICAL_PROXY_CATEGORIES[0], description: '', error: '', success: '' },
    formalizer: { template: listTemplates()[0] ?? 'formal', message: '', error: '' },
    share: { selectedProxyId: '', text: '', qrPreview: '', error: '' },
    history: readBidHistory(),
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setCalcField':
      return { ...state, calcInput: { ...state.calcInput, [action.field]: action.value } };
    case 'setDashboardQuery':
      return { ...state, dashboardQuery: action.value };
    case 'setDashboardSort':
      return { ...state, dashboardSort: action.value };
    case 'setCalculation':
      return { ...state, calculation: action.value };
    case 'setError':
      return { ...state, error: action.value };
    case 'hydrateExtensions': {
      const mergedProxies = mergeWithExtensions(state.referenceProxies, action.value);
      return {
        ...state,
        extensionProxies: action.value,
        mergedProxies,
        calcInput: {
          ...state.calcInput,
          proxyId: state.calcInput.proxyId || mergedProxies[0]?.id || '',
        },
      };
    }
    case 'setCustomizerField':
      return { ...state, customizer: { ...state.customizer, [action.field]: action.value } };
    case 'setReferenceFilter':
      return { ...state, referenceFilters: { ...state.referenceFilters, [action.field]: action.value } as State['referenceFilters'] };
    case 'setCompareField':
      return { ...state, compare: { ...state.compare, [action.field]: action.value } };
    case 'setNewProxyField':
      return { ...state, newProxy: { ...state.newProxy, [action.field]: action.value } };
    case 'setFormalizerField':
      return { ...state, formalizer: { ...state.formalizer, [action.field]: action.value } };
    case 'setShare':
      return { ...state, share: { text: action.text, selectedProxyId: action.selectedProxyId, qrPreview: action.qrPreview, error: action.error } };
    case 'setHistory':
      return { ...state, history: action.value };
    default:
      return state;
  }
}

function HomeView({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const visibleEquivalents = useMemo(() => {
    if (!state.calculation) return [];
    return applyDashboardView(state.calculation.equivalents, {
      query: state.dashboardQuery,
      sort: state.dashboardSort,
    });
  }, [state.calculation, state.dashboardQuery, state.dashboardSort]);

  function runCalculation() {
    try {
      validateDashboardInput({
        amount: Number(state.calcInput.amount),
        unit: state.calcInput.unit,
        proxyId: state.calcInput.proxyId,
      });

      const camelMultiplier = resolveCamelMultiplier({
        locationKey: state.customizer.locationKey,
        manualMultiplier: Number(state.customizer.manualMultiplier),
      });

      const result = calculateIceWithModifiers(
        {
          amount: Number(state.calcInput.amount),
          unit: state.calcInput.unit,
          proxyId: state.calcInput.proxyId,
          camelUsdRate: Number(state.calcInput.camelUsdRate),
        },
        state.mergedProxies,
        { camelMultiplier },
      );

      dispatch({ type: 'setCalculation', value: result });
      dispatch({ type: 'setError', value: '' });
    } catch (error) {
      dispatch({ type: 'setError', value: error instanceof Error ? error.message : 'Calculation failed.' });
    }
  }

  return (
    <section className="view-card">
      <h2>Home</h2>
      <div className="grid">
        <label>Amount<input value={state.calcInput.amount} onChange={(e) => dispatch({ type: 'setCalcField', field: 'amount', value: e.target.value })} /></label>
        <label>Unit
          <select value={state.calcInput.unit} onChange={(e) => dispatch({ type: 'setCalcField', field: 'unit', value: e.target.value })}>
            <option value="USD">USD</option><option value="CAMEL">CAMEL</option><option value="PROXY">PROXY</option>
          </select>
        </label>
        <label>Camel USD rate<input value={state.calcInput.camelUsdRate} onChange={(e) => dispatch({ type: 'setCalcField', field: 'camelUsdRate', value: e.target.value })} /></label>
        {state.calcInput.unit === 'PROXY' && (
          <label>Proxy
            <select value={state.calcInput.proxyId} onChange={(e) => dispatch({ type: 'setCalcField', field: 'proxyId', value: e.target.value })}>
              {state.mergedProxies.map((proxy) => <option key={proxy.id} value={proxy.id}>{proxy.name}</option>)}
            </select>
          </label>
        )}
      </div>
      <button onClick={runCalculation}>Calculate</button>
      {state.error && <p className="error">{state.error}</p>}
      {state.calculation && <p className="result">Camel value: {state.calculation.camelValue}</p>}
      {state.calculation && (
        <>
          <div className="grid">
            <label>Filter results<input value={state.dashboardQuery} onChange={(e) => dispatch({ type: 'setDashboardQuery', value: e.target.value })} /></label>
            <label>Sort
              <select value={state.dashboardSort} onChange={(e) => dispatch({ type: 'setDashboardSort', value: e.target.value as State['dashboardSort'] })}>
                <option value="quantity-desc">Quantity desc</option><option value="quantity-asc">Quantity asc</option><option value="name-asc">Name asc</option><option value="name-desc">Name desc</option>
              </select>
            </label>
          </div>
          <table><thead><tr><th>Proxy</th><th>Quantity</th></tr></thead><tbody>{visibleEquivalents.slice(0, 20).map((item) => <tr key={item.proxyId}><td>{item.proxyName}</td><td>{item.quantity}</td></tr>)}</tbody></table>
        </>
      )}
    </section>
  );
}

function ReferenceView({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const filtered = useMemo(
    () => filterReferenceProxies(state.mergedProxies, state.referenceFilters),
    [state.mergedProxies, state.referenceFilters],
  );

  function runCompare() {
    try {
      const quantity = compareProxyUnits(
        {
          fromProxyId: state.compare.fromProxyId,
          toProxyId: state.compare.toProxyId,
          amount: Number(state.compare.amount),
        },
        state.mergedProxies,
      );
      const from = state.mergedProxies.find((item) => item.id === state.compare.fromProxyId);
      const to = state.mergedProxies.find((item) => item.id === state.compare.toProxyId);
      if (!from || !to) throw new Error('Select valid proxies.');
      const summary = buildCompareSummary({ amount: Number(state.compare.amount), quantity, fromName: from.name, toName: to.name });
      dispatch({ type: 'setCompareField', field: 'result', value: summary });
      dispatch({ type: 'setCompareField', field: 'error', value: '' });
    } catch (error) {
      dispatch({ type: 'setCompareField', field: 'error', value: error instanceof Error ? error.message : 'Compare failed.' });
    }
  }

  return (
    <section className="view-card">
      <h2>Reference</h2>
      <div className="grid">
        <label>Search<input value={state.referenceFilters.query} onChange={(e) => dispatch({ type: 'setReferenceFilter', field: 'query', value: e.target.value })} /></label>
        <label>Category
          <select value={state.referenceFilters.category} onChange={(e) => dispatch({ type: 'setReferenceFilter', field: 'category', value: e.target.value })}>
            <option value="">All</option>{CANONICAL_PROXY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>Source
          <select value={state.referenceFilters.source} onChange={(e) => dispatch({ type: 'setReferenceFilter', field: 'source', value: e.target.value })}>
            <option value="all">All</option><option value="reference">Reference</option><option value="extension">Extension</option>
          </select>
        </label>
      </div>
      <p>{filtered.length} proxies</p>
      <ul className="list">{filtered.slice(0, 25).map((proxy) => <li key={proxy.id}>{proxy.name} · {proxy.category}</li>)}</ul>

      <h3>Compare</h3>
      <div className="grid">
        <label>Amount<input value={state.compare.amount} onChange={(e) => dispatch({ type: 'setCompareField', field: 'amount', value: e.target.value })} /></label>
        <label>From<select value={state.compare.fromProxyId} onChange={(e) => dispatch({ type: 'setCompareField', field: 'fromProxyId', value: e.target.value })}>{state.mergedProxies.map((proxy) => <option key={proxy.id} value={proxy.id}>{proxy.name}</option>)}</select></label>
        <label>To<select value={state.compare.toProxyId} onChange={(e) => dispatch({ type: 'setCompareField', field: 'toProxyId', value: e.target.value })}>{state.mergedProxies.map((proxy) => <option key={proxy.id} value={proxy.id}>{proxy.name}</option>)}</select></label>
      </div>
      <button onClick={runCompare}>Compare</button>
      {state.compare.error && <p className="error">{state.compare.error}</p>}
      {state.compare.result && <p className="result">{state.compare.result}</p>}
    </section>
  );
}

function CustomizerView({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  function saveProxy() {
    try {
      const created = createProxyDefinition(
        {
          name: state.newProxy.name,
          ratePerCamel: Number(state.newProxy.ratePerCamel),
          category: state.newProxy.category,
          description: state.newProxy.description,
        },
        state.mergedProxies,
      );
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
      <h2>Customizer</h2>
      <div className="grid">
        <label>Location preset
          <select value={state.customizer.locationKey} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'locationKey', value: e.target.value })}>
            {Object.entries(locationPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}
          </select>
        </label>
        <label>Manual multiplier<input value={state.customizer.manualMultiplier} onChange={(e) => dispatch({ type: 'setCustomizerField', field: 'manualMultiplier', value: e.target.value })} /></label>
      </div>
      <p>Effective camel multiplier: {resolveCamelMultiplier({ locationKey: state.customizer.locationKey, manualMultiplier: Number(state.customizer.manualMultiplier) })}</p>

      <h3>Add custom proxy</h3>
      <div className="grid">
        <label>Name<input value={state.newProxy.name} onChange={(e) => dispatch({ type: 'setNewProxyField', field: 'name', value: e.target.value })} /></label>
        <label>Rate per camel<input value={state.newProxy.ratePerCamel} onChange={(e) => dispatch({ type: 'setNewProxyField', field: 'ratePerCamel', value: e.target.value })} /></label>
        <label>Category
          <select value={state.newProxy.category} onChange={(e) => dispatch({ type: 'setNewProxyField', field: 'category', value: e.target.value })}>
            {CANONICAL_PROXY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>Description<input value={state.newProxy.description} onChange={(e) => dispatch({ type: 'setNewProxyField', field: 'description', value: e.target.value })} /></label>
      </div>
      <button onClick={saveProxy}>Add custom proxy</button>
      {state.newProxy.error && <p className="error">{state.newProxy.error}</p>}
      {state.newProxy.success && <p className="result">{state.newProxy.success}</p>}
    </section>
  );
}

function FormalizerView({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  function generate() {
    try {
      if (!state.calculation) throw new Error('Run a calculation first.');
      const top = state.calculation.equivalents[0];
      const message = generateFormalizedMessage({
        template: state.formalizer.template,
        camelValue: state.calculation.camelValue,
        proxyQuantity: top.quantity,
        proxyName: top.proxyName,
      });
      dispatch({ type: 'setFormalizerField', field: 'message', value: message });
      dispatch({ type: 'setFormalizerField', field: 'error', value: '' });
    } catch (error) {
      dispatch({ type: 'setFormalizerField', field: 'error', value: error instanceof Error ? error.message : 'Failed to generate message.' });
    }
  }

  return (
    <section className="view-card">
      <h2>Formalizer</h2>
      <label>Template<select value={state.formalizer.template} onChange={(e) => dispatch({ type: 'setFormalizerField', field: 'template', value: e.target.value })}>{listTemplates().map((template) => <option key={template} value={template}>{template}</option>)}</select></label>
      <button onClick={generate}>Generate formalized message</button>
      {state.formalizer.error && <p className="error">{state.formalizer.error}</p>}
      {state.formalizer.message && <pre>{state.formalizer.message}</pre>}
    </section>
  );
}

function ShareView({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  function generateShare() {
    try {
      if (!state.calculation) throw new Error('Run a calculation first.');
      const payload = buildSharePayload(state.calculation, {
        proxyId: state.share.selectedProxyId || state.calculation.equivalents[0]?.proxyId,
        message: state.formalizer.message,
      });
      const qr = buildQrPayload({ mode: 'text', shareText: payload.shareText });
      dispatch({ type: 'setShare', text: payload.shareText, selectedProxyId: payload.selectedProxy.proxyId, qrPreview: qr.preview, error: '' });
    } catch (error) {
      dispatch({ type: 'setShare', text: '', selectedProxyId: '', qrPreview: '', error: error instanceof Error ? error.message : 'Share build failed.' });
    }
  }

  return (
    <section className="view-card">
      <h2>Share</h2>
      <button onClick={generateShare}>Build share payload</button>
      {state.share.error && <p className="error">{state.share.error}</p>}
      {state.share.text && <pre>{state.share.text}</pre>}
      {state.share.qrPreview && <p className="result">{state.share.qrPreview}</p>}
    </section>
  );
}

function ArchiveView({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  function saveEntry() {
    try {
      if (!state.calculation) throw new Error('Run a calculation before archiving.');
      const entry = createHistoryEntry({
        amount: Number(state.calcInput.amount),
        unit: state.calcInput.unit,
        camelValue: state.calculation.camelValue,
        summary: state.share.text || state.formalizer.message || 'Camel bid summary',
      });
      const next = [entry, ...state.history];
      writeBidHistory(next);
      dispatch({ type: 'setHistory', value: next });
      dispatch({ type: 'setError', value: '' });
    } catch (error) {
      dispatch({ type: 'setError', value: error instanceof Error ? error.message : 'Unable to archive entry.' });
    }
  }

  function clearHistory() {
    writeBidHistory([]);
    dispatch({ type: 'setHistory', value: [] });
  }

  return (
    <section className="view-card">
      <h2>Archive</h2>
      <button onClick={saveEntry}>Archive latest bid</button> <button onClick={clearHistory}>Clear</button>
      {state.error && <p className="error">{state.error}</p>}
      <ul className="list">
        {state.history.map((entry) => <li key={entry.id}>{entry.summary} · {entry.camelValue} camels · {formatRelativeAge(entry.createdAt)}</li>)}
      </ul>
    </section>
  );
}

export function App() {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);

  useEffect(() => {
    writeCustomizerSettings({
      locationKey: state.customizer.locationKey,
      manualMultiplier: Number(state.customizer.manualMultiplier),
      language: state.customizer.language,
    });
  }, [state.customizer]);

  return (
    <main className="app-shell">
      <header>
        <h1>International Camel Equivalents</h1>
        <p>React + TypeScript migration feature routes</p>
      </header>
      <nav aria-label="Primary" className="route-nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/reference">Reference</NavLink>
        <NavLink to="/customizer">Customizer</NavLink>
        <NavLink to="/formalizer">Formalizer</NavLink>
        <NavLink to="/share">Share</NavLink>
        <NavLink to="/archive">Archive</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<HomeView state={state} dispatch={dispatch} />} />
        <Route path="/reference" element={<ReferenceView state={state} dispatch={dispatch} />} />
        <Route path="/customizer" element={<CustomizerView state={state} dispatch={dispatch} />} />
        <Route path="/formalizer" element={<FormalizerView state={state} dispatch={dispatch} />} />
        <Route path="/share" element={<ShareView state={state} dispatch={dispatch} />} />
        <Route path="/archive" element={<ArchiveView state={state} dispatch={dispatch} />} />
      </Routes>
    </main>
  );
}
