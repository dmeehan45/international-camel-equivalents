import { useEffect, useMemo, useState } from 'react';
import { DowryFormProvider, useDowryForm } from './store/DowryFormContext';
import { FLOW_STEP_LABELS, canOpenFlowStep, getFlowSteps, type FlowStepId } from './domain/flow';
import { uxCopy } from './content/uxCopy';
import { Page1Landing } from './pages/Page1Landing';
import { Page2Basics } from './pages/Page2Basics';
import { Page3Offer } from './pages/Page3Offer';
import { Page4Proposal } from './pages/Page4Proposal';
import { Page5Drafts } from './pages/Page5Drafts';
import { ProxyPersonalityAssessmentModal } from './components/advisory/tools/ProxyPersonalityAssessmentModal';
import { BidVolatilitySimulatorModal } from './components/advisory/tools/BidVolatilitySimulatorModal';
import { MaidenResponseEstimatorModal } from './components/advisory/tools/MaidenResponseEstimatorModal';
import { FullDbtArchiveModal } from './components/advisory/tools/FullDbtArchiveModal';
import proxies from './data/proxies.json';
import { buildCuratedSuggestions, formatAdvisoryDate, getLiveRate, getVolatilityPercent, toCamelBenchmark } from './core/dbt-rates';
import type { AdvisoryToolKey, AdvisoryToolTile, ArchiveTrendInsightResult, MaidenResponseEstimateResult, ProxyDefinition, VolatilityForecastResult } from './domain/types';
import { readAdvisoryUnlockState, readApplyNextBidProxyId, writeAdvisoryUnlockState, writeApplyNextBid, writeAppliedArchiveInsight, writeAppliedEstimate, writeAppliedForecast } from './core/advisory-tools-storage';

const regions = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Kenya', 'UAE', 'India', 'Pakistan', 'Other'];
const ageRanges = ['18–24', '25–34', '35–44', '45–54', '55+'];
const tones = ['Formal', 'Ironic', 'Pedantic'] as const;
const clauseOptions = [
  {
    name: 'No Take-Backs Covenant',
    text: `Addendum [X]: No Take-Backs Covenant

The Parties hereby covenant and agree that, upon execution of this Indenture, the dowry bid comprising [Quantity] [Proxy] shall be irrevocable and non-withdrawable in perpetuity, notwithstanding any subsequent change in sentiment, discovery of hidden defects in the proxy (including but not limited to latent hypnotic tendencies in hyenas or unexpected venomous properties in mantis shrimp), or intervention by celestial or terrestrial authorities.

In the event the Proposer attempts to retract the bid after acceptance, the Acceptor shall be entitled to immediate enforcement of the full [Quantity] [Proxy] plus compound interest calculated at the DBT Volatility Index rate prevailing on the date of attempted retraction, compounded daily until delivery. Such interest shall accrue in the form of additional proxies of equivalent absurdity, to be selected by the Acceptor from the current DBT library.

This covenant survives termination of the marriage, annulment, or dissolution by any court of competent jurisdiction (including courts of public opinion). Any attempt to invoke "changed circumstances" shall be deemed frivolous and subject to a penalty of one (1) barrel of monkeys (chaotic variant) per day of delay.`,
  },
  {
    name: 'Marital Discord Covenant',
    text: `Addendum [X]: Marital Discord Covenant

In anticipation of potential discord arising during the term of the proposed union, the Parties agree to an automatic escalation mechanism for the dowry bid. Should any dispute, whether verbal, silent, or expressed through interpretive dance, exceed three (3) consecutive days without amicable resolution, the original bid of [Quantity] [Proxy] shall escalate by five percent (5%) per week in equivalent units of the same proxy class, or—if escalation in-kind is impractical—by substitution of a proxy one tier higher in DBT absurdity ranking.

Escalation shall continue until either (a) reconciliation is certified by a mutually agreed-upon neutral third party (e.g., a parliament of owls or a sufficiently wise sentient cheese wheel), or (b) the bid reaches a quantity sufficient to trigger a "catastrophic absurdity threshold" as defined in DBT Annex Z-13, at which point the Acceptor may elect to convert the entire dowry into a single, uncontainable herd of cats (1 herd = 10 cats, chaotic and independent).

The Proposer waives any defense based on "I didn't mean it that way" or "it was just a misunderstanding about the exploding toads." All escalation proceeds shall be held in escrow by the Bureau of Absurd Exchanges until final disposition.`,
  },
  {
    name: 'Dimensional Spud Safeguard',
    text: `Addendum [X]: Dimensional Spud Safeguard

Recognizing the inherent risks associated with bids involving portal potatoes or any proxy capable of dimensional translocation, the Parties expressly agree to the following protective provisions. Should the selected proxy ([Proxy]) exhibit unexpected portal-opening behavior during delivery, storage, or marital cohabitation—resulting in the unintentional relocation of either Party, household furnishings, or the entire dowry consignment to an alternate dimension—the Proposer shall be obligated to mount a good-faith rescue expedition within seventy-two (72) hours.

Rescue shall include, at minimum: (i) procurement of a reverse-portal spud (DBT rate: 5.43 per unit), (ii) deployment of a qualified potato navigator (certified by the Bureau of Dimensional Tuber Logistics), and (iii) payment of any applicable interdimensional tolls in equivalent units of invisible pink unicorns (rate: 0.03).

In the event rescue is unsuccessful after ninety (90) days, the Acceptor may declare the Indenture null and retain a consolation prize of one (1) holographic hippo (projected variant) plus accrued late fees calculated at the DBT "lost-in-the-multiverse" surcharge rate. The Proposer shall further indemnify the Acceptor against any existential dread, alternate-timeline doppelgänger lawsuits, or unsolicited visits from time-traveling squirrels arising from said translocation event.

This safeguard survives the termination of the Indenture and extends to any progeny, whether born, adopted, or spontaneously manifested via quantum quokka entanglement.`,
  },
] as const;
type Tone = (typeof tones)[number];
const proxyLibrary = proxies as ProxyDefinition[];

type SavedDraft = {
  id: string;
  name: string;
  summary: string;
  text: string;
  createdAt: string;
};

type ResumeSnapshot = {
  form: ReturnType<typeof useDowryForm>['form'];
  selectedProxyId: string;
  proposalText: string;
  step: FlowStepId;
  drafts: SavedDraft[];
  lastModifiedISO: string;
};

const RESUME_STORAGE_KEY = 'icea-resume-snapshot-v1';

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
  selectedClauses: string[];
  customClause: string;
  tone: Tone;
}) {
  const toneLine = input.tone === 'Formal'
    ? 'This instrument is submitted with procedural seriousness and ceremonial restraint.'
    : input.tone === 'Ironic'
      ? 'This instrument is tendered with measured dignity and unmeasured confidence.'
      : 'This instrument is submitted pursuant to precision language and excessive footnote energy.';

  const safeProxy = input.proxyName.trim() || 'the selected proxy';
  const safeQuantity = input.quantity > 0 ? String(input.quantity) : 'an unspecified quantity of';
  const addendumClauses = input.selectedClauses
    .map((clauseName, idx) => {
      const clauseTemplate = clauseOptions.find((item) => item.name === clauseName)?.text;
      if (!clauseTemplate) return '';
      return clauseTemplate
        .split('[X]').join(String(idx + 1))
        .split('[Quantity]').join(safeQuantity)
        .split('[Proxy]').join(safeProxy)
        .split('[Name]').join(input.name || 'Unnamed Subject');
    })
    .filter(Boolean);

  if (input.customClause.trim()) {
    addendumClauses.push(`Addendum ${addendumClauses.length + 1}: Custom Clause\n\n${input.customClause.trim()}`);
  }

  const addendumBlock = addendumClauses.length ? addendumClauses.join('\n\n') : 'No addendum clauses were selected.';

  return `DOWRY PROPOSAL INDENTURE\n\nParties: The Undersigned Proposer and ${input.name || 'Unnamed Subject'} of ${input.region || 'Unspecified Region'}.\n\nWHEREAS, pursuant to the Definitive Benchmarking Tool (DBT v2.026, rates as of ${input.advisoryDate}), the Proposer offers a dowry bid in the form of ${safeQuantity} ${safeProxy} (live equivalent: ${input.camelEquivalent} camels, volatility-adjusted at +${input.volatilityPercent}%).\n\nDBT Certification: 1 Camel = ${input.rate} ${safeProxy}. Bid excludes ancillary liabilities, including but not limited to feeding schedules, noise mitigation, stacking, relocation, and containment obligations. ${toneLine}\n\nClauses:\n1. Acceptance deems this indenture binding in advisory jurisdictions recognized by the Bureau of Absurd Exchanges.\n2. Proxy specifics: Said ${safeProxy} shall remain transferable in spirit and administratively annoying in practice.\n3. Particulars: ${input.particulars}.\n4. Dispute Resolution: Arbitrated by the Bureau of Absurd Exchanges under expedited no-take-backs procedure.\n\nAddendum:\n${addendumBlock}\n\nSignatories:\n_______________________________ (Proposer)\n_______________________________ (Acceptor)\nDate: February 22, 2026\n\nThis instrument supersedes prior oral understandings and optimistic hallway negotiations. Executed in good faith (or bad, per DBT discretion).`;
}

function contractTextToHtml(text: string) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .split('\n')
    .map((line) => {
      if (!line.trim()) return '<div class="pdf-spacer"></div>';
      if (/^DOWRY PROPOSAL INDENTURE/.test(line)) return `<h1>${line}</h1>`;
      if (/^Clauses:/.test(line) || /^Addendum:/.test(line) || /^Signatories:/.test(line)) return `<h2>${line}</h2>`;
      if (/^\d+\./.test(line)) return `<p class="pdf-clause">${line}</p>`;
      if (/^Addendum\s\d+:/.test(line)) return `<p class="pdf-clause pdf-addendum">${line}</p>`;
      if (/^[_]{10,}/.test(line) || /^Date:/.test(line)) return `<p class="pdf-signature">${line}</p>`;
      return `<p>${line}</p>`;
    })
    .join('');
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
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [customSentence, setCustomSentence] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [selectedProxyId, setSelectedProxyId] = useState('');
  const [volatilityToast, setVolatilityToast] = useState('');
  const [hasShownEditWarning, setHasShownEditWarning] = useState(false);
  const [activeToolId, setActiveToolId] = useState<AdvisoryToolKey | null>(null);
  const [toolsUnlocked, setToolsUnlocked] = useState(() => readAdvisoryUnlockState().hasUnlockedFurtherAdvisoryTools);
  const [advisoryToolNotice, setAdvisoryToolNotice] = useState('');
  const [isPersistentDisclaimerVisible, setPersistentDisclaimerVisible] = useState(() => !sessionStorage.getItem(uxCopy.disclaimer.sessionKey));
  const [isStepCertifying, setIsStepCertifying] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [activeLegalModal, setActiveLegalModal] = useState<string | null>(null);
  const [resumeSnapshot, setResumeSnapshot] = useState<ResumeSnapshot | null>(null);

  const legalModalCopy: Record<string, { title: string; body: string }> = {
    'how-it-works': {
      title: 'How It Works',
      body: 'The advisory workflow captures proposal particulars, applies DBT-indexed proxy benchmarking, generates an indenture draft, and retains artifacts in local storage for later review. No remote transmission is required for core document generation.',
    },
    'dbt-rate-disclaimer': {
      title: 'DBT Rate Disclaimer',
      body: 'All DBT values are advisory benchmarks intended for ceremonial valuation exercises. Rates may adjust with volatility inputs, category multipliers, and Bureau recertification windows.',
    },
    'advisory-scope': {
      title: 'Advisory Scope',
      body: 'Outputs from this interface are non-binding advisory drafts and should not be interpreted as enforceable legal instruments in any sensible jurisdiction.',
    },
    'terms-of-advisory-use': {
      title: 'Terms of Advisory Use',
      body: 'By using this service, you acknowledge that contract text is generated for advisory review, not legal execution. You assume all responsibility for interpretation, adaptation, and any ceremonial misunderstandings.',
    },
    'privacy-notice': {
      title: 'Privacy Notice',
      body: 'We collect no personal data because we have no backend. Your proposals remain gloriously ephemeral unless you intentionally save drafts to local device storage.',
    },
    'cookie-policy-none-used': {
      title: 'Cookie Policy (None Used)',
      body: 'This application does not issue tracking cookies, analytics cookies, or preference cookies. Session behaviors rely on local browser storage only.',
    },
    'contact-support': {
      title: 'Support Contact',
      body: 'For assistance, message support@dowryadvisory.invalid with a description of the issue, browser version, and any relevant proxy identifiers.',
    },
    'report-rate-anomalies': {
      title: 'Report Rate Anomalies',
      body: 'If a proxy benchmark appears inconsistent, submit a rate anomaly report with timestamp, selected proxy, and displayed DBT rate for review by advisory operations.',
    },
  };

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


  useEffect(() => {
    setIsStepCertifying(true);
    const timer = window.setTimeout(() => setIsStepCertifying(false), 360);
    return () => window.clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

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
      selectedClauses,
      customClause: customSentence,
      tone,
    });
  }

  function startOver() {
    setStep('page1-landing');
    setProposalText('');
    setCustomSentence('');
    setTone('Formal');
    setSelectedClauses([]);
    setError('');
    setSelectedProxyId('');
    setHasShownEditWarning(false);
    setAdvisoryToolNotice('');
    dispatchForm({ type: 'setField', field: 'bidName', value: '' });
    dispatchForm({ type: 'setField', field: 'bidRegion', value: '' });
    dispatchForm({ type: 'setField', field: 'camelQuantity', value: 18 });
    dispatchForm({ type: 'resetOptional' });
    localStorage.removeItem(RESUME_STORAGE_KEY);
    setResumeSnapshot(null);
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
    if (!toolsUnlocked) {
      writeAdvisoryUnlockState({ hasUnlockedFurtherAdvisoryTools: true, unlockedAtISO: new Date().toISOString() });
      setToolsUnlocked(true);
    }
    setStep('page5-drafts');
    setError('');
  }

  function saveResumeSnapshot(forceStep?: FlowStepId) {
    const snapshot: ResumeSnapshot = {
      form,
      selectedProxyId,
      proposalText,
      step: forceStep ?? step,
      drafts,
      lastModifiedISO: new Date().toISOString(),
    };
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(snapshot));
    setResumeSnapshot(snapshot);
  }

  function resumeLastSnapshot() {
    if (!resumeSnapshot) return;
    dispatchForm({ type: 'setField', field: 'bidName', value: resumeSnapshot.form.bidName });
    dispatchForm({ type: 'setField', field: 'bidRegion', value: resumeSnapshot.form.bidRegion });
    dispatchForm({ type: 'setField', field: 'camelQuantity', value: resumeSnapshot.form.camelQuantity });
    dispatchForm({ type: 'setField', field: 'ageRange', value: resumeSnapshot.form.ageRange });
    dispatchForm({ type: 'setField', field: 'occupation', value: resumeSnapshot.form.occupation });
    dispatchForm({ type: 'setField', field: 'quirkyFact', value: resumeSnapshot.form.quirkyFact });
    setSelectedProxyId(resumeSnapshot.selectedProxyId);
    setProposalText(resumeSnapshot.proposalText);
    setDrafts(resumeSnapshot.drafts);
    setStep(resumeSnapshot.step);
  }

  function discardLastSnapshot() {
    localStorage.removeItem(RESUME_STORAGE_KEY);
    setResumeSnapshot(null);
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
    const html = `
      <style>
        @page { size: A4 portrait; margin: 16mm; }
        body { margin: 0; background: #f5f1e8; font-family: Georgia, 'Times New Roman', serif; }
        .pdf-contract {
          max-width: 794px;
          margin: 0 auto;
          border: 2px dashed #c8a869;
          background: #fffdf7;
          color: #2d2414;
          padding: 22px;
          position: relative;
          line-height: 1.7;
          font-size: 15px;
          hyphens: auto;
          text-align: justify;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .pdf-contract::before {
          content: 'DBT CERTIFIED • DBT CERTIFIED • DBT CERTIFIED • DBT CERTIFIED';
          position: absolute;
          inset: 45% 0 auto;
          text-align: center;
          color: rgba(140, 116, 70, 0.12);
          font-size: 18px;
          letter-spacing: 0.3em;
          pointer-events: none;
        }
        .pdf-seal {
          position: absolute;
          right: 16px;
          top: 14px;
          border: 1px solid rgba(140, 116, 70, 0.75);
          border-radius: 999px;
          padding: 6px 10px;
          color: #8c7446;
          font-size: 11px;
          font-weight: 700;
          background: rgba(255, 252, 241, 0.85);
          max-width: 100px;
          text-align: center;
        }
        h1 { font-size: 1.15rem; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 14px; text-align: center; }
        h2 { font-size: 1rem; text-transform: uppercase; margin: 16px 0 8px; letter-spacing: 0.04em; }
        p { margin: 0 0 10px; text-indent: 1.2rem; }
        .pdf-clause, .pdf-signature { text-indent: 0; }
        .pdf-spacer { height: 10px; }
      </style>
      <article class="pdf-contract">
        <div class="pdf-seal">DBT CERTIFIED SEAL</div>
        ${contractTextToHtml(proposalText || generatedProposal())}
      </article>
      <script>window.print();</script>
    `;
    const win = window.open('', '_blank', 'width=700,height=900');
    if (!win) return;
    win.document.write(`<html><head><title>Advisory Proposal Contract</title></head><body>${html}</body></html>`);
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
    saveResumeSnapshot('page3-offer');
    setStep('page3-offer');
  }

  function handleLockOffer() {
    if (!selectedProxyId) {
      setError(uxCopy.errors.proxyRequired);
      return;
    }
    setHasShownEditWarning(false);
    setAdvisoryToolNotice('');
    const nextText = generatedProposal();
    setProposalText(nextText);
    saveResumeSnapshot('page4-proposal');
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


  function handleApplyForecast(result: VolatilityForecastResult) {
    writeAppliedForecast(result);
    setAdvisoryToolNotice(`Forecast Applied: ${result.proxyName} now displays at ${result.projectedRate.toFixed(2)} (±${result.volatilityPercent.toFixed(1)}%).`);
    setActiveToolId(null);
  }

  function handleGenerateContingencyClause(result: MaidenResponseEstimateResult) {
    writeAppliedEstimate(result);
    setAdvisoryToolNotice(`Clause Generated: ${result.contingencyClause}`);
    setActiveToolId(null);
  }

  function handleApplyArchiveTrend(result: ArchiveTrendInsightResult) {
    writeAppliedArchiveInsight(result);
    setAdvisoryToolNotice(`Trend Applied: ${result.proxyName} marked ${result.trend} at avg ${result.averageRate.toFixed(2)}.`);
    setActiveToolId(null);
  }

  const tools: AdvisoryToolTile[] = [
    { key: 'proxy_personality_assessment', title: 'Proxy Personality Assessment', subtitle: 'DBT-Certified Module', teaser: 'Assess Proxy Affinity', icon: 'quiz', unlockRequirement: 'first_successful_bid' },
    { key: 'bid_volatility_simulator', title: 'Bid Volatility Simulator', subtitle: 'Risk Engine Module', teaser: 'Run proxy scenario forecasts', icon: 'simulator', unlockRequirement: 'first_successful_bid' },
    { key: 'maiden_response_estimator', title: 'Maiden Response Estimator', subtitle: 'Algorithmic Counsel Unit', teaser: 'Estimate acceptance probability', icon: 'estimator', unlockRequirement: 'first_successful_bid' },
    { key: 'full_dbt_archive', title: 'Full DBT Archive', subtitle: 'Ledger Access Module', teaser: 'Browse historical rate logs', icon: 'archive', unlockRequirement: 'first_successful_bid' },
  ];

  useEffect(() => {
    if (step !== 'page4-proposal') return;
    setProposalText(generatedProposal());
  }, [selectedClauses, customSentence, tone]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESUME_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ResumeSnapshot;
      if (!parsed?.lastModifiedISO) return;
      setResumeSnapshot(parsed);
      if (Array.isArray(parsed.drafts)) setDrafts(parsed.drafts);
    } catch {
      // noop: ignore malformed recovery data
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (step === 'page1-landing') return;
      saveResumeSnapshot();
    }, 10000);
    return () => window.clearInterval(timer);
  }, [form, selectedProxyId, proposalText, step, drafts]);

  useEffect(() => {
    if (!selectedProxyId) {
      const suggestedProxyId = readApplyNextBidProxyId();
      if (suggestedProxyId) setSelectedProxyId(suggestedProxyId);
    }
  }, [selectedProxyId]);

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
        <p className="phase-progress-meta">Step {getFlowSteps().indexOf(step) + 1} of {getFlowSteps().length}</p>
        {getFlowSteps().map((item) => (
          <button key={item} className={item === step ? 'step active' : 'step'} disabled={!canOpenFlowStep(item, flowContext)} onClick={() => setStep(item)}>
            <span className="step-indicator">{canOpenFlowStep(item, flowContext) && item !== step ? '✓' : getFlowSteps().indexOf(item) + 1}</span>
            <span>{FLOW_STEP_LABELS[item]}</span>
          </button>
        ))}
      </nav>

      {step !== 'page1-landing' && <button className="text-only-link" onClick={startOver}>{uxCopy.global.startOver}</button>}

      <section className="view-card">
        {isBooting && (
          <div className="boot-loader" role="status" aria-live="polite">
            <div className="boot-loader-shimmer" aria-hidden="true" />
            <p>Initializing DBT connection…</p>
          </div>
        )}
        {isStepCertifying && <p className="helper dbt-certifying">Certifying with DBT...</p>}
        {step === 'page1-landing' && (
          <Page1Landing
            copy={uxCopy}
            howOpen={howOpen}
            onToggleHow={() => setHowOpen((v) => !v)}
            onBegin={() => setStep('page2-basics')}
            resumeSnapshot={resumeSnapshot}
            onResumeSnapshot={resumeLastSnapshot}
            onDiscardSnapshot={discardLastSnapshot}
          />
        )}

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
            selectedClauses={selectedClauses}
            onToggleClause={(value) => {
              setSelectedClauses((current) => {
                if (current.includes(value)) return current.filter((item) => item !== value);
                if (current.length >= 5) return current;
                return [...current, value];
              });
            }}
            tone={tone}
            tones={tones}
            onSetTone={setTone}
            clauseOptions={clauseOptions}
            onGenerate={() => {
              setHasShownEditWarning(false);
              setAdvisoryToolNotice('');
              setProposalText(generatedProposal());
            }}
            onCopy={() => copyText(proposalText || generatedProposal())}
            onDownloadTxt={downloadTxt}
            onDownloadPdf={downloadPdf}
            onShare={() => shareText(proposalText || generatedProposal())}
            onDone={saveDraft}
            onTryDifferentProxy={() => setStep('page3-offer')}
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
            toolsUnlocked={toolsUnlocked}
            tools={tools}
            onSelectTool={setActiveToolId}
            onStartNew={startOver}
          />
        )}

      {error && <p className="error">{error}</p>}
      {advisoryToolNotice && <p className="helper badge-volatility">{advisoryToolNotice}</p>}

      <ProxyPersonalityAssessmentModal
        isOpen={activeToolId === 'proxy_personality_assessment'}
        onClose={() => setActiveToolId(null)}
        proxyLibrary={proxyLibrary}
        onApplyToNextBid={(result) => {
          writeApplyNextBid(result);
          setSelectedProxyId(result.proxyId);
          setActiveToolId(null);
        }}
      />
      <BidVolatilitySimulatorModal
        isOpen={activeToolId === 'bid_volatility_simulator'}
        onClose={() => setActiveToolId(null)}
        proxyLibrary={proxyLibrary}
        onApplyForecast={handleApplyForecast}
      />
      <MaidenResponseEstimatorModal
        isOpen={activeToolId === 'maiden_response_estimator'}
        onClose={() => setActiveToolId(null)}
        drafts={drafts.map((draft) => ({ id: draft.id, summary: draft.summary }))}
        onGenerateClause={handleGenerateContingencyClause}
      />
      <FullDbtArchiveModal
        isOpen={activeToolId === 'full_dbt_archive'}
        onClose={() => setActiveToolId(null)}
        proxyLibrary={proxyLibrary}
        onApplyTrend={handleApplyArchiveTrend}
      />
      </section>

      <footer className="legal-footer">
        <details className="footer-section" open>
          <summary><span className="footer-title">Service</span></summary>
          <button className="footer-link-button" type="button" onClick={() => setActiveLegalModal('how-it-works')}>How It Works</button>
          <button className="footer-link-button" type="button" onClick={() => setActiveLegalModal('dbt-rate-disclaimer')}>DBT Rate Disclaimer</button>
          <button className="footer-link-button" type="button" onClick={() => setActiveLegalModal('advisory-scope')}>Advisory Scope</button>
        </details>
        <details className="footer-section" open>
          <summary><span className="footer-title">Legal</span></summary>
          <button className="footer-link-button" type="button" onClick={() => setActiveLegalModal('terms-of-advisory-use')}>Terms of Advisory Use</button>
          <button className="footer-link-button" type="button" onClick={() => setActiveLegalModal('privacy-notice')}>Privacy Notice</button>
          <button className="footer-link-button" type="button" onClick={() => setActiveLegalModal('cookie-policy-none-used')}>Cookie Policy (none used)</button>
        </details>
        <details className="footer-section" open>
          <summary><span className="footer-title">Contact</span></summary>
          <button className="footer-link-button" type="button" onClick={() => setActiveLegalModal('contact-support')}>support@dowryadvisory.invalid</button>
          <button className="footer-link-button" type="button" onClick={() => setActiveLegalModal('report-rate-anomalies')}>Report Rate Anomalies</button>
        </details>
        <p className="footer-rates-line">{uxCopy.global.footer.ratesLine}</p>
        <p className="footer-rates-line">{uxCopy.global.footer.brandLine}</p>
        <p className="footer-rates-line">{uxCopy.global.footer.advisoryLine}</p>
      </footer>

      {activeLegalModal && (
        <div className="legal-modal-overlay" role="dialog" aria-modal="true" aria-label={legalModalCopy[activeLegalModal].title}>
          <article className="legal-modal-card">
            <h3>{legalModalCopy[activeLegalModal].title}</h3>
            <p>{legalModalCopy[activeLegalModal].body}</p>
            <button type="button" className="ccc-button-primary" onClick={() => setActiveLegalModal(null)}>Close</button>
          </article>
        </div>
      )}

      {isPersistentDisclaimerVisible && (
        <div className="persistent-disclaimer" role="status">
          <span>{uxCopy.global.persistentDisclaimer}</span>
          <button
            type="button"
            className="persistent-disclaimer-dismiss"
            onClick={() => {
              sessionStorage.setItem(uxCopy.disclaimer.sessionKey, 'dismissed');
              setPersistentDisclaimerVisible(false);
            }}
          >
            {uxCopy.disclaimer.dismissCta}
          </button>
        </div>
      )}
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
