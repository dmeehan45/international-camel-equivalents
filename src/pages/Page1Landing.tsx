import type { uxCopy } from '../content/uxCopy';

type Props = {
  copy: typeof uxCopy;
  howOpen: boolean;
  onToggleHow: () => void;
  onBegin: () => void;
};

export function Page1Landing({ copy, howOpen, onToggleHow, onBegin }: Props) {
  const benefits = [
    {
      title: 'Fast & Simple',
      detail: 'One-click proxy selection and contract generation',
    },
    {
      title: 'DBT-Indexed Rates',
      detail: 'Live benchmarking across 100+ certified alternatives',
    },
    {
      title: 'Secure Advisory',
      detail: 'Documents stored locally • No data collection',
    },
  ];

  const trustLines = [
    'DBT v2.026 Certified',
    'Bureau of Absurd Exchanges Compliant',
    'Advisory Use Only',
    'Not Legal Advice',
    '256-bit Local Encryption',
    'GDPR-Style Privacy (No Data Processed)',
    'SOC 2 Inspired Controls',
  ];

  return (
    <div className="intro-landing">
      <header className="intro-hero" aria-label="Advisory service introduction">
        <p className="intro-kicker">Advisory Workflow Platform</p>
        <h2>{copy.page1.title}</h2>
        <p className="intro-tagline">Securely formalize marriage proposals with DBT-certified proxy valuation.</p>
        <div className="intro-microcopy" aria-label="Service highlights">
          <p>Generate compliant indentures in under three minutes.</p>
          <p>No login required. Instant advisory documents. Auditable rate history.</p>
        </div>
      </header>

      <section className="benefits-grid" aria-label="Service benefits">
        {benefits.map((benefit) => (
          <article className="benefit-card" key={benefit.title}>
            <h3>{benefit.title}</h3>
            <p>{benefit.detail}</p>
          </article>
        ))}
      </section>

      <section className="trust-bar" aria-label="Trust and compliance markers">
        <div className="trust-line-items">
          {trustLines.map((line) => (
            <p className="trust-line" key={line}>
              <span aria-hidden="true">•</span> {line}
            </p>
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
          <li>Enter basic proposal particulars.</li>
          <li>Select a certified proxy and quantity.</li>
          <li>Review and customize the generated indenture.</li>
          <li>Export or transmit the advisory document.</li>
          <li>Manage drafts in your secure local docket.</li>
        </ol>

        <p className="helper">{copy.page1.footnotes[0]}</p>
        <p className="helper">{copy.page1.footnotes[1]}</p>
      </details>
    </div>
  );
}
