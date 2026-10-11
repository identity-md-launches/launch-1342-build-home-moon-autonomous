import type { ReactElement, SVGProps } from 'react';

/**
 * One icon set, 1.5px stroke, currentColor. Add a name here and a path below.
 */
export type IconName =
  | 'contract'
  | 'shield'
  | 'browser'
  | 'image'
  | 'oracle'
  | 'copy'
  | 'check'
  | 'arrow'
  | 'external'
  | 'moon';

const paths: Record<IconName, ReactElement> = {
  contract: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13l-2 2 2 2M14 13l2 2-2 2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  browser: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
      <path d="M8 15l2-2-2-2M12 16h4" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 16l-5-5-8 9" />
    </>
  ),
  oracle: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v16M4 12h16" />
      <path d="M6.5 6.5a8 8 0 0 0 11 11M17.5 6.5a8 8 0 0 1-11 11" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h8" />
    </>
  ),
  check: <path d="M5 12l5 5 9-10" />,
  arrow: <path d="M12 5v14M6 13l6 6 6-6" />,
  external: <path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5" />,
  moon: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 0 0 16 6 6 0 0 1 0-16z" />
    </>
  ),
};

interface Props extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  /** Supply a title for informative icons; decorative icons are hidden by default. */
  title?: string;
}

export function Icon({ name, size = 20, title, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
