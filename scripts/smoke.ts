/* Smoke test del motore di Ribasso: esercita i flussi principali senza browser. */

let esiti: { nome: string; ok: boolean; dettaglio?: string }[] = []
function check(nome: string, cond: boolean, dettaglio?: string) {
  esiti.push({ nome, ok: cond, dettaglio })
  console.log(`${cond ? '✅' : '❌'} ${nome}${dettaglio ? ` — ${dettaglio}` : ''}`)
}

const realRandom = Math.random
function fissaRandom(v: number) {
  Math.random = () => v
}
function ripristinaRandom() {
  Math.random = realRandom
}

async function main() {
  // Shim del browser per Node
  const archivio: Record<string, string> = {}
  ;(globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (k: string) => archivio[k] ?? null,
    setItem: (k: string, v: string) => {
      archivio[k] = String(v)
    },
    removeItem: (k: string) => {
      delete archivio[k]
    },
  }

  const S = await import('../src/lib/store')

  // ── Onboarding ──
  S.completaOnboarding({
    nome: 'Tester Demo',
    emoji: '🙂',
    ruolo: 'entrambi',
    citta: 'Milano',
    lat: 45.4642,
    lng: 9.19,
    categorie: ['imbiancatura', 'grafica'],
    competenze: ['Pareti interne', 'Logo'],
    raggioKm: 25,
    tariffaMinima: 0,
    bio: 'Profilo di test',
    social: { instagram: 'tester' },
  })
  const stato = S.getState()
  const io = S.utenteCorrente()!
  check('Onboarding crea utente e mondo', !!io && stato.utenti.length > 10 && stato.lavori.length > 5)
  check('Recensioni seed presenti', stato.recensioni.length > 20)

  // ── Feed e matching ──
  const feed = S.feedPerUtente(io)
  check('Feed non vuoto', feed.length > 0, `${feed.length} annunci`)
  check(
    'Feed rispetta le categorie del profilo',
    feed.every((l) => io.categorie.includes(l.categoria))
  )
  check(
    'Annunci ricorsivi nascosti ai non Premium',
    feed.every((l) => !l.ricorsivo)
  )

  // ── Flusso RICHIEDENTE: pubblica → asta → deposito → completamento → pagamento ──
  const annuncioId = S.pubblicaAnnuncio({
    titolo: 'Test: imbiancare ufficio',
    descrizione: 'Lavoro di prova generato dallo smoke test, pareti bianche, 60 mq.',
    categoria: 'imbiancatura',
    budgetMax: 600,
    prezzoSubito: 330,
    durataOre: 8,
    acconto30: true,
    urgente: false,
    ricorsivo: false,
  })!
  check('Annuncio pubblicato', !!S.lavoroById(annuncioId))

  // I bot fanno offerte (random basso ⇒ offerta quasi certa a ogni tick)
  fissaRandom(0.1)
  for (let i = 0; i < 5; i++) S.demoAvanzaOre(1)
  const dopoOfferte = S.lavoroById(annuncioId)!
  check('I bot hanno fatto offerte al ribasso', dopoOfferte.offerte.length >= 1, `${dopoOfferte.offerte.length} offerte`)
  const importi = dopoOfferte.offerte.map((o) => o.importo)
  check(
    'Offerte entro budget e sopra il prezzo subito',
    importi.every((x) => x <= 600 && x >= 330)
  )

  // Scadenza asta → aggiudicazione automatica al minimo
  S.demoAvanzaOre(8)
  const aggiudicato = S.lavoroById(annuncioId)!
  check('Asta chiusa e aggiudicata', aggiudicato.stato === 'aggiudicato', `stato=${aggiudicato.stato}`)
  check('Vince il prezzo più basso', aggiudicato.prezzoFinale === Math.min(...importi))

  // Deposito in custodia
  S.depositaEscrow(annuncioId)
  let l1 = S.lavoroById(annuncioId)!
  check('Escrow depositato, lavori in corso', l1.stato === 'in-corso' && !!l1.escrow)
  check(
    'Transazione di deposito registrata',
    S.getState().transazioni.some((t) => t.tipo === 'deposito' && t.lavoroId === annuncioId)
  )

  // Acconto 30% con codice
  const codice = l1.escrow!.codice
  const ko = S.rilasciaAcconto(annuncioId, '000000')
  check('Codice errato rifiutato', !ko.ok)
  const okAcc = S.rilasciaAcconto(annuncioId, codice)
  l1 = S.lavoroById(annuncioId)!
  check('Acconto 30% rilasciato con codice', okAcc.ok && l1.escrow!.accontoRilasciato)

  // Il professionista bot completa il lavoro
  S.demoAvanzaOre(1)
  l1 = S.lavoroById(annuncioId)!
  check('Il bot segna il lavoro completato', l1.stato === 'completato-da-confermare', `stato=${l1.stato}`)

  // Conferma e saldo
  const okPay = S.confermaEPaga(annuncioId, codice)
  l1 = S.lavoroById(annuncioId)!
  check('Saldo rilasciato, lavoro pagato', okPay.ok && l1.stato === 'pagato')
  const sommaRilasci = l1.escrow!.rilasci.reduce((s, r) => s + r.importo, 0)
  check('Rilasci = prezzo pattuito', sommaRilasci === l1.prezzoFinale, `${sommaRilasci} vs ${l1.prezzoFinale}`)

  // Feedback reciproco
  S.lasciaFeedback(annuncioId, 5, 'Ottimo lavoro di test!')
  l1 = S.lavoroById(annuncioId)!
  check('Feedback del richiedente registrato', l1.feedbackLasciato.richiedente)
  S.demoAvanzaOre(1)
  l1 = S.lavoroById(annuncioId)!
  check('Feedback del bot ricevuto', l1.feedbackLasciato.professionista)
  check(
    'La recensione del bot è arrivata a me',
    S.recensioniDi(io.id).length >= 1
  )

  // ── Flusso PROFESSIONISTA: prendi subito → disputa → accordo ──
  ripristinaRandom()
  const feed2 = S.feedPerUtente(io)
  const preda = feed2[0]
  check('C\'è un annuncio da prendere subito', !!preda)
  const okSubito = S.prendiSubito(preda.id)
  let l2 = S.lavoroById(preda.id)!
  check('Prendi subito aggiudica immediatamente', okSubito.ok && l2.stato === 'aggiudicato' && l2.aggiudicatarioId === io.id)
  check('Prezzo finale = prezzo subito', l2.prezzoFinale === l2.prezzoSubito)

  // Il cliente bot deposita
  fissaRandom(0.3)
  S.demoAvanzaOre(1)
  l2 = S.lavoroById(preda.id)!
  check('Il cliente bot ha depositato in custodia', l2.stato === 'in-corso' && !!l2.escrow, `stato=${l2.stato}`)

  // Segno completato; il bot NON è soddisfatto (random alto ⇒ disputa)
  S.segnaCompletato(preda.id, [])
  fissaRandom(0.9)
  S.demoAvanzaOre(1)
  l2 = S.lavoroById(preda.id)!
  check('Il cliente bot ha aperto una disputa', l2.stato === 'in-disputa' && !!l2.disputa, `stato=${l2.stato}`)
  check('La disputa è documentata con foto', (l2.disputa?.foto.length ?? 0) > 0)

  // Controproposta del professionista all'80% → il bot accetta (≤85%)
  const proposta80 = Math.round((l2.prezzoFinale! * 0.8) / 5) * 5
  const okContro = S.controproposta(preda.id, proposta80, 'Vengo a sistemare i difetti e chiudiamo qui.')
  check('Controproposta inviata', okContro.ok)
  fissaRandom(0.3)
  S.demoAvanzaOre(1)
  l2 = S.lavoroById(preda.id)!
  check('Accordo raggiunto: lavoro risolto', l2.stato === 'risolto', `stato=${l2.stato}`)
  check('Importo accordo corretto', l2.disputa?.importoAccordo === proposta80)
  const rimborso = l2.escrow!.rilasci.find((r) => r.tipo === 'rimborso')
  check('Rimborso parziale al cliente registrato', !!rimborso && rimborso.importo === l2.prezzoFinale! - proposta80)
  check(
    'Pagamento (accordo) ricevuto dal professionista',
    S.getState().transazioni.some((t) => t.tipo === 'rilascio' && t.lavoroId === preda.id)
  )
  check(
    'Commissione Ribasso trattenuta',
    S.getState().transazioni.some((t) => t.tipo === 'commissione' && t.lavoroId === preda.id)
  )

  // ── Premium ──
  S.attivaPremium()
  const io2 = S.utenteCorrente()!
  check('Premium attivo', io2.premium)
  const sugg = S.suggerimentiAI(io2)
  check('Suggerimenti AI generati', sugg.length > 0 && sugg[0].motivi.length > 0)
  check(
    'Transazione abbonamento registrata',
    S.getState().transazioni.some((t) => t.tipo === 'abbonamento')
  )

  // ── Mediazione (flusso forzato) ──
  ripristinaRandom()
  const annuncio2 = S.pubblicaAnnuncio({
    titolo: 'Test mediazione: logo aziendale',
    descrizione: 'Secondo lavoro di prova per esercitare la mediazione del sistema.',
    categoria: 'grafica',
    budgetMax: 400,
    prezzoSubito: 200,
    durataOre: 4,
    acconto30: false,
    urgente: false,
    ricorsivo: false,
  })!
  fissaRandom(0.1)
  for (let i = 0; i < 3; i++) S.demoAvanzaOre(1)
  S.demoAvanzaOre(4)
  let l3 = S.lavoroById(annuncio2)!
  check('Seconda asta aggiudicata', l3.stato === 'aggiudicato', `stato=${l3.stato}`)
  S.depositaEscrow(annuncio2)
  S.demoAvanzaOre(1) // il bot completa
  l3 = S.lavoroById(annuncio2)!
  check('Bot ha completato il secondo lavoro', l3.stato === 'completato-da-confermare', `stato=${l3.stato}`)
  // Apro disputa con proposta bassissima → il bot non accetta (sotto 70%)
  const bassa = Math.max(5, Math.round((l3.prezzoFinale! * 0.3) / 5) * 5)
  const okDisp = S.apriDisputa(annuncio2, 'Il logo non rispetta il brief concordato.', ['data:image/svg+xml,foto'], bassa)
  check('Disputa aperta dal richiedente', okDisp.ok)
  fissaRandom(0.5)
  S.demoAvanzaOre(1) // bot risponde con controproposta
  l3 = S.lavoroById(annuncio2)!
  check('Il bot pro ha controproposto', (l3.disputa?.proposte.length ?? 0) >= 2)
  // Chiedo la mediazione dell'app
  S.richiediMediazione(annuncio2)
  l3 = S.lavoroById(annuncio2)!
  check('Mediazione avviata con proposta', l3.disputa?.stato === 'mediazione' && l3.disputa.importoMediazione != null)
  S.demoAvanzaOre(1) // il bot accetta la mediazione
  S.accettaMediazione(annuncio2)
  l3 = S.lavoroById(annuncio2)!
  check('Mediazione conclusa: risolto', l3.stato === 'risolto', `stato=${l3.stato}`)

  // ── Persistenza ──
  check('Stato persistito su localStorage', (archivio['ribasso_stato_v1'] ?? '').length > 1000)

  ripristinaRandom()
  const falliti = esiti.filter((e) => !e.ok)
  console.log(`\n${esiti.length - falliti.length}/${esiti.length} controlli superati`)
  if (falliti.length > 0) {
    console.error('FALLITI:', falliti.map((f) => f.nome).join(' | '))
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('Errore smoke test:', e)
  process.exit(1)
})
