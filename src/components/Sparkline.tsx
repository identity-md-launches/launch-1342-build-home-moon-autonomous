import { useId } from 'react';

interface Props {
  values: number[];
  width?: number;
  height?: number;
  label: string;
}

/** Tiny SVG line of the values seen this session. Flat line until two samples exist. */
export function Sparkline({ values, width = 120, height = 28, label }: Props) {
  const id = useId();
  const n = values.length;
  const min = n ? Math.min(...values) : 0;
  const max = n ? Math.max(...values) : 1;
  const span = max - min || 1;
  const pad = 2;
  const pts =
    n < 2
      ? [`${pad},${height / 2}`, `${width - pad},${height / 2}`]
      : values.map((v, i) => {
          const x = pad + (i / (n - 1)) * (width - pad * 2);
          const y = height - pad - ((v - min) / span) * (height - pad * 2);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        });
  const last = pts[pts.length - 1] ?? `${width - pad},${height / 2}`;
  const [lx, ly] = last.split(',');
  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby={id}
      preserveAspectRatio="none"
    >
      <title id={id}>{`${label}: ${n} sample${n === 1 ? '' : 's'} this session`}</title>
      <polyline points={pts.join(' ')} fill="none" stroke="currentColor" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r={2} fill="currentColor" />
    </svg>
  );
}
