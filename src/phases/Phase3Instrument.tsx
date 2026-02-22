import { useState } from 'react';
import { uxCopy } from '../content/uxCopy';
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
  const [draftToolsOpen, setDraftToolsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const messageRemaining = INSTRUMENT_TEXT_LIMIT - props.state.formalizer.message.length;

  return (
    <>
      <PhaseHeader phaseLabel="Card 5 of 6" heading={uxCopy.phases.phase3.heading} subtitle={uxCopy.phases.phase3.subtitle} />
      <LegalCard>
        <label htmlFor="phase3-instrument-text">
          Proposal text
          <textarea
            id="phase3-instrument-text"
            className="ccc-input"
            rows={10}
            value={props.state.formalizer.message}
            maxLength={INSTRUMENT_TEXT_LIMIT}
            aria-describedby="phase3-instrument-limit"
            onChange={(e) => props.dispatch({ type: 'setFormalizerField', field: 'message', value: e.target.value })}
            placeholder="Your proposal text appears here."
          />
        </label>
        <p id="phase3-instrument-limit" className="helper" aria-live="polite">{messageRemaining} characters remaining.</p>
        {props.state.formalizer.message.length >= INSTRUMENT_TEXT_LIMIT && <p className="error" role="alert">Text reached the maximum length.</p>}
      </LegalCard>

      <div className="results-drawer">
        <button className="cta-secondary" aria-expanded={draftToolsOpen} onClick={() => setDraftToolsOpen((current) => !current)}>
          {draftToolsOpen ? 'Hide draft tools' : 'More details?'}
        </button>
        {draftToolsOpen && (
          <div className="grid mobile-drawer-body">
            <label htmlFor="phase3-template">Template<select id="phase3-template" className="ccc-input" value={props.state.formalizer.template} onChange={(e) => props.dispatch({ type: 'setFormalizerField', field: 'template', value: e.target.value })}>{props.templates.map((template) => <option key={template} value={template}>{template}</option>)}</select></label>
            <button className="cta-secondary" onClick={props.generateMessage}>Refresh draft</button>
          </div>
        )}
      </div>

      <div className="results-drawer">
        <button className="cta-secondary" aria-expanded={exportOpen} onClick={() => setExportOpen((current) => !current)}>
          {exportOpen ? 'Hide export options' : 'Share and download'}
        </button>
        {exportOpen && (
          <div className="mobile-drawer-body">
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
          </div>
        )}
      </div>

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
