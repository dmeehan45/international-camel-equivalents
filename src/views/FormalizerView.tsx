import { useAppState } from '../store/AppStateContext';

export function FormalizerView() {
  const app = useAppState();

  return (
    <section>
      <h2>Formalizer + compare</h2>
      <div className="row">
        <input value={app.compareAmount} onChange={(e) => app.setCompareAmount(e.target.value)} type="number" min="0" />
        <select value={app.compareFromProxyId} onChange={(e) => app.setCompareFromProxyId(e.target.value)}>
          {app.proxies.map((proxy) => <option key={proxy.id} value={proxy.id}>{proxy.name}</option>)}
        </select>
        <select value={app.compareToProxyId} onChange={(e) => app.setCompareToProxyId(e.target.value)}>
          {app.proxies.map((proxy) => <option key={proxy.id} value={proxy.id}>{proxy.name}</option>)}
        </select>
      </div>
      <p className="meta">{app.compareSummary}</p>

      <div className="row">
        <select value={app.messageTemplate} onChange={(e) => app.setMessageTemplate(e.target.value)}>
          {app.messageTemplates.map((template) => <option key={template} value={template}>{template}</option>)}
        </select>
        <select value={app.messageProxyId} onChange={(e) => app.setMessageProxyId(e.target.value)}>
          {app.proxies.map((proxy) => <option key={proxy.id} value={proxy.id}>{proxy.name}</option>)}
        </select>
        <button type="button" onClick={app.formalize}>Formalize message</button>
      </div>
      <textarea value={app.messageOutput} onChange={(e) => app.setMessageOutput(e.target.value)} rows={4} style={{ width: '100%', marginTop: '0.75rem' }} />
    </section>
  );
}
