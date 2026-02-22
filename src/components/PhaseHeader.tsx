type Props = {
  phaseLabel: string;
  heading: string;
  subtitle?: string;
};

export function PhaseHeader({ phaseLabel, heading, subtitle }: Props) {
  return (
    <header className="phase-header">
      <p className="phase-label">{phaseLabel}</p>
      <h2>{heading}</h2>
      {subtitle && <p className="helper">{subtitle}</p>}
    </header>
  );
}
