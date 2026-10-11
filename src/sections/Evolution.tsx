import { strings } from '../content/site';
import { changelog } from '../content/changelog';
import { formatDate } from '../lib/format';
import './Evolution.css';

export function Evolution() {
  return (
    <section id="evolution" className="section" aria-labelledby="evolution-title">
      <div className="container">
        <div className="section-head">
          <h2 id="evolution-title" className="t-h2">
            {strings.evolution.heading}
          </h2>
          <span className="coord">
            {strings.evolution.coord} · {changelog[0]?.version ?? ''}
          </span>
        </div>
        <ol className="log">
          {changelog.map((entry) => (
            <li key={entry.version} className="log__entry">
              <div className="log__meta t-mono">
                <span className="log__version">{entry.version}</span>
                <time dateTime={entry.date}>{formatDate(entry.date)}</time>
              </div>
              <div className="log__body">
                <h3 className="t-h3">{entry.title}</h3>
                <ul className="log__notes">
                  {entry.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
