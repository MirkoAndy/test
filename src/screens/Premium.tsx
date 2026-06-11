import type { Utente } from '../lib/types'
import { attivaPremium, disattivaPremium, COMMISSIONE_PREMIUM, COMMISSIONE_STANDARD, PREZZO_PREMIUM } from '../lib/store'
import { Icon } from '../components/Icon'
import { fmtEur } from '../lib/format'

export function Premium({ utente }: { utente: Utente }) {
  return (
    <div className="screen">
      <header className="barra-indietro">
        <button className="btn ghost small" onClick={() => history.back()}>
          <Icon nome="chevron-left" size={18} /> Indietro
        </button>
        <span className="barra-titolo">Ribasso Premium</span>
        <span style={{ width: 86 }} />
      </header>

      <section className="premium-hero">
        <span className="premium-glow">✨</span>
        <h1>
          Lavora meglio.
          <br />
          Guadagna di più.
        </h1>
        <p className="muted">
          L'intelligenza artificiale di Ribasso impara dal tuo profilo e ti porta gli annunci giusti, prima degli altri.
        </p>
      </section>

      <section className="card card-pad">
        <div className="vantaggio">
          <span className="vantaggio-emoji">🤖</span>
          <div>
            <strong>Suggerimenti AI personalizzati</strong>
            <p className="muted small">
              Una selezione quotidiana di annunci più in linea con le tue competenze, meglio pagati e più vicini, con il motivo
              di ogni proposta.
            </p>
          </div>
        </div>
        <div className="vantaggio">
          <span className="vantaggio-emoji">🔁</span>
          <div>
            <strong>Lavori ricorsivi in anteprima</strong>
            <p className="muted small">
              Pulizie settimanali, manutenzioni mensili, ripetizioni: i contratti che si ripetono sono visibili solo agli
              abbonati Premium.
            </p>
          </div>
        </div>
        <div className="vantaggio">
          <span className="vantaggio-emoji">💸</span>
          <div>
            <strong>Commissioni ridotte: {COMMISSIONE_PREMIUM}% invece di {COMMISSIONE_STANDARD}%</strong>
            <p className="muted small">Su un lavoro da 1.000 € sono 40 € in più in tasca tua. Premium si ripaga da solo.</p>
          </div>
        </div>
        <div className="vantaggio">
          <span className="vantaggio-emoji">🏅</span>
          <div>
            <strong>Badge Premium sul profilo</strong>
            <p className="muted small">Più fiducia dai clienti, più aggiudicazioni.</p>
          </div>
        </div>
      </section>

      <section className="card card-pad premium-prezzo">
        <strong className="prezzo-big">{fmtEur(PREZZO_PREMIUM)}</strong>
        <span className="muted small">al mese · disdici quando vuoi</span>
        {!utente.premium ? (
          <button className="btn gold grande block" onClick={attivaPremium}>
            <Icon nome="sparkles" size={18} /> Attiva Ribasso Premium
          </button>
        ) : (
          <>
            <span className="badge gold">
              <Icon nome="sparkles" size={12} /> Attivo
            </span>
            <button className="btn ghost small danger" onClick={disattivaPremium}>
              Disattiva l'abbonamento
            </button>
          </>
        )}
        <p className="muted small">(Demo: nessun addebito reale.)</p>
      </section>
    </div>
  )
}
