import { useMemo } from 'react';
import { useAppState } from '../store/AppStateContext';

export function ReferenceView() {
  const app = useAppState();
  const categories = useMemo(
    () => [...new Set(app.proxies.map((proxy) => proxy.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [app.proxies],
  );

  return (
    <section>
      <h2>Reference library</h2>
      <div className="row">
        <input value={app.referenceQuery} onChange={(e) => app.setReferenceQuery(e.target.value)} placeholder="Search" />
        <select value={app.referenceCategory} onChange={(e) => app.setReferenceCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <select value={app.referenceSource} onChange={(e) => app.setReferenceSource(e.target.value)}>
          <option value="all">All sources</option>
          <option value="reference">Reference only</option>
          <option value="extension">Extensions only</option>
        </select>
      </div>
      <p className="meta">Showing {app.referenceRows.rows.length} of {app.referenceRows.total} proxies.</p>
      <ul>
        {app.referenceRows.rows.map((proxy) => (
          <li key={proxy.id}>{proxy.name} — {proxy.category} ({proxy.source ?? 'reference'})</li>
        ))}
      </ul>
    </section>
  );
}
