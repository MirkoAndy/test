# Ribasso — Il lavoro giusto, al prezzo giusto 🔨

**Ribasso** è un marketplace di lavori basato su **aste al ribasso**: un cliente (il *richiedente*)
pubblica un annuncio per qualsiasi lavoro — imbiancare casa, un trasloco, un logo — con un budget
massimo; per un tempo limitato i professionisti in zona rilanciano al ribasso e chi offre il prezzo
più basso si aggiudica l'appalto (l'*aggiudicante*). Chi vuole può chiudere l'asta all'istante con
**«Prendi subito il lavoro»** a un prezzo fuori mercato.

Questa repository contiene una **demo completa e funzionante** in forma di **PWA**: lo stesso
codice è sia **sito web** sia **app installabile** su smartphone (Aggiungi a schermata Home).
Tutta la piattaforma è simulata in locale — professionisti, offerte, pagamenti e dispute — così da
poter provare **ogni flusso end-to-end senza backend**.

---

## Come provarla

```bash
npm install
npm run dev          # sviluppo → http://localhost:5173
npm run build        # build di produzione in dist/
npm run preview      # serve la build → http://localhost:4173
```

La cartella `dist/` è statica: si pubblica così com'è su GitHub Pages, Netlify, Vercel o qualsiasi
hosting. Aprendola da smartphone si può installare come app (PWA con manifest e service worker).

> **Modalità demo** — in basso a destra c'è il pulsante **⏩ Demo**: fa avanzare il tempo (+1/+8/+24
> ore) per veder chiudere le aste e progredire lavori, pagamenti e feedback senza aspettare.
> I "professionisti" e i "clienti" che incontri sono bot simulati che fanno offerte, depositano
> fondi, completano lavori, aprono dispute e lasciano recensioni.

## Il flusso completo (come da concept)

| Fase | Cosa succede |
|---|---|
| **1. Profilazione** | All'iscrizione un form inquadra l'utente: categorie (max 4), competenze, raggio di lavoro, compenso minimo, bio e social. Un imbianchino **non vedrà mai** annunci di traslochi o grafica, e viceversa. |
| **2. Annuncio** | Il richiedente pubblica il lavoro con **budget massimo (forfait)**, prezzo **«Prendi subito»** (suggerito: 55% del budget) e durata dell'asta (4/8/24/48 ore). Opzioni: acconto 30/70, urgente, ricorsivo. |
| **3. Asta al ribasso** | Per la durata scelta i professionisti rilanciano al ribasso (tipo eBay). Alla scadenza vince **l'offerta più bassa**; il richiedente può anche aggiudicare prima, scegliendo **in base ai feedback**; oppure un professionista chiude tutto con **Prendi subito** al prezzo fuori mercato. |
| **4. Scoperta (swipe)** | I professionisti sfogliano gli annunci matchati con **swipe stile Tinder** (← passa, → salva, tocco = dettaglio completo con offerta e Prendi subito), ordinati per match score e **geolocalizzazione**. |
| **5. Custodia (escrow)** | Come PayPal: il richiedente **deposita** l'importo sull'app, che lo trattiene. Rilascio con **codice di sblocco** (modello Deliveroo/PayPal), in unica soluzione o **30% all'avvio + 70% a fine lavori**. |
| **6a. Soddisfatto** | Il cliente conferma con il codice → l'app rilascia il pagamento **trattenendo la commissione** (12%, 8% per i Premium — modello Satispay) → entrambi sono esortati a lasciare un **feedback a stelline**. |
| **6b. Non soddisfatto** | Si apre la **disputa**: motivo + **foto obbligatorie** (anti-truffa) + proposta economica. Negoziazione con controproposte; se non c'è accordo interviene la **mediazione di Ribasso** con una proposta equa. Ad accordo raggiunto: rilascio parziale al professionista e **rimborso parziale** al cliente, poi feedback. |
| **7. Fiducia** | Profili pubblici con rating medio, recensioni verificate per lavoro, lavori completati e **link social (LinkedIn, Instagram, TikTok, sito)**. |

## Revenue model

1. **Commissione sulle transazioni** (12% standard, 8% Premium), trattenuta solo a lavoro pagato —
   visibile in ogni transazione del portafoglio.
2. **Ribasso Premium** (14,99 €/mese, modello Tinder): suggerimenti **AI** con spiegazione del
   match, **annunci ricorsivi in anteprima esclusiva** (es. pulizie settimanali), commissioni
   ridotte e badge sul profilo.

## Architettura della demo

```
src/
├── lib/
│   ├── types.ts        # modello di dominio (Utente, Lavoro, Offerta, Escrow, Disputa…)
│   ├── store.ts        # stato + azioni + MOTORE: aste, bot, escrow, dispute, mediazione, AI
│   ├── seed.ts         # mondo demo: 15 professionisti bot, clienti, annunci, recensioni
│   ├── categories.ts   # 12 categorie di lavoro con competenze
│   ├── geo.ts          # geolocalizzazione, distanze haversine, città
│   ├── router.ts       # routing hash-based (funziona ovunque, anche da file://)
│   └── …
├── components/         # SwipeDeck (Tinder), Stars, Countdown, Sheet, Toast, FotoUploader…
└── screens/            # Landing (sito), Onboarding, Scopri, Dettaglio, Pubblica, Annunci,
                        # Lavori, Profilo, Profilo pubblico, Portafoglio, Premium
```

- **Stack**: React 18 + TypeScript + Vite, zero dipendenze UI: design system custom in CSS
  (stile Apple: SF system font, glassmorphism, bordi morbidi).
- **Persistenza**: `localStorage` — nessun dato lascia il dispositivo.
- **Verifiche**: `scripts/smoke.ts` (42 controlli sul motore: aste, escrow, dispute, mediazione,
  premium) e `scripts/render-check.ts` (render di tutte le schermate in tutti gli stati):

```bash
npx esbuild scripts/smoke.ts --bundle --format=esm --platform=node --outfile=/tmp/smoke.mjs && node /tmp/smoke.mjs
npx esbuild scripts/render-check.ts --bundle --format=cjs --platform=node --jsx=automatic --outfile=/tmp/render.cjs && node /tmp/render.cjs
```

## Dalla demo alla produzione

La demo implementa fedelmente **prodotto e UX**; pagamenti, utenti e notifiche sono simulati.
Il percorso per il prodotto reale (backend, pagamenti veri con PSP/escrow conformi, KYC, push,
AI di matching, antifrode, GDPR) è descritto in **[docs/ARCHITETTURA.md](docs/ARCHITETTURA.md)**.
