import type { uxCopy } from '../content/uxCopy';

type SavedDraft = {
  id: string;
  name: string;
  summary: string;
  text: string;
  createdAt: string;
  proxyName: string;
  proxyQuantity: number;
  camelEquivalent: number;
  rateLabel: string;
};

type ToolTile = {
  id: string;
  title: string;
  description: string;
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
  tools: ToolTile[];
  activeToolId: string;
  onSelectTool: (id: string) => void;
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
            <p>{draft.proxyQuantity} {draft.proxyName} ≈ {draft.camelEquivalent} Camels ({draft.rateLabel})</p>
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

      {props.toolsUnlocked && (
        <div>
          <h3>{props.copy.page5.extras}</h3>
          <div className="cards tool-grid">
            {props.tools.map((tool) => (
              <button key={tool.id} className={`card-button ${props.activeToolId === tool.id ? 'is-selected' : ''}`} onClick={() => props.onSelectTool(tool.id)}>
                <strong>{tool.title}</strong>
                <p className="helper">{tool.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="helper">{props.copy.page5.localNote}</p>
      <button className="ccc-button-primary" onClick={props.onStartNew}>{props.copy.page5.startNew}</button>
    </div>
  );
}
