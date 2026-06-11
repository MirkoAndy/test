import type { Lavoro, Utente } from '../lib/types'
import { feedPerUtente, ricorsiviNascosti, suggerimentiAI, swipePreferisci, swipeScarta, resetScartati } from '../lib/store'
import { SwipeDeck } from '../components/SwipeDeck'
import { JobDeckCard } from '../components/JobCards'
import { Icon } from '../components/Icon'
import { nav } from '../lib/router'
import { fmtEur } from '../lib/format'
import { categoria } from '../lib/categories'

export function Discover({ utente }: { utente: Utente }) {
  const feed = feedPerUtente(utente)
  const nascosti = ricorsiviNascosti(utente)
  const ai = utente.premium ? suggerimentiAI(utente) : []

  return (
    <div className="screen">
      <header className="screen-head">
        <div>
          <h1>Scopri</h1>
          <span className="muted small">
            <Icon nome="pin" size={13} /> {utente.citta} · raggio {utente.raggioKm} km
          </span>
        </div>
        <button className="btn ghost small" onClick={() => nav('/app/premium')} aria-label="Premium">
          <Icon nome="sparkles" size={20} className={utente.premium ? 'oro' : ''} />
        </button>
      </header>

      {utente.premium && ai.length > 0 && (
        <div className="ai-row">
          <span className="ai-row-titolo">
            <Icon nome="sparkles" size={14} /> Scelti per te dall'AI
          </span>
          <div className="ai-scroll">
            {ai.map(({ lavoro, score, motivi }) => (
              <button key={lavoro.id} className="ai-card" onClick={() => nav(`/app/annuncio/${lavoro.id}`)}>
                <span className="ai-score">{score}%</span>
                <strong className="ai-titolo">{lavoro.titolo}</strong>
                <span className="small muted">{motivi[motivi.length - 1]}</span>
                <span className="ai-prezzo">{fmtEur(lavoro.budgetMax)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!utente.premium && (
        <button className="premium-teaser" onClick={() => nav('/app/premium')}>
          <Icon nome="sparkles" size={18} />
          <span>
            <strong>Ribasso Premium</strong>
            <span className="small">
              {nascosti > 0
                ? `${nascosti} ${nascosti === 1 ? 'annuncio ricorsivo nascosto' : 'annunci ricorsivi nascosti'} · AI dedicata · commissioni 8%`
                : 'Annunci migliori scelti dall\'AI · ricorsivi in anteprima · commissioni 8%'}
            </span>
          </span>
          <Icon nome="chevron-right" size={16} />
        </button>
      )}

      {feed.length > 0 ? (
        <SwipeDeck<Lavoro>
          items={feed}
          getKey={(l) => l.id}
          render={(l) => <JobDeckCard lavoro={l} utente={utente} />}
          onScarta={(l) => swipeScarta(l.id)}
          onSalva={(l) => swipePreferisci(l.id)}
          onApri={(l) => nav(`/app/annuncio/${l.id}`)}
        />
      ) : (
        <div className="vuoto card-pad">
          <span className="vuoto-emoji">🔭</span>
          <h3>Nessun annuncio nel deck</h3>
          <p className="muted">
            Hai visto tutto per ora. I nuovi annunci di {utente.categorie.map((c) => categoria(c).nome).join(', ') || 'zona'}{' '}
            appariranno qui automaticamente.
          </p>
          <button className="btn secondary" onClick={resetScartati}>
            <Icon nome="refresh" size={16} /> Rivedi gli annunci scartati
          </button>
        </div>
      )}
    </div>
  )
}
