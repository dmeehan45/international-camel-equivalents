import type { uxCopy } from '../content/uxCopy';

type SavedDraft = {
  id: string;
  name: string;
  camels: number;
  summary: string;
  text: string;
  createdAt: string;
};

type Props = {
  copy: typeof uxCopy;
  drafts: SavedDraft[];
  selectedDraftId: string | null;
  onToggleView: (id: string) => void;
  onCopyDraft: (text: string) => void;
  onShareDraft: (text: string) => void;
  onDeleteDraft: (id: string) => void;
  extrasOpen: boolean;
  onToggleExtras: () => void;
  rejectionText: string;
  onGenerateRejection: () => void;
  calculationsOpen: boolean;
  onToggleCalculations: () => void;
  onStartNew: () => void;
};

export function Page5Drafts(props: Props) {
  return (
    <div>
      <h2>{props.copy.page5.title}</h2>
      {props.drafts.length === 0 && <p>{props.copy.page5.empty}</p>}
      <div className="cards">
        {props.drafts.map((draft) => (
          <article key={draft.id} className="draft-card">
            <p><strong>{draft.name}</strong></p>
            <p>{draft.summary}</p>
            <p className="helper">{new Date(draft.createdAt).toLocaleString()}</p>
            {props.selectedDraftId === draft.id && <pre>{draft.text}</pre>}
            <div className="actions-row">
              <button className="cta-secondary" onClick={() => props.onToggleView(draft.id)}>{props.copy.page5.view}</button>
              <button className="cta-secondary" onClick={() => props.onCopyDraft(draft.text)}>{props.copy.page5.copy}</button>
              <button className="cta-secondary" onClick={() => props.onShareDraft(draft.text)}>{props.copy.page5.share}</button>
              <button className="cta-secondary" onClick={() => props.onDeleteDraft(draft.id)}>{props.copy.page5.delete}</button>
            </div>
          </article>
        ))}
      </div>

      <button className="cta-secondary text-link" onClick={props.onToggleExtras}>{props.copy.page5.extras}</button>
      {props.extrasOpen && (
        <div className="drawer">
          <button className="cta-secondary" onClick={props.onGenerateRejection}>{props.copy.page5.rejection}</button>
          {props.rejectionText && <pre>{props.rejectionText}</pre>}
          <button className="cta-secondary" onClick={props.onToggleCalculations}>{props.copy.page5.history}</button>
          {props.calculationsOpen && (
            <ul className="calc-log">
              {props.drafts.map((draft) => (
                <li key={`calc-${draft.id}`}>{draft.summary} · {new Date(draft.createdAt).toLocaleDateString()}</li>
              ))}
              {props.drafts.length === 0 && <li>No calculations yet.</li>}
            </ul>
          )}
        </div>
      )}

      <p className="helper">{props.copy.page5.localNote}</p>
      <button className="ccc-button-primary" onClick={props.onStartNew}>{props.copy.page5.startNew}</button>
    </div>
  );
}
