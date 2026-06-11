/* Verifica che le schermate principali si renderizzino senza eccezioni (SSR come proxy del browser). */
import { createElement } from 'react'

async function main() {
  const archivio: Record<string, string> = {}
  const g = globalThis as Record<string, unknown>
  g.localStorage = {
    getItem: (k: string) => archivio[k] ?? null,
    setItem: (k: string, v: string) => {
      archivio[k] = String(v)
    },
    removeItem: (k: string) => {
      delete archivio[k]
    },
  }
  g.location = { hash: '#/', href: 'http://localhost/' }
  g.window = { addEventListener: () => {}, removeEventListener: () => {}, setTimeout, clearTimeout }
  g.history = { back: () => {} }
  g.document = { addEventListener: () => {}, removeEventListener: () => {}, hidden: false, body: { style: {} } }

  const { renderToString } = await import('react-dom/server')
  const S = await import('../src/lib/store')
  const { Landing } = await import('../src/screens/Landing')
  const { Onboarding } = await import('../src/screens/Onboarding')

  let ok = 0
  const fallimenti: string[] = []
  function prova(nome: string, fn: () => string) {
    try {
      const html = fn()
      if (html.length < 100) throw new Error(`output troppo corto (${html.length})`)
      ok++
      console.log(`✅ render ${nome} (${html.length} caratteri)`)
    } catch (e) {
      fallimenti.push(nome)
      console.error(`❌ render ${nome}:`, e)
    }
  }

  prova('Landing', () => renderToString(createElement(Landing)))
  prova('Onboarding', () => renderToString(createElement(Onboarding)))

  // Mondo popolato per le schermate interne
  S.completaOnboarding({
    nome: 'Render Tester',
    emoji: '🙂',
    ruolo: 'entrambi',
    citta: 'Milano',
    lat: 45.4642,
    lng: 9.19,
    categorie: ['imbiancatura', 'grafica', 'traslochi'],
    competenze: ['Logo'],
    raggioKm: 30,
    tariffaMinima: 0,
    bio: 'test',
    social: {},
  })
  const io = S.utenteCorrente()!

  const { Discover } = await import('../src/screens/Discover')
  const { JobDetail } = await import('../src/screens/JobDetail')
  const { PostJob } = await import('../src/screens/PostJob')
  const { MyAds } = await import('../src/screens/MyAds')
  const { ProJobs } = await import('../src/screens/ProJobs')
  const { Profile } = await import('../src/screens/Profile')
  const { UserProfile } = await import('../src/screens/UserProfile')
  const { Wallet } = await import('../src/screens/Wallet')
  const { Premium } = await import('../src/screens/Premium')

  prova('Discover', () => renderToString(createElement(Discover, { utente: io })))
  prova('PostJob', () => renderToString(createElement(PostJob)))
  prova('MyAds', () => renderToString(createElement(MyAds, { utente: io })))
  prova('ProJobs', () => renderToString(createElement(ProJobs, { utente: io })))
  prova('Profile', () => renderToString(createElement(Profile, { utente: io })))
  prova('Wallet', () => renderToString(createElement(Wallet)))
  prova('Premium', () => renderToString(createElement(Premium, { utente: io })))

  const feed = S.feedPerUtente(io)
  prova('JobDetail (asta aperta, vista pro)', () => renderToString(createElement(JobDetail, { id: feed[0].id, utente: io })))
  const proBot = S.getState().utenti.find((u) => u.bot && u.ruolo === 'professionista')!
  prova('UserProfile (bot)', () => renderToString(createElement(UserProfile, { id: proBot.id })))

  // Stati avanzati del dettaglio: aggiudicato → escrow → completato → disputa → mediazione
  const id = S.pubblicaAnnuncio({
    titolo: 'Render: stati avanzati',
    descrizione: 'Annuncio per coprire tutti gli stati di dettaglio nel render check.',
    categoria: 'imbiancatura',
    budgetMax: 500,
    prezzoSubito: 250,
    durataOre: 4,
    acconto30: true,
    urgente: true,
    ricorsivo: false,
  })!
  const orig = Math.random
  Math.random = () => 0.1
  for (let i = 0; i < 3; i++) S.demoAvanzaOre(1)
  prova('JobDetail (asta, vista cliente con offerte)', () => renderToString(createElement(JobDetail, { id, utente: io })))
  S.demoAvanzaOre(4)
  prova('JobDetail (aggiudicato)', () => renderToString(createElement(JobDetail, { id, utente: io })))
  S.depositaEscrow(id)
  prova('JobDetail (in corso + codice)', () => renderToString(createElement(JobDetail, { id, utente: io })))
  S.demoAvanzaOre(1)
  prova('JobDetail (completato da confermare)', () => renderToString(createElement(JobDetail, { id, utente: io })))
  S.apriDisputa(id, 'Test disputa render', ['data:image/svg+xml,x'], 100)
  prova('JobDetail (in disputa)', () => renderToString(createElement(JobDetail, { id, utente: io })))
  S.richiediMediazione(id)
  prova('JobDetail (mediazione)', () => renderToString(createElement(JobDetail, { id, utente: io })))
  S.demoAvanzaOre(1)
  S.accettaMediazione(id)
  prova('JobDetail (risolto + feedback)', () => renderToString(createElement(JobDetail, { id, utente: io })))
  Math.random = orig

  console.log(`\n${ok} render riusciti, ${fallimenti.length} falliti`)
  if (fallimenti.length > 0) {
    console.error('FALLITI:', fallimenti.join(' | '))
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('Errore render check:', e)
  process.exit(1)
})
