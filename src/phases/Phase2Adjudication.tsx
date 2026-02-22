import { uxCopy } from '../content/uxCopy';
import { locationPresets } from '../core/customizer-settings.js';
import { ErrorMessage } from '../components/ErrorMessage';

type Recommendation = {
  regionFactor: number;
  traitBonuses: number;
  adjustedCamelValue: number;
};

type Props = {
  effectiveMultiplier: number;
  state: any;
  recommendation: Recommendation | null;
  regionOverride: string;
  setRegionOverride: (value: string) => void;
  traitModifiers: { social: number; resilience: number; prestige: number; ceremony: number };
  setTraitModifiers: (value: any) => void;
  advancedTrait: number;
  setAdvancedTrait: (value: number) => void;
  fiatTraitsEnabled: boolean;
  setFiatTraitsEnabled: (value: boolean) => void;
  adjudicationLocked: boolean;
  lockedRecommendation: Recommendation | null;
  languagePreview: Record<string, string>;
  scanActionsOpen: boolean;
  setScanActionsOpen: (value: boolean) => void;
  resultsFiltersOpen: boolean;
  setResultsFiltersOpen: (value: boolean | ((value: boolean) => boolean)) => void;
  topPicks: any[];
  visibleEquivalents: any[];
  runCompare: () => void;
  finalizeBid: () => void;
  resetToOriginalBid: () => void;
  dispatch: (value: any) => void;
};

export function Phase2Adjudication(props: Props) {
  const { state } = props;
  const displayRecommendation = props.lockedRecommendation ?? props.recommendation;

  return (
    <>
      <h2>{uxCopy.phases.phase2.heading}</h2>
      <div className="context-cards">
        <details className="context-card" open>
          <summary>Region &amp; customs · {props.effectiveMultiplier.toFixed(2)}x</summary>
          <div className="grid">
            <label>Preset<select value={state.customizer.locationKey} onChange={(e) => props.dispatch({ type: 'setCustomizerField', field: 'locationKey', value: e.target.value })}>{Object.entries(locationPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}</select></label>
            <label>Manual multiplier<select value={state.customizer.manualMultiplier} onChange={(e) => props.dispatch({ type: 'setCustomizerField', field: 'manualMultiplier', value: e.target.value })}><option value="0.8">0.8</option><option value="1">1.0</option><option value="1.2">1.2</option></select></label>
          </div>
        </details>

        <section className="context-card">
          <h3>Recommendation preview</h3>
          <p className="helper">Original {state.calculation?.camelValue.toFixed(2) ?? '0.00'} camels → Adjusted {displayRecommendation?.adjustedCamelValue.toFixed(2) ?? '0.00'} camels</p>
          <div className="grid">
            <label>
              Region override
              <select className="ccc-input" value={props.regionOverride} onChange={(e) => props.setRegionOverride(e.target.value)} disabled={props.adjudicationLocked}>
                <option value="">Use preset</option>
                {Object.entries(locationPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}
              </select>
            </label>
            <label>
              <input type="checkbox" checked={props.fiatTraitsEnabled} onChange={(e) => props.setFiatTraitsEnabled(e.target.checked)} disabled={props.adjudicationLocked} />
              Apply fiat trait affidavit bonuses
            </label>
          </div>
          <div className="grid">
            <label>Social affidavit<input className="ccc-input" type="number" min="0.8" max="1.2" step="0.05" value={props.traitModifiers.social} disabled={props.adjudicationLocked} onChange={(e) => props.setTraitModifiers((current: any) => ({ ...current, social: Number(e.target.value) }))} /></label>
            <label>Resilience affidavit<input className="ccc-input" type="number" min="0.8" max="1.2" step="0.05" value={props.traitModifiers.resilience} disabled={props.adjudicationLocked} onChange={(e) => props.setTraitModifiers((current: any) => ({ ...current, resilience: Number(e.target.value) }))} /></label>
            <label>Prestige affidavit<input className="ccc-input" type="number" min="0.8" max="1.2" step="0.05" value={props.traitModifiers.prestige} disabled={props.adjudicationLocked} onChange={(e) => props.setTraitModifiers((current: any) => ({ ...current, prestige: Number(e.target.value) }))} /></label>
            <label>Ceremony affidavit<input className="ccc-input" type="number" min="0.8" max="1.2" step="0.05" value={props.traitModifiers.ceremony} disabled={props.adjudicationLocked} onChange={(e) => props.setTraitModifiers((current: any) => ({ ...current, ceremony: Number(e.target.value) }))} /></label>
            <label>Advanced multiplier<input className="ccc-input" type="number" min="0.9" max="1.1" step="0.01" value={props.advancedTrait} disabled={props.adjudicationLocked} onChange={(e) => props.setAdvancedTrait(Number(e.target.value))} /></label>
          </div>
        </section>

        <details className="context-card"><summary>Language · {state.customizer.language.toUpperCase()}</summary><label>Language<select value={state.customizer.language} onChange={(e) => props.dispatch({ type: 'setCustomizerField', field: 'language', value: e.target.value })}><option value="en">English</option><option value="ar">Arabic</option><option value="fr">French</option></select></label><p className="helper">{props.languagePreview[state.customizer.language] ?? props.languagePreview.en}</p></details>
      </div>
      {state.calculation ? <p className="hero">{state.calculation.camelValue.toFixed(2)} camels</p> : <p>{uxCopy.phases.phase2.noResult}</p>}
      <p className="helper">Detection: {state.calcInput.rawBid} · Affects message/export: templates and share format only.</p>
      <div className="stepper"><button className={state.topTab === 'top' ? 'step active' : 'step'} onClick={() => props.dispatch({ type: 'setTopTab', value: 'top' })}>Top picks</button><button className={state.topTab === 'all' ? 'step active' : 'step'} onClick={() => props.dispatch({ type: 'setTopTab', value: 'all' })}>All</button><button className={state.topTab === 'compare' ? 'step active' : 'step'} onClick={() => props.dispatch({ type: 'setTopTab', value: 'compare' })}>Compare</button><button className="step" onClick={() => props.setResultsFiltersOpen((value) => !value)}>{props.resultsFiltersOpen ? 'Hide filters' : 'Show filters'}</button></div>
      {props.resultsFiltersOpen && <section className="context-card"><h3>Result tools</h3><div className="grid"><label>Search<input className="ccc-input" value={state.dashboardQuery} onChange={(e) => props.dispatch({ type: 'setDashboardQuery', value: e.target.value })} /></label><label>Sort<select className="ccc-input" value={state.dashboardSort} onChange={(e) => props.dispatch({ type: 'setDashboardSort', value: e.target.value })}><option value="quantity-desc">Quantity (high to low)</option><option value="quantity-asc">Quantity (low to high)</option><option value="name-asc">Name (A-Z)</option><option value="name-desc">Name (Z-A)</option></select></label></div></section>}
      <table><thead><tr><th>Select</th><th>Proxy</th><th>Quantity</th></tr></thead><tbody>{(state.topTab === 'top' ? props.topPicks : props.visibleEquivalents).slice(0, 12).map((item) => <tr key={item.proxyId}><td><input type="checkbox" checked={state.compareSelected.includes(item.proxyId)} onChange={() => props.dispatch({ type: 'toggleCompareSelected', proxyId: item.proxyId })} /></td><td>{item.proxyName}</td><td>{item.quantity}</td></tr>)}</tbody></table>
      <ErrorMessage message={state.compare.error} statute="Statute 7" />
      {displayRecommendation && <section className={props.adjudicationLocked ? 'context-card adjudication-locked' : 'context-card'}><h3>Original vs adjusted</h3><p className="helper">{state.calculation?.camelValue.toFixed(2)} → {displayRecommendation.adjustedCamelValue.toFixed(2)} camels ({displayRecommendation.regionFactor.toFixed(2)}x region · {displayRecommendation.traitBonuses.toFixed(2)} trait bonus)</p>{props.adjudicationLocked && <p className="helper">🔒 Lock-in complete: adjudicated bid is sealed.</p>}<button className="ccc-button-primary cta-primary" onClick={props.finalizeBid} disabled={props.adjudicationLocked}>{uxCopy.phases.phase2.cta}</button><button className="cta-secondary" onClick={props.resetToOriginalBid}>{uxCopy.phases.phase2.secondaryCta}</button></section>}
      <details className={state.chaosMode ? 'celebrate-strip chaos-surface' : 'celebrate-strip'} onToggle={(event) => props.dispatch({ type: 'setCelebrateOpen', value: (event.currentTarget as HTMLDetailsElement).open })}><summary>Celebrate</summary>{state.celebrateOpen && <p>Show parade / show chart.</p>}</details>
    </>
  );
}
