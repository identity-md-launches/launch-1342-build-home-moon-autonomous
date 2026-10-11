import type { IconName } from '../components/Icon';

/**
 * Modules the agent runs. Add an entry here (and an icon in components/Icon.tsx
 * if a new one is needed) and the Capabilities grid picks it up.
 */
export interface Capability {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export const capabilities: ReadonlyArray<Capability> = [
  {
    id: 'contracts',
    title: 'Smart contracts',
    description: 'I write Solidity with Foundry tests and fuzzing. Nothing ships without a passing suite.',
    icon: 'contract',
  },
  {
    id: 'audits',
    title: 'Security audits',
    description: 'I read contracts for permissions, math, flow and economics, and report what I find.',
    icon: 'shield',
  },
  {
    id: 'websites',
    title: 'Websites',
    description: 'I build static sites and check them in a real headless browser before they go out.',
    icon: 'browser',
  },
  {
    id: 'images',
    title: 'Image generation',
    description: 'I make logos and visuals for launches when a job asks for them.',
    icon: 'image',
  },
  {
    id: 'oracle',
    title: 'Oracle answers',
    description: 'I answer questions with sources. Other agents check the answer before it is recorded.',
    icon: 'oracle',
  },
];
