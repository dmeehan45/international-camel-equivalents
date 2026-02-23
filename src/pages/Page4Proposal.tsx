import { useEffect, useMemo, useRef, useState } from 'react';
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
  selectedClauses: string[];
  onToggleClause: (value: string) => void;
  tone: Tone;
  tones: readonly Tone[];
  onSetTone: (value: Tone) => void;
  clauseOptions: readonly { name: string; text: string }[];
  onGenerate: () => void;
  onCopy: () => void;
  onDownloadTxt: () => void;
  onDownloadPdf: () => void;
  onShare: () => void;
  onDone: () => void;
  onTryDifferentProxy: () => void;
  onFirstEditWarning: () => void;
};

export function Page4Proposal(props: Props) {
  const [previewClause, setPreviewClause] = useState<string>('');
  const previousCountRef = useRef(props.selectedClauses.length);
  const previewRef = useRef<HTMLTextAreaElement | null>(null);
  const reachedCap = props.selectedClauses.length >= 5;
  const [mobilePreviewHeight, setMobilePreviewHeight] = useState<string | undefined>(undefined);

  const previewSnippet = useMemo(() => {
    const activeClause = props.clauseOptions.find((option) => option.name === previewClause);
    return activeClause?.text.split('\n').find((line) => line.trim() && !line.startsWith('Addendum')) || '';
  }, [props.clauseOptions, previewClause]);

  useEffect(() => {
    if (props.selectedClauses.length > previousCountRef.current && previewRef.current) {
      previewRef.current.scrollTop = previewRef.current.scrollHeight;
    }
    previousCountRef.current = props.selectedClauses.length;
  }, [props.selectedClauses.length]);


  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updatePreviewHeight = () => {
      if (window.innerWidth >= 768) {
        setMobilePreviewHeight(undefined);
        return;
      }

      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      setMobilePreviewHeight(`${Math.max(220, viewportHeight - 280)}px`);
    };

    updatePreviewHeight();

    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', updatePreviewHeight);
    window.addEventListener('orientationchange', updatePreviewHeight);

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updatePreviewHeight) : null;
    if (observer) observer.observe(document.documentElement);

    return () => {
      viewport?.removeEventListener('resize', updatePreviewHeight);
      window.removeEventListener('orientationchange', updatePreviewHeight);
      observer?.disconnect();
    };
  }, []);

  return (
    <div className="proposal-layout-root">
      <h2>{props.copy.page4.title}</h2>

      <div className="contract-preview-layout">
        <div className="legal-shell-contract">
          <span className="dbt-seal-badge">DBT CERTIFIED SEAL</span>
          <textarea
            ref={previewRef}
            className="contract-text"
            rows={20}
            value={props.proposalText}
            onChange={(e) => {
              props.onFirstEditWarning();
              props.onSetProposalText(e.target.value);
            }}
            style={mobilePreviewHeight ? { maxHeight: mobilePreviewHeight } : undefined}
          />
        </div>

        <aside className="contract-enhancements">
          <h3>Instrument Enhancements</h3>
          <p className="helper">Structured clauses, legal spacing, and certified docket styling are applied for exports.</p>
          <p className="helper">Use personalize options below to tune clauses and tone without breaking legal layout.</p>
        </aside>
      </div>

      <button className="cta-secondary text-link" onClick={props.onTogglePersonalize}>{props.copy.page4.personalizeLabel}</button>
      {props.personalizeOpen && (
        <div className="drawer">
          <label>{props.copy.page4.clauseLabel}
            <div className="clause-grid" role="group" aria-label={props.copy.page4.clauseLabel}>
              {props.clauseOptions.map((option) => {
                const checked = props.selectedClauses.includes(option.name);
                return (
                  <label
                    key={option.name}
                    className={checked ? 'clause-pill is-active' : 'clause-pill'}
                    onMouseEnter={() => setPreviewClause(option.name)}
                    onFocus={() => setPreviewClause(option.name)}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => props.onToggleClause(option.name)}
                      disabled={!checked && reachedCap}
                    />
                    <span>{option.name}</span>
                  </label>
                );
              })}
            </div>
            <small className="helper">Select up to 5 addendum clauses.</small>
            {previewClause && <p className="helper clause-snippet"><strong>Preview:</strong> {previewSnippet}</p>}
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
      <div className="actions-row actions-row--two">
        <button className="ccc-button-primary" onClick={props.onDone}>{props.copy.page4.done}</button>
        <button className="cta-secondary" onClick={props.onTryDifferentProxy}>Try a Different Proxy</button>
      </div>
      {props.copy.page4.footnotes.map((note) => <p key={note} className="helper legal-footnote">{note}</p>)}
    </div>
  );
}
