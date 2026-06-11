import { nav } from '../lib/router'
import { Icon } from '../components/Icon'
import { getState } from '../lib/store'

export function Landing() {
  const entra = () => nav(getState().onboardingCompletato ? '/app' : '/onboarding')
  return (
    <div className="landing">
      <header className="landing-nav">
        <span className="logo">
          <span className="logo-icona">⌄</span> Ribasso
        </span>
        <nav className="landing-links">
          <a href="#come-funziona">Come funziona</a>
          <a href="#pagamenti">Pagamenti protetti</a>
          <a href="#premium">Premium</a>
        </nav>
        <button className="btn small" onClick={entra}>
          Apri l'app
        </button>
      </header>

      <section className="hero">
        <h1>
          Il lavoro giusto,
          <br />
          <span className="hero-grad">al prezzo giusto.</span>
        </h1>
        <p className="hero-sub">
          Pubblica qualsiasi lavoro — imbiancare casa, un trasloco, un logo — e lascia che i professionisti vicino a te si
          sfidino <strong>all'asta al ribasso</strong>. Paghi solo a lavoro finito, con fondi protetti in custodia.
        </p>
        <div className="hero-cta">
          <button className="btn grande" onClick={entra}>
            Inizia ora — è gratis
          </button>
          <button className="btn grande secondary" onClick={() => nav('/onboarding')}>
            Sono un professionista
          </button>
        </div>
        <p className="muted small">Disponibile come app (installala dal browser) e sito web · Demo interattiva</p>

        <div className="phone-mock">
          <div className="phone-notch" />
          <div className="phone-screen">
            <div className="mock-card">
              <div className="mock-hero">🎨</div>
              <strong>Imbiancare trilocale 90 m²</strong>
              <span className="muted small">📍 2,1 km · si chiude tra 7h 30m</span>
              <div className="mock-prezzi">
                <span>
                  Budget <strong>950 €</strong>
                </span>
                <span className="mock-best">
                  Migliore <strong>720 €</strong>
                </span>
              </div>
              <div className="mock-btn">⚡️ Prendi subito a 520 €</div>
            </div>
            <div className="mock-swipe">← passa · salva →</div>
          </div>
        </div>
      </section>

      <section className="landing-sec" id="come-funziona">
        <h2>Come funziona</h2>
        <div className="step-grid">
          <div className="step">
            <span className="step-n">1</span>
            <span className="step-emoji">📣</span>
            <h3>Pubblica l'annuncio</h3>
            <p>Descrivi il lavoro e fissa il tuo budget massimo. Scegli quanto dura l'asta: 4, 8, 24 o 48 ore.</p>
          </div>
          <div className="step">
            <span className="step-n">2</span>
            <span className="step-emoji">🔨</span>
            <h3>Parte l'asta al ribasso</h3>
            <p>
              I professionisti in zona, selezionati in base al profilo, rilanciano al ribasso. Vince il prezzo più basso — o chi
              usa <strong>«Prendi subito»</strong> al prezzo fuori mercato.
            </p>
          </div>
          <div className="step">
            <span className="step-n">3</span>
            <span className="step-emoji">🔒</span>
            <h3>Fondi in custodia</h3>
            <p>
              Depositi l'importo sull'app, come su PayPal. Il professionista lo riceve solo quando confermi con il tuo codice di
              sblocco. Possibile acconto 30% e saldo 70%.
            </p>
          </div>
          <div className="step">
            <span className="step-n">4</span>
            <span className="step-emoji">⭐️</span>
            <h3>Feedback reciproco</h3>
            <p>Stelline e recensioni verificate per entrambi, con link ai profili social: la fiducia si costruisce a ogni lavoro.</p>
          </div>
        </div>
      </section>

      <section className="landing-sec alterna" id="pagamenti">
        <div className="due-col">
          <div>
            <h2>Pagamenti protetti, sempre.</h2>
            <ul className="lista-check">
              <li>
                <Icon nome="lock" size={18} /> Il denaro resta in custodia finché il lavoro non ti soddisfa
              </li>
              <li>
                <Icon nome="check" size={18} /> Rilascio con codice di conferma, come Deliveroo o PayPal
              </li>
              <li>
                <Icon nome="scale" size={18} /> Non sei soddisfatto? Ribasso fa da <strong>mediatore</strong>: proposta, accordo
                documentato con foto, rimborso parziale
              </li>
              <li>
                <Icon nome="euro" size={18} /> Commissione trasparente solo a transazione completata
              </li>
            </ul>
          </div>
          <div className="escrow-demo card-pad">
            <div className="tl-item fatto">
              <span className="tl-dot" />
              <div>
                <strong>950 € depositati in custodia</strong>
                <span className="muted small">Il professionista può iniziare</span>
              </div>
            </div>
            <div className="tl-item fatto">
              <span className="tl-dot" />
              <div>
                <strong>Acconto 30% rilasciato — 285 €</strong>
                <span className="muted small">Codice confermato dal cliente</span>
              </div>
            </div>
            <div className="tl-item attivo">
              <span className="tl-dot" />
              <div>
                <strong>Saldo 70% al termine — 665 €</strong>
                <span className="muted small">In attesa della tua conferma</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-sec" id="premium">
        <div className="premium-banner">
          <span className="badge gold grande">
            <Icon nome="sparkles" size={14} /> Ribasso Premium
          </span>
          <h2>L'AI che lavora per chi lavora.</h2>
          <p>
            Per 14,99 €/mese i professionisti ricevono annunci più in linea con il proprio profilo, meglio pagati e{' '}
            <strong>ricorsivi</strong> in anteprima esclusiva, con commissioni ridotte dal 12% all'8%.
          </p>
          <button className="btn gold grande" onClick={entra}>
            Scopri Premium
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <span className="logo">
          <span className="logo-icona">⌄</span> Ribasso
        </span>
        <p className="muted small">
          Demo dimostrativa — i pagamenti, gli utenti e le aste sono simulati in locale. Nessun dato lascia il tuo dispositivo.
        </p>
        <div className="muted small">Privacy · Termini · Contatti</div>
      </footer>
    </div>
  )
}
