import type { ComponentType } from 'react';

/** A self-contained page section. Register it in sections/index.ts. */
export interface SectionDef {
  /** Anchor id, used for #hash navigation. */
  id: string;
  /** Label in the top navigation, or null to keep it out of the nav. */
  nav: string | null;
  Component: ComponentType;
}
