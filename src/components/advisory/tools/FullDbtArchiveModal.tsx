import { useMemo, useState } from 'react';
import { AdvisoryToolShell } from '../AdvisoryToolShell';
import type { ArchiveTrendInsightResult, ProxyDefinition } from '../../../domain/types';
import { buildArchiveEntries } from '../../../core/advisory-tools-engine';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  proxyLibrary: ProxyDefinition[];
  onApplyTrend: (result: ArchiveTrendInsightResult) => void;
};

export function FullDbtArchiveModal(props: Props) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProxyDefinition['category']>('all');
  const [selectedProxyName, setSelectedProxyName] = useState('');

  const logs = useMemo(() => buildArchiveEntries(props.proxyLibrary, Date.now()), [props.proxyLibrary]);
  const filtered = logs.filter((item) => {
    const matchesQuery = !query.trim() || item.proxyName.toLowerCase().includes(query.toLowerCase()) || item.note.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  const insight = useMemo(() => {
    const source = filtered.filter((entry) => !selectedProxyName || entry.proxyName === selectedProxyName);
    if (source.length === 0) return null;
    const first = source[source.length - 1].rate;
    const last = source[0].rate;
    const averageRate = source.reduce((sum, entry) => sum + entry.rate, 0) / source.length;
    const trend = last > first + 0.04 ? 'upward' : last < first - 0.04 ? 'downward' : 'flat';
    return {
      proxyName: selectedProxyName || source[0].proxyName,
      averageRate,
      trend,
      advisoryNote: `Trend indicates ${trend} pressure in mermaid melody markets.`,
      appliedAtISO: new Date().toISOString(),
    } as ArchiveTrendInsightResult;
  }, [filtered, selectedProxyName]);

  if (!props.isOpen) return null;

  return (
    <AdvisoryToolShell title="DBT Historical Rate Archive – Ledger Access" onClose={props.onClose} mobileFullScreen>
      <div className="actions-row actions-row--two">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ledger" />
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as typeof categoryFilter)}>
          <option value="all">All categories</option>
          {[...new Set(props.proxyLibrary.map((proxy) => proxy.category))].map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <label>
        Proxy focus
        <select value={selectedProxyName} onChange={(event) => setSelectedProxyName(event.target.value)}>
          <option value="">All visible proxies</option>
          {[...new Set(filtered.map((entry) => entry.proxyName))].map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </label>

      <p className="helper">
        {filtered.length === 0
          ? 'No ledger records in scope.'
          : `Showing ${Math.min(40, filtered.length)} of ${filtered.length} ledger records in scope.`}
      </p>

      <div className="cards advisory-ledger-list">
        {filtered.slice(0, 40).map((entry) => (
          <article key={entry.id} className="draft-card">
            <strong>{entry.dateLabel} · {entry.proxyName}</strong>
            <p className="helper">Rate {entry.rate.toFixed(2)}</p>
            <p className="helper">{entry.note}</p>
          </article>
        ))}
      </div>

      {insight ? (
        <>
          <p>
            Insight Summary: {insight.proxyName} averaged {insight.averageRate.toFixed(2)} over selected records
            {' '}(Trend: {insight.trend}).
          </p>
          <p className="helper">Advisory: Leverage for temporal hedging with polite bureaucracy.</p>
          <button className="ccc-button-primary" onClick={() => props.onApplyTrend(insight)}>Apply Trend to Bid</button>
        </>
      ) : (
        <p className="helper">No historical records match this filter. Expand scope for Bureau-compliant insight.</p>
      )}
    </AdvisoryToolShell>
  );
}
