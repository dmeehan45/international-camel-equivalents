import { useMemo, useState } from 'react';
import type { uxCopy } from '../content/uxCopy';

type ProxyCard = {
  id: string;
  name: string;
  category: string;
  description: string;
  liveRate: number;
};

type Props = {
  copy: typeof uxCopy;
  selectedProxyId: string;
  selectedProxyName: string;
  proxyQuantity: number;
  camelEquivalent: number;
  curatedCards: ProxyCard[];
  fullLibrary: ProxyCard[];
  isLibraryOpen: boolean;
  onToggleLibrary: () => void;
  onSelectProxy: (id: string) => void;
  onQuantityChange: (value: number) => void;
  volatilityPercent: number;
  selectedLiveRate: number;
  volatilityToast: string;
  onLockIn: () => void;
};

export function Page3Offer(props: Props) {
  const [query, setQuery] = useState('');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareOpen, setCompareOpen] = useState(false);



  const compareCards = props.fullLibrary.filter((card) => compareIds.includes(card.id));

  function toggleCompareSelection(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) return current;
      return [...current, id];
    });
  }

  const filteredLibrary = useMemo(() => {
    if (!query.trim()) return props.fullLibrary;
    const q = query.toLowerCase();
    return props.fullLibrary.filter((item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }, [props.fullLibrary, query]);

  return (
    <div>
      <h2>{props.copy.page3.title}</h2>
      {props.volatilityToast && <p className="helper badge-volatility">{props.volatilityToast}</p>}
      <p>{props.copy.page3.suggestion(props.selectedProxyName)}</p>
      <p className="helper">{props.copy.page3.helper}</p>

      <div className="cards proxy-cards">
        {props.curatedCards.map((card) => (
          <button
            key={card.id}
            className={`card-button ${props.selectedProxyId === card.id ? 'is-selected' : ''}`}
            onClick={() => props.onSelectProxy(card.id)}
            title={card.description}
            aria-label={`${card.name}. ${card.description}`}
          >
            <strong>{card.name}</strong>
            <p className="helper">Benchmarked Live Rate: 1 Camel = {card.liveRate} {card.name}</p>
            <p className="helper">{card.description}</p>
          </button>
        ))}
      </div>

      <div className="actions-row actions-row--two">
        <button className="cta-secondary" onClick={props.onToggleLibrary}>{props.copy.page3.browse}</button>
        <button className="cta-secondary" disabled={compareIds.length < 2} onClick={() => setCompareOpen((v) => !v)}>
          {isCompareOpen ? 'Hide Comparison' : `Compare Selected (${compareIds.length})`}
        </button>
      </div>
      {props.isLibraryOpen && (
        <div className="drawer drawer--library">
          <button className="cta-secondary drawer-mobile-close" onClick={props.onToggleLibrary}>Close library</button>
          <input value={query} placeholder={props.copy.page3.searchPlaceholder} onChange={(e) => setQuery(e.target.value)} />
          <div className="cards proxy-library-list">
            {filteredLibrary.map((card) => (
              <div key={card.id} className={`card-button ${props.selectedProxyId === card.id ? 'is-selected' : ''}`}>
                <button
                  className="compare-select-button"
                  onClick={() => props.onSelectProxy(card.id)}
                  title={card.description}
                  aria-label={`${card.name}. ${card.description}`}
                >
                  <strong>{card.name}</strong>
                  <p className="helper">{card.category}</p>
                  <p className="helper">1 Camel = {card.liveRate} {card.name}</p>
                </button>
                <label className="helper compare-checkbox">
                  <input
                    type="checkbox"
                    checked={compareIds.includes(card.id)}
                    onChange={() => toggleCompareSelection(card.id)}
                    disabled={!compareIds.includes(card.id) && compareIds.length >= 4}
                  /> Compare
                </label>
              </div>
            ))}
            {filteredLibrary.length === 0 && <p>{props.copy.page3.empty}</p>}
          </div>
        </div>
      )}

      {isCompareOpen && compareCards.length >= 2 && (
        <div className="drawer drawer--library" aria-label="Proxy comparison table">
          <h3>Proxy Comparison</h3>
          <div className="compare-grid">
            {compareCards.map((card) => (
              <article key={card.id} className="compare-col">
                <h4>{card.name}</h4>
                <p className="helper"><strong>Live DBT Rate:</strong> {card.liveRate}</p>
                <p className="helper"><strong>Camel Equivalent:</strong> {(props.proxyQuantity * card.liveRate).toFixed(2)}</p>
                <p className="helper">{card.description}</p>
                <button className="cta-secondary" onClick={() => props.onSelectProxy(card.id)}>Select this Proxy</button>
              </article>
            ))}
          </div>
        </div>
      )}

      <label>{props.copy.page3.live(props.camelEquivalent)}
        <input type="range" min={1} max={100} value={props.proxyQuantity} onChange={(e) => props.onQuantityChange(Number(e.target.value))} />
      </label>
      <p className="helper">{props.copy.page3.formula(props.proxyQuantity, props.selectedLiveRate, props.camelEquivalent, props.volatilityPercent)}</p>

      <button className="ccc-button-primary" onClick={props.onLockIn}>{props.copy.page3.lockIn}</button>
      {props.copy.page3.footnotes.map((note) => <p key={note} className="helper legal-footnote">{note}</p>)}
    </div>
  );
}
