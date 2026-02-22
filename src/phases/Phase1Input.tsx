import { uxCopy } from '../content/uxCopy';
import { locationPresets } from '../core/customizer-settings.js';

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
  return (
    <>
      <h2>{uxCopy.phases.phase1.heading}</h2>
      <p className="helper">{uxCopy.phases.phase1.subtitle}</p>
      <div className="grid">
        <label title="Required field">{uxCopy.phases.phase1.labels.bidName}<input className="ccc-input" value={props.bidName} onChange={(e) => props.setBidName(e.target.value)} placeholder={uxCopy.phases.phase1.placeholders.bidName} /></label>
        <label title="Required field">{uxCopy.phases.phase1.labels.bidRegion}<select className="ccc-input" value={props.bidRegion} onChange={(e) => props.setBidRegion(e.target.value)}><option value="">{uxCopy.phases.phase1.placeholders.bidRegion}</option>{Object.entries(locationPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}</select></label>
      </div>
      <label>{uxCopy.phases.phase1.labels.camelQuantity}: {props.camelQuantity}<input className="ccc-input" type="range" min={props.minCamelQuantity} max={props.maxCamelQuantity} value={props.camelQuantity} onChange={(e) => props.setCamelQuantity(props.clampCamelQuantity(Number(e.target.value)))} /></label>
      <p className="helper">{uxCopy.phases.phase1.helper.quantityRange(props.minCamelQuantity, props.maxCamelQuantity)}</p>
      <p className="helper">{uxCopy.phases.phase1.helper.examples}</p>
      <div className="context-cards">
        <details className="context-card"><summary>{uxCopy.phases.phase1.labels.warriorStatus}</summary><label><input type="checkbox" checked={props.isWarrior} onChange={(e) => props.setIsWarrior(e.target.checked)} /> Includes warrior context</label></details>
        <details className="context-card"><summary>{uxCopy.phases.phase1.labels.hobby}</summary><label>Hobby<input className="ccc-input" value={props.hobby} onChange={(e) => props.setHobby(e.target.value)} placeholder={uxCopy.phases.phase1.placeholders.hobby} /></label></details>
        <details className="context-card"><summary>{uxCopy.phases.phase1.labels.courtshipYears}</summary><label>Courtship years<input className="ccc-input" type="number" min="0" max="50" value={props.courtshipYears} onChange={(e) => props.setCourtshipYears(Math.min(50, Math.max(0, Number(e.target.value) || 0)))} /></label></details>
        <details className="context-card"><summary>{uxCopy.phases.phase1.labels.artifact}</summary><label><input type="checkbox" checked={props.hasArtifact} onChange={(e) => props.setHasArtifact(e.target.checked)} /> Includes ceremonial artifact</label></details>
        <details className="context-card"><summary>{uxCopy.phases.phase1.labels.quirks}</summary><label>Quirks<textarea className="ccc-input" value={props.quirks} onChange={(e) => props.setQuirks(e.target.value)} placeholder={uxCopy.phases.phase1.placeholders.quirks} /></label></details>
      </div>
      <p className="helper">{uxCopy.phases.phase1.helper.requiredFields}</p>
      <button className="ccc-button-primary cta-primary" onClick={props.onCalculate} disabled={!props.canCalculateIce}>{uxCopy.phases.phase1.cta}</button>
      <button className="cta-secondary" type="button" onClick={props.onResetOptional}>{uxCopy.phases.phase1.secondaryCta}</button>
      {props.parseSource && <p className="result">{props.parseSource}</p>}
    </>
  );
}
