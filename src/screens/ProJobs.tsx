import type { Utente } from '../lib/types'
import { lavoriDelPro, migliorOfferta, offertaUtente } from '../lib/store'
import { JobRow } from '../components/JobCards'
import { fmtEur } from '../lib/format'
import { nav } from '../lib/router'

export function ProJobs({ utente }: { utente: Utente }) {
  const { attivi, vinti, chiusi, salvati } = lavoriDelPro(utente.id)
  const vuoto = attivi.length + vinti.length + chiusi.length + salvati.length === 0

  return (
    <div className="screen">
      <header className="screen-head">
        <div>
          <h1>I miei lavori</h1>
          <span className="muted small">Offerte, aggiudicazioni e preferiti</span>
        </div>
      </header>

      {vuoto && (
        <div className="vuoto card-pad">
          <span className="vuoto-emoji">🔨</span>
          <h3>Ancora niente qui</h3>
          <p className="muted">Vai su Scopri, trova un lavoro in linea con te e fai la tua offerta al ribasso.</p>
          <button className="btn" onClick={() => nav('/app/scopri')}>
            Scopri i lavori
          </button>
        </div>
      )}

      {vinti.length > 0 && (
        <section className="gruppo">
          <h3 className="gruppo-titolo">🏆 Aggiudicati a te</h3>
          {vinti.map((l) => (
            <JobRow
              key={l.id}
              lavoro={l}
              destra={
                <span className={`pill ${l.stato === 'in-disputa' ? 'rosso' : l.stato === 'aggiudicato' ? 'arancio' : 'verde'}`}>
                  {l.stato === 'aggiudicato' && 'attesa deposito'}
                  {l.stato === 'in-corso' && 'al lavoro!'}
                  {l.stato === 'completato-da-confermare' && 'attesa conferma'}
                  {l.stato === 'in-disputa' && 'disputa'}
                </span>
              }
            />
          ))}
        </section>
      )}

      {attivi.length > 0 && (
        <section className="gruppo">
          <h3 className="gruppo-titolo">🔨 In gara</h3>
          {attivi.map((l) => {
            const mia = offertaUtente(l, utente.id)
            const best = migliorOfferta(l)
            const inTesta = best && mia && best.proId === utente.id
            return (
              <JobRow
                key={l.id}
                lavoro={l}
                sottotitolo={`La tua offerta: ${fmtEur(mia?.importo ?? 0)}`}
                destra={<span className={`pill ${inTesta ? 'verde' : 'rosso'}`}>{inTesta ? 'in testa 🏁' : `superato (${fmtEur(best?.importo ?? 0)})`}</span>}
              />
            )
          })}
        </section>
      )}

      {salvati.length > 0 && (
        <section className="gruppo">
          <h3 className="gruppo-titolo">❤️ Salvati</h3>
          {salvati.map((l) => (
            <JobRow key={l.id} lavoro={l} destra={<span className="pill">{fmtEur(migliorOfferta(l)?.importo ?? l.budgetMax)}</span>} />
          ))}
        </section>
      )}

      {chiusi.length > 0 && (
        <section className="gruppo">
          <h3 className="gruppo-titolo">✅ Completati</h3>
          {chiusi.map((l) => (
            <JobRow
              key={l.id}
              lavoro={l}
              destra={<span className="pill verde">{fmtEur(l.disputa?.importoAccordo ?? l.prezzoFinale ?? 0)}</span>}
            />
          ))}
        </section>
      )}
    </div>
  )
}
