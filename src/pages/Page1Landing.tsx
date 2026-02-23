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
      <h2>{copy.page1.title}</h2>
      <p className="intro-tagline">{copy.page1.tagline}</p>

      {copy.page1.body.map((line) => <p key={line}>{line}</p>)}

      <div className="trust-badge-grid" aria-label="Advisory trust markers">
        {copy.page1.trustBadges.map((badge) => (
          <p className="trust-badge" key={badge}>{badge}</p>
        ))}
      </div>

      <div className="trust-mentions" aria-label="Advisory endorsements">
        {copy.page1.trustMentions.map((mention) => (
          <p key={mention}>{mention}</p>
        ))}
      </div>

      <button className="ccc-button-primary" onClick={onBegin}>{copy.page1.begin}</button>
      <p className="helper cta-meta">{copy.page1.ctaMeta}</p>

      <details className="how-it-works" open={howOpen}>
        <summary className="cta-secondary text-link" onClick={(event) => {
          event.preventDefault();
          onToggleHow();
        }}>
          {copy.page1.howItWorksLabel}
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
