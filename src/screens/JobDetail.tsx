import { useState } from 'react'
import type { Lavoro, Utente } from '../lib/types'
import { categoria } from '../lib/categories'
import { distanzaKm, fmtDistanza } from '../lib/geo'
import { fmtData, fmtEur, fmtTempoFa } from '../lib/format'
import {
  accettaMediazione,
  accettaProposta,
  accontoRilasciato,
  adesso,
  aggiudicaOfferta,
  annullaAnnuncio,
  apriDisputa,
  commissionePercPer,
  confermaEPaga,
  controproposta,
  depositaEscrow,
  faiOfferta,
  lasciaFeedback,
  lavoroById,
  migliorOfferta,
  offerteOrdinate,
  prendiSubito,
  ratingDi,
  richiediMediazione,
  rilasciaAcconto,
  ripubblicaAnnuncio,
  segnaCompletato,
  utenteById,
} from '../lib/store'
import { nav } from '../lib/router'
import { Icon } from '../components/Icon'
import { Stars, StarPicker } from '../components/Stars'
import { Avatar } from '../components/Avatar'
import { Countdown } from '../components/Countdown'
import { Sheet } from '../components/Sheet'
import { FotoUploader } from '../components/FotoUploader'
import { StatoBadge } from '../components/JobCards'
import { toast } from '../lib/toast'

type SheetAttivo =
  | null
  | 'offerta'
  | 'prendi-subito'
  | 'deposita'
  | 'acconto'
  | 'salda'
  | 'completa'
  | 'disputa'
  | 'controproposta'
  | 'aggiudica'

export function JobDetail({ id, utente }: { id: string; utente: Utente }) {
  const lavoro = lavoroById(id)
  const [sheet, setSheet] = useState<SheetAttivo>(null)
  const [importoOfferta, setImportoOfferta] = useState('')
  const [messaggioOfferta, setMessaggioOfferta] = useState('')
  const [codice, setCodice] = useState('')
  const [fotoCompleta, setFotoCompleta] = useState<string[]>([])
  const [motivoDisputa, setMotivoDisputa] = useState('')
  const [fotoDisputa, setFotoDisputa] = useState<string[]>([])
  const [propostaDisputa, setPropostaDisputa] = useState('')
  const [notaContro, setNotaContro] = useState('')
  const [offertaDaAggiudicare, setOffertaDaAggiudicare] = useState<string | null>(null)
  const [stelle, setStelle] = useState(0)
  const [commentoFeedback, setCommentoFeedback] = useState('')

  if (!lavoro) {
    return (
      <div className="screen">
        <BarraIndietro titolo="Annuncio" />
        <div className="vuoto card-pad">
          <span className="vuoto-emoji">🤷</span>
          <p className="muted">Annuncio non trovato.</p>
        </div>
      </div>
    )
  }

  const cat = categoria(lavoro.categoria)
  const sonoOwner = lavoro.richiedenteId === utente.id
  const sonoAggiudicatario = lavoro.aggiudicatarioId === utente.id
  const cliente = utenteById(lavoro.richiedenteId)
  const vincitore = lavoro.aggiudicatarioId ? utenteById(lavoro.aggiudicatarioId) : undefined
  const best = migliorOfferta(lavoro)
  const miaOfferta = lavoro.offerte.find((o) => o.proId === utente.id)
  const astaAperta = lavoro.stato === 'in-asta' && lavoro.scadeIl > adesso()
  const dist = distanzaKm(utente.lat, utente.lng, lavoro.lat, lavoro.lng)
  const offerte = offerteOrdinate(lavoro)
  const acconto = accontoRilasciato(lavoro)
  const percCommissione = lavoro.escrow?.commissionePerc ?? commissionePercPer(utente)

  function chiudiSheet() {
    setSheet(null)
    setCodice('')
  }

  function inviaOfferta() {
    if (!lavoro) return
    const ris = faiOfferta(lavoro.id, Number(importoOfferta), messaggioOfferta.trim() || undefined)
    if (!ris.ok) {
      toast(ris.errore ?? 'Offerta non valida', 'errore')
      return
    }
    setImportoOfferta('')
    setMessaggioOfferta('')
    chiudiSheet()
  }

  function confermaPrendiSubito() {
    if (!lavoro) return
    const ris = prendiSubito(lavoro.id)
    if (!ris.ok) toast(ris.errore ?? 'Operazione non riuscita', 'errore')
    chiudiSheet()
  }

  function confermaSaldo() {
    if (!lavoro) return
    const ris = confermaEPaga(lavoro.id, codice)
    if (!ris.ok) {
      toast(ris.errore ?? 'Codice errato', 'errore')
      return
    }
    chiudiSheet()
  }

  function confermaAcconto() {
    if (!lavoro) return
    const ris = rilasciaAcconto(lavoro.id, codice)
    if (!ris.ok) {
      toast(ris.errore ?? 'Codice errato', 'errore')
      return
    }
    chiudiSheet()
  }

  function inviaDisputa() {
    if (!lavoro) return
    const ris = apriDisputa(lavoro.id, motivoDisputa.trim(), fotoDisputa, Number(propostaDisputa))
    if (!ris.ok) {
      toast(ris.errore ?? 'Compila tutti i campi', 'errore')
      return
    }
    setMotivoDisputa('')
    setFotoDisputa([])
    setPropostaDisputa('')
    chiudiSheet()
  }

  function inviaControproposta() {
    if (!lavoro) return
    const ris = controproposta(lavoro.id, Number(propostaDisputa), notaContro.trim() || undefined)
    if (!ris.ok) {
      toast(ris.errore ?? 'Importo non valido', 'errore')
      return
    }
    setPropostaDisputa('')
    setNotaContro('')
    chiudiSheet()
  }

  const quickChips: number[] = []
  if (astaAperta) {
    const base = best ? best.importo : lavoro.budgetMax
    const c1 = Math.max(lavoro.prezzoSubito, Math.floor((base * 0.95) / 5) * 5)
    const c2 = Math.max(lavoro.prezzoSubito, Math.floor((base * 0.9) / 5) * 5)
    if (c1 < base) quickChips.push(c1)
    if (c2 < c1) quickChips.push(c2)
  }

  const feedbackGiaLasciato = sonoOwner ? lavoro.feedbackLasciato.richiedente : lavoro.feedbackLasciato.professionista
  const mostraFeedback = (lavoro.stato === 'pagato' || lavoro.stato === 'risolto') && (sonoOwner || sonoAggiudicatario)

  return (
    <div className="screen dettaglio">
      <BarraIndietro titolo={cat.nome} />

      <div className="job-hero" style={{ background: `linear-gradient(135deg, ${cat.gradiente[0]}, ${cat.gradiente[1]})` }}>
        <span className="job-hero-emoji">{cat.emoji}</span>
        <div className="job-hero-badges">
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
          {lavoro.presoSubito && <span className="badge bianco">⚡️ Preso subito</span>}
        </div>
      </div>

      <div className="dettaglio-body">
        <div className="riga-spazio">
          <StatoBadge stato={lavoro.stato} />
          {astaAperta && <Countdown scadeIl={lavoro.scadeIl} />}
        </div>
        <h1 className="job-titolo">{lavoro.titolo}</h1>
        <p className="muted small">
          <Icon nome="pin" size={13} /> {fmtDistanza(dist)} da te · {lavoro.citta} · pubblicato {fmtTempoFa(adesso() - lavoro.creatoIl)}
        </p>

        <section className="card card-pad">
          <h3>Descrizione</h3>
          <p className="job-desc">{lavoro.descrizione}</p>
          {lavoro.acconto30 && (
            <p className="nota-acconto small">
              <Icon nome="info" size={14} /> Pagamento in due tranche: 30% all'avvio, 70% a lavori ultimati.
            </p>
          )}
        </section>

        {/* Pannello prezzi */}
        <section className="card card-pad price-panel">
          <div className="price-row">
            <span className="muted">Budget massimo del cliente</span>
            <strong>{fmtEur(lavoro.budgetMax)}</strong>
          </div>
          <div className="price-row evidenza">
            <span>
              {best ? `Offerta migliore (${offerte.length} ${offerte.length === 1 ? 'offerta' : 'offerte'})` : 'Ancora nessuna offerta'}
            </span>
            <strong>{best ? fmtEur(best.importo) : '—'}</strong>
          </div>
          {(astaAperta || lavoro.prezzoFinale != null) && (
            <div className="price-row finale">
              <span>{lavoro.prezzoFinale != null ? 'Prezzo di aggiudicazione' : 'Prezzo «Prendi subito»'}</span>
              <strong>{fmtEur(lavoro.prezzoFinale ?? lavoro.prezzoSubito)}</strong>
            </div>
          )}
        </section>

        {/* Cliente (vista professionista) */}
        {!sonoOwner && cliente && <SchedaUtente utente={cliente} etichetta="Richiedente" />}

        {/* Vincitore (vista cliente) */}
        {sonoOwner && vincitore && <SchedaUtente utente={vincitore} etichetta="Aggiudicatario" />}

        {/* ── ASTA APERTA ── */}
        {astaAperta && !sonoOwner && (
          <section className="card card-pad azioni-asta">
            {miaOfferta && (
              <p className={`stato-offerta ${best?.proId === utente.id ? 'in-testa' : 'superato'}`}>
                {best?.proId === utente.id
                  ? `🏁 Sei in testa con ${fmtEur(miaOfferta.importo)}`
                  : `📉 La tua offerta di ${fmtEur(miaOfferta.importo)} è stata superata`}
              </p>
            )}
            <button className="btn block" onClick={() => setSheet('offerta')}>
              <Icon nome="gavel" size={18} /> {miaOfferta ? 'Ribassa la tua offerta' : 'Fai la tua offerta'}
            </button>
            <button className="btn block subito" onClick={() => setSheet('prendi-subito')}>
              <Icon nome="bolt" size={18} /> Prendi subito il lavoro a {fmtEur(lavoro.prezzoSubito)}
            </button>
            <p className="muted small centro">
              Riceverai l'importo al netto della commissione Ribasso del {percCommissione}%
              {utente.premium ? ' (tariffa Premium)' : ''}.
            </p>
          </section>
        )}

        {astaAperta && sonoOwner && (
          <section className="card card-pad">
            <div className="riga-spazio">
              <h3>Offerte ricevute</h3>
              <span className="muted small">vince il prezzo più basso</span>
            </div>
            {offerte.length === 0 && <p className="muted">Nessuna offerta finora: i professionisti in zona stanno guardando il tuo annuncio.</p>}
            <div className="lista-offerte">
              {offerte.map((o, i) => {
                const pro = utenteById(o.proId)
                if (!pro) return null
                const rating = ratingDi(pro.id)
                return (
                  <div key={o.id} className={`offerta-row ${i === 0 ? 'migliore' : ''}`}>
                    <button className="offerta-pro" onClick={() => nav(`/app/pro/${pro.id}`)}>
                      <Avatar emoji={pro.emoji} id={pro.id} size={40} />
                      <span>
                        <strong>{pro.nome}</strong>
                        <span className="small muted">
                          <Stars valore={rating.media} size={11} /> {rating.media ? rating.media.toFixed(1).replace('.', ',') : '—'} ({rating.totale}) ·{' '}
                          {pro.lavoriCompletati} lavori
                        </span>
                        {o.messaggio && <span className="small offerta-msg">"{o.messaggio}"</span>}
                      </span>
                    </button>
                    <span className="offerta-destra">
                      <strong className="offerta-importo">{fmtEur(o.importo)}</strong>
                      <button
                        className="btn small secondary"
                        onClick={() => {
                          setOffertaDaAggiudicare(o.id)
                          setSheet('aggiudica')
                        }}
                      >
                        Aggiudica
                      </button>
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="muted small">
              Puoi aggiudicare subito a chi preferisci — anche in base ai feedback — oppure attendere la chiusura: vincerà
              automaticamente l'offerta più bassa.
            </p>
            <button className="btn ghost small danger" onClick={() => { annullaAnnuncio(lavoro.id); }}>
              Annulla annuncio
            </button>
          </section>
        )}

        {/* ── SCADUTO ── */}
        {lavoro.stato === 'scaduto' && sonoOwner && (
          <section className="card card-pad">
            <p className="muted">L'asta si è chiusa senza offerte. Prova ad alzare il budget o ripubblica.</p>
            <button className="btn block" onClick={() => ripubblicaAnnuncio(lavoro.id)}>
              <Icon nome="refresh" size={16} /> Ripubblica l'annuncio
            </button>
          </section>
        )}

        {/* ── AGGIUDICATO: deposito escrow ── */}
        {lavoro.stato === 'aggiudicato' && sonoOwner && lavoro.prezzoFinale != null && (
          <section className="card card-pad escrow-cta">
            <h3>
              <Icon nome="lock" size={18} /> Deposita i fondi in custodia
            </h3>
            <p className="muted small">
              Come su PayPal: l'importo resta protetto da Ribasso e viene rilasciato al professionista solo con la tua conferma
              {lavoro.acconto30 ? ' (30% all\'avvio, 70% alla fine)' : ''}.
            </p>
            <button className="btn block" onClick={() => setSheet('deposita')}>
              Deposita {fmtEur(lavoro.prezzoFinale)} in custodia
            </button>
          </section>
        )}

        {lavoro.stato === 'aggiudicato' && sonoAggiudicatario && (
          <section className="card card-pad">
            <p className="attesa">
              ⏳ Il cliente sta depositando i fondi in custodia. Riceverai una notifica appena potrai iniziare.
            </p>
          </section>
        )}

        {/* ── ESCROW attivo ── */}
        {lavoro.escrow && ['in-corso', 'completato-da-confermare', 'in-disputa', 'pagato', 'risolto'].includes(lavoro.stato) && (
          <EscrowTimeline lavoro={lavoro} sonoOwner={sonoOwner} />
        )}

        {/* Codice di sblocco per il cliente */}
        {sonoOwner && lavoro.escrow && ['in-corso', 'completato-da-confermare'].includes(lavoro.stato) && (
          <section className="card card-pad codice-card">
            <h3>
              <Icon nome="shield" size={18} /> Il tuo codice di sblocco
            </h3>
            <div className="codice">{lavoro.escrow.codice.split('').join(' ')}</div>
            <p className="muted small">
              Serve per rilasciare i pagamenti. Non condividerlo: inseriscilo solo quando il lavoro è fatto a regola d'arte.
            </p>
          </section>
        )}

        {/* Azioni in corso */}
        {lavoro.stato === 'in-corso' && sonoOwner && lavoro.acconto30 && !lavoro.escrow?.accontoRilasciato && (
          <button className="btn block secondary" onClick={() => setSheet('acconto')}>
            Rilascia l'acconto del 30% ({fmtEur(Math.round((lavoro.prezzoFinale ?? 0) * 0.3))})
          </button>
        )}

        {lavoro.stato === 'in-corso' && sonoAggiudicatario && (
          <section className="card card-pad">
            <h3>Hai finito?</h3>
            <p className="muted small">Documenta il risultato con qualche foto: tutela te e il cliente in caso di contestazioni.</p>
            <button className="btn block" onClick={() => setSheet('completa')}>
              <Icon nome="check" size={18} /> Segna come completato
            </button>
          </section>
        )}

        {/* Foto di consegna */}
        {lavoro.fotoConsegna.length > 0 && ['completato-da-confermare', 'in-disputa', 'pagato', 'risolto'].includes(lavoro.stato) && (
          <section className="card card-pad">
            <h3>Foto di fine lavori</h3>
            <div className="galleria">
              {lavoro.fotoConsegna.map((f, i) => (
                <img key={i} src={f} alt={`Consegna ${i + 1}`} />
              ))}
            </div>
          </section>
        )}

        {/* ── COMPLETATO: conferma o disputa ── */}
        {lavoro.stato === 'completato-da-confermare' && sonoOwner && (
          <section className="card card-pad">
            <h3>Il professionista ha segnato il lavoro come completato</h3>
            <p className="muted small">Controlla il risultato: sei soddisfatto?</p>
            <button className="btn block success" onClick={() => setSheet('salda')}>
              <Icon nome="check" size={18} /> Sono soddisfatto: conferma e paga
            </button>
            <button className="btn block ghost danger" onClick={() => setSheet('disputa')}>
              Non sono soddisfatto
            </button>
          </section>
        )}

        {lavoro.stato === 'completato-da-confermare' && sonoAggiudicatario && (
          <section className="card card-pad">
            <p className="attesa">⏳ In attesa che il cliente verifichi il lavoro e rilasci il pagamento con il suo codice.</p>
          </section>
        )}

        {/* ── DISPUTA ── */}
        {lavoro.disputa && lavoro.stato === 'in-disputa' && (
          <DisputaPanel
            lavoro={lavoro}
            utente={utente}
            onControproponi={() => setSheet('controproposta')}
          />
        )}

        {/* ── CHIUSO: riepilogo ── */}
        {(lavoro.stato === 'pagato' || lavoro.stato === 'risolto') && lavoro.escrow && lavoro.prezzoFinale != null && (
          <section className="card card-pad riepilogo">
            <h3>Riepilogo transazione</h3>
            <div className="price-row">
              <span className="muted">Prezzo pattuito</span>
              <span>{fmtEur(lavoro.prezzoFinale)}</span>
            </div>
            {lavoro.disputa?.importoAccordo != null && (
              <div className="price-row">
                <span className="muted">Accordo dopo disputa</span>
                <span>{fmtEur(lavoro.disputa.importoAccordo)}</span>
              </div>
            )}
            {lavoro.escrow.rilasci.map((r, i) => (
              <div key={i} className="price-row small">
                <span className="muted">
                  {r.tipo === 'acconto' && 'Acconto 30% al professionista'}
                  {r.tipo === 'saldo' && 'Saldo al professionista'}
                  {r.tipo === 'accordo' && 'Rilascio da accordo'}
                  {r.tipo === 'rimborso' && 'Rimborso al cliente'}
                </span>
                <span>{fmtEur(r.importo)}</span>
              </div>
            ))}
            {(sonoAggiudicatario || sonoOwner) && (
              <div className="price-row">
                <span className="muted">Commissione Ribasso ({lavoro.escrow.commissionePerc}%)</span>
                <span>
                  −{' '}
                  {fmtEur(
                    Math.round(
                      lavoro.escrow.rilasci.filter((r) => r.tipo !== 'rimborso').reduce((s, r) => s + r.importo, 0) *
                        lavoro.escrow.commissionePerc
                    ) / 100
                  )}
                </span>
              </div>
            )}
          </section>
        )}

        {/* ── FEEDBACK ── */}
        {mostraFeedback && (
          <section className="card card-pad feedback-box">
            <h3>
              <Icon nome="star" size={18} /> {feedbackGiaLasciato ? 'Feedback' : 'Com\'è andata? Lascia un feedback'}
            </h3>
            {!feedbackGiaLasciato && (
              <>
                <StarPicker valore={stelle} onChange={setStelle} />
                <textarea
                  className="input"
                  rows={2}
                  placeholder={sonoOwner ? 'Com\'è andata con il professionista?' : 'Com\'è andata con il cliente?'}
                  value={commentoFeedback}
                  onChange={(e) => setCommentoFeedback(e.target.value)}
                />
                <button
                  className="btn block"
                  disabled={stelle === 0}
                  onClick={() => {
                    lasciaFeedback(lavoro.id, stelle, commentoFeedback)
                    setStelle(0)
                    setCommentoFeedback('')
                  }}
                >
                  Pubblica feedback
                </button>
                <p className="muted small centro">I feedback reciproci rendono Ribasso affidabile per tutti.</p>
              </>
            )}
            {feedbackGiaLasciato && <p className="muted small">Hai già lasciato il tuo feedback per questo lavoro. Grazie! 🙏</p>}
          </section>
        )}
      </div>

      {/* ─── SHEETS ─── */}

      <Sheet aperto={sheet === 'offerta'} onClose={chiudiSheet} titolo="Fai la tua offerta al ribasso">
        <p className="muted small">
          {best ? `Offerta migliore attuale: ${fmtEur(best.importo)}.` : `Budget massimo: ${fmtEur(lavoro.budgetMax)}.`} Vince il
          prezzo più basso alla chiusura.
        </p>
        {quickChips.length > 0 && (
          <div className="chips">
            {quickChips.map((c) => (
              <button key={c} className={`chip ${importoOfferta === String(c) ? 'active' : ''}`} onClick={() => setImportoOfferta(String(c))}>
                {fmtEur(c)}
              </button>
            ))}
          </div>
        )}
        <div className="field">
          <label>La tua offerta (€)</label>
          <input
            className="input grande-input"
            type="number"
            inputMode="numeric"
            value={importoOfferta}
            onChange={(e) => setImportoOfferta(e.target.value)}
            placeholder={best ? `meno di ${best.importo}` : `max ${lavoro.budgetMax}`}
          />
        </div>
        <div className="field">
          <label>Messaggio per il cliente (facoltativo)</label>
          <input
            className="input"
            value={messaggioOfferta}
            onChange={(e) => setMessaggioOfferta(e.target.value)}
            placeholder="Es. posso passare per un sopralluogo domani"
          />
        </div>
        {importoOfferta && Number(importoOfferta) > 0 && (
          <p className="muted small">
            Se vinci riceverai ≈ {fmtEur(Math.round(Number(importoOfferta) * (1 - percCommissione / 100)))} netti (commissione{' '}
            {percCommissione}%).
          </p>
        )}
        <button className="btn block" onClick={inviaOfferta}>
          <Icon nome="send" size={16} /> Invia offerta
        </button>
      </Sheet>

      <Sheet aperto={sheet === 'prendi-subito'} onClose={chiudiSheet} titolo="Prendi subito il lavoro ⚡️">
        <p>
          Ti aggiudichi <strong>immediatamente</strong> «{lavoro.titolo}» al prezzo fuori mercato di{' '}
          <strong>{fmtEur(lavoro.prezzoSubito)}</strong>, chiudendo l'asta per tutti.
        </p>
        <p className="muted small">
          Netto per te: ≈ {fmtEur(Math.round(lavoro.prezzoSubito * (1 - percCommissione / 100)))} (commissione {percCommissione}
          %). Il cliente depositerà i fondi in custodia prima dell'inizio dei lavori.
        </p>
        <button className="btn block subito" onClick={confermaPrendiSubito}>
          <Icon nome="bolt" size={18} /> Confermo: prendo il lavoro a {fmtEur(lavoro.prezzoSubito)}
        </button>
      </Sheet>

      <Sheet aperto={sheet === 'aggiudica'} onClose={chiudiSheet} titolo="Aggiudica il lavoro">
        {(() => {
          const off = lavoro.offerte.find((o) => o.id === offertaDaAggiudicare)
          const pro = off ? utenteById(off.proId) : undefined
          if (!off || !pro) return null
          const rating = ratingDi(pro.id)
          return (
            <>
              <div className="aggiudica-recap">
                <Avatar emoji={pro.emoji} id={pro.id} size={48} />
                <div>
                  <strong>{pro.nome}</strong>
                  <span className="small muted">
                    <Stars valore={rating.media} size={12} /> {rating.media.toFixed(1).replace('.', ',')} · {rating.totale} recensioni
                  </span>
                </div>
                <strong className="offerta-importo">{fmtEur(off.importo)}</strong>
              </div>
              <p className="muted small">
                Chiudi l'asta in anticipo e aggiudichi il lavoro a questo professionista. Dopo, depositerai l'importo in custodia.
              </p>
              <button
                className="btn block"
                onClick={() => {
                  aggiudicaOfferta(lavoro.id, off.id)
                  chiudiSheet()
                }}
              >
                Aggiudica a {pro.nome.split(' ')[0]} per {fmtEur(off.importo)}
              </button>
            </>
          )
        })()}
      </Sheet>

      <Sheet aperto={sheet === 'deposita'} onClose={chiudiSheet} titolo="Deposita in custodia 🔒">
        <div className="price-row">
          <span className="muted">Importo da depositare</span>
          <strong>{fmtEur(lavoro.prezzoFinale ?? 0)}</strong>
        </div>
        <div className="metodi-pagamento">
          <span className="metodo attivo"> Pay</span>
          <span className="metodo">💳 ··· 4242</span>
          <span className="metodo">🅿️ PayPal</span>
        </div>
        <p className="muted small">
          I fondi restano protetti da Ribasso e vengono rilasciati solo con il tuo codice di sblocco
          {lavoro.acconto30 ? ': 30% all\'avvio e 70% a lavori ultimati' : ' a lavori ultimati'}. (Demo: nessun pagamento reale.)
        </p>
        <button
          className="btn block"
          onClick={() => {
            depositaEscrow(lavoro.id)
            chiudiSheet()
          }}
        >
          <Icon nome="lock" size={16} /> Deposita ora {fmtEur(lavoro.prezzoFinale ?? 0)}
        </button>
      </Sheet>

      <Sheet aperto={sheet === 'acconto'} onClose={chiudiSheet} titolo="Rilascia l'acconto del 30%">
        <p className="muted small">
          Stai per rilasciare {fmtEur(Math.round((lavoro.prezzoFinale ?? 0) * 0.3))} a {vincitore?.nome}. Inserisci il tuo codice
          di sblocco per confermare.
        </p>
        <input
          className="input grande-input centro"
          inputMode="numeric"
          maxLength={6}
          placeholder="······"
          value={codice}
          onChange={(e) => setCodice(e.target.value)}
        />
        <button className="btn block" onClick={confermaAcconto}>
          Conferma rilascio acconto
        </button>
      </Sheet>

      <Sheet aperto={sheet === 'salda'} onClose={chiudiSheet} titolo="Conferma e paga ✅">
        <div className="price-row">
          <span className="muted">Saldo da rilasciare</span>
          <strong>{fmtEur((lavoro.prezzoFinale ?? 0) - acconto)}</strong>
        </div>
        {vincitore && (
          <p className="muted small">
            {vincitore.nome} riceverà l'importo al netto della commissione Ribasso del {lavoro.escrow?.commissionePerc ?? 12}%.
            Inserisci il tuo codice di sblocco per confermare che il lavoro è stato svolto correttamente.
          </p>
        )}
        <input
          className="input grande-input centro"
          inputMode="numeric"
          maxLength={6}
          placeholder="······"
          value={codice}
          onChange={(e) => setCodice(e.target.value)}
        />
        <button className="btn block success" onClick={confermaSaldo}>
          <Icon nome="check" size={16} /> Rilascia il pagamento
        </button>
      </Sheet>

      <Sheet aperto={sheet === 'completa'} onClose={chiudiSheet} titolo="Segna come completato 📸">
        <p className="muted small">
          Aggiungi qualche foto del lavoro finito: documentare il risultato ti tutela in caso di contestazioni.
        </p>
        <FotoUploader foto={fotoCompleta} onChange={setFotoCompleta} />
        <button
          className="btn block"
          onClick={() => {
            segnaCompletato(lavoro.id, fotoCompleta)
            setFotoCompleta([])
            chiudiSheet()
          }}
        >
          <Icon nome="check" size={16} /> Conferma: lavoro completato
        </button>
      </Sheet>

      <Sheet aperto={sheet === 'disputa'} onClose={chiudiSheet} titolo="Apri una disputa 🤝">
        <p className="muted small">
          Ribasso farà da mediatore. Descrivi il problema, documentalo con foto e proponi quanto sei disposto a riconoscere per
          il lavoro svolto: il professionista potrà accettare o fare una controproposta.
        </p>
        <div className="field">
          <label>Cosa non va?</label>
          <textarea
            className="input"
            rows={3}
            value={motivoDisputa}
            onChange={(e) => setMotivoDisputa(e.target.value)}
            placeholder="Es. la parete del soggiorno presenta aloni e il battiscopa è macchiato…"
          />
        </div>
        <div className="field">
          <label>Foto del problema (obbligatorie)</label>
          <FotoUploader foto={fotoDisputa} onChange={setFotoDisputa} />
        </div>
        <div className="field">
          <label>
            La tua proposta (su {fmtEur(lavoro.prezzoFinale ?? 0)} pattuiti{acconto > 0 ? `, acconto già versato ${fmtEur(acconto)}` : ''})
          </label>
          <input
            className="input grande-input"
            type="number"
            inputMode="numeric"
            value={propostaDisputa}
            onChange={(e) => setPropostaDisputa(e.target.value)}
            placeholder={`Es. ${Math.round(((lavoro.prezzoFinale ?? 0) * 0.5) / 5) * 5}`}
          />
        </div>
        <button className="btn block danger" onClick={inviaDisputa}>
          Apri la disputa
        </button>
      </Sheet>

      <Sheet aperto={sheet === 'controproposta'} onClose={chiudiSheet} titolo="Fai una controproposta">
        <div className="field">
          <label>Importo proposto (€)</label>
          <input
            className="input grande-input"
            type="number"
            inputMode="numeric"
            value={propostaDisputa}
            onChange={(e) => setPropostaDisputa(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Nota (facoltativa)</label>
          <input className="input" value={notaContro} onChange={(e) => setNotaContro(e.target.value)} placeholder="Spiega la tua proposta" />
        </div>
        <button className="btn block" onClick={inviaControproposta}>
          <Icon nome="send" size={16} /> Invia controproposta
        </button>
      </Sheet>
    </div>
  )
}

// ─── Sotto-componenti ────────────────────────────────────────────────────────

function BarraIndietro({ titolo }: { titolo: string }) {
  return (
    <header className="barra-indietro">
      <button className="btn ghost small" onClick={() => history.back()}>
        <Icon nome="chevron-left" size={18} /> Indietro
      </button>
      <span className="barra-titolo">{titolo}</span>
      <span style={{ width: 86 }} />
    </header>
  )
}

function SchedaUtente({ utente, etichetta }: { utente: Utente; etichetta: string }) {
  const rating = ratingDi(utente.id)
  return (
    <button className="card card-pad scheda-utente" onClick={() => nav(`/app/pro/${utente.id}`)}>
      <Avatar emoji={utente.emoji} id={utente.id} size={46} />
      <span className="scheda-utente-info">
        <span className="muted small">{etichetta}</span>
        <strong>{utente.nome}</strong>
        <span className="small muted">
          {rating.totale > 0 ? (
            <>
              <Stars valore={rating.media} size={11} /> {rating.media.toFixed(1).replace('.', ',')} ({rating.totale} recensioni)
            </>
          ) : (
            'Nuovo su Ribasso'
          )}
        </span>
      </span>
      <Icon nome="chevron-right" size={18} className="muted" />
    </button>
  )
}

function EscrowTimeline({ lavoro, sonoOwner }: { lavoro: Lavoro; sonoOwner: boolean }) {
  const e = lavoro.escrow
  if (!e || lavoro.prezzoFinale == null) return null
  const acconto = Math.round(lavoro.prezzoFinale * 0.3)
  const saldoFinale = e.rilasci.find((r) => r.tipo === 'saldo' || r.tipo === 'accordo')
  const chiuso = lavoro.stato === 'pagato' || lavoro.stato === 'risolto'
  return (
    <section className="card card-pad">
      <h3>
        <Icon nome="lock" size={18} /> Custodia Ribasso
      </h3>
      <div className="timeline">
        <div className="tl-item fatto">
          <span className="tl-dot" />
          <div>
            <strong>{fmtEur(lavoro.prezzoFinale)} depositati in custodia</strong>
            {e.depositatoIl && <span className="muted small">{fmtData(e.depositatoIl)}</span>}
          </div>
        </div>
        {lavoro.acconto30 && (
          <div className={`tl-item ${e.accontoRilasciato ? 'fatto' : 'attivo'}`}>
            <span className="tl-dot" />
            <div>
              <strong>Acconto 30% — {fmtEur(acconto)}</strong>
              <span className="muted small">
                {e.accontoRilasciato ? 'Rilasciato al professionista' : sonoOwner ? 'Da rilasciare con il tuo codice' : 'In attesa del cliente'}
              </span>
            </div>
          </div>
        )}
        <div className={`tl-item ${chiuso ? 'fatto' : lavoro.stato === 'in-disputa' ? 'errore' : 'attivo'}`}>
          <span className="tl-dot" />
          <div>
            <strong>
              {lavoro.stato === 'in-disputa'
                ? 'Saldo congelato: disputa in corso'
                : chiuso
                  ? `Saldo rilasciato — ${fmtEur(saldoFinale?.importo ?? lavoro.prezzoFinale - (e.accontoRilasciato ? acconto : 0))}`
                  : `Saldo a fine lavori — ${fmtEur(lavoro.prezzoFinale - (lavoro.acconto30 ? acconto : 0))}`}
            </strong>
            <span className="muted small">
              {lavoro.stato === 'in-disputa'
                ? 'Si sblocca con l\'accordo tra le parti'
                : chiuso
                  ? 'Transazione completata'
                  : sonoOwner
                    ? 'Si rilascia con il tuo codice di sblocco'
                    : 'Il cliente conferma con il suo codice'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function DisputaPanel({
  lavoro,
  utente,
  onControproponi,
}: {
  lavoro: Lavoro
  utente: Utente
  onControproponi: () => void
}) {
  const d = lavoro.disputa
  if (!d) return null
  const ultima = d.proposte[d.proposte.length - 1]
  const toccaAMe = d.stato === 'negoziazione' && ultima && ultima.da !== utente.id
  const hoAccettatoMediazione = d.accettatoDa.includes(utente.id)
  return (
    <section className="card card-pad disputa">
      <h3>
        <Icon nome="scale" size={18} /> Disputa in corso
      </h3>
      <p className="disputa-motivo">"{d.motivo}"</p>
      {d.foto.length > 0 && (
        <div className="galleria">
          {d.foto.map((f, i) => (
            <img key={i} src={f} alt={`Documentazione ${i + 1}`} />
          ))}
        </div>
      )}
      <div className="proposte">
        {d.proposte.map((p, i) => {
          const autore = utenteById(p.da)
          const mia = p.da === utente.id
          return (
            <div key={i} className={`proposta ${mia ? 'mia' : ''}`}>
              <span className="small muted">
                {mia ? 'Tu' : autore?.nome} · {fmtData(p.data)}
              </span>
              <strong>{fmtEur(p.importo)}</strong>
              {p.nota && <span className="small">{p.nota}</span>}
            </div>
          )
        })}
      </div>

      {d.stato === 'mediazione' && (
        <div className="mediazione">
          <span className="badge purple">
            <Icon nome="scale" size={12} /> Mediazione Ribasso
          </span>
          <p className="small">{d.mediazioneTesto}</p>
          <div className="price-row evidenza">
            <span>Proposta del mediatore</span>
            <strong>{fmtEur(d.importoMediazione ?? 0)}</strong>
          </div>
          {!hoAccettatoMediazione ? (
            <button className="btn block" onClick={() => accettaMediazione(lavoro.id)}>
              Accetto la proposta del mediatore
            </button>
          ) : (
            <p className="muted small centro">Hai accettato ✓ — in attesa della controparte…</p>
          )}
        </div>
      )}

      {toccaAMe && (
        <div className="disputa-azioni">
          <button className="btn block success" onClick={() => accettaProposta(lavoro.id)}>
            Accetta {fmtEur(ultima.importo)} e chiudi
          </button>
          <button className="btn block secondary" onClick={onControproponi}>
            Fai una controproposta
          </button>
          <button className="btn block ghost" onClick={() => richiediMediazione(lavoro.id)}>
            <Icon nome="scale" size={16} /> Chiedi la mediazione di Ribasso
          </button>
        </div>
      )}

      {d.stato === 'negoziazione' && !toccaAMe && (
        <p className="muted small centro">⏳ In attesa della risposta della controparte…</p>
      )}
    </section>
  )
}
