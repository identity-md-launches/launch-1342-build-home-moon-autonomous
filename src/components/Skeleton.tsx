interface Props {
  /** Width in ch so the placeholder matches the value it stands in for. */
  ch?: number;
  label?: string;
}

export function Skeleton({ ch = 4, label = 'Loading' }: Props) {
  return (
    <span className="skeleton" style={{ width: `${ch}ch` }} role="img" aria-label={label} />
  );
}
