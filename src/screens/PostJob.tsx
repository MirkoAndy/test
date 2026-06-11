import { useState } from 'react'
import type { CategoriaId } from '../lib/types'
import { CATEGORIE } from '../lib/categories'
import { pubblicaAnnuncio } from '../lib/store'
import { nav } from '../lib/router'
import { Icon } from '../components/Icon'
import { fmtEur } from '../lib/format'
import { toast } from '../lib/toast'

const DURATE = [
  { ore: 4, label: '4 ore', desc: 'lampo' },
  { ore: 8, label: '8 ore', desc: 'consigliata' },
  { ore: 24, label: '24 ore', desc: 'standard' },
  { ore: 48, label: '48 ore', desc: 'rilassata' },
]

export function PostJob() {
  const [titolo, setTitolo] = useState('')
  const [descrizione, setDescrizione] = useState('')
  const [cat, setCat] = useState<CategoriaId | null>(null)
  const [budget, setBudget] = useState('')
  const [prezzoSubito, setPrezzoSubito] = useState('')
  const [subitoToccato, setSubitoToccato] = useState(false)
  const [durata, setDurata] = useState(8)
  const [acconto30, setAcconto30] = useState(false)
  const [urgente, setUrgente] = useState(false)
  const [ricorsivo, setRicorsivo] = useState(false)

  const budgetN = Number(budget) || 0
  const suggeritoSubito = budgetN > 0 ? Math.max(5, Math.round((budgetN * 0.55) / 5) * 5) : 0
  const subitoN = subitoToccato ? Number(prezzoSubito) || 0 : suggeritoSubito

  function pubblica() {
    if (titolo.trim().length < 5) return toast('Scrivi un titolo chiaro (almeno 5 caratteri)', 'errore')
    if (!cat) return toast('Scegli la categoria del lavoro', 'errore')
    if (descrizione.trim().length < 20) return toast('Descrivi meglio il lavoro: aiuta a ricevere offerte serie', 'errore')
    if (budgetN < 10) return toast('Indica un budget massimo di almeno 10 €', 'errore')
    if (subitoN < 5 || subitoN >= budgetN)
      return toast('Il prezzo «Prendi subito» deve essere fuori mercato: ben sotto il budget massimo', 'errore')
    const id = pubblicaAnnuncio({
      titolo,
      descrizione,
      categoria: cat,
      budgetMax: Math.round(budgetN),
      prezzoSubito: Math.round(subitoN),
      durataOre: durata,
      acconto30,
      urgente,
      ricorsivo,
    })
    if (id) nav(`/app/annuncio/${id}`)
  }

  return (
    <div className="screen">
      <header className="screen-head">
        <div>
          <h1>Pubblica un lavoro</h1>
          <span className="muted small">L'asta al ribasso parte appena pubblichi</span>
        </div>
      </header>

      <section className="card card-pad">
        <div className="field">
          <label>Titolo dell'annuncio</label>
          <input
            className="input"
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
            placeholder="Es. Imbiancare trilocale 90 m²"
          />
        </div>
        <div className="field">
          <label>Categoria</label>
          <div className="cat-grid compatta">
            {CATEGORIE.map((c) => (
              <button key={c.id} className={`cat-card ${cat === c.id ? 'active' : ''}`} onClick={() => setCat(c.id)}>
                <span className="cat-emoji" style={{ background: `linear-gradient(135deg, ${c.gradiente[0]}, ${c.gradiente[1]})` }}>
                  {c.emoji}
                </span>
                <span className="small">{c.nome}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Descrizione</label>
          <textarea
            className="input"
            rows={4}
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            placeholder="Metri quadri, tempi, materiali, piano, accessi… più dettagli dai, più precise saranno le offerte."
          />
        </div>
      </section>

      <section className="card card-pad">
        <h3>
          <Icon nome="euro" size={18} /> Prezzi dell'asta
        </h3>
        <div className="field">
          <label>Budget massimo (forfait)</label>
          <input
            className="input grande-input"
            type="number"
            inputMode="numeric"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Es. 950"
          />
          <span className="muted small">Le offerte partiranno da qui e scenderanno.</span>
        </div>
        <div className="field">
          <label>
            <Icon nome="bolt" size={14} /> Prezzo «Prendi subito il lavoro»
          </label>
          <input
            className="input grande-input"
            type="number"
            inputMode="numeric"
            value={subitoToccato ? prezzoSubito : suggeritoSubito || ''}
            onChange={(e) => {
              setSubitoToccato(true)
              setPrezzoSubito(e.target.value)
            }}
            placeholder="Prezzo fuori mercato"
          />
          <span className="muted small">
            Un prezzo molto sotto mercato: chi lo accetta si aggiudica il lavoro all'istante, senza attendere l'asta.
            {budgetN > 0 && ` Suggerito: ${fmtEur(suggeritoSubito)} (55% del budget).`}
          </span>
        </div>
        <div className="field">
          <label>Durata dell'asta</label>
          <div className="seg">
            {DURATE.map((d) => (
              <button key={d.ore} className={`seg-opt ${durata === d.ore ? 'active' : ''}`} onClick={() => setDurata(d.ore)}>
                <strong>{d.label}</strong>
                <span className="small muted">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card card-pad">
        <h3>Opzioni</h3>
        <label className="switch-row">
          <span>
            <strong>Acconto 30% / saldo 70%</strong>
            <span className="muted small">Rilasci il 30% all'avvio dei lavori e il 70% alla fine</span>
          </span>
          <input type="checkbox" checked={acconto30} onChange={(e) => setAcconto30(e.target.checked)} />
        </label>
        <label className="switch-row">
          <span>
            <strong>Urgente ⚡️</strong>
            <span className="muted small">Più visibilità nel deck dei professionisti</span>
          </span>
          <input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} />
        </label>
        <label className="switch-row">
          <span>
            <strong>Lavoro ricorsivo 🔁</strong>
            <span className="muted small">Si ripete nel tempo (es. pulizie settimanali): in anteprima ai Premium</span>
          </span>
          <input type="checkbox" checked={ricorsivo} onChange={(e) => setRicorsivo(e.target.checked)} />
        </label>
      </section>

      <div className="riepilogo-pubblica card card-pad">
        <p className="small muted">
          Pagamento protetto: depositerai l'importo in custodia solo dopo l'aggiudicazione, e verrà rilasciato con il tuo codice
          di sblocco a lavoro finito.
        </p>
        <button className="btn grande block" onClick={pubblica}>
          <Icon nome="gavel" size={18} /> Pubblica e avvia l'asta
        </button>
      </div>
    </div>
  )
}
