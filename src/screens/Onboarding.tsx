import { useMemo, useState } from 'react'
import type { CategoriaId, Ruolo } from '../lib/types'
import { CATEGORIE, categoria } from '../lib/categories'
import { CITTA, rilevaPosizione } from '../lib/geo'
import { completaOnboarding } from '../lib/store'
import { nav } from '../lib/router'
import { Icon } from '../components/Icon'
import { toast } from '../lib/toast'

const EMOJI = ['🙂', '😎', '🧑‍🔧', '👩‍🎨', '🧔', '👱‍♀️', '👨‍💼', '👩‍💼', '🧑‍💻', '👷', '🦸‍♀️', '🐝']

export function Onboarding() {
  const [passo, setPasso] = useState(0)
  const [nome, setNome] = useState('')
  const [emoji, setEmoji] = useState('🙂')
  const [ruolo, setRuolo] = useState<Ruolo>('entrambi')
  const [cittaIdx, setCittaIdx] = useState(0)
  const [posizione, setPosizione] = useState<{ lat: number; lng: number } | null>(null)
  const [geoStato, setGeoStato] = useState<'idle' | 'caricamento' | 'ok' | 'negato'>('idle')
  const [categorie, setCategorie] = useState<CategoriaId[]>([])
  const [competenze, setCompetenze] = useState<string[]>([])
  const [raggioKm, setRaggioKm] = useState(15)
  const [tariffa, setTariffa] = useState('')
  const [bio, setBio] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [sito, setSito] = useState('')

  const ePro = ruolo !== 'richiedente'
  const passi = ePro ? 4 : 3

  const competenzeDisponibili = useMemo(
    () => categorie.flatMap((id) => categoria(id).competenze),
    [categorie]
  )

  async function geolocalizza() {
    setGeoStato('caricamento')
    const ris = await rilevaPosizione()
    if (ris) {
      setPosizione({ lat: ris.lat, lng: ris.lng })
      const idx = CITTA.findIndex((c) => c.nome === ris.citta.nome)
      if (idx >= 0) setCittaIdx(idx)
      setGeoStato('ok')
      toast(`Posizione rilevata: zona ${ris.citta.nome} 📍`, 'successo')
    } else {
      setGeoStato('negato')
      toast('Geolocalizzazione non disponibile: scegli la città manualmente')
    }
  }

  function toggleCategoria(id: CategoriaId) {
    setCategorie((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev))
  }

  function toggleCompetenza(c: string) {
    setCompetenze((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  function avanti() {
    if (passo === 0 && nome.trim().length < 2) {
      toast('Inserisci il tuo nome per continuare', 'errore')
      return
    }
    if (passo === 2 && ePro && categorie.length === 0) {
      toast('Scegli almeno una categoria: ti proporremo solo annunci in linea', 'errore')
      return
    }
    if (passo < passi - 1) {
      setPasso(passo + 1)
      return
    }
    const c = CITTA[cittaIdx]
    completaOnboarding({
      nome: nome.trim(),
      emoji,
      ruolo,
      citta: c.nome,
      lat: posizione?.lat ?? c.lat,
      lng: posizione?.lng ?? c.lng,
      categorie: ePro ? categorie : [],
      competenze: ePro ? competenze : [],
      raggioKm,
      tariffaMinima: ePro ? Number(tariffa) || 0 : 0,
      bio: bio.trim(),
      social: {
        linkedin: linkedin.trim() || undefined,
        instagram: instagram.trim() || undefined,
        tiktok: tiktok.trim() || undefined,
        sito: sito.trim() || undefined,
      },
    })
    nav(ePro ? '/app/scopri' : '/app/annunci')
    toast(`Benvenuto su Ribasso, ${nome.trim().split(' ')[0]} 👋`, 'successo')
  }

  return (
    <div className="onboarding">
      <header className="ob-top">
        <button className="btn ghost small" onClick={() => (passo === 0 ? nav('/') : setPasso(passo - 1))}>
          <Icon nome="chevron-left" size={18} /> Indietro
        </button>
        <div className="ob-progress">
          {Array.from({ length: passi }).map((_, i) => (
            <span key={i} className={`ob-dot ${i <= passo ? 'attivo' : ''}`} />
          ))}
        </div>
        <span style={{ width: 90 }} />
      </header>

      {passo === 0 && (
        <section className="ob-step">
          <h1>Ciao! 👋</h1>
          <p className="muted">Come ti chiami? Crea il tuo profilo Ribasso in meno di un minuto.</p>
          <div className="field">
            <label>Nome e cognome</label>
            <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Es. Mario Rossi" autoFocus />
          </div>
          <div className="field">
            <label>Il tuo avatar</label>
            <div className="chips">
              {EMOJI.map((e) => (
                <button key={e} className={`chip emoji ${emoji === e ? 'active' : ''}`} onClick={() => setEmoji(e)}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {passo === 1 && (
        <section className="ob-step">
          <h1>Cosa vuoi fare su Ribasso?</h1>
          <p className="muted">Potrai cambiare in qualsiasi momento dal profilo.</p>
          <div className="ruolo-grid">
            <button className={`ruolo-card ${ruolo === 'richiedente' ? 'active' : ''}`} onClick={() => setRuolo('richiedente')}>
              <span className="ruolo-emoji">📣</span>
              <strong>Cerco professionisti</strong>
              <span className="muted small">Pubblico lavori e ricevo offerte al ribasso</span>
            </button>
            <button className={`ruolo-card ${ruolo === 'professionista' ? 'active' : ''}`} onClick={() => setRuolo('professionista')}>
              <span className="ruolo-emoji">🛠️</span>
              <strong>Offro i miei servizi</strong>
              <span className="muted small">Trovo lavori in zona e faccio la mia offerta</span>
            </button>
            <button className={`ruolo-card ${ruolo === 'entrambi' ? 'active' : ''}`} onClick={() => setRuolo('entrambi')}>
              <span className="ruolo-emoji">🔁</span>
              <strong>Entrambi</strong>
              <span className="muted small">Il meglio dei due mondi</span>
            </button>
          </div>
        </section>
      )}

      {passo === 2 && ePro && (
        <section className="ob-step">
          <h1>Di cosa ti occupi?</h1>
          <p className="muted">
            Scegli fino a 4 categorie: vedrai <strong>solo</strong> annunci in linea con il tuo profilo. Un imbianchino non
            riceverà traslochi, e viceversa.
          </p>
          <div className="cat-grid">
            {CATEGORIE.map((c) => (
              <button key={c.id} className={`cat-card ${categorie.includes(c.id) ? 'active' : ''}`} onClick={() => toggleCategoria(c.id)}>
                <span className="cat-emoji" style={{ background: `linear-gradient(135deg, ${c.gradiente[0]}, ${c.gradiente[1]})` }}>
                  {c.emoji}
                </span>
                <span className="small">{c.nome}</span>
              </button>
            ))}
          </div>
          {competenzeDisponibili.length > 0 && (
            <div className="field">
              <label>Le tue competenze</label>
              <div className="chips">
                {competenzeDisponibili.map((c) => (
                  <button key={c} className={`chip ${competenze.includes(c) ? 'active' : ''}`} onClick={() => toggleCompetenza(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="field">
            <label>Compenso minimo per lavoro (facoltativo)</label>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              value={tariffa}
              onChange={(e) => setTariffa(e.target.value)}
              placeholder="Es. 100 €"
            />
          </div>
        </section>
      )}

      {passo === passi - 1 && (
        <section className="ob-step">
          <h1>Dove operi?</h1>
          <p className="muted">Usiamo la posizione per proporti {ePro ? 'lavori' : 'professionisti'} vicino a te.</p>
          <button className="btn block secondary" onClick={geolocalizza} disabled={geoStato === 'caricamento'}>
            <Icon nome="pin" size={18} />
            {geoStato === 'caricamento' ? 'Rilevamento…' : geoStato === 'ok' ? 'Posizione rilevata ✓' : 'Usa la mia posizione'}
          </button>
          <div className="field">
            <label>Oppure scegli la città</label>
            <select className="input" value={cittaIdx} onChange={(e) => { setCittaIdx(Number(e.target.value)); setPosizione(null); setGeoStato('idle') }}>
              {CITTA.map((c, i) => (
                <option key={c.nome} value={i}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          {ePro && (
            <div className="field">
              <label>
                Raggio di lavoro: <strong>{raggioKm} km</strong>
              </label>
              <input type="range" min={3} max={50} value={raggioKm} onChange={(e) => setRaggioKm(Number(e.target.value))} />
            </div>
          )}
          {ePro && (
            <>
              <div className="field">
                <label>Presentati in due righe (facoltativo)</label>
                <textarea
                  className="input"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Es. Imbianchino con 10 anni di esperienza, preventivi chiari e cantiere pulito."
                />
              </div>
              <div className="field">
                <label>
                  <Icon nome="link" size={14} /> I tuoi social (aumentano la fiducia dei clienti)
                </label>
                <input className="input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn (es. mario-rossi)" />
                <input className="input" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram (es. mario.lavori)" />
                <input className="input" value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="TikTok (facoltativo)" />
                <input className="input" value={sito} onChange={(e) => setSito(e.target.value)} placeholder="Sito web (facoltativo)" />
              </div>
            </>
          )}
        </section>
      )}

      <footer className="ob-footer">
        <button className="btn grande block" onClick={avanti}>
          {passo === passi - 1 ? 'Inizia su Ribasso 🚀' : 'Continua'}
        </button>
      </footer>
    </div>
  )
}
