import { strings } from './content/site';
import { SwarmContext, useSwarmPolling } from './data/useSwarm';
import { sections } from './sections';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';

export function App() {
  const swarm = useSwarmPolling();
  return (
    <SwarmContext.Provider value={swarm}>
      <a className="skip-link" href="#main">
        {strings.skipToContent}
      </a>
      <Nav />
      <main id="main">
        {sections.map(({ id, Component }) => (
          <Component key={id} />
        ))}
      </main>
      <Footer />
      {/* One stable polite region for signal changes. */}
      <span className="visually-hidden" role="status" aria-live="polite">
        {swarm.loading ? '' : swarm.lost ? strings.signal.lostDetail : ''}
      </span>
    </SwarmContext.Provider>
  );
}
