import { uxCopy } from '../content/uxCopy';
import { ErrorMessage } from '../components/ErrorMessage';

type Props = {
  state: any;
  exportTab: 'text' | 'image' | 'pdf' | 'html';
  setExportTab: (value: 'text' | 'image' | 'pdf' | 'html') => void;
  generateMessage: () => void;
  runExportAction: (action: 'copy' | 'download' | 'share', forcedTab?: 'text' | 'image' | 'pdf' | 'html') => void;
  exportToast: string;
  dispatch: (value: any) => void;
  templates: string[];
  onCompleteInstrument: () => void;
};

export function Phase3Instrument(props: Props) {
  return (
    <>
      <h2>{uxCopy.phases.phase3.heading}</h2>
      <label>Template<select className="ccc-input" value={props.state.formalizer.template} onChange={(e) => props.dispatch({ type: 'setFormalizerField', field: 'template', value: e.target.value })}>{props.templates.map((template) => <option key={template} value={template}>{template}</option>)}</select></label>
      <button onClick={props.generateMessage}>Refresh draft</button>
      <label>
        Instrument text
        <textarea
          className="ccc-input"
          rows={10}
          value={props.state.formalizer.message}
          onChange={(e) => props.dispatch({ type: 'setFormalizerField', field: 'message', value: e.target.value })}
          placeholder="Instrument text will be drafted automatically with editable placeholders."
        />
      </label>
      <div className="stepper">
        <button className={props.exportTab === 'text' ? 'step active' : 'step'} onClick={() => props.setExportTab('text')}>Text</button>
        <button className={props.exportTab === 'image' ? 'step active' : 'step'} onClick={() => props.setExportTab('image')}>Image</button>
        <button className={props.exportTab === 'pdf' ? 'step active' : 'step'} onClick={() => props.setExportTab('pdf')}>PDF</button>
        <button className={props.exportTab === 'html' ? 'step active' : 'step'} onClick={() => props.setExportTab('html')}>HTML</button>
      </div>
      <button className="ccc-button-primary cta-primary" onClick={() => props.runExportAction('copy', 'text')}>One-click copy</button>
      <button onClick={() => props.runExportAction('download', 'pdf')}>One-click PDF</button>
      <button onClick={() => props.runExportAction('share', 'text')}>One-click share</button>
      <button onClick={props.onCompleteInstrument}>Continue to Phase IV docket</button>
      {props.state.share.text && <pre className="legal-card document-preview">{props.state.share.text}</pre>}
      {props.state.share.qrPreview && <p className="result">{props.state.share.qrPreview}</p>}
      <ErrorMessage message={props.state.formalizer.error} statute="Statute 9" />
      <ErrorMessage message={props.state.share.error} statute="Statute 11" />
      {props.exportToast && <p className="helper">{props.exportToast}</p>}
    </>
  );
}
