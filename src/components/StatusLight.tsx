import './StatusLight.css';

export type LightTone = 'live' | 'alert' | 'idle' | 'unknown';

interface Props {
  tone: LightTone;
  /** Visible text next to the light; the light alone never carries the state. */
  label: string;
  pulse?: boolean;
}

export function StatusLight({ tone, label, pulse = false }: Props) {
  return (
    <span className={`light light--${tone}${pulse ? ' light--pulse' : ''}`}>
      <span className="light__dot" aria-hidden="true" />
      <span className="light__label">{label}</span>
    </span>
  );
}
