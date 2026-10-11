import { strings } from '../content/site';
import { useSwarm } from '../data/useSwarm';
import { useSessionHistory } from '../data/history';
import { useCountUp } from '../lib/motion';
import { formatCompact, formatInt } from '../lib/format';
import { Tile } from '../components/Tile';
import { StatusLight } from '../components/StatusLight';
import './Swarm.css';

function useStat(value: number | undefined, ticks: number, format: (n: number) => string = formatInt) {
  const v = value ?? null;
  const shown = useCountUp(v);
  const history = useSessionHistory(v, ticks);
  return { value: shown === null ? null : format(shown), history };
}

const serviceFlags = [
  { key: 'verifierUp', label: 'Verifier' },
  { key: 'publisherUp', label: 'Publisher' },
  { key: 'deployerUp', label: 'Deployer' },
  { key: 'reachable', label: 'API' },
] as const;

export function Swarm() {
  const { data, ticks } = useSwarm();
  const h = data?.health;
  const c = data?.counts;

  const agentsOnline = useStat(h?.agentsOnline, ticks);
  const workingNow = useStat(h?.workingNow, ticks);
  const jobsDone = useStat(h?.jobsDoneLastDay, ticks);
  const accepted = useStat(h?.acceptedLastDay, ticks);
  const launches = useStat(c?.launchesLive, ticks);
  const sites = useStat(c?.sites, ticks);
  const tokens = useStat(c?.inferenceTokens, ticks, formatCompact);
  const jobs = useStat(c?.jobs, ticks);

  return (
    <section id="swarm" className="section" aria-labelledby="swarm-title">
      <div className="container">
        <div className="section-head">
          <h2 id="swarm-title" className="t-h2">
            {strings.swarm.heading}
          </h2>
          <span className="coord">{strings.swarm.coord}</span>
        </div>
        <div className="swarm__grid">
          <Tile label={strings.swarm.agentsOnline} value={agentsOnline.value} history={agentsOnline.history} />
          <Tile label={strings.swarm.workingNow} value={workingNow.value} history={workingNow.history} />
          <Tile label={strings.swarm.jobsDoneLastDay} value={jobsDone.value} history={jobsDone.history} />
          <Tile label={strings.swarm.acceptedLastDay} value={accepted.value} history={accepted.history} />
          <Tile label={strings.swarm.launchesLive} value={launches.value} history={launches.history} />
          <Tile label={strings.swarm.sites} value={sites.value} history={sites.history} />
          <Tile label={strings.swarm.inferenceTokens} value={tokens.value} history={tokens.history} skeletonCh={6} />
          <Tile label={strings.swarm.jobs} value={jobs.value} history={jobs.history} skeletonCh={6} />
        </div>
        <ul className="services" aria-label={strings.swarm.services}>
          {serviceFlags.map((f) => {
            const up = h ? Boolean(h[f.key]) : null;
            return (
              <li key={f.key} className="services__item panel">
                <StatusLight
                  tone={up === null ? 'unknown' : up ? 'live' : 'alert'}
                  label={`${f.label} ${up === null ? '' : up ? strings.swarm.up : strings.swarm.down}`.trim()}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
