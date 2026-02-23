import type { uxCopy } from '../content/uxCopy';
import { AdvisoryToolsStrip } from '../components/advisory/AdvisoryToolsStrip';
import type { AdvisoryToolTile, AdvisoryToolKey } from '../domain/types';

type SavedDraft = {
  id: string;
  name: string;
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
  toolsUnlocked: boolean;
  tools: AdvisoryToolTile[];
  onSelectTool: (id: AdvisoryToolKey) => void;
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

      {!props.toolsUnlocked && <p className="helper legal-footnote">{props.copy.page5.localNote}</p>}

      {props.toolsUnlocked && (
        <div>
          <h3>{props.copy.page5.extras}</h3>
          <p className="helper badge-volatility">{props.copy.page5.unlock}</p>
          <AdvisoryToolsStrip tiles={props.tools} isUnlocked={props.toolsUnlocked} onOpenTool={props.onSelectTool} />
          <p className="helper">{props.copy.page5.localNote}</p>
        </div>
      )}

      {props.copy.page5.footnotes.map((note) => <p key={note} className="helper legal-footnote">{note}</p>)}
      <button className="ccc-button-primary" onClick={props.onStartNew}>{props.copy.page5.startNew}</button>
    </div>
  );
}
