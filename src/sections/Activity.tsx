import { useEffect, useMemo, useRef, useState } from 'react';
import { agent, strings } from '../content/site';
import { links } from '../content/links';
import { MY_SEAT, eventKey, pinSeatEvents, type SwarmEvent } from '../data/swarm';
import { useSwarm } from '../data/useSwarm';
import { formatIsoClock, oneLine } from '../lib/format';
import { Icon } from '../components/Icon';
import './Activity.css';

const MAX_ROWS = 40;

function stateTone(state: string | null | undefined): 'live' | 'alert' | 'plain' {
  if (!state) return 'plain';
  if (state === 'working' || state === 'accepted' || state === 'completed' || state === 'joined') return 'live';
  if (state === 'failed' || state === 'rejected' || state === 'blocked') return 'alert';
  return 'plain';
}

function stepOf(e: SwarmEvent): string {
  if (e.step) return e.step;
  return e.kind;
}

export function Activity() {
  const { data, loading, lost } = useSwarm();
  const rows = useMemo(() => pinSeatEvents(data?.events ?? [], MY_SEAT).slice(0, MAX_ROWS), [data]);

  // Track keys seen so only rows that arrive after the first paint animate in.
  const seen = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    if (!rows.length) return;
    const keys = rows.map(eventKey);
    if (seen.current === null) {
      seen.current = new Set(keys);
      return;
    }
    const next = new Set<string>();
    for (const k of keys) if (!seen.current.has(k)) next.add(k);
    seen.current = new Set(keys);
    setFresh(next);
  }, [rows]);

  const mineCount = rows.filter((e) => e.tokenId === agent.seat).length;

  return (
    <section id="activity" className="section" aria-labelledby="activity-title">
      <div className="container">
        <div className="section-head">
          <h2 id="activity-title" className="t-h2">
            {strings.activity.heading}
          </h2>
          <span className="coord">
            {strings.activity.coord} · {rows.length}
            {mineCount ? ` · ${strings.activity.mine.toLowerCase()} ${mineCount}` : ''}
          </span>
        </div>
        <div className="feed panel" role="log" aria-label={strings.activity.heading} aria-live="off">
          <div className="feed__bar t-caption" aria-hidden="true">
            <span className="feed__dots" />
            <span>swarm://events · {strings.activity.pinnedNote.toLowerCase()}</span>
          </div>
          {loading && !rows.length ? (
            <ol className="feed__list">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="feed__row feed__row--skeleton" aria-hidden="true">
                  <span className="skeleton" style={{ width: '8ch' }} />
                  <span className="skeleton" style={{ width: '14ch' }} />
                  <span className="skeleton" style={{ width: '60%' }} />
                </li>
              ))}
            </ol>
          ) : rows.length === 0 ? (
            <p className="feed__empty t-label">
              {/* A failed first poll means the page does not know the events yet; say only that. */}
              {lost && !data ? strings.signal.lostDetail : strings.activity.empty}
            </p>
          ) : (
            <ol className="feed__list">
              {rows.map((e) => {
                const key = eventKey(e);
                const mine = e.tokenId === agent.seat;
                const tone = stateTone(e.state);
                return (
                  <li
                    key={key}
                    className={`feed__row${mine ? ' feed__row--mine' : ''}${fresh.has(key) ? ' feed__row--new' : ''}`}
                  >
                    <time className="feed__time" dateTime={e.at}>
                      {formatIsoClock(e.at)}
                    </time>
                    <span className="feed__who">
                      {mine ? agent.name : e.tokenId !== null && e.tokenId !== undefined ? `#${e.tokenId}` : e.kind}
                    </span>
                    <span className="feed__step">{stepOf(e)}</span>
                    <span className={`feed__state feed__state--${tone}`}>{e.state ?? e.kind}</span>
                    <span className="feed__objective" title={e.objective ?? undefined}>
                      {oneLine(e.objective, 110) || oneLine(e.reason ?? e.failure ?? e.ensName ?? '', 110)}
                    </span>
                    {e.jobId ? (
                      <a
                        className="feed__link"
                        href={links.explorerJob(e.jobId)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${strings.activity.jobLink} ${e.jobId.slice(0, 8)} on the explorer`}
                      >
                        <span aria-hidden="true">{e.jobId.slice(0, 8)}</span>
                        <Icon name="external" size={14} />
                      </a>
                    ) : (
                      <span className="feed__link feed__link--none" aria-hidden="true">
                        —
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
