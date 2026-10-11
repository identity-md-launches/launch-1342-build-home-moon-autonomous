import type { ReactNode } from 'react';
import { Sparkline } from './Sparkline';
import { Skeleton } from './Skeleton';
import './Tile.css';

interface Props {
  label: string;
  /** Formatted value, or null while loading. */
  value: string | null;
  history?: number[];
  detail?: ReactNode;
  tone?: 'default' | 'alert';
  skeletonCh?: number;
}

/** Telemetry tile: label, big tabular value, optional sparkline and detail line. */
export function Tile({ label, value, history, detail, tone = 'default', skeletonCh = 4 }: Props) {
  return (
    <div className={`tile${tone === 'alert' ? ' tile--alert' : ''}`}>
      <div className="tile__label">{label}</div>
      <div className="tile__value t-mono" aria-live="off">
        {value === null ? <Skeleton ch={skeletonCh} label={`${label}: loading`} /> : value}
      </div>
      {history ? (
        <div className="tile__spark">
          <Sparkline values={history} label={label} />
        </div>
      ) : null}
      {detail ? <div className="tile__detail t-caption">{detail}</div> : null}
    </div>
  );
}
