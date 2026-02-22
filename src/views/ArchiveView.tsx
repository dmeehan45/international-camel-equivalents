import { useAppState } from '../store/AppStateContext';

export function ArchiveView() {
  const app = useAppState();

  return (
    <section>
      <h2>Archive</h2>
      <div className="row">
        <button type="button" onClick={app.archiveBid}>Archive this bid</button>
      </div>
      <div className="meta">{app.archiveStatus}</div>
      <ul>
        {app.archiveEntries.slice(0, 10).map((entry) => (
          <li key={entry.id}>{entry.summary} ({app.formatRelativeAge(entry.createdAt)})</li>
        ))}
      </ul>
    </section>
  );
}
