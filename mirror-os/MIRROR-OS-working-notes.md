# MIRROR OS — Working notes

Pagina di lavoro che accompagna il deck "MIRROR OS · Concept v1.0" (41 slide: 35 principali + 6 di appendice).
Tutto ciò che è segnato `[TO VALIDATE]` o `[__]` è un'ipotesi, non un dato.

---

## 10 decisioni di design prese

1. **Palette dominata da nero e avorio.** Mirror Black e Warm Ivory reggono l'80% del deck; Apple Red compare solo come alert o "serve un umano". Ogni slide ha al massimo un elemento rosso.
2. **Una sola slide di accento in Deep Burgundy (08, Gap Filler).** "Empty slots expire" è l'idea economica più forte, quindi ha lo statement visivo più forte.
3. **Playfair Display + Hanken Grotesk.** Serif ad alto contrasto per headline e numeri, grotesk pulito per etichette e UI. Niente Inter, per evitare l'effetto "SaaS generico".
4. **Materiali resi in CSS/SVG, non stock photo.** Specchio fumé/bronzo, filo champagne, pietra chiara. Nelle note di ogni slide c'è la direzione per sostituirli con fotografia reale (still life, interni MIRROR MIRROR).
5. **La mela è un segno, non una storia.** Compare solo su cover e closing, piccola, con foglia in metallo champagne. Nessun riferimento esplicito alla fiaba.
6. **Etichetta di fase su ogni modulo** (MVP, V1, V2, V3, FUTURE · PHASE TBD). Chi guarda sa sempre cosa esiste come concept e cosa arriva dopo.
7. **Mockup mobile-first con progressive disclosure.** Prima ciò che richiede attenzione, poi il dettaglio. Nessuna dashboard con grafici decorativi; l'unico grafico è una linea di trend e un istogramma di cassa.
8. **Microcopy operativo in italiano** (WhatsApp, Google Sheet, email al commercialista), narrativa in inglese. Il deck regge un investitore internazionale e un titolare italiano.
9. **Zero numeri di traction, ROI o prezzi.** La scorecard (28) e il business model (32) usano solo placeholder; i numeri nei mockup sono dichiarati "simulated".
10. **Il controllo umano è un sistema visivo ricorrente.** Escalation in rosso, approvazioni come pulsanti espliciti (Approve / Edit / Handle myself), matrice di autonomia (24) e matrice permessi (A2).

## 10 ipotesi da validare

1. Il titolare spende una quota rilevante della giornata in micro-task operativi (time-tracking di 2 settimane prima del pilota).
2. Una parte significativa degli slot vuoti e delle cancellazioni è recuperabile con outreach mirato e consensuale.
3. Le clienti accettano conferme e spostamenti gestiti da un assistente AI dichiarato come tale, senza calo di soddisfazione.
4. La "deriva dal proprio ciclo" predice l'abbandono meglio di una soglia fissa (es. 90 giorni).
5. Un upsell basato su segnali reali delle conversazioni converte senza essere percepito come pressione commerciale.
6. Il Google Sheet modificabile è accettato come output finanziario principale (vs dashboard chiusa).
7. Il commercialista è disposto a ricevere comunicazioni e documenti preparati dal sistema.
8. "Nessuna migrazione" è un argomento d'acquisto decisivo per altri centri.
9. Il valore percepito arriva entro le prime settimane, nonostante i tempi di attivazione delle integrazioni.
10. Esiste una disponibilità a pagare compatibile con il modello a livelli (base + sede/uso + skill + onboarding).

## 10 domande tecniche da risolvere prima dello sviluppo

1. Le API di Altegio coprono lettura e scrittura di appuntamenti, clienti, pagamenti e prodotti? Webhook in tempo reale o polling? Limiti di rate?
2. WhatsApp Business Platform: quale BSP, quali template da approvare, come gestire opt-in e finestre di messaggistica?
3. Identity resolution: come riconciliare la stessa cliente tra Altegio, WhatsApp, banca e social (telefono, email, regole di merge, revisione umana)?
4. Slot locking: come evitare doppie prenotazioni quando più clienti accettano la stessa offerta e Altegio non espone un lock nativo?
5. Policy engine: regole dichiarative versionate, e chi può modificarle? Come si testano le soglie di autonomia?
6. Audit log: formato, immutabilità (append-only, hash chain), tempi di conservazione e accesso in caso di contestazione.
7. Quale modello LLM per quale compito, con quale fallback, costo per centro e latenza accettabile su WhatsApp?
8. Sandbox delle Skill: replay su dati storici anonimizzati o ambiente shadow? Come si misura il risultato prima dell'approvazione?
9. Open banking in Italia: quale provider PSD2, consenso, rinnovo periodico, categorie di dati disponibili?
10. Architettura multi-tenant fin dall'MVP o single-tenant con refactoring previsto? Dove risiedono i dati (UE) e con quale cifratura?

## 10 KPI da misurare nel pilota MIRROR MIRROR

| # | KPI | Come si misura |
|---|-----|----------------|
| 1 | Ore di reception risparmiate / settimana | Time study prima e durante il pilota |
| 2 | Tasso di conferma automatica | Conferme chiuse senza intervento umano ÷ conferme inviate |
| 3 | Slot recuperati | Slot vuoti o cancellati riprenotati tramite Gap Filler |
| 4 | Ricavo recuperato | Incassato effettivo sugli slot recuperati |
| 5 | Tasso di no-show | No-show ÷ appuntamenti prenotati |
| 6 | Tasso di riprenotazione | Clienti tornate entro il proprio ciclo abituale |
| 7 | Tempo di chiusura amministrativa | Minuti dall'ultima cliente alla giornata chiusa e riconciliata |
| 8 | Discrepanze rilevate | Differenze tra foglio, POS e banca, e tempo medio di risoluzione |
| 9 | Escalation umane | Numero e motivo; quota gestita entro un tempo target |
| 10 | Tasso di errore AI | Azioni errate ÷ azioni totali, dopo revisione umana campionaria |

Ogni KPI parte con `[BASELINE]` misurata prima dell'accensione, un `[TARGET]` concordato prima del lancio e un `[ACTUAL]` registrato durante il pilota.
