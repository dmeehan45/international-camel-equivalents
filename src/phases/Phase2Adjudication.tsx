import { useState } from 'react';
import { uxCopy } from '../content/uxCopy';
import { locationPresets } from '../core/customizer-settings.js';
import { Drawer } from '../components/Drawer';
import { ErrorMessage } from '../components/ErrorMessage';
import { LegalCard } from '../components/LegalCard';
import { PhaseHeader } from '../components/PhaseHeader';
import { PrimaryActionBar } from '../components/PrimaryActionBar';

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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { state } = props;
  const displayRecommendation = props.lockedRecommendation ?? props.recommendation;

  return (
    <>
      <PhaseHeader phaseLabel="Phase 2 of 4" heading={uxCopy.phases.phase2.heading} subtitle={uxCopy.phases.phase2.subtitle} />
      <LegalCard tone={props.adjudicationLocked ? 'locked' : 'default'}>
        {state.calculation ? <p className="hero">{state.calculation.camelValue.toFixed(2)} camels</p> : <p>{uxCopy.phases.phase2.noResult}</p>}
        <p className="helper">Original {state.calculation?.camelValue.toFixed(2) ?? '0.00'} → Adjusted {displayRecommendation?.adjustedCamelValue.toFixed(2) ?? '0.00'} camels</p>
        {props.adjudicationLocked && <p className="helper">Bid lock complete. This ruling is sealed.</p>}
      </LegalCard>

      <button type="button" className="more-details-trigger" onClick={() => setDetailsOpen(true)}>
        More details?
      </button>
      <Drawer isOpen={detailsOpen} title={uxCopy.phases.phase2.advancedLabel} onClose={() => setDetailsOpen(false)}>
        <div className="context-cards">
          <section className="context-card">
            <h3>Jurisdiction controls · {props.effectiveMultiplier.toFixed(2)}x</h3>
            <div className="grid">
              <label>Preset<select className="ccc-input" value={state.customizer.locationKey} onChange={(e) => props.dispatch({ type: 'setCustomizerField', field: 'locationKey', value: e.target.value })}>{Object.entries(locationPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}</select></label>
              <label>Manual multiplier<select className="ccc-input" value={state.customizer.manualMultiplier} onChange={(e) => props.dispatch({ type: 'setCustomizerField', field: 'manualMultiplier', value: e.target.value })}><option value="0.8">0.8</option><option value="1">1.0</option><option value="1.2">1.2</option></select></label>
              <label>Region override
                <select className="ccc-input" value={props.regionOverride} onChange={(e) => props.setRegionOverride(e.target.value)} disabled={props.adjudicationLocked}>
                  <option value="">Use preset</option>
                  {Object.entries(locationPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}
                </select>
              </label>
            </div>
          </section>
          <section className="context-card">
            <h3>Trait affidavits</h3>
            <label>
              <input type="checkbox" checked={props.fiatTraitsEnabled} onChange={(e) => props.setFiatTraitsEnabled(e.target.checked)} disabled={props.adjudicationLocked} />
              Apply fiat trait bonuses
            </label>
            <div className="grid">
              <label>Social<input className="ccc-input" type="number" min="0.8" max="1.2" step="0.05" value={props.traitModifiers.social} disabled={props.adjudicationLocked} onChange={(e) => props.setTraitModifiers((current: any) => ({ ...current, social: Number(e.target.value) }))} /></label>
              <label>Resilience<input className="ccc-input" type="number" min="0.8" max="1.2" step="0.05" value={props.traitModifiers.resilience} disabled={props.adjudicationLocked} onChange={(e) => props.setTraitModifiers((current: any) => ({ ...current, resilience: Number(e.target.value) }))} /></label>
              <label>Prestige<input className="ccc-input" type="number" min="0.8" max="1.2" step="0.05" value={props.traitModifiers.prestige} disabled={props.adjudicationLocked} onChange={(e) => props.setTraitModifiers((current: any) => ({ ...current, prestige: Number(e.target.value) }))} /></label>
              <label>Ceremony<input className="ccc-input" type="number" min="0.8" max="1.2" step="0.05" value={props.traitModifiers.ceremony} disabled={props.adjudicationLocked} onChange={(e) => props.setTraitModifiers((current: any) => ({ ...current, ceremony: Number(e.target.value) }))} /></label>
              <label>Advanced multiplier<input className="ccc-input" type="number" min="0.9" max="1.1" step="0.01" value={props.advancedTrait} disabled={props.adjudicationLocked} onChange={(e) => props.setAdvancedTrait(Number(e.target.value))} /></label>
            </div>
          </section>
          <section className="context-card">
            <h3>Result tools</h3>
            <div className="stepper"><button className={state.topTab === 'top' ? 'step active' : 'step'} onClick={() => props.dispatch({ type: 'setTopTab', value: 'top' })}>Top picks</button><button className={state.topTab === 'all' ? 'step active' : 'step'} onClick={() => props.dispatch({ type: 'setTopTab', value: 'all' })}>All</button><button className={state.topTab === 'compare' ? 'step active' : 'step'} onClick={() => props.dispatch({ type: 'setTopTab', value: 'compare' })}>Compare</button></div>
            <div className="grid"><label>Search<input className="ccc-input" value={state.dashboardQuery} onChange={(e) => props.dispatch({ type: 'setDashboardQuery', value: e.target.value })} /></label><label>Sort<select className="ccc-input" value={state.dashboardSort} onChange={(e) => props.dispatch({ type: 'setDashboardSort', value: e.target.value })}><option value="quantity-desc">Quantity (high to low)</option><option value="quantity-asc">Quantity (low to high)</option><option value="name-asc">Name (A-Z)</option><option value="name-desc">Name (Z-A)</option></select></label></div>
            <ul className="list">{props.visibleEquivalents.map((item) => <li key={item.proxyId}>{item.proxyName}: {item.quantity}</li>)}</ul>
          </section>
        </div>
      </Drawer>

      <LegalCard>
        <h3>Top recommendations</h3>
        <ul className="list">{props.topPicks.map((item) => <li key={item.proxyId}>{item.proxyName}: {item.quantity}</li>)}</ul>
      </LegalCard>

      <PrimaryActionBar
        primary={{ label: uxCopy.phases.phase2.cta, onClick: props.finalizeBid, disabled: props.adjudicationLocked || !state.calculation }}
        secondary={[
          { label: uxCopy.phases.phase2.secondaryCta, onClick: props.resetToOriginalBid },
          { label: uxCopy.phases.phase2.compareCta, onClick: props.runCompare, disabled: state.topTab !== 'compare' },
        ]}
      />
      <ErrorMessage message={state.error} />
    </>
  );
}
