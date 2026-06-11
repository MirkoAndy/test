import { useEffect, useState, useSyncExternalStore } from 'react'
import { avviaMotore, demoAvanzaOre, getState, subscribe, tick, utenteCorrente } from './lib/store'
import { nav, useRoute } from './lib/router'
import type { IconName } from './components/Icon'
import { Icon } from './components/Icon'
import { ToastHost } from './components/ToastHost'
import { Landing } from './screens/Landing'
import { Onboarding } from './screens/Onboarding'
import { Discover } from './screens/Discover'
import { JobDetail } from './screens/JobDetail'
import { PostJob } from './screens/PostJob'
import { MyAds } from './screens/MyAds'
import { ProJobs } from './screens/ProJobs'
import { Profile } from './screens/Profile'
import { UserProfile } from './screens/UserProfile'
import { Wallet } from './screens/Wallet'
import { Premium } from './screens/Premium'

interface Tab {
  rotta: string
  label: string
  icona: IconName
  prominente?: boolean
}

export default function App() {
  useSyncExternalStore(subscribe, getState, getState)
  const route = useRoute()

  useEffect(() => avviaMotore(), [])
  useEffect(() => {
    const f = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', f)
    return () => document.removeEventListener('visibilitychange', f)
  }, [])

  const stato = getState()
  const utente = utenteCorrente()
  const inApp = route.startsWith('/app')

  useEffect(() => {
    if (inApp && (!stato.onboardingCompletato || !utente)) nav('/onboarding')
  }, [inApp, stato.onboardingCompletato, utente])

  if (route === '/' || (!inApp && route !== '/onboarding')) {
    return (
      <>
        <Landing />
        <ToastHost />
      </>
    )
  }

  if (route === '/onboarding') {
    return (
      <>
        <Onboarding />
        <ToastHost />
      </>
    )
  }

  if (!utente) return null

  const ePro = utente.ruolo !== 'richiedente'
  const eRichiedente = utente.ruolo !== 'professionista'

  const tabs: Tab[] = []
  if (ePro) tabs.push({ rotta: '/app/scopri', label: 'Scopri', icona: 'cards' })
  if (ePro) tabs.push({ rotta: '/app/lavori', label: 'Lavori', icona: 'briefcase' })
  if (eRichiedente) tabs.push({ rotta: '/app/pubblica', label: 'Pubblica', icona: 'plus', prominente: true })
  if (eRichiedente) tabs.push({ rotta: '/app/annunci', label: 'Annunci', icona: 'megaphone' })
  tabs.push({ rotta: '/app/profilo', label: 'Profilo', icona: 'user' })

  const seg = route.split('/').filter(Boolean) // ['app', ...]
  let schermata: JSX.Element
  const sezione = seg[1] ?? ''
  if (sezione === '' || sezione === 'scopri') {
    schermata = ePro ? <Discover utente={utente} /> : <MyAds utente={utente} />
  } else if (sezione === 'lavori') {
    schermata = <ProJobs utente={utente} />
  } else if (sezione === 'pubblica') {
    schermata = <PostJob />
  } else if (sezione === 'annunci') {
    schermata = <MyAds utente={utente} />
  } else if (sezione === 'profilo') {
    schermata = <Profile utente={utente} />
  } else if (sezione === 'premium') {
    schermata = <Premium utente={utente} />
  } else if (sezione === 'portafoglio') {
    schermata = <Wallet />
  } else if (sezione === 'annuncio' && seg[2]) {
    schermata = <JobDetail id={seg[2]} utente={utente} />
  } else if (sezione === 'pro' && seg[2]) {
    schermata = <UserProfile id={seg[2]} />
  } else {
    schermata = ePro ? <Discover utente={utente} /> : <MyAds utente={utente} />
  }

  const attiva = (t: Tab) =>
    route === t.rotta || (t.rotta === '/app/scopri' && (route === '/app' || route === '/app/'))

  return (
    <div className="app">
      <main className="app-main">{schermata}</main>
      <nav className="tabbar">
        {tabs.map((t) => (
          <button
            key={t.rotta}
            className={`tab ${attiva(t) ? 'active' : ''} ${t.prominente ? 'prominente' : ''}`}
            onClick={() => nav(t.rotta)}
          >
            <Icon nome={t.icona} size={t.prominente ? 26 : 22} />
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
      <DemoPill />
      <ToastHost />
    </div>
  )
}

/** Controlli demo: fai avanzare il tempo per vedere aste e flussi concludersi. */
function DemoPill() {
  const [aperto, setAperto] = useState(false)
  return (
    <div className="demo-pill-wrap">
      {aperto && (
        <div className="demo-pop card">
          <strong className="small">Modalità demo</strong>
          <p className="muted small">
            Tutto è simulato in locale. Fai avanzare il tempo per chiudere le aste e veder progredire lavori, pagamenti e
            feedback.
          </p>
          <div className="demo-bottoni">
            <button className="btn small secondary" onClick={() => demoAvanzaOre(1)}>
              +1 ora
            </button>
            <button className="btn small secondary" onClick={() => demoAvanzaOre(8)}>
              +8 ore
            </button>
            <button className="btn small secondary" onClick={() => demoAvanzaOre(24)}>
              +24 ore
            </button>
          </div>
        </div>
      )}
      <button className={`demo-pill ${aperto ? 'aperto' : ''}`} onClick={() => setAperto(!aperto)}>
        ⏩ Demo
      </button>
    </div>
  )
}
