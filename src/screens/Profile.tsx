import { useState } from 'react'
import type { CategoriaId, Utente } from '../lib/types'
import { CATEGORIE } from '../lib/categories'
import { aggiornaProfilo, ratingDi, recensioniDi, resetDemo, saldoUtente, utenteById } from '../lib/store'
import { Avatar } from '../components/Avatar'
import { Stars } from '../components/Stars'
import { Icon } from '../components/Icon'
import { nav } from '../lib/router'
import { fmtDataBreve, fmtEur } from '../lib/format'

export function Profile({ utente }: { utente: Utente }) {
  const rating = ratingDi(utente.id)
  const recensioni = recensioniDi(utente.id)
  const saldo = saldoUtente()
  const [bio, setBio] = useState(utente.bio)
  const [social, setSocial] = useState({ ...utente.social })
  const ePro = utente.ruolo !== 'richiedente'

  function toggleCategoria(id: CategoriaId) {
    const nuove = utente.categorie.includes(id)
      ? utente.categorie.filter((x) => x !== id)
      : utente.categorie.length < 4
        ? [...utente.categorie, id]
        : utente.categorie
    aggiornaProfilo({ categorie: nuove })
  }

  return (
    <div className="screen">
      <header className="screen-head">
        <div>
          <h1>Profilo</h1>
          <span className="muted small">Il tuo biglietto da visita su Ribasso</span>
        </div>
        {utente.premium && (
          <span className="badge gold">
            <Icon nome="sparkles" size={12} /> Premium
          </span>
        )}
      </header>

      <section className="card card-pad profilo-testa">
        <Avatar emoji={utente.emoji} id={utente.id} size={64} />
        <div>
          <h2>{utente.nome}</h2>
          <span className="muted small">
            <Icon nome="pin" size={12} /> {utente.citta}
          </span>
          <span className="small">
            {rating.totale > 0 ? (
              <>
                <Stars valore={rating.media} size={13} /> {rating.media.toFixed(1).replace('.', ',')} · {rating.totale} recensioni
              </>
            ) : (
              <span className="muted">Ancora nessuna recensione</span>
            )}
          </span>
        </div>
      </section>

      <div className="kpi-grid">
        <div className="kpi card">
          <strong>{utente.lavoriCompletati}</strong>
          <span className="muted small">lavori completati</span>
        </div>
        <div className="kpi card">
          <strong>{rating.totale}</strong>
          <span className="muted small">recensioni</span>
        </div>
        <button className="kpi card cliccabile" onClick={() => nav('/app/portafoglio')}>
          <strong className={saldo >= 0 ? 'verde' : 'rosso'}>{fmtEur(Math.round(saldo * 100) / 100)}</strong>
          <span className="muted small">
            <Icon nome="wallet" size={12} /> portafoglio
          </span>
        </button>
      </div>

      <button className="card card-pad premium-box" onClick={() => nav('/app/premium')}>
        <Icon nome="sparkles" size={22} className="oro" />
        <span>
          <strong>{utente.premium ? 'Gestisci Ribasso Premium' : 'Passa a Ribasso Premium'}</strong>
          <span className="muted small">
            {utente.premium ? 'Attivo · commissioni 8% · AI dedicata' : 'AI dedicata, annunci ricorsivi, commissioni 8%'}
          </span>
        </span>
        <Icon nome="chevron-right" size={16} className="muted" />
      </button>

      <section className="card card-pad">
        <h3>Il tuo ruolo</h3>
        <div className="seg">
          {(
            [
              ['richiedente', '📣 Cerco', 'professionisti'],
              ['professionista', '🛠️ Offro', 'servizi'],
              ['entrambi', '🔁 Entrambi', ''],
            ] as const
          ).map(([r, label, sub]) => (
            <button key={r} className={`seg-opt ${utente.ruolo === r ? 'active' : ''}`} onClick={() => aggiornaProfilo({ ruolo: r })}>
              <strong>{label}</strong>
              {sub && <span className="small muted">{sub}</span>}
            </button>
          ))}
        </div>
      </section>

      {ePro && (
        <>
          <section className="card card-pad">
            <h3>Le tue categorie</h3>
            <p className="muted small">Determinano quali annunci vedi nel deck: solo lavori in linea con te.</p>
            <div className="chips">
              {CATEGORIE.map((c) => (
                <button
                  key={c.id}
                  className={`chip ${utente.categorie.includes(c.id) ? 'active' : ''}`}
                  onClick={() => toggleCategoria(c.id)}
                >
                  {c.emoji} {c.nome}
                </button>
              ))}
            </div>
            <div className="field">
              <label>
                Raggio di lavoro: <strong>{utente.raggioKm} km</strong>
              </label>
              <input
                type="range"
                min={3}
                max={50}
                value={utente.raggioKm}
                onChange={(e) => aggiornaProfilo({ raggioKm: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Compenso minimo per lavoro</label>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                value={utente.tariffaMinima || ''}
                onChange={(e) => aggiornaProfilo({ tariffaMinima: Number(e.target.value) || 0 })}
                placeholder="0 €"
              />
            </div>
          </section>

          <section className="card card-pad">
            <h3>Bio</h3>
            <textarea
              className="input"
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              onBlur={() => aggiornaProfilo({ bio })}
              placeholder="Racconta in due righe chi sei e come lavori"
            />
          </section>
        </>
      )}

      <section className="card card-pad">
        <h3>
          <Icon nome="link" size={16} /> I tuoi social
        </h3>
        <p className="muted small">Compaiono sul tuo profilo pubblico: aiutano gli altri a fidarsi di te.</p>
        {(
          [
            ['linkedin', 'LinkedIn'],
            ['instagram', 'Instagram'],
            ['tiktok', 'TikTok'],
            ['sito', 'Sito web'],
          ] as const
        ).map(([k, label]) => (
          <div className="field" key={k}>
            <label>{label}</label>
            <input
              className="input"
              value={social[k] ?? ''}
              onChange={(e) => setSocial({ ...social, [k]: e.target.value })}
              onBlur={() => aggiornaProfilo({ social: { ...social, [k]: social[k]?.trim() || undefined } })}
              placeholder={k === 'sito' ? 'www.iltuosito.it' : `Il tuo profilo ${label}`}
            />
          </div>
        ))}
      </section>

      {recensioni.length > 0 && (
        <section className="card card-pad">
          <h3>Recensioni ricevute</h3>
          {recensioni.slice(0, 5).map((r) => {
            const autore = utenteById(r.autoreId)
            return (
              <div key={r.id} className="recensione">
                <div className="riga-spazio">
                  <strong className="small">{autore?.nome ?? 'Utente'}</strong>
                  <Stars valore={r.stelle} size={12} />
                </div>
                <p className="small">{r.commento}</p>
                <span className="muted small">{fmtDataBreve(r.data)}</span>
              </div>
            )
          })}
        </section>
      )}

      <section className="card card-pad demo-zona">
        <h3>Demo</h3>
        <p className="muted small">
          Questa è una demo interattiva: utenti, aste e pagamenti sono simulati in locale sul tuo dispositivo.
        </p>
        <button
          className="btn ghost danger small"
          onClick={() => {
            if (confirm('Azzerare la demo? Perderai profilo, annunci e transazioni.')) {
              resetDemo()
              nav('/')
            }
          }}
        >
          Azzera la demo
        </button>
      </section>
    </div>
  )
}
