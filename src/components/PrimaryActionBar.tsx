type SecondaryAction = { label: string; onClick: () => void; disabled?: boolean };

type Props = {
  primary: { label: string; onClick: () => void; disabled?: boolean };
  secondary?: SecondaryAction[];
};

export function PrimaryActionBar({ primary, secondary = [] }: Props) {
  return (
    <div className="primary-action-bar">
      <button className="ccc-button-primary cta-primary" onClick={primary.onClick} disabled={primary.disabled}>{primary.label}</button>
      {secondary.map((action) => (
        <button key={action.label} className="cta-secondary" onClick={action.onClick} disabled={action.disabled}>{action.label}</button>
      ))}
    </div>
  );
}
