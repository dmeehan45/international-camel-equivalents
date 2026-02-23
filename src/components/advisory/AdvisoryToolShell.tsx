import type { ReactNode } from 'react';

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  mobileFullScreen?: boolean;
};

export function AdvisoryToolShell(props: Props) {
  return (
    <div className="advisory-tool-overlay" role="dialog" aria-modal="true" aria-label={props.title}>
      <div className={`advisory-tool-shell ${props.mobileFullScreen ? 'is-mobile-full' : ''}`}>
        <div className="advisory-tool-shell-header">
          <strong>{props.title}</strong>
          <button onClick={props.onClose} aria-label="Close advisory tool">Close</button>
        </div>
        <div>{props.children}</div>
      </div>
    </div>
  );
}
