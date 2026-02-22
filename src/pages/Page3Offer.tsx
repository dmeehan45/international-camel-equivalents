import type { uxCopy } from '../content/uxCopy';

type Card = { label: string; camels: number };

type Props = {
  copy: typeof uxCopy;
  camelQuantity: number;
  suggestedCamels: number;
  cards: Card[];
  onSliderChange: (value: number) => void;
  onSelectCard: (value: number) => void;
  onLockIn: () => void;
};

export function Page3Offer({ copy, camelQuantity, suggestedCamels, cards, onSliderChange, onSelectCard, onLockIn }: Props) {
  return (
    <div>
      <h2>{copy.page3.title}</h2>
      <p>{copy.page3.suggestion(suggestedCamels)}</p>
      <p className="helper">{copy.page3.helper}</p>
      <label>{copy.page3.live(camelQuantity)}
        <input type="range" min={5} max={100} value={camelQuantity} onChange={(e) => onSliderChange(Number(e.target.value))} />
      </label>
      <div className="cards">
        {cards.map((card) => (
          <button key={card.label} className="card-button" onClick={() => onSelectCard(card.camels)}>{card.label}</button>
        ))}
      </div>
      <button className="ccc-button-primary" onClick={onLockIn}>{copy.page3.lockIn}</button>
      <p className="helper">{copy.page3.footnote}</p>
    </div>
  );
}
