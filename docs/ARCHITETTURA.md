# Ribasso — Architettura per la produzione

Questo documento descrive come portare la demo a un prodotto reale (app iOS/Android + sito web),
mantenendo lo stesso modello di dominio già implementato in `src/lib/types.ts`.

## 1. Vista d'insieme

```
┌────────────┐   ┌─────────────┐   ┌──────────────────────────────┐
│ App mobile │   │  Web app    │   │ Backend API (NestJS/Fastify) │
│ React      │──▶│ Next.js     │──▶│  - Auth (OTP + OAuth)        │
│ Native     │   │ (stessa UI) │   │  - Annunci & Aste (realtime) │
└────────────┘   └─────────────┘   │  - Matching & Feed           │
                                   │  - Escrow orchestration      │
       WebSocket / push ◀──────────│  - Dispute & Mediazione      │
                                   │  - Feedback & Reputazione    │
                                   └──────┬───────────┬───────────┘
                                          │           │
                              ┌───────────▼──┐   ┌────▼─────────────┐
                              │ PostgreSQL + │   │ PSP marketplace  │
                              │ Redis (aste) │   │ Stripe Connect / │
                              │ S3 (foto)    │   │ MangoPay (escrow,│
                              └──────────────┘   │ KYC, payout)     │
                                                 └──────────────────┘
```

- **Frontend**: la UI della demo è già component-based; si porta in **React Native** (o si
  mantiene PWA) per le app store e in **Next.js** per il sito, riusando design system e flussi.
- **Realtime**: le aste richiedono WebSocket (offerte live, countdown, "sei stato superato").
  Redis con TTL/sorted set per lo stato live; chiusura asta affidata a un job scheduler
  (es. BullMQ) che garantisce l'aggiudicazione **esattamente una volta** alla scadenza.

## 2. Pagamenti ed escrow (il punto critico)

Trattenere fondi di terzi richiede una licenza di istituto di pagamento. **Non si implementa in
proprio**: si usa un PSP con conti di marketplace che fornisce l'escrow "as a service":

- **Stripe Connect** (accounts Express per i professionisti, KYC incluso):
  - il cliente paga al deposito → `PaymentIntent` con **separate charges & transfers**;
  - i fondi restano sul platform balance; al rilascio (codice di sblocco) si esegue un
    `Transfer` al connected account del professionista **al netto della commissione**
    (`application_fee`); acconto 30/70 = due transfer;
  - disputa risolta con accordo = transfer parziale + `Refund` parziale al cliente.
- Alternativa europea: **MangoPay** (e-wallet con escrow nativo, pensato per marketplace).
- Il **codice di sblocco** della demo diventa una conferma forte (codice via SMS/push + 3DS dove
  serve), stessa UX già implementata.

## 3. Schema dati (estensione di quello demo)

Tabelle principali: `users`, `professional_profiles` (categorie, raggio, tariffa minima, social,
KYC status), `listings` (budget_max, instant_price, expires_at, escrow_mode), `bids`,
`awards`, `escrows` (psp_payment_id, stato), `releases` (acconto/saldo/accordo/rimborso),
`disputes` + `dispute_offers` + `dispute_evidence` (foto S3 con hash/EXIF per antifrode),
`reviews` (vincolate 1-a-1 col lavoro concluso → recensioni solo verificate), `transactions`,
`subscriptions` (Premium), `devices` (push token).

Indici geografici (PostGIS) su `listings(location)` e `professional_profiles(location, radius)`
per il feed geolocalizzato.

## 4. Matching e AI (Premium)

1. **Filtro duro** (già in demo): categoria ∈ categorie del professionista, distanza ≤ raggio.
2. **Ranking**: score = pertinenza testo (embedding di titolo+descrizione vs bio+competenze),
   distanza, budget vs tariffa minima, reputazione del cliente, urgenza/ricorsività.
3. **Premium**: feed potenziato con spiegazione del match in linguaggio naturale (LLM su template,
   come i "motivi" della demo), anteprima esclusiva dei lavori **ricorsivi**, alert push su match
   ≥ soglia, suggerimento del **prezzo di offerta ottimale** stimato dallo storico delle aste.

## 5. Fiducia e antifrode

- Recensioni **solo da transazioni reali** (vincolo FK su lavoro pagato/risolto) — stelle + testo.
- Foto obbligatorie nelle dispute con metadati/efemeridi e hash (anti riuso), già nel flusso demo.
- Verifiche profilo: documento (KYC del PSP), telefono, link social (LinkedIn/Instagram/TikTok).
- Limiti anti-collusione sulle aste (stesso device/IP che si auto-aggiudica), rate limiting,
  moderazione annunci (classificatore + revisione umana).
- Mediazione: prima automatizzata (proposta equa calcolata, come in demo), poi operatore umano
  con SLA per i casi non risolti; audit log completo della trattativa.

## 6. Conformità

- **GDPR**: data minimization, export/cancellazione account, DPA con PSP e cloud.
- **DSA/marketplace**: tracciabilità dei professionisti (Dac7), termini chiari sulla mediazione.
- Fatturazione commissioni: ricevute automatiche (Stripe Tax / Fatturazione elettronica IT).

## 7. Roadmap suggerita

| Fase | Contenuto |
|---|---|
| **MVP (8-10 settimane)** | Auth OTP, profilo+categorie, pubblicazione, asta realtime, Prendi subito, Stripe Connect (deposito/rilascio singolo), feedback, push. Una città pilota. |
| **V1** | Acconto 30/70, dispute con mediazione assistita, Premium (abbonamento + feed AI), annunci ricorsivi, portafoglio/fatture. |
| **V2** | Suggerimento prezzo AI, badge e livelli reputazione, chat in-app, assicurazione sul lavoro, espansione multi-città. |

## 8. KPI del modello di business

- Take rate effettivo (commissione media incassata / GMV) — demo: 12% standard, 8% Premium.
- Conversione asta → aggiudicazione → pagamento; % "Prendi subito" (proxy di pricing corretto).
- Tasso dispute e % risolte senza operatore; NPS post-transazione; LTV abbonati Premium.
