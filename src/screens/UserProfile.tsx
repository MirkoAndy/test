import { categoria } from '../lib/categories'
import { ratingDi, recensioniDi, utenteById } from '../lib/store'
import { Avatar } from '../components/Avatar'
import { Stars } from '../components/Stars'
import { Icon } from '../components/Icon'
import { fmtDataBreve } from '../lib/format'

const SOCIAL_META = {
  linkedin: { label: 'LinkedIn', emoji: 'in', url: (v: string) => `https://www.linkedin.com/in/${v.replace(/^@/, '')}` },
  instagram: { label: 'Instagram', emoji: '📷', url: (v: string) => `https://instagram.com/${v.replace(/^@/, '')}` },
  tiktok: { label: 'TikTok', emoji: '🎵', url: (v: string) => `https://tiktok.com/@${v.replace(/^@/, '')}` },
  sito: { label: 'Sito', emoji: '🌐', url: (v: string) => (v.startsWith('http') ? v : `https://${v}`) },
} as const

export function UserProfile({ id }: { id: string }) {
  const u = utenteById(id)
  if (!u) {
    return (
      <div className="screen">
        <BarraIndietro />
        <div className="vuoto card-pad">
          <span className="vuoto-emoji">🤷</span>
          <p className="muted">Profilo non trovato.</p>
        </div>
      </div>
    )
  }
  const rating = ratingDi(u.id)
  const recensioni = recensioniDi(u.id)
  const socials = (Object.keys(SOCIAL_META) as (keyof typeof SOCIAL_META)[]).filter((k) => u.social[k])

  return (
    <div className="screen">
      <BarraIndietro />
      <section className="card card-pad profilo-pubblico">
        <Avatar emoji={u.emoji} id={u.id} size={72} />
        <h1>{u.nome}</h1>
        <span className="muted small">
          <Icon nome="pin" size={12} /> {u.citta} · su Ribasso dal {fmtDataBreve(u.iscrittoIl)}
        </span>
        {rating.totale > 0 ? (
          <div className="rating-grande">
            <Stars valore={rating.media} size={20} />
            <strong>{rating.media.toFixed(1).replace('.', ',')}</strong>
            <span className="muted small">({rating.totale} recensioni)</span>
          </div>
        ) : (
          <span className="muted small">Ancora nessuna recensione</span>
        )}
        <div className="kpi-mini">
          <span>
            <strong>{u.lavoriCompletati}</strong> lavori completati
          </span>
          {u.premium && (
            <span className="badge gold">
              <Icon nome="sparkles" size={12} /> Premium
            </span>
          )}
        </div>
        {u.bio && <p className="bio">{u.bio}</p>}
        {u.categorie.length > 0 && (
          <div className="chips centro">
            {u.categorie.map((c) => {
              const cat = categoria(c)
              return (
                <span key={c} className="chip statica">
                  {cat.emoji} {cat.nome}
                </span>
              )
            })}
          </div>
        )}
        {u.competenze.length > 0 && (
          <div className="chips centro">
            {u.competenze.map((c) => (
              <span key={c} className="chip statica piccola">
                {c}
              </span>
            ))}
          </div>
        )}
        {socials.length > 0 && (
          <div className="social-row">
            {socials.map((k) => {
              const meta = SOCIAL_META[k]
              const v = u.social[k]!
              return (
                <a key={k} className="social-btn" href={meta.url(v)} target="_blank" rel="noreferrer">
                  <span className="social-emoji">{meta.emoji}</span> {meta.label}
                </a>
              )
            })}
          </div>
        )}
      </section>

      <section className="card card-pad">
        <h3>
          <Icon nome="star" size={16} /> Recensioni ({recensioni.length})
        </h3>
        {recensioni.length === 0 && <p className="muted small">Nessuna recensione ancora.</p>}
        {recensioni.slice(0, 12).map((r) => {
          const autore = utenteById(r.autoreId)
          return (
            <div key={r.id} className="recensione">
              <div className="riga-spazio">
                <strong className="small">
                  {autore?.nome ?? 'Utente'}{' '}
                  <span className="muted">({r.ruoloAutore === 'richiedente' ? 'cliente' : 'professionista'})</span>
                </strong>
                <Stars valore={r.stelle} size={12} />
              </div>
              {r.commento && <p className="small">{r.commento}</p>}
              <span className="muted small">{fmtDataBreve(r.data)}</span>
            </div>
          )
        })}
      </section>
    </div>
  )
}

function BarraIndietro() {
  return (
    <header className="barra-indietro">
      <button className="btn ghost small" onClick={() => history.back()}>
        <Icon nome="chevron-left" size={18} /> Indietro
      </button>
      <span className="barra-titolo">Profilo pubblico</span>
      <span style={{ width: 86 }} />
    </header>
  )
}
