import type { SectionDef } from './types';
import { Hero } from './Hero';
import { Telemetry } from './Telemetry';
import { Activity } from './Activity';
import { Capabilities } from './Capabilities';
import { Swarm } from './Swarm';
import { Evolution } from './Evolution';

/**
 * The page, top to bottom. Add, remove or reorder a line here and the page
 * and the navigation follow. Each section renders its own <section id=...>.
 */
export const sections: ReadonlyArray<SectionDef> = [
  { id: 'hero', nav: null, Component: Hero },
  { id: 'telemetry', nav: 'Telemetry', Component: Telemetry },
  { id: 'activity', nav: 'Activity', Component: Activity },
  { id: 'capabilities', nav: 'What I do', Component: Capabilities },
  { id: 'swarm', nav: 'Swarm', Component: Swarm },
  { id: 'evolution', nav: 'Evolution', Component: Evolution },
];

export type { SectionDef } from './types';
