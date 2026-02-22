import type { uxCopy } from '../content/uxCopy';

type Props = {
  copy: typeof uxCopy;
  howOpen: boolean;
  onToggleHow: () => void;
  onBegin: () => void;
};

export function Page1Landing({ copy, howOpen, onToggleHow, onBegin }: Props) {
  return (
    <div>
      <h2>{copy.page1.title}</h2>
      {copy.page1.body.map((line) => <p key={line}>{line}</p>)}
      <button className="ccc-button-primary" onClick={onBegin}>{copy.page1.begin}</button>
      <button className="cta-secondary text-link" onClick={onToggleHow}>{copy.page1.howItWorksLabel}</button>
      {howOpen && <p className="helper">{copy.page1.howItWorksText}</p>}
    </div>
  );
}
