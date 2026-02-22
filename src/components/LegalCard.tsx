import type { ReactNode } from 'react';

type Props = {
  title?: string;
  tone?: 'default' | 'locked' | 'warning';
  children: ReactNode;
  className?: string;
};

export function LegalCard({ title, tone = 'default', children, className = '' }: Props) {
  const classes = `legal-card legal-card-${tone} ${className}`.trim();
  return (
    <section className={classes}>
      {title && <h3>{title}</h3>}
      {children}
    </section>
  );
}
