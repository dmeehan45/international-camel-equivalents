import { useMemo, useState } from 'react';
import { DowryFormProvider, useDowryForm } from './store/DowryFormContext';
import { FLOW_STEP_LABELS, canOpenFlowStep, getFlowSteps, type FlowStepId } from './domain/flow';
import { uxCopy } from './content/uxCopy';

type SavedDraft = {
  id: string;
  name: string;
  camels: number;
  summary: string;
  text: string;
  createdAt: string;
};

const regions = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Kenya', 'UAE', 'India', 'Pakistan', 'Other'];
const ageRanges = ['18–24', '25–34', '35–44', '45–54', '55+'];
const tones = ['Formal', 'Playful', 'Very Dry'] as const;

type Tone = (typeof tones)[number];

function estimateSuggestion(name: string, region: string, ageRange: string, occupation: string, quirkyFact: string) {
  let score = 18;
  if (name.trim().length > 10) score += 2;
  if (region && region !== 'Other') score += 1;
  if (ageRange) score += 1;
  if (occupation.trim()) score += 2;
  if (quirkyFact.trim()) score += 1;
  return Math.min(100, Math.max(5, score));
}

function equivalentCards(camels: number) {
  return [
    { label: `${camels} Camels`, camels },
    { label: `Luxury handbags (~$${(camels * 2500).toLocaleString()})`, camels },
    { label: `Used compact cars (~${Math.max(1, Math.round(camels / 8))} vehicles)`, camels },
    { label: `Business-class flights (~${Math.max(1, Math.round(camels * 0.9))} round-trips)`, camels },
  ];
}

function buildProposalText(name: string, camels: number, usd: number, tone: Tone, customSentence: string) {
  const toneLine = tone === 'Formal'
    ? 'This offer is made in sincere good faith.'
    : tone === 'Playful'
      ? 'This offer is sincere, if admittedly dramatic.'
      : 'This offer is submitted with calm administrative confidence.';

  return `To: ${name}\n\nI hereby formally propose marriage and offer, in good faith, a dowry of ${camels} camels (or a modern equivalent value of approximately $${usd.toLocaleString()}).\n\n${toneLine}\n\nAccepted terms are binding in the court of public opinion.${customSentence ? `\n\n${customSentence}` : ''}\n\nRegards,`;
}

function Shell() {
  const { form, dispatchForm, canCalculateIce, clampCamelQuantity } = useDowryForm();
  const [step, setStep] = useState<FlowStepId>('page1-landing');
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [error, setError] = useState('');
  const [tone, setTone] = useState<Tone>('Formal');
  const [customSentence, setCustomSentence] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  const suggestedCamels = useMemo(
    () => estimateSuggestion(form.bidName, form.bidRegion, form.ageRange, form.occupation, form.quirkyFact),
    [form.bidName, form.bidRegion, form.ageRange, form.occupation, form.quirkyFact],
  );

  const flowContext = {
    currentStep: step,
    hasBasics: canCalculateIce,
    hasOffer: form.camelQuantity >= 5,
    hasProposal: Boolean(proposalText.trim()),
  };

  const cards = equivalentCards(form.camelQuantity);

  function startOver() {
    setStep('page1-landing');
    setProposalText('');
    setCustomSentence('');
    setTone('Formal');
    setError('');
    dispatchForm({ type: 'setField', field: 'bidName', value: '' });
    dispatchForm({ type: 'setField', field: 'bidRegion', value: '' });
    dispatchForm({ type: 'setField', field: 'camelQuantity', value: 18 });
    dispatchForm({ type: 'resetOptional' });
  }

  function saveDraft() {
    if (!proposalText.trim()) {
      setError(uxCopy.errors.proposalRequired);
      return;
    }
    const item: SavedDraft = {
      id: crypto.randomUUID(),
      name: form.bidName,
      camels: form.camelQuantity,
      summary: `${form.camelQuantity} camels ≈ ${Math.max(1, Math.round(form.camelQuantity / 8))} used compact cars`,
      text: proposalText,
      createdAt: new Date().toISOString(),
    };
    setDrafts((current) => [item, ...current]);
    setStep('page5-drafts');
    setError('');
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  function downloadText() {
    const blob = new Blob([proposalText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dowry-proposal.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function shareText(text: string) {
    if (navigator.share) {
      await navigator.share({ title: uxCopy.global.appTitle, text });
      return;
    }
    await copyText(text);
  }

  return (
    <main className="app-shell">
      <header className="fixed-header">
        <button onClick={() => {
          const steps = getFlowSteps();
          const idx = steps.indexOf(step);
          if (idx > 0) setStep(steps[idx - 1]);
        }} disabled={step === 'page1-landing'} aria-label="Back">←</button>
        <h1>{uxCopy.global.appTitle}</h1>
        <button onClick={startOver} aria-label="Home">⌂</button>
      </header>

      <nav className="phase-progress" aria-label="Progress">
        {getFlowSteps().map((item) => (
          <button key={item} className={item === step ? 'step active' : 'step'} disabled={!canOpenFlowStep(item, flowContext)} onClick={() => setStep(item)}>
            {FLOW_STEP_LABELS[item]}
          </button>
        ))}
      </nav>

      <section className="view-card">
        {step === 'page1-landing' && (
          <div>
            <h2>{uxCopy.page1.title}</h2>
            {uxCopy.page1.body.map((line) => <p key={line}>{line}</p>)}
            <button className="ccc-button-primary" onClick={() => setStep('page2-basics')}>{uxCopy.page1.begin}</button>
            <button className="cta-secondary text-link" onClick={() => setHowOpen((v) => !v)}>{uxCopy.page1.howItWorksLabel}</button>
            {howOpen && <p className="helper">{uxCopy.page1.howItWorksText}</p>}
          </div>
        )}

        {step === 'page2-basics' && (
          <div>
            <h2>{uxCopy.page2.title}</h2>
            <label>{uxCopy.page2.nameLabel}
              <input value={form.bidName} placeholder={uxCopy.page2.namePlaceholder} onChange={(e) => dispatchForm({ type: 'setField', field: 'bidName', value: e.target.value })} />
            </label>
            <label>{uxCopy.page2.regionLabel}
              <select value={form.bidRegion} onChange={(e) => dispatchForm({ type: 'setField', field: 'bidRegion', value: e.target.value })}>
                <option value="">{uxCopy.page2.regionPlaceholder}</option>
                {regions.map((region) => <option key={region} value={region}>{region}</option>)}
              </select>
            </label>

            <button className="cta-secondary text-link" onClick={() => setOptionalOpen((v) => !v)}>{optionalOpen ? uxCopy.page2.hideMore : uxCopy.page2.addMore}</button>
            {optionalOpen && (
              <div className="drawer">
                <label>{uxCopy.page2.ageRange}
                  <select value={form.ageRange} onChange={(e) => dispatchForm({ type: 'setField', field: 'ageRange', value: e.target.value })}>
                    <option value="">Select age range</option>
                    {ageRanges.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <label>{uxCopy.page2.occupation}
                  <input value={form.occupation} placeholder={uxCopy.page2.occupationPlaceholder} onChange={(e) => dispatchForm({ type: 'setField', field: 'occupation', value: e.target.value })} />
                </label>
                <label>{uxCopy.page2.quirkyFact}
                  <input value={form.quirkyFact} placeholder={uxCopy.page2.quirkyFactPlaceholder} onChange={(e) => dispatchForm({ type: 'setField', field: 'quirkyFact', value: e.target.value })} />
                </label>
              </div>
            )}

            <button className="ccc-button-primary" onClick={() => {
              if (!form.bidName.trim()) return setError(uxCopy.errors.nameRequired);
              if (!form.bidRegion.trim()) return setError(uxCopy.errors.regionRequired);
              dispatchForm({ type: 'setField', field: 'camelQuantity', value: suggestedCamels });
              setError('');
              setStep('page3-offer');
            }}>{uxCopy.page2.continue}</button>
          </div>
        )}

        {step === 'page3-offer' && (
          <div>
            <h2>{uxCopy.page3.title}</h2>
            <p>{uxCopy.page3.suggestion(suggestedCamels)}</p>
            <p className="helper">{uxCopy.page3.helper}</p>
            <label>{uxCopy.page3.live(form.camelQuantity)}
              <input type="range" min={5} max={100} value={form.camelQuantity} onChange={(e) => dispatchForm({ type: 'setField', field: 'camelQuantity', value: clampCamelQuantity(Number(e.target.value)) })} />
            </label>
            <div className="cards">
              {cards.map((card) => (
                <button key={card.label} className="card-button" onClick={() => dispatchForm({ type: 'setField', field: 'camelQuantity', value: card.camels })}>{card.label}</button>
              ))}
            </div>
            <button className="ccc-button-primary" onClick={() => setStep('page4-proposal')}>{uxCopy.page3.lockIn}</button>
            <p className="helper">{uxCopy.page3.footnote}</p>
          </div>
        )}

        {step === 'page4-proposal' && (
          <div>
            <h2>{uxCopy.page4.title}</h2>
            <textarea
              rows={10}
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              placeholder={buildProposalText(form.bidName || 'Name', form.camelQuantity, form.camelQuantity * 2500, tone, customSentence)}
            />

            <button className="cta-secondary text-link" onClick={() => setPersonalizeOpen((v) => !v)}>{uxCopy.page4.personalizeLabel}</button>
            {personalizeOpen && (
              <div className="drawer">
                <label>{uxCopy.page4.customSentence}
                  <input value={customSentence} onChange={(e) => setCustomSentence(e.target.value)} />
                </label>
                <label>{uxCopy.page4.tone}
                  <select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
                    {tones.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <button className="cta-secondary" onClick={() => setProposalText(buildProposalText(form.bidName, form.camelQuantity, form.camelQuantity * 2500, tone, customSentence))}>Generate / Refresh text</button>
              </div>
            )}

            <div className="actions-row">
              <button className="cta-secondary" onClick={() => copyText(proposalText || buildProposalText(form.bidName, form.camelQuantity, form.camelQuantity * 2500, tone, customSentence))}>{uxCopy.page4.copy}</button>
              <button className="cta-secondary" onClick={downloadText}>{uxCopy.page4.download}</button>
              <button className="cta-secondary" onClick={() => shareText(proposalText || buildProposalText(form.bidName, form.camelQuantity, form.camelQuantity * 2500, tone, customSentence))}>{uxCopy.page4.share}</button>
            </div>
            <button className="ccc-button-primary" onClick={saveDraft}>{uxCopy.page4.done}</button>
          </div>
        )}

        {step === 'page5-drafts' && (
          <div>
            <h2>{uxCopy.page5.title}</h2>
            {drafts.length === 0 && <p>{uxCopy.page5.empty}</p>}
            <div className="cards">
              {drafts.map((draft) => (
                <article key={draft.id} className="draft-card">
                  <p><strong>{draft.name}</strong></p>
                  <p>{draft.summary}</p>
                  <p className="helper">{new Date(draft.createdAt).toLocaleString()}</p>
                  {selectedDraftId === draft.id && <pre>{draft.text}</pre>}
                  <div className="actions-row">
                    <button className="cta-secondary" onClick={() => setSelectedDraftId(selectedDraftId === draft.id ? null : draft.id)}>{uxCopy.page5.view}</button>
                    <button className="cta-secondary" onClick={() => copyText(draft.text)}>{uxCopy.page5.copy}</button>
                    <button className="cta-secondary" onClick={() => shareText(draft.text)}>{uxCopy.page5.share}</button>
                    <button className="cta-secondary" onClick={() => setDrafts((current) => current.filter((item) => item.id !== draft.id))}>{uxCopy.page5.delete}</button>
                  </div>
                </article>
              ))}
            </div>
            <details>
              <summary>{uxCopy.page5.extras}</summary>
              <p>{uxCopy.page5.rejection}</p>
              <p>{uxCopy.page5.history}</p>
            </details>
            <p className="helper">{uxCopy.page5.localNote}</p>
            <button className="ccc-button-primary" onClick={startOver}>{uxCopy.page5.startNew}</button>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </section>

      <footer className="legal-footer">
        <p>{uxCopy.global.footer}</p>
      </footer>

      <div className="persistent-disclaimer">{uxCopy.global.persistentDisclaimer}</div>
    </main>
  );
}

export function App() {
  return (
    <DowryFormProvider>
      <Shell />
    </DowryFormProvider>
  );
}
