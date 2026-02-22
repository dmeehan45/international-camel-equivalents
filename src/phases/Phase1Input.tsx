import { useState } from 'react';
import { uxCopy } from '../content/uxCopy';
import { locationPresets } from '../core/customizer-settings.js';
import { LegalCard } from '../components/LegalCard';
import { PhaseHeader } from '../components/PhaseHeader';
import { PrimaryActionBar } from '../components/PrimaryActionBar';

const FIELD_LIMITS = {
  bidName: 80,
  hobby: 100,
  quirks: 320,
} as const;

type Props = {
  bidName: string;
  bidRegion: string;
  camelQuantity: number;
  minCamelQuantity: number;
  maxCamelQuantity: number;
  canCalculateIce: boolean;
  isWarrior: boolean;
  hobby: string;
  courtshipYears: number;
  hasArtifact: boolean;
  quirks: string;
  parseSource: string;
  setBidName: (value: string) => void;
  setBidRegion: (value: string) => void;
  setCamelQuantity: (value: number) => void;
  clampCamelQuantity: (value: number) => number;
  setIsWarrior: (value: boolean) => void;
  setHobby: (value: string) => void;
  setCourtshipYears: (value: number) => void;
  setHasArtifact: (value: boolean) => void;
  setQuirks: (value: string) => void;
  onCalculate: () => void;
  onResetOptional: () => void;
};

export function Phase1Input(props: Props) {
  const [optionalOpen, setOptionalOpen] = useState(false);
  const bidNameRemaining = FIELD_LIMITS.bidName - props.bidName.length;
  const hobbyRemaining = FIELD_LIMITS.hobby - props.hobby.length;
  const quirksRemaining = FIELD_LIMITS.quirks - props.quirks.length;

  return (
    <>
      <PhaseHeader phaseLabel="Card 1 of 6" heading={uxCopy.phases.phase1.heading} subtitle={uxCopy.phases.phase1.subtitle} />
      <LegalCard>
        <div className="grid">
          <label htmlFor="phase1-bid-name" title="Required field">
            {uxCopy.phases.phase1.labels.bidName}
            <input id="phase1-bid-name" className="ccc-input" value={props.bidName} maxLength={FIELD_LIMITS.bidName} aria-describedby="phase1-bid-name-limit" onChange={(e) => props.setBidName(e.target.value)} placeholder={uxCopy.phases.phase1.placeholders.bidName} autoFocus />
          </label>
          <p id="phase1-bid-name-limit" className="helper">{bidNameRemaining} characters remaining.</p>
          <label htmlFor="phase1-bid-region" title="Required field">
            {uxCopy.phases.phase1.labels.bidRegion}
            <select id="phase1-bid-region" className="ccc-input" value={props.bidRegion} onChange={(e) => props.setBidRegion(e.target.value)}>
              <option value="">{uxCopy.phases.phase1.placeholders.bidRegion}</option>
              {Object.entries(locationPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}
            </select>
          </label>
        </div>
        <label htmlFor="phase1-camel-quantity">{uxCopy.phases.phase1.labels.camelQuantity}: {props.camelQuantity}
          <input id="phase1-camel-quantity" className="ccc-input" type="range" min={props.minCamelQuantity} max={props.maxCamelQuantity} value={props.camelQuantity} onChange={(e) => props.setCamelQuantity(props.clampCamelQuantity(Number(e.target.value)))} />
        </label>
        <p className="helper">{uxCopy.phases.phase1.helper.quantityRange(props.minCamelQuantity, props.maxCamelQuantity)}</p>
      </LegalCard>

      <div className="results-drawer">
        <button className="cta-secondary" aria-expanded={optionalOpen} onClick={() => setOptionalOpen((current) => !current)}>
          {optionalOpen ? 'Hide details' : 'More details?'}
        </button>
        {optionalOpen && (
          <div className="context-cards mobile-drawer-body">
            <label htmlFor="phase1-warrior"><input id="phase1-warrior" type="checkbox" checked={props.isWarrior} onChange={(e) => props.setIsWarrior(e.target.checked)} /> Warrior skills included</label>
            <label htmlFor="phase1-hobby">Hobby
              <input id="phase1-hobby" className="ccc-input" value={props.hobby} maxLength={FIELD_LIMITS.hobby} aria-describedby="phase1-hobby-limit" onChange={(e) => props.setHobby(e.target.value)} placeholder={uxCopy.phases.phase1.placeholders.hobby} />
            </label>
            <p id="phase1-hobby-limit" className="helper">{hobbyRemaining} characters remaining.</p>
            <label htmlFor="phase1-courtship-years">Years together
              <input id="phase1-courtship-years" className="ccc-input" type="number" min="0" max="50" value={props.courtshipYears} onChange={(e) => props.setCourtshipYears(Math.min(50, Math.max(0, Number(e.target.value) || 0)))} />
            </label>
            <label htmlFor="phase1-artifact"><input id="phase1-artifact" type="checkbox" checked={props.hasArtifact} onChange={(e) => props.setHasArtifact(e.target.checked)} /> Ceremonial artifact included</label>
            <label htmlFor="phase1-quirks">Anything else?
              <textarea id="phase1-quirks" className="ccc-input" value={props.quirks} maxLength={FIELD_LIMITS.quirks} aria-describedby="phase1-quirks-limit" onChange={(e) => props.setQuirks(e.target.value)} placeholder={uxCopy.phases.phase1.placeholders.quirks} />
            </label>
            <p id="phase1-quirks-limit" className="helper" aria-live="polite">{quirksRemaining} characters remaining.</p>
            {props.quirks.length >= FIELD_LIMITS.quirks && <p className="error" role="alert">Notes reached the maximum length.</p>}
          </div>
        )}
      </div>

      <p className="helper">{uxCopy.phases.phase1.helper.requiredFields}</p>
      <PrimaryActionBar
        primary={{ label: uxCopy.phases.phase1.cta, onClick: props.onCalculate, disabled: !props.canCalculateIce }}
        secondary={[{ label: uxCopy.phases.phase1.secondaryCta, onClick: props.onResetOptional }]}
      />
      {props.parseSource && <p className="result">{props.parseSource}</p>}
    </>
  );
}
