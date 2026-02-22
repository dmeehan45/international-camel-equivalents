import type { uxCopy } from '../content/uxCopy';

type Tone = 'Formal' | 'Ironic' | 'Pedantic';

type Props = {
  copy: typeof uxCopy;
  proposalText: string;
  onSetProposalText: (text: string) => void;
  personalizeOpen: boolean;
  onTogglePersonalize: () => void;
  customSentence: string;
  onSetCustomSentence: (value: string) => void;
  selectedClause: string;
  onSetSelectedClause: (value: string) => void;
  tone: Tone;
  tones: readonly Tone[];
  onSetTone: (value: Tone) => void;
  clauseOptions: readonly string[];
  onGenerate: () => void;
  onCopy: () => void;
  onDownloadTxt: () => void;
  onDownloadPdf: () => void;
  onShare: () => void;
  onDone: () => void;
};

export function Page4Proposal(props: Props) {
  return (
    <div>
      <h2>{props.copy.page4.title}</h2>
      <textarea className="contract-text" rows={14} value={props.proposalText} onChange={(e) => props.onSetProposalText(e.target.value)} />

      <button className="cta-secondary text-link" onClick={props.onTogglePersonalize}>{props.copy.page4.personalizeLabel}</button>
      {props.personalizeOpen && (
        <div className="drawer">
          <label>{props.copy.page4.clauseLabel}
            <select value={props.selectedClause} onChange={(e) => props.onSetSelectedClause(e.target.value)}>
              {props.clauseOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>{props.copy.page4.customSentence}
            <input value={props.customSentence} onChange={(e) => props.onSetCustomSentence(e.target.value)} />
          </label>
          <label>{props.copy.page4.tone}
            <select value={props.tone} onChange={(e) => props.onSetTone(e.target.value as Tone)}>
              {props.tones.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <button className="cta-secondary" onClick={props.onGenerate}>{props.copy.page4.generate}</button>
        </div>
      )}

      <div className="actions-row actions-row--two">
        <button className="cta-secondary" onClick={props.onCopy}>{props.copy.page4.copy}</button>
        <button className="cta-secondary" onClick={props.onShare}>{props.copy.page4.share}</button>
      </div>
      <div className="actions-row actions-row--two">
        <button className="cta-secondary" onClick={props.onDownloadTxt}>{props.copy.page4.downloadTxt}</button>
        <button className="cta-secondary" onClick={props.onDownloadPdf}>{props.copy.page4.downloadPdf}</button>
      </div>
      <button className="ccc-button-primary" onClick={props.onDone}>{props.copy.page4.done}</button>
    </div>
  );
}
