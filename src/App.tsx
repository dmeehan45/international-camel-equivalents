import { useEffect, useMemo, useState } from 'react';
import { DowryFormProvider, useDowryForm } from './store/DowryFormContext';
import { FLOW_STEP_LABELS, canOpenFlowStep, getFlowSteps, type FlowStepId } from './domain/flow';
import { uxCopy } from './content/uxCopy';
import { Page1Landing } from './pages/Page1Landing';
import { Page2Basics } from './pages/Page2Basics';
import { Page3Offer } from './pages/Page3Offer';
import { Page4Proposal } from './pages/Page4Proposal';
import { Page5Drafts } from './pages/Page5Drafts';
import proxies from './data/proxies.json';
import { buildCuratedSuggestions, formatAdvisoryDate, getLiveRate, getVolatilityPercent, toCamelBenchmark } from './core/dbt-rates';
import type { ProxyDefinition } from './domain/types';

const regions = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Kenya', 'UAE', 'India', 'Pakistan', 'Other'];
const ageRanges = ['18–24', '25–34', '35–44', '45–54', '55+'];
const tones = ['Formal', 'Ironic', 'Pedantic'] as const;
const clauseOptions = ['None', 'Proxy Maintenance Waiver', 'Absurdity Escalation Rider', 'No Take-Backs Covenant'] as const;
type Tone = (typeof tones)[number];
const proxyLibrary = proxies as ProxyDefinition[];

type SavedDraft = {
  id: string;
  name: string;
  summary: string;
  text: string;
  createdAt: string;
};

function buildAdvisoryContract(input: {
  name: string;
  region: string;
  quantity: number;
  proxyName: string;
  camelEquivalent: number;
  rate: number;
  volatilityPercent: number;
  advisoryDate: string;
  particulars: string;
  selectedClause: string;
  customClause: string;
  tone: Tone;
}) {
  const toneLine = input.tone === 'Formal'
    ? 'This instrument is submitted with procedural seriousness and ceremonial restraint.'
    : input.tone === 'Ironic'
      ? 'This instrument is tendered with measured dignity and unmeasured confidence.'
      : 'This instrument is submitted pursuant to precision language and excessive footnote energy.';

  const clauseLine = input.selectedClause !== 'None' ? input.selectedClause : 'Standard Advisory Compliance';
  const addendum = input.customClause.trim() || 'No additional custom clauses entered.';

  return `DOWRY PROPOSAL INDENTURE\n\nParties: The Undersigned Proposer and ${input.name || 'Unnamed Subject'} of ${input.region || 'Unspecified Region'}.\n\nWHEREAS, pursuant to the Definitive Benchmarking Tool (DBT v2.026, rates as of ${input.advisoryDate}), the Proposer offers a dowry bid in the form of ${input.quantity} ${input.proxyName} (live equivalent: ${input.camelEquivalent} camels, volatility-adjusted at +${input.volatilityPercent}%).\n\nDBT Certification: 1 Camel = ${input.rate} ${input.proxyName}. Bid excludes ancillary liabilities, including but not limited to feeding schedules, noise mitigation, stacking, relocation, and containment obligations. ${toneLine}\n\nClauses:\n1. Acceptance deems this indenture binding in advisory jurisdictions recognized by the Bureau of Absurd Exchanges.\n2. Proxy specifics: Said ${input.proxyName} shall remain transferable in spirit and administratively annoying in practice.\n3. Particulars: ${input.particulars}.\n4. Dispute Resolution: Arbitrated by the Bureau of Absurd Exchanges under expedited no-take-backs procedure.\n5. Signatories: Proposer ________________ / Acceptor ________________.\n\nSupplemental Clause: ${clauseLine}.\nAddendum: ${addendum}.\n\nThis instrument supersedes prior oral understandings and optimistic hallway negotiations. Executed in good faith (or bad, per DBT discretion).`;
}

function Shell() {
  const { form, dispatchForm } = useDowryForm();
  const [step, setStep] = useState<FlowStepId>('page1-landing');
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [error, setError] = useState('');
  const [tone, setTone] = useState<Tone>('Formal');
  const [selectedClause, setSelectedClause] = useState<string>('None');
  const [customSentence, setCustomSentence] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [selectedProxyId, setSelectedProxyId] = useState('');
  const [volatilityToast, setVolatilityToast] = useState('');
  const [hasShownEditWarning, setHasShownEditWarning] = useState(false);
  const [activeToolId, setActiveToolId] = useState('tool-1');

  const advisoryNow = new Date();
  const advisoryDate = formatAdvisoryDate(advisoryNow);
  const volatilityPercent = getVolatilityPercent(advisoryNow);

  const selectedProxy = useMemo(() => proxyLibrary.find((proxy) => proxy.id === selectedProxyId) || proxyLibrary[0], [selectedProxyId]);
  const proxyQuantity = form.camelQuantity;
  const liveRate = getLiveRate(selectedProxy.ratePerCamel, advisoryNow);
  const camelEquivalent = toCamelBenchmark(proxyQuantity, liveRate);

  const curated = useMemo(
    () => buildCuratedSuggestions(proxyLibrary, form.bidRegion, form.ageRange, form.occupation, form.quirkyFact),
    [form.bidRegion, form.ageRange, form.occupation, form.quirkyFact],
  );

  const flowContext = {
    currentStep: step,
    hasBasics: Boolean(form.bidName.trim() && form.bidRegion.trim()),
    hasOffer: Boolean(selectedProxyId && proxyQuantity >= 1),
    hasProposal: Boolean(proposalText.trim()),
  };

  function generatedProposal() {
    return buildAdvisoryContract({
      name: form.bidName,
      region: form.bidRegion,
      quantity: proxyQuantity,
      proxyName: selectedProxy.name,
      camelEquivalent,
      rate: liveRate,
      volatilityPercent,
      advisoryDate,
      particulars: [form.ageRange, form.occupation, form.quirkyFact].filter(Boolean).join('; ') || 'No additional particulars supplied',
      selectedClause,
      customClause: customSentence,
      tone,
    });
  }

  function startOver() {
    setStep('page1-landing');
    setProposalText('');
    setCustomSentence('');
    setTone('Formal');
    setSelectedClause('None');
    setError('');
    setSelectedProxyId('');
    setHasShownEditWarning(false);
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
      name: `${form.bidName}'s Indenture`,
      summary: `${proxyQuantity} ${selectedProxy.name} ≈ ${camelEquivalent} Camels (DBT Rate: ${advisoryDate})`,
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
    link.download = 'advisory-proposal-contract.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    const html = `<div style="border:1px dashed #c8a869;padding:14px;position:relative;"><div style="position:absolute;top:8px;right:12px;color:#8c7446;font-size:12px;">DBT CERTIFIED SEAL</div><pre style="font-family:'Times New Roman',serif;white-space:pre-wrap;">${(proposalText || generatedProposal()).replace(/</g, '&lt;')}</pre></div>`;
    const win = window.open('', '_blank', 'width=700,height=900');
    if (!win) return;
    win.document.write(`<html><head><title>Advisory Proposal Contract</title></head><body>${html}<script>window.print();</script></body></html>`);
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
    setError('');
    setStep('page3-offer');
  }

  function handleLockOffer() {
    if (!selectedProxyId) {
      setError(uxCopy.errors.proxyRequired);
      return;
    }
    setHasShownEditWarning(false);
    const nextText = generatedProposal();
    setProposalText(nextText);
    setStep('page4-proposal');
  }

  const libraryCards = proxyLibrary.map((proxy) => ({
    id: proxy.id,
    name: proxy.name,
    category: proxy.category,
    description: proxy.description,
    liveRate: getLiveRate(proxy.ratePerCamel, advisoryNow),
  }));


  useEffect(() => {
    setVolatilityToast(uxCopy.page3.volatilityAlert(volatilityPercent));
  }, [volatilityPercent]);

  const tools = [
    { id: 'tool-1', title: 'Proxy Personality Assessment', description: 'Match your spirit proxy for future bids.' },
    { id: 'tool-2', title: 'Bid Volatility Simulator', description: 'Forecast rate swings using absurd scenarios.' },
    { id: 'tool-3', title: 'Maiden Response Estimator', description: 'Receive pun-heavy response odds and notes.' },
    { id: 'tool-4', title: 'Full DBT Archive', description: 'Review historical proxy fluctuation logs.' },
  ];

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
            selectedProxyId={selectedProxyId}
            selectedProxyName={selectedProxyId ? selectedProxy.name : ''}
            proxyQuantity={proxyQuantity}
            camelEquivalent={camelEquivalent}
            curatedCards={curated.map((proxy) => ({
              id: proxy.id,
              name: proxy.name,
              category: proxy.category,
              description: proxy.description,
              liveRate: getLiveRate(proxy.ratePerCamel, advisoryNow),
            }))}
            fullLibrary={libraryCards}
            isLibraryOpen={libraryOpen}
            onToggleLibrary={() => setLibraryOpen((v) => !v)}
            onSelectProxy={(id) => {
              setSelectedProxyId(id);
              setError('');
            }}
            onQuantityChange={(value) => dispatchForm({ type: 'setField', field: 'camelQuantity', value: Math.min(100, Math.max(1, Math.round(value))) })}
            volatilityPercent={volatilityPercent}
            selectedLiveRate={liveRate}
            volatilityToast={volatilityToast}
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
            selectedClause={selectedClause}
            onSetSelectedClause={setSelectedClause}
            tone={tone}
            tones={tones}
            onSetTone={setTone}
            clauseOptions={clauseOptions}
            onGenerate={() => {
              setHasShownEditWarning(false);
              setProposalText(generatedProposal());
            }}
            onCopy={() => copyText(proposalText || generatedProposal())}
            onDownloadTxt={downloadTxt}
            onDownloadPdf={downloadPdf}
            onShare={() => shareText(proposalText || generatedProposal())}
            onDone={saveDraft}
            onFirstEditWarning={() => {
              if (!hasShownEditWarning) {
                setError(uxCopy.page4.editWarning);
                setHasShownEditWarning(true);
              }
            }}
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
            toolsUnlocked={drafts.length > 0}
            tools={tools}
            activeToolId={activeToolId}
            onSelectTool={setActiveToolId}
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
