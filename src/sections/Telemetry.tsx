import { strings } from '../content/site';
import { MY_SEAT, acceptanceRate } from '../data/swarm';
import { useSwarm } from '../data/useSwarm';
import { useSessionHistory } from '../data/history';
import { useCountUp, useTicker } from '../lib/motion';
import { formatInt, formatPercent, formatSince } from '../lib/format';
import { Tile } from '../components/Tile';
import './Telemetry.css';

function useStat(value: number | null | undefined, ticks: number) {
  const v = value ?? null;
  const shown = useCountUp(v);
  const history = useSessionHistory(v, ticks);
  return { shown, history };
}

export function Telemetry() {
  const { data, ticks, lost } = useSwarm();
  const now = useTicker(1_000);
  const seat = data?.seats[MY_SEAT];

  const accepted = useStat(seat?.accepted, ticks);
  const attempts = useStat(seat?.attempts, ticks);
  const pending = useStat(seat?.pending, ticks);
  const rate = acceptanceRate(seat);
  const rateStat = useStat(rate, ticks);
  const last = seat?.last ? Date.parse(seat.last) : NaN;
  const sinceStat = useSessionHistory(Number.isFinite(last) ? Math.floor((now - last) / 1000) : null, ticks);

  const fmt = (n: number | null) => (n === null ? null : formatInt(n));

  return (
    <section id="telemetry" className="section" aria-labelledby="telemetry-title">
      <div className="container">
        <div className="section-head">
          <h2 id="telemetry-title" className="t-h2">
            {strings.telemetry.heading}
          </h2>
          <span className="coord">
            {strings.telemetry.coord}
            {lost ? ` · ${strings.signal.lost.toLowerCase()}` : ''}
          </span>
        </div>
        <div className="telemetry__grid">
          <Tile label={strings.telemetry.accepted} value={fmt(accepted.shown)} history={accepted.history} />
          <Tile label={strings.telemetry.attempts} value={fmt(attempts.shown)} history={attempts.history} />
          {seat === undefined || (seat.attempts > 0 && rate !== null) ? (
            <Tile
              label={strings.telemetry.rate}
              value={rateStat.shown === null ? null : formatPercent(rateStat.shown)}
              history={rateStat.history}
              skeletonCh={5}
            />
          ) : null}
          <Tile
            label={strings.telemetry.pending}
            value={fmt(pending.shown)}
            history={pending.history}
            tone={(seat?.pending ?? 0) > 0 ? 'alert' : 'default'}
            detail={seat ? `${strings.telemetry.queued}: ${formatInt(seat.queued)}` : null}
          />
          <Tile
            label={strings.telemetry.sinceLast}
            value={seat === undefined ? null : Number.isFinite(last) ? formatSince(last, now) : strings.signal.never}
            history={sinceStat}
            skeletonCh={6}
          />
        </div>
        <p className="t-caption telemetry__hint">{strings.telemetry.sparklineHint}</p>
      </div>
    </section>
  );
}
