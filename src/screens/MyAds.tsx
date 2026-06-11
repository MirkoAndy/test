import type { Lavoro, Utente } from '../lib/types'
import { adesso, annunciDi } from '../lib/store'
import { JobRow } from '../components/JobCards'
import { nav } from '../lib/router'
import { fmtEur } from '../lib/format'
import { Icon } from '../components/Icon'

function destraPer(l: Lavoro): { testo: string; classe?: string } {
  switch (l.stato) {
    case 'in-asta':
      return l.offerte.length > 0
        ? { testo: `${l.offerte.length} offerte · min ${fmtEur(Math.min(...l.offerte.map((o) => o.importo)))}`, classe: 'blu' }
        : { testo: 'nessuna offerta' }
    case 'aggiudicato':
      return { testo: 'Deposita i fondi', classe: 'arancio' }
    case 'completato-da-confermare':
      return { testo: 'Da confermare', classe: 'arancio' }
    case 'in-disputa':
      return { testo: 'Disputa', classe: 'rosso' }
    case 'in-corso':
      return { testo: 'In corso' }
    case 'pagato':
      return { testo: fmtEur(l.prezzoFinale ?? 0) }
    case 'risolto':
      return { testo: `accordo ${fmtEur(l.disputa?.importoAccordo ?? 0)}` }
    default:
      return { testo: '' }
  }
}

export function MyAds({ utente }: { utente: Utente }) {
  const tutti = annunciDi(utente.id)
  const t = adesso()
  const daGestire = tutti.filter((l) => ['aggiudicato', 'completato-da-confermare', 'in-disputa'].includes(l.stato))
  const inAsta = tutti.filter((l) => l.stato === 'in-asta' && l.scadeIl > t)
  const inCorso = tutti.filter((l) => l.stato === 'in-corso')
  const chiusi = tutti.filter((l) => ['pagato', 'risolto', 'scaduto', 'annullato'].includes(l.stato))

  return (
    <div className="screen">
      <header className="screen-head">
        <div>
          <h1>I miei annunci</h1>
          <span className="muted small">Le tue aste al ribasso</span>
        </div>
        <button className="btn small" onClick={() => nav('/app/pubblica')}>
          <Icon nome="plus" size={16} /> Nuovo
        </button>
      </header>

      {tutti.length === 0 && (
        <div className="vuoto card-pad">
          <span className="vuoto-emoji">📣</span>
          <h3>Nessun annuncio ancora</h3>
          <p className="muted">Pubblica il tuo primo lavoro: i professionisti in zona faranno offerte al ribasso.</p>
          <button className="btn" onClick={() => nav('/app/pubblica')}>
            Pubblica un lavoro
          </button>
        </div>
      )}

      {daGestire.length > 0 && (
        <section className="gruppo">
          <h3 className="gruppo-titolo">⚡️ Da gestire</h3>
          {daGestire.map((l) => {
            const d = destraPer(l)
            return <JobRow key={l.id} lavoro={l} destra={<span className={`pill ${d.classe ?? ''}`}>{d.testo}</span>} />
          })}
        </section>
      )}

      {inAsta.length > 0 && (
        <section className="gruppo">
          <h3 className="gruppo-titolo">🔨 Aste in corso</h3>
          {inAsta.map((l) => {
            const d = destraPer(l)
            return <JobRow key={l.id} lavoro={l} destra={<span className={`pill ${d.classe ?? ''}`}>{d.testo}</span>} />
          })}
        </section>
      )}

      {inCorso.length > 0 && (
        <section className="gruppo">
          <h3 className="gruppo-titolo">🛠️ Lavori in corso</h3>
          {inCorso.map((l) => {
            const d = destraPer(l)
            return <JobRow key={l.id} lavoro={l} destra={<span className="pill">{d.testo}</span>} />
          })}
        </section>
      )}

      {chiusi.length > 0 && (
        <section className="gruppo">
          <h3 className="gruppo-titolo">📁 Archivio</h3>
          {chiusi.map((l) => {
            const d = destraPer(l)
            return <JobRow key={l.id} lavoro={l} destra={<span className="pill">{d.testo}</span>} />
          })}
        </section>
      )}
    </div>
  )
}
