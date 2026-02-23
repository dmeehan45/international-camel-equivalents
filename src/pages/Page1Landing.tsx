import type { uxCopy } from '../content/uxCopy';

type Props = {
  copy: typeof uxCopy;
  howOpen: boolean;
  onToggleHow: () => void;
  onBegin: () => void;
};

export function Page1Landing({ copy, howOpen, onToggleHow, onBegin }: Props) {
  return (
    <div className="intro-landing">
      <header className="intro-hero" aria-label="Advisory service introduction">
        <p className="intro-kicker">Advisory Workflow Platform</p>
        <h2>{copy.page1.title}</h2>
        <p className="intro-tagline">{copy.page1.tagline}</p>
        {copy.page1.body.map((line) => <p key={line}>{line}</p>)}
      </header>

      <section className="trust-rail" aria-label="Advisory trust markers">
        <div className="trust-badge-grid">
          {copy.page1.trustBadges.map((badge) => (
            <p className="trust-badge" key={badge}>
              <span className="trust-badge-dot" aria-hidden="true" />
              {badge}
            </p>
          ))}
        </div>
        <div className="trust-mentions" aria-label="Advisory endorsements">
          {copy.page1.trustMentions.map((mention) => (
            <p key={mention}>{mention}</p>
          ))}
        </div>
      </section>

      <section className="cta-zone" aria-label="Begin advisory process">
        <button className="ccc-button-primary" onClick={onBegin}>{copy.page1.begin}</button>
        <p className="helper cta-meta">{copy.page1.ctaMeta}</p>
      </section>

      <details className="how-it-works" open={howOpen}>
        <summary className="how-it-works-summary" onClick={(event) => {
          event.preventDefault();
          onToggleHow();
        }}>
          <span>{copy.page1.howItWorksLabel}</span>
          <span className="how-it-works-chevron" aria-hidden="true">▾</span>
        </summary>

        <ol>
          {copy.page1.howItWorksSteps.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong> — {step.detail}
            </li>
          ))}
        </ol>

        <p className="helper">{copy.page1.howItWorksText}</p>
      </details>

      {copy.page1.footnotes.map((note) => <p key={note} className="helper legal-footnote">{note}</p>)}
    </div>
  );
}
