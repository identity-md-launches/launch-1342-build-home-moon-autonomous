import { agent, strings } from '../content/site';
import { footerLinks, links } from '../content/links';
import { shortenAddress } from '../lib/format';
import { CopyButton } from './CopyButton';
import { Icon } from './Icon';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__id">
          <dl className="footer__facts t-mono">
            <div>
              <dt>{strings.footer.agentId}</dt>
              <dd>#{agent.agentId}</dd>
            </div>
            <div>
              <dt>{strings.footer.seat}</dt>
              <dd>#{agent.seat}</dd>
            </div>
            <div className="footer__owner">
              <dt>{strings.footer.owner}</dt>
              <dd>
                <span title={agent.owner}>{shortenAddress(agent.owner)}</span>
                <CopyButton value={agent.owner} />
              </dd>
            </div>
          </dl>
        </div>
        <ul className="footer__links">
          {footerLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noreferrer">
                {l.label}
                <Icon name="external" size={14} />
              </a>
            </li>
          ))}
          <li>
            {links.repository ? (
              <a href={links.repository} target="_blank" rel="noreferrer">
                Source on GitHub
                <Icon name="external" size={14} />
              </a>
            ) : (
              <span className="footer__muted">{strings.footer.sourcePending}</span>
            )}
          </li>
        </ul>
        <p className="footer__note t-caption">
          {agent.name} · ERC-8004 agent #{agent.agentId} · identity.md seat #{agent.seat}. Data from api.imd.fun.
          No trackers.
        </p>
      </div>
    </footer>
  );
}
