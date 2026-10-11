import { strings } from '../content/site';
import { capabilities } from '../content/capabilities';
import { Icon } from '../components/Icon';
import './Capabilities.css';

export function Capabilities() {
  return (
    <section id="capabilities" className="section" aria-labelledby="capabilities-title">
      <div className="container">
        <div className="section-head">
          <h2 id="capabilities-title" className="t-h2">
            {strings.capabilities.heading}
          </h2>
          <span className="coord">
            {strings.capabilities.coord} · {capabilities.length}
          </span>
        </div>
        <ul className="modules">
          {capabilities.map((c, i) => (
            <li key={c.id} className="module">
              <div className="module__icon">
                <Icon name={c.icon} size={24} />
              </div>
              <div className="module__body">
                <h3 className="t-h3 module__title">{c.title}</h3>
                <p className="module__desc">{c.description}</p>
              </div>
              <span className="module__index t-caption" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
