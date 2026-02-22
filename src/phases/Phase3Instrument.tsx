import { useState } from 'react';
import { uxCopy } from '../content/uxCopy';
import { Drawer } from '../components/Drawer';
import { ErrorMessage } from '../components/ErrorMessage';
import { LegalCard } from '../components/LegalCard';
import { PhaseHeader } from '../components/PhaseHeader';
import { PrimaryActionBar } from '../components/PrimaryActionBar';

const INSTRUMENT_TEXT_LIMIT = 4000;

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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const messageRemaining = INSTRUMENT_TEXT_LIMIT - props.state.formalizer.message.length;

  return (
    <>
      <PhaseHeader phaseLabel="Phase 3 of 4" heading={uxCopy.phases.phase3.heading} subtitle={uxCopy.phases.phase3.subtitle} />
      <LegalCard>
        <label htmlFor="phase3-template">Template<select id="phase3-template" className="ccc-input" value={props.state.formalizer.template} onChange={(e) => props.dispatch({ type: 'setFormalizerField', field: 'template', value: e.target.value })}>{props.templates.map((template) => <option key={template} value={template}>{template}</option>)}</select></label>
        <button className="cta-secondary" onClick={props.generateMessage}>Refresh draft</button>
        <label htmlFor="phase3-instrument-text">
          Instrument text
          <textarea
            id="phase3-instrument-text"
            className="ccc-input"
            rows={10}
            value={props.state.formalizer.message}
            maxLength={INSTRUMENT_TEXT_LIMIT}
            aria-describedby="phase3-instrument-limit"
            onChange={(e) => props.dispatch({ type: 'setFormalizerField', field: 'message', value: e.target.value })}
            placeholder="Instrument text will be drafted automatically with editable placeholders."
          />
        </label>
        <p id="phase3-instrument-limit" className="helper" aria-live="polite">{messageRemaining} characters remaining.</p>
        {props.state.formalizer.message.length >= INSTRUMENT_TEXT_LIMIT && <p className="error" role="alert">Instrument text reached the maximum length.</p>}
      </LegalCard>

      <button type="button" className="more-details-trigger" onClick={() => setDetailsOpen(true)}>
        More details?
      </button>
      <Drawer isOpen={detailsOpen} title="Export options" onClose={() => setDetailsOpen(false)}>
        <div className="stepper" role="tablist" aria-label="Export format">
          <button role="tab" aria-selected={props.exportTab === 'text'} className={props.exportTab === 'text' ? 'step active' : 'step'} onClick={() => props.setExportTab('text')}>Text</button>
          <button role="tab" aria-selected={props.exportTab === 'image'} className={props.exportTab === 'image' ? 'step active' : 'step'} onClick={() => props.setExportTab('image')}>Image</button>
          <button role="tab" aria-selected={props.exportTab === 'pdf'} className={props.exportTab === 'pdf' ? 'step active' : 'step'} onClick={() => props.setExportTab('pdf')}>PDF</button>
          <button role="tab" aria-selected={props.exportTab === 'html'} className={props.exportTab === 'html' ? 'step active' : 'step'} onClick={() => props.setExportTab('html')}>HTML</button>
        </div>
        <div className="stepper">
          <button className="cta-secondary" onClick={() => props.runExportAction('copy', 'text')}>Copy</button>
          <button className="cta-secondary" onClick={() => props.runExportAction('download', 'pdf')}>PDF</button>
          <button className="cta-secondary" onClick={() => props.runExportAction('share', 'text')}>Share</button>
        </div>
      </Drawer>

      <PrimaryActionBar
        primary={{ label: uxCopy.phases.phase3.cta, onClick: props.onCompleteInstrument }}
      />
      {props.state.share.text && <pre className="legal-card document-preview" aria-label="Generated share text preview">{props.state.share.text}</pre>}
      {props.state.share.qrPreview && <p className="result">{props.state.share.qrPreview}</p>}
      <ErrorMessage message={props.state.formalizer.error} statute="Statute 9" />
      <ErrorMessage message={props.state.share.error} statute="Statute 11" />
      {props.exportToast && <p className="helper">{props.exportToast}</p>}
    </>
  );
}
