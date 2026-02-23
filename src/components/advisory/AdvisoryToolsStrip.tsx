import type { AdvisoryToolTile } from '../../domain/types';

type Props = {
  tiles: AdvisoryToolTile[];
  isUnlocked: boolean;
  onOpenTool: (key: AdvisoryToolTile['key']) => void;
};

const icons = {
  quiz: '❓',
  simulator: '📉',
  estimator: '📊',
  archive: '📚',
} as const;

export function AdvisoryToolsStrip(props: Props) {
  if (!props.isUnlocked) return null;

  return (
    <div className="advisory-tools-strip" role="list" aria-label="Advanced Advisory Modules">
      {props.tiles.slice(0, 4).map((tile) => (
        <button key={tile.key} className="advisory-tool-tile" role="listitem" onClick={() => props.onOpenTool(tile.key)}>
          <p className="advisory-tool-icon" aria-hidden="true">{icons[tile.icon]}</p>
          <strong>{tile.title}</strong>
          <p className="advisory-tool-subtitle">{tile.subtitle}</p>
          <p className="helper">{tile.teaser}</p>
        </button>
      ))}
    </div>
  );
}
