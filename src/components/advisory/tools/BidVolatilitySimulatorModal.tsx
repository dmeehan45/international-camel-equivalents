import { useState } from 'react';
import { AdvisoryToolShell } from '../AdvisoryToolShell';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const scenarios = [
  { label: 'Pirate Parrot Invasion', impact: 0.15 },
  { label: 'Bubblegum Blowfish Bubble Burst', impact: -0.042 },
  { label: 'Yak Stampede Event', impact: 0.09 },
];

export function BidVolatilitySimulatorModal(props: Props) {
  const [turn, setTurn] = useState(0);
  const [score, setScore] = useState(1);
  if (!props.isOpen) return null;

  return (
    <AdvisoryToolShell title="DBT Volatility Forecasting Simulator – Model v1.07" onClose={props.onClose} mobileFullScreen>
      <p className="helper">Turn {Math.min(turn + 1, 4)}/4</p>
      <div className="cards">
        {scenarios.map((scenario) => (
          <button key={scenario.label} className="card-button" onClick={() => { setScore((v) => v + scenario.impact); setTurn((v) => Math.min(v + 1, 4)); }}>
            <strong>{scenario.label}</strong>
            <p className="helper">Impact {(scenario.impact * 100).toFixed(1)}%</p>
          </button>
        ))}
      </div>
      <p>Forecast Report: projected multiplier {score.toFixed(2)} (Volatility ±{Math.abs((score - 1) * 100).toFixed(1)}%).</p>
      <button>Apply Forecast</button>
    </AdvisoryToolShell>
  );
}
