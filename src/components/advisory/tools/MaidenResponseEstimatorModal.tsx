import { useMemo, useState } from 'react';
import { AdvisoryToolShell } from '../AdvisoryToolShell';
import type { MaidenResponseEstimateResult } from '../../../domain/types';

type DraftInput = {
  id: string;
  summary: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  drafts: DraftInput[];
  onGenerateClause: (result: MaidenResponseEstimateResult) => void;
};

export function MaidenResponseEstimatorModal(props: Props) {
  const [generosity, setGenerosity] = useState(50);
  const [novelty, setNovelty] = useState(30);
  const [selectedDraftId, setSelectedDraftId] = useState(props.drafts[0]?.id || '');

  const selectedDraft = props.drafts.find((draft) => draft.id === selectedDraftId) || props.drafts[0];

  const estimate = useMemo(() => {
    const base = 50 + generosity * 0.32 - novelty * 0.17;
    const draftBonus = selectedDraft?.summary.length ? Math.min(8, selectedDraft.summary.length / 40) : -5;
    return Math.max(0, Math.min(100, base + draftBonus));
  }, [generosity, novelty, selectedDraft]);

  const confidenceBand = estimate >= 70 ? 'High' : estimate >= 45 ? 'Moderate' : 'Fragile';
  const contingencyClause = `In event of rejection, revert to certified fallback proxy protocol with ${Math.max(1, Math.round((100 - estimate) / 10))} additional courtesy units.`;

  if (!props.isOpen) return null;

  return (
    <AdvisoryToolShell title="DBT Response Probability Estimator – Algorithm 5.13" onClose={props.onClose} mobileFullScreen>
      <label>
        Source Docket Proposal
        <select value={selectedDraftId} onChange={(event) => setSelectedDraftId(event.target.value)}>
          {props.drafts.map((draft) => (
            <option key={draft.id} value={draft.id}>{draft.summary.slice(0, 80)}</option>
          ))}
        </select>
      </label>

      <label>Bid Generosity ({generosity})
        <input type="range" min={0} max={100} value={generosity} onChange={(e) => setGenerosity(Number(e.target.value))} />
      </label>
      <label>Proxy Novelty ({novelty})
        <input type="range" min={0} max={100} value={novelty} onChange={(e) => setNovelty(Number(e.target.value))} />
      </label>

      <p>
        Estimation Report: Probability of Affirmative Response — {estimate.toFixed(0)}%
        {' '}(Confidence: {confidenceBand}; interval ±DBT Absurdity Factor).
      </p>
      <ul className="calc-log">
        <li>Tip: Mitigate risk with fairy dust sprinkles addendum.</li>
        <li>Tip: Keep annexes concise to avoid narwhal tusk fatigue.</li>
      </ul>

      <button
        className="ccc-button-primary"
        disabled={!selectedDraft}
        onClick={() => {
          if (!selectedDraft) return;
          props.onGenerateClause({
            draftId: selectedDraft.id,
            probabilityPercent: Number(estimate.toFixed(0)),
            confidenceBand,
            contingencyClause,
            appliedAtISO: new Date().toISOString(),
          });
        }}
      >
        Generate Contingency Clause
      </button>
      <pre>{contingencyClause}</pre>
    </AdvisoryToolShell>
  );
}
