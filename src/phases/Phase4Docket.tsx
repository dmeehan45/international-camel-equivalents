import { useMemo, useState } from 'react';
import { buildDocketEntries } from '../core/history-archive.js';
import { uxCopy } from '../content/uxCopy';
import { LegalCard } from '../components/LegalCard';
import { PhaseHeader } from '../components/PhaseHeader';
import { PrimaryActionBar } from '../components/PrimaryActionBar';

type HistoryEntry = { id: string; createdAt: string; amount: number; unit: string; camelValue: number; summary: string };

type DocketEntry = HistoryEntry & { docketNumber: string; status: string; timerText: string; ageText: string; unread: boolean };

type Props = {
  calculation: any;
  shareText: string;
  exportToast: string;
  onSaveEntry: () => void;
  history: HistoryEntry[];
  docketReadIds: string[];
  onMarkDocketRead: (id: string) => void;
  onInitiateProceeding: () => void;
};

const sideQuestModules = ['Quiz', 'Rejection Generator', 'Precedent Archive'] as const;

export function Phase4Docket(props: Props) {
  const [openDocketId, setOpenDocketId] = useState<string | null>(null);
  const [openModule, setOpenModule] = useState<(typeof sideQuestModules)[number] | null>(null);
  const dockets = useMemo(
    () => buildDocketEntries(props.history, props.docketReadIds),
    [props.history, props.docketReadIds],
  );

  const docketCards = useMemo(() => dockets.map((entry: DocketEntry) => {
    const expanded = openDocketId === entry.id;
    return (
      <article key={entry.id} className="context-card">
        <p><strong>{entry.docketNumber}</strong> {entry.unread ? <span className="step-status current">Unread</span> : <span className="step-status completed">Seen</span>}</p>
        <p>{entry.summary}</p>
        <p className="helper">{entry.ageText} · {entry.timerText}</p>
        <p><span className="step-status">{entry.status}</span></p>
        <button
          aria-expanded={expanded}
          aria-controls={`docket-${entry.id}`}
          onClick={() => {
            setOpenDocketId(expanded ? null : entry.id);
            props.onMarkDocketRead(entry.id);
          }}
        >
          {expanded ? 'Hide Details' : 'Expand Details'}
        </button>
        {expanded && (
          <div id={`docket-${entry.id}`}>
            <p>Amount: {entry.amount} {entry.unit}</p>
            <p>Camel Value: {entry.camelValue.toFixed(2)}</p>
          </div>
        )}
      </article>
    );
  }), [dockets, openDocketId, props]);

  return (
    <>
      <PhaseHeader phaseLabel="Phase 4 of 4" heading={uxCopy.phases.phase4.heading} subtitle={uxCopy.phases.phase4.subtitle} />
      <LegalCard>
        <p className="hero">{props.calculation ? `${props.calculation.camelValue.toFixed(2)} camels` : uxCopy.phases.phase4.empty}</p>
        {props.shareText && <pre>{props.shareText}</pre>}
        {props.exportToast && <p className="helper">{props.exportToast}</p>}
      </LegalCard>

      <PrimaryActionBar
        primary={{ label: uxCopy.phases.phase4.primaryCta, onClick: props.onInitiateProceeding }}
        secondary={[{ label: uxCopy.phases.phase4.cta, onClick: props.onSaveEntry, disabled: !props.shareText }]}
      />

      <h3>Docket Queue</h3>
      <div className="grid" role="list" aria-label="Docket queue entries">
        {docketCards}
        {dockets.length === 0 && <p className="helper">Archive an entry to generate docket cards.</p>}
      </div>

      <details className="context-card">
        <summary>Optional side quests</summary>
        <div className="stepper side-quests">
          {sideQuestModules.map((moduleName) => (
            <button key={moduleName} onClick={() => setOpenModule(moduleName)}>{moduleName}</button>
          ))}
        </div>
      </details>
      {openModule && (
        <section className="view-card overlay" role="dialog" aria-modal="true" aria-label={openModule}>
          <h3>{openModule}</h3>
          {openModule === 'Quiz' && <p>Quick compatibility quiz module: assign 1-5 scores and compare totals.</p>}
          {openModule === 'Rejection Generator' && <p>Generate diplomatic decline notes using the current share summary.</p>}
          {openModule === 'Precedent Archive' && <p>Browse prior docket cards by status and age for repeat engagement.</p>}
          <button onClick={() => setOpenModule(null)}>Close Module</button>
        </section>
      )}
    </>
  );
}
