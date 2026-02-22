import { useAppState } from '../store/AppStateContext';

export function HomeView() {
  const app = useAppState();

  return (
    <section>
      <div className="row">
        <input value={app.amount} onChange={(e) => app.setAmount(e.target.value)} type="number" min="0" />
        <select value={app.unit} onChange={(e) => app.setUnit(e.target.value as any)}>
          <option value="USD">USD</option>
          <option value="CAMEL">Camels</option>
          <option value="PROXY">Proxy</option>
        </select>
        {app.unit === 'PROXY' && (
          <select value={app.proxyId} onChange={(e) => app.setProxyId(e.target.value)}>
            {app.proxies.map((proxy) => (
              <option key={proxy.id} value={proxy.id}>{proxy.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="row">
        <input value={app.filterQuery} onChange={(e) => app.setFilterQuery(e.target.value)} placeholder="Filter proxies" />
        <select value={app.sort} onChange={(e) => app.setSort(e.target.value)}>
          <option value="quantity-desc">Sort: Quantity (high to low)</option>
          <option value="quantity-asc">Sort: Quantity (low to high)</option>
          <option value="name-asc">Sort: Name (A-Z)</option>
          <option value="name-desc">Sort: Name (Z-A)</option>
        </select>
      </div>

      {app.dashboard && (
        <>
          <p><strong>{app.amount} {app.unit}</strong> equals <strong>{app.dashboard.camelValue} camels</strong>.</p>
          <p className="meta">Base ICE: {app.dashboard.baseCamelValue} camels. Showing {app.dashboard.visible.length} of {app.dashboard.total}.</p>
          <table>
            <thead><tr><th>Proxy</th><th>Equivalent Quantity</th></tr></thead>
            <tbody>
              {app.dashboard.visible.map((item) => (
                <tr key={item.proxyId}><td>{item.proxyName}</td><td>{item.quantity}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {app.error && <div className="error">{app.error}</div>}
    </section>
  );
}
