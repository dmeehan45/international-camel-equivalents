import { useMemo, useState } from 'react';
import { DowryFormProvider, useDowryForm } from './store/DowryFormContext';
import { FLOW_STEP_LABELS, canOpenFlowStep, getFlowSteps, type FlowStepId } from './domain/flow';
import { uxCopy } from './content/uxCopy';
import { Page1Landing } from './pages/Page1Landing';
import { Page2Basics } from './pages/Page2Basics';
import { Page3Offer } from './pages/Page3Offer';
import { Page4Proposal } from './pages/Page4Proposal';
import { Page5Drafts } from './pages/Page5Drafts';

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

const CAMEL_USD = 2500;
const HANDBAG_USD = 6000;
const COMPACT_CAR_USD = 18000;
const FLIGHT_USD = 3000;

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
  const usdValue = camels * CAMEL_USD;
  const handbagCamels = Math.min(100, Math.max(5, Math.round((3 * HANDBAG_USD) / CAMEL_USD)));
  const carCamels = Math.min(100, Math.max(5, Math.round((2 * COMPACT_CAR_USD) / CAMEL_USD)));
  const flightCamels = Math.min(100, Math.max(5, Math.round((8 * FLIGHT_USD) / CAMEL_USD)));

  return [
    { label: `${camels} Camels`, camels },
    { label: `Equivalent in luxury handbags (~$${usdValue.toLocaleString()})`, camels: handbagCamels },
    { label: `Equivalent in used compact cars (~${Math.max(1, Math.round(usdValue / COMPACT_CAR_USD))} vehicles)`, camels: carCamels },
    { label: `Equivalent in international flights (~${Math.max(1, Math.round(usdValue / FLIGHT_USD))} business-class round-trips)`, camels: flightCamels },
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
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [calculationsOpen, setCalculationsOpen] = useState(false);
  const [error, setError] = useState('');
  const [tone, setTone] = useState<Tone>('Formal');
  const [customSentence, setCustomSentence] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [rejectionText, setRejectionText] = useState('');
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

  function generatedProposal() {
    return buildProposalText(form.bidName || 'Name', form.camelQuantity, form.camelQuantity * CAMEL_USD, tone, customSentence);
  }

  function startOver() {
    setStep('page1-landing');
    setProposalText('');
    setCustomSentence('');
    setRejectionText('');
    setTone('Formal');
    setError('');
    dispatchForm({ type: 'setField', field: 'bidName', value: '' });
    dispatchForm({ type: 'setField', field: 'bidRegion', value: '' });
    dispatchForm({ type: 'setField', field: 'camelQuantity', value: 18 });
    dispatchForm({ type: 'resetOptional' });
  }

  function saveDraft() {
    const finalText = proposalText.trim() ? proposalText : generatedProposal();
    if (!finalText.trim()) {
      setError(uxCopy.errors.proposalRequired);
      return;
    }
    const item: SavedDraft = {
      id: crypto.randomUUID(),
      name: form.bidName,
      camels: form.camelQuantity,
      summary: `${form.camelQuantity} camels ≈ ${Math.max(1, Math.round(form.camelQuantity / 8))} used compact cars`,
      text: finalText,
      createdAt: new Date().toISOString(),
    };
    setDrafts((current) => [item, ...current]);
    setStep('page5-drafts');
    setError('');
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  function downloadTxt() {
    const blob = new Blob([proposalText || generatedProposal()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dowry-proposal.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    const html = `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap;">${(proposalText || generatedProposal()).replace(/</g, '&lt;')}</pre>`;
    const win = window.open('', '_blank', 'width=700,height=900');
    if (!win) return;
    win.document.write(`<html><head><title>Dowry Proposal</title></head><body>${html}<script>window.print();</script></body></html>`);
    win.document.close();
  }

  async function shareText(text: string) {
    if (navigator.share) {
      await navigator.share({ title: uxCopy.global.appTitle, text });
      return;
    }
    await copyText(text);
  }

  function handleContinueBasics() {
    if (!form.bidName.trim()) return setError(uxCopy.errors.nameRequired);
    if (!form.bidRegion.trim()) return setError(uxCopy.errors.regionRequired);
    dispatchForm({ type: 'setField', field: 'camelQuantity', value: suggestedCamels });
    setError('');
    setStep('page3-offer');
  }

  function handleLockOffer() {
    const nextText = generatedProposal();
    setProposalText(nextText);
    setStep('page4-proposal');
  }

  function generateRejection() {
    const name = drafts[0]?.name || form.bidName || 'Applicant';
    const note = `To: ${name}\n\nThank you for your proposal submission. After careful review, we respectfully decline at this time.\n\nWe appreciate the gesture and wish you well in future negotiations.\n\nRegards,`;
    setRejectionText(note);
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

      {step !== 'page1-landing' && <button className="text-only-link" onClick={startOver}>{uxCopy.global.startOver}</button>}

      <section className="view-card">
        {step === 'page1-landing' && <Page1Landing copy={uxCopy} howOpen={howOpen} onToggleHow={() => setHowOpen((v) => !v)} onBegin={() => setStep('page2-basics')} />}

        {step === 'page2-basics' && (
          <Page2Basics
            copy={uxCopy}
            form={form}
            regions={regions}
            ageRanges={ageRanges}
            optionalOpen={optionalOpen}
            onToggleOptional={() => setOptionalOpen((v) => !v)}
            onSetField={(field, value) => dispatchForm({ type: 'setField', field, value })}
            onContinue={handleContinueBasics}
          />
        )}

        {step === 'page3-offer' && (
          <Page3Offer
            copy={uxCopy}
            camelQuantity={form.camelQuantity}
            suggestedCamels={suggestedCamels}
            cards={cards}
            onSliderChange={(value) => dispatchForm({ type: 'setField', field: 'camelQuantity', value: clampCamelQuantity(value) })}
            onSelectCard={(value) => dispatchForm({ type: 'setField', field: 'camelQuantity', value: clampCamelQuantity(value) })}
            onLockIn={handleLockOffer}
          />
        )}

        {step === 'page4-proposal' && (
          <Page4Proposal
            copy={uxCopy}
            proposalText={proposalText}
            onSetProposalText={setProposalText}
            personalizeOpen={personalizeOpen}
            onTogglePersonalize={() => setPersonalizeOpen((v) => !v)}
            customSentence={customSentence}
            onSetCustomSentence={setCustomSentence}
            tone={tone}
            tones={tones}
            onSetTone={setTone}
            onGenerate={() => setProposalText(generatedProposal())}
            onCopy={() => copyText(proposalText || generatedProposal())}
            onDownloadTxt={downloadTxt}
            onDownloadPdf={downloadPdf}
            onShare={() => shareText(proposalText || generatedProposal())}
            onDone={saveDraft}
          />
        )}

        {step === 'page5-drafts' && (
          <Page5Drafts
            copy={uxCopy}
            drafts={drafts}
            selectedDraftId={selectedDraftId}
            onToggleView={(id) => setSelectedDraftId(selectedDraftId === id ? null : id)}
            onCopyDraft={copyText}
            onShareDraft={shareText}
            onDeleteDraft={(id) => setDrafts((current) => current.filter((item) => item.id !== id))}
            extrasOpen={extrasOpen}
            onToggleExtras={() => setExtrasOpen((v) => !v)}
            rejectionText={rejectionText}
            onGenerateRejection={generateRejection}
            calculationsOpen={calculationsOpen}
            onToggleCalculations={() => setCalculationsOpen((v) => !v)}
            onStartNew={startOver}
          />
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
