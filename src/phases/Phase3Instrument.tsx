type Props = {
  state: any;
  exportTab: 'text' | 'image' | 'pdf' | 'html';
  setExportTab: (value: 'text' | 'image' | 'pdf' | 'html') => void;
  generateMessage: () => void;
  runExportAction: (action: 'copy' | 'download' | 'share') => void;
  exportToast: string;
  dispatch: (value: any) => void;
  templates: string[];
};

export function Phase3Instrument(props: Props) {
  return (
    <>
      <h2>Phase 3: Instrument</h2>
      <label>Template<select className="ccc-input" value={props.state.formalizer.template} onChange={(e) => props.dispatch({ type: 'setFormalizerField', field: 'template', value: e.target.value })}>{props.templates.map((template) => <option key={template} value={template}>{template}</option>)}</select></label>
      <button onClick={props.generateMessage}>Generate message</button>
      {props.state.formalizer.message && <pre>{props.state.formalizer.message}</pre>}
      <div className="stepper">
        <button className={props.exportTab === 'text' ? 'step active' : 'step'} onClick={() => props.setExportTab('text')}>Text</button>
        <button className={props.exportTab === 'image' ? 'step active' : 'step'} onClick={() => props.setExportTab('image')}>Image</button>
        <button className={props.exportTab === 'pdf' ? 'step active' : 'step'} onClick={() => props.setExportTab('pdf')}>PDF</button>
        <button className={props.exportTab === 'html' ? 'step active' : 'step'} onClick={() => props.setExportTab('html')}>HTML</button>
      </div>
      <button className="ccc-button-primary cta-primary" onClick={() => props.runExportAction('copy')}>Copy</button>
      <button onClick={() => props.runExportAction('download')}>Download</button>
      <button onClick={() => props.runExportAction('share')}>Share</button>
      {props.state.share.text && <pre>{props.state.share.text}</pre>}
      {props.state.share.qrPreview && <p className="result">{props.state.share.qrPreview}</p>}
      {props.exportToast && <p className="helper">{props.exportToast}</p>}
    </>
  );
}
