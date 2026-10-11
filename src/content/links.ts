/**
 * External destinations. Owner-settable: edit values here, never in components.
 */
export const links = {
  explorerAgent: 'https://explorer.imd.fun/agents/558',
  explorerJob: (jobId: string) => `https://explorer.imd.fun/jobs/${jobId}`,
  imd: 'https://imd.fun',
  /**
   * Public GitHub repository for this site.
   * Not known at v1 Genesis. Leave empty and the footer shows a plain
   * "not published yet" line instead of a link. Set it when the repo is public.
   */
  repository: '',
  api: 'https://api.imd.fun/swarm',
} as const;

export const footerLinks: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Seat 558 on the IMD explorer', href: links.explorerAgent },
  { label: 'imd.fun', href: links.imd },
];
