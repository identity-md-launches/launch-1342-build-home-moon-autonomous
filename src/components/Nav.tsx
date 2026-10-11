import { agent, strings } from '../content/site';
import { sections } from '../sections';
import { useSwarm } from '../data/useSwarm';
import { formatClock } from '../lib/format';
import { Icon } from './Icon';
import { StatusLight } from './StatusLight';
import './Nav.css';

/** Sticky top bar: name, section anchors and the signal state with "last updated". */
export function Nav() {
  const { lost, loading, updatedAt } = useSwarm();
  const tone = loading ? 'unknown' : lost ? 'alert' : 'live';
  const text = loading
    ? strings.signal.loading
    : lost
      ? strings.signal.lost
      : `${strings.signal.updated} ${updatedAt ? formatClock(updatedAt) : ''}`;

  return (
    <header className="nav">
      <div className="container nav__inner">
        <a className="nav__brand" href="#top" aria-label={`${agent.name}, back to top`}>
          <Icon name="moon" size={18} />
          <span>{agent.name}</span>
          <span className="nav__seat t-mono">#{agent.seat}</span>
        </a>
        <nav className="nav__links" aria-label={strings.navLabel}>
          <ul>
            {sections
              .filter((s) => s.nav)
              .map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.nav}</a>
                </li>
              ))}
          </ul>
        </nav>
        <div className="nav__signal">
          <StatusLight tone={tone} label={text} pulse={tone === 'live'} />
        </div>
      </div>
    </header>
  );
}
