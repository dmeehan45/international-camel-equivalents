import { useAppState } from '../store/AppStateContext';

export function CustomizerView() {
  const app = useAppState();

  return (
    <section>
      <h2>Customizer</h2>
      <div className="row">
        <select value={app.locationKey} onChange={(e) => app.setLocationKey(e.target.value)}>
          {Object.entries(app.locationPresets).map(([key, preset]) => (
            <option key={key} value={key}>{preset.label} ({preset.camelMultiplier}x)</option>
          ))}
        </select>
        <select value={app.language} onChange={(e) => app.setLanguage(e.target.value)}>
          <option value="en">English</option><option value="ar">Arabic</option><option value="fr">French</option>
          <option value="es">Spanish</option><option value="sw">Swahili</option>
        </select>
        <input value={app.manualMultiplier} onChange={(e) => app.setManualMultiplier(e.target.value)} type="number" min="0.01" step="0.01" />
      </div>
      <div className="row">
        <select value={app.overrideProxyId} onChange={(e) => app.setOverrideProxyId(e.target.value)}>
          {app.proxies.map((proxy) => <option key={proxy.id} value={proxy.id}>{proxy.name}</option>)}
        </select>
        <input value={app.overrideRate} onChange={(e) => app.setOverrideRate(e.target.value)} placeholder="Override rate" type="number" min="0" step="0.01" />
      </div>

      <h3>Proxy generator</h3>
      <div className="row">
        <input value={app.newProxyName} onChange={(e) => app.setNewProxyName(e.target.value)} placeholder="Proxy name" />
        <input value={app.newProxyRate} onChange={(e) => app.setNewProxyRate(e.target.value)} placeholder="Rate per camel" type="number" min="0.01" step="0.01" />
        <input value={app.newProxyCategory} onChange={(e) => app.setNewProxyCategory(e.target.value)} placeholder="Category" />
        <input value={app.newProxyDescription} onChange={(e) => app.setNewProxyDescription(e.target.value)} placeholder="Description" />
        <button type="button" onClick={app.addProxy}>Unleash the Proxy Pandemonium!</button>
      </div>
      <div className="meta">{app.generatorStatus}</div>
    </section>
  );
}
