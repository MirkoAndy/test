// ─── Modello di dominio di Ribasso ───────────────────────────────────────────

export type Ruolo = 'richiedente' | 'professionista' | 'entrambi'

export type CategoriaId =
  | 'imbiancatura'
  | 'traslochi'
  | 'grafica'
  | 'idraulica'
  | 'elettricista'
  | 'giardinaggio'
  | 'pulizie'
  | 'falegnameria'
  | 'ripetizioni'
  | 'fotografia'
  | 'web'
  | 'climatizzazione'

export interface Categoria {
  id: CategoriaId
  nome: string
  emoji: string
  gradiente: [string, string]
  competenze: string[]
}

export interface SocialLinks {
  linkedin?: string
  instagram?: string
  tiktok?: string
  sito?: string
}

export interface Utente {
  id: string
  nome: string
  emoji: string
  ruolo: Ruolo
  citta: string
  lat: number
  lng: number
  bio: string
  categorie: CategoriaId[]
  competenze: string[]
  raggioKm: number
  tariffaMinima: number
  social: SocialLinks
  premium: boolean
  premiumDal?: number
  bot: boolean
  lavoriCompletati: number
  iscrittoIl: number
}

export interface Recensione {
  id: string
  lavoroId: string
  autoreId: string
  destinatarioId: string
  stelle: number // 1..5
  commento: string
  data: number
  ruoloAutore: 'richiedente' | 'professionista'
}

export interface Offerta {
  id: string
  lavoroId: string
  proId: string
  importo: number
  messaggio?: string
  data: number
}

/**
 * Ciclo di vita di un annuncio:
 *  in-asta → aggiudicato (in attesa di deposito) → in-corso (fondi in escrow)
 *  → completato-da-confermare (il pro segna fine lavori)
 *  → pagato  |  in-disputa → risolto
 *  in-asta senza offerte alla scadenza → scaduto
 */
export type StatoLavoro =
  | 'in-asta'
  | 'scaduto'
  | 'aggiudicato'
  | 'in-corso'
  | 'completato-da-confermare'
  | 'pagato'
  | 'in-disputa'
  | 'risolto'
  | 'annullato'

export interface Rilascio {
  tipo: 'acconto' | 'saldo' | 'accordo' | 'rimborso'
  importo: number
  data: number
}

export interface Escrow {
  depositatoIl?: number
  /** Codice di sblocco mostrato al richiedente (modello Deliveroo/PayPal). */
  codice: string
  accontoRilasciato: boolean
  rilasci: Rilascio[]
  /** Percentuale trattenuta dall'app sul compenso del professionista. */
  commissionePerc: number
}

export interface PropostaDisputa {
  da: string
  importo: number
  nota?: string
  data: number
}

export interface Disputa {
  apertaIl: number
  motivo: string
  foto: string[]
  proposte: PropostaDisputa[]
  stato: 'negoziazione' | 'mediazione' | 'accordo'
  /** Proposta del mediatore (l'app) quando stato = mediazione. */
  importoMediazione?: number
  mediazioneTesto?: string
  accettatoDa: string[]
  importoAccordo?: number
}

export interface Lavoro {
  id: string
  titolo: string
  descrizione: string
  categoria: CategoriaId
  richiedenteId: string
  citta: string
  lat: number
  lng: number
  budgetMax: number
  /** Prezzo "Prendi subito il lavoro": fuori mercato, al ribasso. */
  prezzoSubito: number
  durataOre: number
  creatoIl: number
  scadeIl: number
  stato: StatoLavoro
  offerte: Offerta[]
  aggiudicatarioId?: string
  prezzoFinale?: number
  aggiudicatoIl?: number
  /** Aggiudicazione immediata tramite "Prendi subito". */
  presoSubito?: boolean
  /** Opzione 30% all'avvio, 70% a fine lavori. */
  acconto30: boolean
  urgente: boolean
  /** Lavoro ricorsivo (in anteprima per gli utenti Premium). */
  ricorsivo: boolean
  fotoConsegna: string[]
  escrow?: Escrow
  disputa?: Disputa
  feedbackLasciato: { richiedente: boolean; professionista: boolean }
  /** Timestamp della prossima azione automatica del bot controparte (demo). */
  botProssimaAzione?: number
}

export interface Transazione {
  id: string
  data: number
  descrizione: string
  /** Positivo = entrata per l'utente corrente, negativo = uscita. */
  importo: number
  tipo: 'deposito' | 'rilascio' | 'commissione' | 'rimborso' | 'abbonamento' | 'accredito'
  lavoroId?: string
}

export interface StatoApp {
  versione: number
  utenteId: string | null
  utenti: Utente[]
  lavori: Lavoro[]
  recensioni: Recensione[]
  transazioni: Transazione[]
  preferiti: string[]
  scartati: string[]
  /** Offset del "tempo demo" rispetto all'orologio reale (fast-forward). */
  clockOffset: number
  ultimoTick: number
  onboardingCompletato: boolean
}

export interface RatingInfo {
  media: number
  totale: number
}
