import { useState } from 'react';
import { AdvisoryToolShell } from '../AdvisoryToolShell';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function MaidenResponseEstimatorModal(props: Props) {
  const [generosity, setGenerosity] = useState(50);
  const [novelty, setNovelty] = useState(30);
  if (!props.isOpen) return null;
  const estimate = Math.max(0, Math.min(100, 50 + generosity * 0.3 - novelty * 0.15));

  return (
    <AdvisoryToolShell title="DBT Response Probability Estimator – Algorithm 5.13" onClose={props.onClose} mobileFullScreen>
      <label>Bid Generosity ({generosity})
        <input type="range" min={0} max={100} value={generosity} onChange={(e) => setGenerosity(Number(e.target.value))} />
      </label>
      <label>Proxy Novelty ({novelty})
        <input type="range" min={0} max={100} value={novelty} onChange={(e) => setNovelty(Number(e.target.value))} />
      </label>
      <p>Estimation Report: Probability of Affirmative Response — {estimate.toFixed(0)}%.</p>
      <button>Generate Contingency Clause</button>
    </AdvisoryToolShell>
  );
}
