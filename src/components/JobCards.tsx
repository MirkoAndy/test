import type { Lavoro, StatoLavoro, Utente } from '../lib/types'
import { categoria } from '../lib/categories'
import { distanzaKm, fmtDistanza } from '../lib/geo'
import { fmtEur } from '../lib/format'
import { adesso, matchScore, migliorOfferta, ratingDi, utenteById } from '../lib/store'
import { Icon } from './Icon'
import { Stars } from './Stars'
import { Avatar } from './Avatar'
import { Countdown } from './Countdown'
import { nav } from '../lib/router'

export const STATO_INFO: Record<StatoLavoro, { label: string; classe: string }> = {
  'in-asta': { label: 'Asta in corso', classe: 'blue' },
  scaduto: { label: 'Scaduta senza offerte', classe: 'gray' },
  aggiudicato: { label: 'Aggiudicato — attesa deposito', classe: 'orange' },
  'in-corso': { label: 'Lavori in corso', classe: 'purple' },
  'completato-da-confermare': { label: 'Da confermare', classe: 'orange' },
  pagato: { label: 'Completato e pagato', classe: 'green' },
  'in-disputa': { label: 'In disputa', classe: 'red' },
  risolto: { label: 'Risolto con accordo', classe: 'green' },
  annullato: { label: 'Annullato', classe: 'gray' },
}

export function StatoBadge({ stato }: { stato: StatoLavoro }) {
  const info = STATO_INFO[stato]
  return <span className={`badge ${info.classe}`}>{info.label}</span>
}

/** Card a tutto schermo per il deck di swipe. */
export function JobDeckCard({ lavoro, utente }: { lavoro: Lavoro; utente: Utente }) {
  const cat = categoria(lavoro.categoria)
  const cliente = utenteById(lavoro.richiedenteId)
  const rating = cliente ? ratingDi(cliente.id) : { media: 0, totale: 0 }
  const best = migliorOfferta(lavoro)
  const dist = distanzaKm(utente.lat, utente.lng, lavoro.lat, lavoro.lng)
  const score = matchScore(utente, lavoro)
  return (
    <div className="jdc">
      <div className="jdc-hero" style={{ background: `linear-gradient(135deg, ${cat.gradiente[0]}, ${cat.gradiente[1]})` }}>
        <span className="jdc-emoji">{cat.emoji}</span>
        <div className="jdc-hero-badges">
          <span className="badge bianco">{cat.nome}</span>
          {lavoro.urgente && (
            <span className="badge red">
              <Icon nome="bolt" size={12} /> Urgente
            </span>
          )}
          {lavoro.ricorsivo && (
            <span className="badge gold">
              <Icon nome="repeat" size={12} /> Ricorsivo
            </span>
          )}
        </div>
        <span className="jdc-match">{score}% match</span>
      </div>
      <div className="jdc-body">
        <h3 className="jdc-titolo">{lavoro.titolo}</h3>
        <div className="jdc-meta">
          <span>
            <Icon nome="pin" size={14} /> {fmtDistanza(dist)} · {lavoro.citta}
          </span>
          <Countdown scadeIl={lavoro.scadeIl} label={false} />
        </div>
        <p className="jdc-desc">{lavoro.descrizione}</p>
        <div className="jdc-prezzi">
          <div className="jdc-prezzo">
            <span className="muted small">Budget max</span>
            <strong>{fmtEur(lavoro.budgetMax)}</strong>
          </div>
          <div className="jdc-prezzo evidenza">
            <span className="muted small">{best ? `Migliore (${lavoro.offerte.length} offerte)` : 'Nessuna offerta'}</span>
            <strong>{best ? fmtEur(best.importo) : '—'}</strong>
          </div>
          <div className="jdc-prezzo subito">
            <span className="small">
              <Icon nome="bolt" size={12} /> Prendi subito
            </span>
            <strong>{fmtEur(lavoro.prezzoSubito)}</strong>
          </div>
        </div>
        {cliente && (
          <div className="jdc-cliente">
            <Avatar emoji={cliente.emoji} id={cliente.id} size={30} />
            <span className="small">{cliente.nome}</span>
            {rating.totale > 0 && (
              <span className="small muted">
                <Stars valore={rating.media} size={11} /> ({rating.totale})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** Riga compatta per le liste (annunci, lavori, preferiti…). */
export function JobRow({ lavoro, sottotitolo, destra }: { lavoro: Lavoro; sottotitolo?: string; destra?: React.ReactNode }) {
  const cat = categoria(lavoro.categoria)
  const aperta = lavoro.stato === 'in-asta' && lavoro.scadeIl > adesso()
  return (
    <button className="job-row" onClick={() => nav(`/app/annuncio/${lavoro.id}`)}>
      <span className="job-row-emoji" style={{ background: `linear-gradient(135deg, ${cat.gradiente[0]}, ${cat.gradiente[1]})` }}>
        {cat.emoji}
      </span>
      <span className="job-row-info">
        <span className="job-row-titolo">{lavoro.titolo}</span>
        <span className="job-row-sub muted small">
          {sottotitolo ?? cat.nome}
          {aperta && (
            <>
              {' · '}
              <Countdown scadeIl={lavoro.scadeIl} label={false} />
            </>
          )}
        </span>
      </span>
      <span className="job-row-destra">
        {destra}
        <Icon nome="chevron-right" size={16} className="muted" />
      </span>
    </button>
  )
}
