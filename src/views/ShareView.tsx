import { useAppState } from '../store/AppStateContext';

export function ShareView() {
  const app = useAppState();

  return (
    <section>
      <h2>Share</h2>
      <div className="row">
        <button type="button" onClick={app.buildShare}>Build share text</button>
        <button type="button" onClick={() => app.copyShareText().catch(() => {})}>Copy share text</button>
        <button type="button" onClick={app.openMailDraft}>Open mail draft</button>
        <button type="button" onClick={app.openSmsDraft}>Open SMS draft</button>
        <button type="button" onClick={app.openTwitterDraft}>Open Twitter draft</button>
        <button type="button" onClick={app.openWhatsappDraft}>Open WhatsApp draft</button>
      </div>
      <textarea value={app.shareOutput} readOnly rows={4} style={{ width: '100%', marginTop: '0.75rem' }} />
    </section>
  );
}
