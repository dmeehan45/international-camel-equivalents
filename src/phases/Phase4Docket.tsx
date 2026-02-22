type Props = {
  calculation: any;
  shareText: string;
  exportToast: string;
  onSaveEntry: () => void;
};

export function Phase4Docket(props: Props) {
  return (
    <>
      <h2>Phase 4: Docket</h2>
      <p className="helper">Review the generated instrument and archive it.</p>
      <p className="hero">{props.calculation ? `${props.calculation.camelValue.toFixed(2)} camels` : 'No bid yet.'}</p>
      {props.shareText && <pre>{props.shareText}</pre>}
      {props.exportToast && <p className="helper">{props.exportToast}</p>}
      <button className="ccc-button-primary cta-primary" onClick={props.onSaveEntry} disabled={!props.shareText}>Save to Archive</button>
    </>
  );
}
