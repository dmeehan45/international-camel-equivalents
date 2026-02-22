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
      <h2>Phase 1: Input</h2>
      <div className="grid">
        <label>Name<input className="ccc-input" value={props.bidName} onChange={(e) => props.setBidName(e.target.value)} placeholder="e.g. Layla" /></label>
        <label>Region<select className="ccc-input" value={props.bidRegion} onChange={(e) => props.setBidRegion(e.target.value)}><option value="">Choose region</option>{Object.entries(locationPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}</select></label>
      </div>
      <label>Camel quantity: {props.camelQuantity}<input className="ccc-input" type="range" min={props.minCamelQuantity} max={props.maxCamelQuantity} value={props.camelQuantity} onChange={(e) => props.setCamelQuantity(props.clampCamelQuantity(Number(e.target.value)))} /></label>
      <p className="helper">Set the primary camel quantity, then calculate ICE. Guardrails keep the value between {props.minCamelQuantity} and {props.maxCamelQuantity} camels.</p>
      <p className="helper">Examples: 2 camels, 5 yaks, 2 cows</p>
      <div className="context-cards">
        <details className="context-card"><summary>Warrior status (optional)</summary><label><input type="checkbox" checked={props.isWarrior} onChange={(e) => props.setIsWarrior(e.target.checked)} /> Includes warrior context</label></details>
        <details className="context-card"><summary>Hobby (optional)</summary><label>Hobby<input className="ccc-input" value={props.hobby} onChange={(e) => props.setHobby(e.target.value)} placeholder="e.g. falconry" /></label></details>
        <details className="context-card"><summary>Courtship length (optional)</summary><label>Courtship years<input className="ccc-input" type="number" min="0" max="50" value={props.courtshipYears} onChange={(e) => props.setCourtshipYears(Math.min(50, Math.max(0, Number(e.target.value) || 0)))} /></label></details>
        <details className="context-card"><summary>Artifact included (optional)</summary><label><input type="checkbox" checked={props.hasArtifact} onChange={(e) => props.setHasArtifact(e.target.checked)} /> Includes ceremonial artifact</label></details>
        <details className="context-card"><summary>Quirks (optional)</summary><label>Quirks<textarea className="ccc-input" value={props.quirks} onChange={(e) => props.setQuirks(e.target.value)} placeholder="Add any notable details" /></label></details>
      </div>
      <button className="ccc-button-primary cta-primary" onClick={props.onCalculate} disabled={!props.canCalculateIce}>Calculate ICE</button>
      <button className="cta-secondary" type="button" onClick={props.onResetOptional}>Reset optional details</button>
      {props.parseSource && <p className="result">{props.parseSource}</p>}
    </>
  );
}
