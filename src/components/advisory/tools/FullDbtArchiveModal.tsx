import { useMemo, useState } from 'react';
import { AdvisoryToolShell } from '../AdvisoryToolShell';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function FullDbtArchiveModal(props: Props) {
  const [query, setQuery] = useState('');
  const logs = useMemo(() => {
    return Array.from({ length: 30 }).map((_, idx) => ({
      id: `log-${idx}`,
      dateLabel: new Date(Date.now() - idx * 86400000).toLocaleDateString(),
      text: `Ledger event ${idx + 1}: Llamas ${idx % 2 ? 'dip' : 'rise'} ${(idx * 0.03).toFixed(2)} due to advisory anomaly.`,
    }));
  }, []);
  if (!props.isOpen) return null;
  const filtered = logs.filter((item) => item.text.toLowerCase().includes(query.toLowerCase()));

  return (
    <AdvisoryToolShell title="DBT Historical Rate Archive – Ledger Access" onClose={props.onClose} mobileFullScreen>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ledger" />
      <div className="cards">
        {filtered.map((entry) => (
          <article key={entry.id} className="draft-card">
            <strong>{entry.dateLabel}</strong>
            <p className="helper">{entry.text}</p>
          </article>
        ))}
      </div>
      <p>Insight Summary: average trend remains mildly upward in mermaid melody markets.</p>
      <button>Apply Trend to Bid</button>
    </AdvisoryToolShell>
  );
}
