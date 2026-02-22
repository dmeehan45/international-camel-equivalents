import { useEffect, useState } from 'react';

type Props = {
  active: boolean;
  actionLabel: string;
  facts: readonly string[];
};

export function LoadingFactRotator({ active, actionLabel, facts }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || facts.length <= 1) return;
    const id = globalThis.setInterval(() => {
      setIndex((current) => (current + 1) % facts.length);
    }, 2200);
    return () => globalThis.clearInterval(id);
  }, [active, facts]);

  useEffect(() => {
    if (!active) setIndex(0);
  }, [active]);

  if (!active) return null;

  return (
    <section className="loading-facts" aria-live="polite" aria-atomic="true" role="status">
      <p className="helper">{actionLabel} in progress…</p>
      <p>{facts[index] ?? facts[0] ?? 'The clerk is stamping forms as fast as possible.'}</p>
    </section>
  );
}
