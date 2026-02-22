import { uxCopy } from '../content/uxCopy';

type Props = {
  calculation: any;
  shareText: string;
  exportToast: string;
  onSaveEntry: () => void;
};

export function Phase4Docket(props: Props) {
  return (
    <>
      <h2>{uxCopy.phases.phase4.heading}</h2>
      <p className="helper">{uxCopy.phases.phase4.subtitle}</p>
      <p className="hero">{props.calculation ? `${props.calculation.camelValue.toFixed(2)} camels` : uxCopy.phases.phase4.empty}</p>
      {props.shareText && <pre>{props.shareText}</pre>}
      {props.exportToast && <p className="helper">{props.exportToast}</p>}
      <button className="ccc-button-primary cta-primary" onClick={props.onSaveEntry} disabled={!props.shareText}>{uxCopy.phases.phase4.cta}</button>
    </>
  );
}
