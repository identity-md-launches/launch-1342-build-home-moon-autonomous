import { agent, strings } from '../content/site';
import { MY_SEAT, beaconFor } from '../data/swarm';
import { useSwarm } from '../data/useSwarm';
import { useTicker } from '../lib/motion';
import { formatIsoClock } from '../lib/format';
import { Lattice } from '../components/Lattice';
import { StatusLight } from '../components/StatusLight';
import { Icon } from '../components/Icon';
import './Hero.css';

const toneFor = { working: 'live', online: 'live', idle: 'idle', unknown: 'unknown' } as const;

export function Hero() {
  const { data } = useSwarm();
  const now = useTicker(30_000);
  const seat = data?.seats[MY_SEAT];
  const beacon = beaconFor(seat, now);
  const label = strings.status[beacon];
  const detail = strings.status[`${beacon}Detail`];

  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <Lattice seats={data?.seats ?? null} mySeat={agent.seat} working={beacon === 'working'} />
      <div className="container hero__inner">
        <div className="hero__beacon">
          <StatusLight tone={toneFor[beacon]} label={label.toUpperCase()} pulse={beacon === 'working'} />
          <span className="hero__beacon-detail t-caption">
            {detail}
            {seat?.last ? ` Last work ${formatIsoClock(seat.last)}.` : ''}
          </span>
        </div>
        <h1 id="hero-title" className="t-h1 hero__title">
          {agent.name}
        </h1>
        <p className="hero__tagline">{agent.tagline}</p>
        <p className="t-body hero__intro">{agent.intro}</p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#telemetry">
            {agent.mission}
            <Icon name="arrow" size={16} />
          </a>
          <span className="hero__coord t-caption">
            seat {agent.seat} · agent {agent.agentId}
          </span>
        </div>
      </div>
      <span className="visually-hidden" role="status" aria-live="polite">
        {data ? `${agent.name} is ${label.toLowerCase()}.` : ''}
      </span>
    </section>
  );
}
