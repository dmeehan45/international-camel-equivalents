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
  onLockIn: () => void;
};

export function Page3Offer(props: Props) {
  const [query, setQuery] = useState('');

  const filteredLibrary = useMemo(() => {
    if (!query.trim()) return props.fullLibrary;
    const q = query.toLowerCase();
    return props.fullLibrary.filter((item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }, [props.fullLibrary, query]);

  const groupedLibrary = useMemo(() => {
    const grouped = new Map<string, ProxyCard[]>();
    for (const card of filteredLibrary) {
      const items = grouped.get(card.category) ?? [];
      items.push(card);
      grouped.set(card.category, items);
    }
    return Array.from(grouped.entries());
  }, [filteredLibrary]);

  return (
    <div>
      <h2>{props.copy.page3.title}</h2>
      <p>{props.copy.page3.suggestion(props.selectedProxyName)}</p>
      <p className="helper">{props.copy.page3.helper}</p>

      <div className="cards proxy-cards">
        {props.curatedCards.map((card) => (
          <button key={card.id} className={`card-button ${props.selectedProxyId === card.id ? 'is-selected' : ''}`} onClick={() => props.onSelectProxy(card.id)}>
            <strong>{card.name}</strong>
            <p className="helper">Benchmarked Live Rate: 1 Camel = {card.liveRate} {card.name}</p>
            <p className="helper">{card.description}</p>
          </button>
        ))}
      </div>

      <button className="cta-secondary" onClick={props.onToggleLibrary}>{props.copy.page3.browse}</button>
      {props.isLibraryOpen && (
        <div className="drawer">
          <input value={query} placeholder={props.copy.page3.searchPlaceholder} onChange={(e) => setQuery(e.target.value)} />
          <div className="cards proxy-library-list">
            {groupedLibrary.map(([category, cards]) => (
              <section key={category} className="proxy-category-group">
                <h4>{category}</h4>
                {cards.map((card) => (
                  <button key={card.id} className={`card-button ${props.selectedProxyId === card.id ? 'is-selected' : ''}`} onClick={() => props.onSelectProxy(card.id)}>
                    <strong>{card.name}</strong>
                    <p className="helper">1 Camel = {card.liveRate} {card.name}</p>
                  </button>
                ))}
              </section>
            ))}
            {filteredLibrary.length === 0 && <p>{props.copy.page3.empty}</p>}
          </div>
        </div>
      )}

      <label>{props.copy.page3.live(props.camelEquivalent)}
        <input type="range" min={1} max={100} value={props.proxyQuantity} onChange={(e) => props.onQuantityChange(Number(e.target.value))} />
      </label>
      <p className="helper">{props.copy.page3.formula(props.proxyQuantity, props.selectedLiveRate, props.camelEquivalent, props.volatilityPercent)}</p>

      <button className="ccc-button-primary" onClick={props.onLockIn}>{props.copy.page3.lockIn}</button>
      <p className="helper">{props.copy.page3.footnote}</p>
    </div>
  );
}
