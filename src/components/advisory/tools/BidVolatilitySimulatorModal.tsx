import { useMemo, useState } from 'react';
import { AdvisoryToolShell } from '../AdvisoryToolShell';
import type { ProxyDefinition, VolatilityForecastResult } from '../../../domain/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  proxyLibrary: ProxyDefinition[];
  onApplyForecast: (result: VolatilityForecastResult) => void;
};

type Scenario = {
  id: string;
  label: string;
  impact: number;
  categories: ProxyDefinition['category'][];
};

const scenarios: Scenario[] = [
  { id: 's1', label: 'Pirate Parrot Invasion', impact: 0.15, categories: ['Birds and Flying Creatures'] },
  { id: 's2', label: 'Bubblegum Blowfish Bubble Burst', impact: -0.042, categories: ['Aquatic and Marine Life'] },
  { id: 's3', label: 'Yak Stampede Event', impact: 0.09, categories: ['Mammals and Land Creatures'] },
  { id: 's4', label: 'Portal Potato Collapse', impact: 0.24, categories: ['Other Bizarre Items and Collectives', 'Mythical and Absurd Concepts'] },
  { id: 's5', label: 'Disco Dinosaur Revival', impact: 0.12, categories: ['Mythical and Absurd Concepts'] },
  { id: 's6', label: 'Scorpion Compliance Strike', impact: -0.06, categories: ['Reptiles, Insects, and Invertebrates'] },
];

export function BidVolatilitySimulatorModal(props: Props) {
  const [turn, setTurn] = useState(0);
  const [selectedProxyId, setSelectedProxyId] = useState(props.proxyLibrary[0]?.id || '');
  const [rateMultiplier, setRateMultiplier] = useState(1);
  const [history, setHistory] = useState<number[]>([1]);

  const selectedProxy = props.proxyLibrary.find((proxy) => proxy.id === selectedProxyId) || props.proxyLibrary[0];
  const scenarioSet = useMemo(() => {
    const preferred = scenarios.filter((scenario) => scenario.categories.includes(selectedProxy.category));
    const fallback = scenarios.filter((scenario) => !scenario.categories.includes(selectedProxy.category));
    return [...preferred, ...fallback].slice(0, 3);
  }, [selectedProxy]);

  function resetSimulation() {
    setTurn(0);
    setRateMultiplier(1);
    setHistory([1]);
  }

  if (!props.isOpen || !selectedProxy) return null;

  const projectedRate = selectedProxy.ratePerCamel * rateMultiplier;
  const volatilityPercent = Math.abs((rateMultiplier - 1) * 100);
  const isExhausted = turn >= 4;

  return (
    <AdvisoryToolShell title="DBT Volatility Forecasting Simulator – Model v1.07" onClose={props.onClose} mobileFullScreen>
      <label>
        Proxy Under Review
        <select
          value={selectedProxyId}
          onChange={(event) => {
            setSelectedProxyId(event.target.value);
            // A multiplier accrued against a different proxy is meaningless here.
            resetSimulation();
          }}
        >
          {props.proxyLibrary.map((proxy) => (
            <option key={proxy.id} value={proxy.id}>{proxy.name}</option>
          ))}
        </select>
      </label>
      <div className="actions-row actions-row--two">
        <p className="helper">
          {isExhausted
            ? 'Turn 4/4 · Simulation complete. Apply the forecast or reset to model another scenario.'
            : `Turn ${turn + 1}/4 · Select an event to advance the simulation.`}
        </p>
        <button className="cta-secondary" onClick={resetSimulation} disabled={turn === 0}>Reset Simulation</button>
      </div>

      <div className="cards">
        {scenarioSet.map((scenario) => (
          <button
            key={scenario.id}
            className="card-button"
            disabled={isExhausted}
            onClick={() => {
              if (isExhausted) return;
              const nextMultiplier = Math.max(0.3, rateMultiplier + scenario.impact / 2);
              setRateMultiplier(nextMultiplier);
              setHistory((current) => [...current, nextMultiplier]);
              setTurn((current) => Math.min(current + 1, 4));
            }}
          >
            <strong>Event: {scenario.label}</strong>
            <p className="helper">Impact {(scenario.impact * 100).toFixed(1)}% on relevant proxies</p>
          </button>
        ))}
      </div>

      <div className="advisory-mini-chart" aria-label="Volatility chart">
        {history.map((value, index) => (
          <div key={`${value}-${index}`} className="advisory-mini-chart-bar" style={{ height: `${Math.max(20, value * 58)}px` }} />
        ))}
      </div>

      <p>
        Forecast Report: {selectedProxy.name} projected at {projectedRate.toFixed(2)}
        {' '}(Volatility: ±{volatilityPercent.toFixed(1)}% over 7 advisory days).
      </p>
      <p className="helper">Recommendation: Hedge with quantum-entangled socks and avoid goblin gadget interference.</p>

      <button
        className="ccc-button-primary"
        onClick={() => props.onApplyForecast({
          proxyId: selectedProxy.id,
          proxyName: selectedProxy.name,
          projectedRate,
          volatilityPercent,
          advisoryNote: 'Temporary display adjustment authorized under Model v1.07.',
          turnsRun: turn,
          appliedAtISO: new Date().toISOString(),
        })}
      >
        Apply Forecast
      </button>
    </AdvisoryToolShell>
  );
}
