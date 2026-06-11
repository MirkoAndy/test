import type {
  CategoriaId,
  Disputa,
  Lavoro,
  Offerta,
  RatingInfo,
  Recensione,
  Ruolo,
  SocialLinks,
  StatoApp,
  Transazione,
  Utente,
} from './types'
import { generaSeed, COMMENTI_FEEDBACK_BOT, COMMENTI_FEEDBACK_BOT_MEDI } from './seed'
import { distanzaKm } from './geo'
import { uid, fmtEur } from './format'
import { categoria } from './categories'
import { fotoPlaceholder } from './media'
import { toast } from './toast'

export const COMMISSIONE_STANDARD = 12
export const COMMISSIONE_PREMIUM = 8
export const PREZZO_PREMIUM = 14.99

const STORAGE_KEY = 'ribasso_stato_v1'

// ─── Stato e sottoscrizioni ──────────────────────────────────────────────────

function statoIniziale(): StatoApp {
  return {
    versione: 1,
    utenteId: null,
    utenti: [],
    lavori: [],
    recensioni: [],
    transazioni: [],
    preferiti: [],
    scartati: [],
    clockOffset: 0,
    ultimoTick: Date.now(),
    onboardingCompletato: false,
  }
}

function carica(): StatoApp {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return statoIniziale()
    const parsed = JSON.parse(raw) as StatoApp
    return { ...statoIniziale(), ...parsed }
  } catch {
    return statoIniziale()
  }
}

let state: StatoApp = carica()
const listeners = new Set<() => void>()

function salva(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota piena: lo stato resta in memoria */
  }
}

function commit(): void {
  state = { ...state }
  salva()
  listeners.forEach((l) => l())
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getState(): StatoApp {
  return state
}

/** Orologio dell'app: tempo reale + offset demo (fast-forward). */
export function adesso(): number {
  return Date.now() + state.clockOffset
}

// ─── Selettori ───────────────────────────────────────────────────────────────

export function utenteCorrente(): Utente | null {
  return state.utenti.find((u) => u.id === state.utenteId) ?? null
}

export function utenteById(id: string): Utente | undefined {
  return state.utenti.find((u) => u.id === id)
}

export function lavoroById(id: string): Lavoro | undefined {
  return state.lavori.find((l) => l.id === id)
}

export function ratingDi(userId: string): RatingInfo {
  const recs = state.recensioni.filter((r) => r.destinatarioId === userId)
  if (recs.length === 0) return { media: 0, totale: 0 }
  return { media: recs.reduce((s, r) => s + r.stelle, 0) / recs.length, totale: recs.length }
}

export function recensioniDi(userId: string): Recensione[] {
  return state.recensioni.filter((r) => r.destinatarioId === userId).sort((a, b) => b.data - a.data)
}

export function migliorOfferta(l: Lavoro): Offerta | undefined {
  if (l.offerte.length === 0) return undefined
  return [...l.offerte].sort((a, b) => a.importo - b.importo || a.data - b.data)[0]
}

export function offertaUtente(l: Lavoro, userId: string): Offerta | undefined {
  return l.offerte.find((o) => o.proId === userId)
}

export function offerteOrdinate(l: Lavoro): Offerta[] {
  return [...l.offerte].sort((a, b) => a.importo - b.importo || a.data - b.data)
}

export function commissionePercPer(pro: Utente | undefined): number {
  return pro?.premium ? COMMISSIONE_PREMIUM : COMMISSIONE_STANDARD
}

export function accontoRilasciato(l: Lavoro): number {
  return (l.escrow?.rilasci ?? []).filter((r) => r.tipo === 'acconto').reduce((s, r) => s + r.importo, 0)
}

export function totaleRilasciatoAlPro(l: Lavoro): number {
  return (l.escrow?.rilasci ?? [])
    .filter((r) => r.tipo !== 'rimborso')
    .reduce((s, r) => s + r.importo, 0)
}

// ─── Matching e feed ─────────────────────────────────────────────────────────

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function matchScore(u: Utente, l: Lavoro): number {
  if (!u.categorie.includes(l.categoria)) return 0
  const d = distanzaKm(u.lat, u.lng, l.lat, l.lng)
  if (d > u.raggioKm + 8) return 0
  let score = 55
  score += Math.max(0, 1 - d / Math.max(1, u.raggioKm)) * 20
  if (l.budgetMax >= u.tariffaMinima) score += 8
  else score -= 15
  const testo = (l.titolo + ' ' + l.descrizione).toLowerCase()
  const overlap = u.competenze.filter((c) => testo.includes(c.toLowerCase())).length
  score += Math.min(10, overlap * 4)
  const rc = ratingDi(l.richiedenteId)
  if (rc.media >= 4.5) score += 4
  if (l.ricorsivo) score += u.premium ? 8 : 0
  if (l.urgente) score += 2
  score += (hashStr(l.id + u.id) % 5) - 2
  return Math.max(5, Math.min(99, Math.round(score)))
}

export function motiviMatch(u: Utente, l: Lavoro): string[] {
  const out: string[] = []
  const cat = categoria(l.categoria)
  out.push(`Corrisponde alla tua categoria «${cat.nome}»`)
  const d = distanzaKm(u.lat, u.lng, l.lat, l.lng)
  out.push(`A ${d.toFixed(1).replace('.', ',')} km da te`)
  if (l.budgetMax >= u.tariffaMinima && u.tariffaMinima > 0) out.push('Budget sopra la tua tariffa minima')
  const testo = (l.titolo + ' ' + l.descrizione).toLowerCase()
  const skill = u.competenze.find((c) => testo.includes(c.toLowerCase()))
  if (skill) out.push(`Richiede la tua competenza «${skill}»`)
  if (l.ricorsivo) out.push('Lavoro ricorsivo: entrate stabili nel tempo')
  const rc = ratingDi(l.richiedenteId)
  if (rc.media >= 4.5) out.push(`Cliente affidabile ★ ${rc.media.toFixed(1).replace('.', ',')}`)
  return out
}

/** Annunci aperti e pertinenti per il professionista (deck di swipe). */
export function feedPerUtente(u: Utente): Lavoro[] {
  const t = adesso()
  return state.lavori
    .filter(
      (l) =>
        l.stato === 'in-asta' &&
        l.scadeIl > t &&
        l.richiedenteId !== u.id &&
        !state.scartati.includes(l.id) &&
        !state.preferiti.includes(l.id) &&
        !offertaUtente(l, u.id) &&
        (!l.ricorsivo || u.premium) &&
        matchScore(u, l) > 0
    )
    .sort((a, b) => matchScore(u, b) - matchScore(u, a))
}

export function ricorsiviNascosti(u: Utente): number {
  if (u.premium) return 0
  const t = adesso()
  return state.lavori.filter(
    (l) => l.stato === 'in-asta' && l.scadeIl > t && l.ricorsivo && u.categorie.includes(l.categoria) && l.richiedenteId !== u.id
  ).length
}

export function suggerimentiAI(u: Utente): { lavoro: Lavoro; score: number; motivi: string[] }[] {
  const t = adesso()
  const aperti = state.lavori.filter(
    (l) => l.stato === 'in-asta' && l.scadeIl > t && l.richiedenteId !== u.id && !offertaUtente(l, u.id)
  )
  const inLinea = aperti
    .filter((l) => matchScore(u, l) > 0)
    .map((l) => ({ lavoro: l, score: matchScore(u, l), motivi: motiviMatch(u, l) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
  if (inLinea.length > 0) return inLinea
  // Fallback: l'AI esplora oltre il profilo per non lasciare mai la vetrina vuota
  return aperti
    .map((l) => ({ l, d: distanzaKm(u.lat, u.lng, l.lat, l.lng) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4)
    .map(({ l, d }) => ({
      lavoro: l,
      score: 45 + (hashStr(l.id + u.id) % 10),
      motivi: [`Nuova opportunità a ${d.toFixed(1).replace('.', ',')} km da te`, 'Espandi le tue categorie per più match'],
    }))
}

export function annunciDi(userId: string): Lavoro[] {
  return state.lavori.filter((l) => l.richiedenteId === userId).sort((a, b) => b.creatoIl - a.creatoIl)
}

export function lavoriDelPro(userId: string): { attivi: Lavoro[]; vinti: Lavoro[]; chiusi: Lavoro[]; salvati: Lavoro[] } {
  const t = adesso()
  const attivi = state.lavori.filter((l) => l.stato === 'in-asta' && l.scadeIl > t && offertaUtente(l, userId))
  const vinti = state.lavori.filter(
    (l) => l.aggiudicatarioId === userId && ['aggiudicato', 'in-corso', 'completato-da-confermare', 'in-disputa'].includes(l.stato)
  )
  const chiusi = state.lavori.filter((l) => l.aggiudicatarioId === userId && ['pagato', 'risolto'].includes(l.stato))
  const salvati = state.lavori.filter((l) => state.preferiti.includes(l.id) && l.stato === 'in-asta' && l.scadeIl > t)
  return { attivi, vinti, chiusi, salvati: salvati.sort((a, b) => a.scadeIl - b.scadeIl) }
}

export function saldoUtente(): number {
  return state.transazioni.reduce((s, t) => s + t.importo, 0)
}

// ─── Azioni: profilo ─────────────────────────────────────────────────────────

export interface DatiOnboarding {
  nome: string
  emoji: string
  ruolo: Ruolo
  citta: string
  lat: number
  lng: number
  categorie: CategoriaId[]
  competenze: string[]
  raggioKm: number
  tariffaMinima: number
  bio: string
  social: SocialLinks
}

export function completaOnboarding(dati: DatiOnboarding): void {
  const t = Date.now()
  state.clockOffset = 0
  const io: Utente = {
    id: 'io',
    nome: dati.nome,
    emoji: dati.emoji,
    ruolo: dati.ruolo,
    citta: dati.citta,
    lat: dati.lat,
    lng: dati.lng,
    bio: dati.bio,
    categorie: dati.categorie,
    competenze: dati.competenze,
    raggioKm: dati.raggioKm,
    tariffaMinima: dati.tariffaMinima,
    social: dati.social,
    premium: false,
    bot: false,
    lavoriCompletati: 0,
    iscrittoIl: t,
  }
  const seed = generaSeed({ citta: dati.citta, lat: dati.lat, lng: dati.lng }, t)
  state.utenti = [io, ...seed.utenti]
  state.lavori = seed.lavori
  state.recensioni = seed.recensioni
  state.transazioni = []
  state.preferiti = []
  state.scartati = []
  state.utenteId = io.id
  state.onboardingCompletato = true
  state.ultimoTick = t
  commit()
}

export function aggiornaProfilo(patch: Partial<Utente>): void {
  const u = utenteCorrente()
  if (!u) return
  Object.assign(u, patch)
  commit()
}

export function attivaPremium(): void {
  const u = utenteCorrente()
  if (!u || u.premium) return
  u.premium = true
  u.premiumDal = adesso()
  state.transazioni.unshift({
    id: uid('tx'),
    data: adesso(),
    descrizione: 'Abbonamento Ribasso Premium (mensile)',
    importo: -PREZZO_PREMIUM,
    tipo: 'abbonamento',
  })
  toast('Benvenuto in Ribasso Premium ✨', 'premium')
  commit()
}

export function disattivaPremium(): void {
  const u = utenteCorrente()
  if (!u) return
  u.premium = false
  toast('Abbonamento Premium disattivato')
  commit()
}

export function resetDemo(): void {
  state = statoIniziale()
  salva()
  listeners.forEach((l) => l())
}

// ─── Azioni: annunci e asta ──────────────────────────────────────────────────

export interface NuovoAnnuncio {
  titolo: string
  descrizione: string
  categoria: CategoriaId
  budgetMax: number
  prezzoSubito: number
  durataOre: number
  acconto30: boolean
  urgente: boolean
  ricorsivo: boolean
}

export function pubblicaAnnuncio(input: NuovoAnnuncio): string | null {
  const u = utenteCorrente()
  if (!u) return null
  const t = adesso()
  const lavoro: Lavoro = {
    id: uid('lav'),
    titolo: input.titolo.trim(),
    descrizione: input.descrizione.trim(),
    categoria: input.categoria,
    richiedenteId: u.id,
    citta: u.citta,
    lat: u.lat,
    lng: u.lng,
    budgetMax: input.budgetMax,
    prezzoSubito: input.prezzoSubito,
    durataOre: input.durataOre,
    creatoIl: t,
    scadeIl: t + input.durataOre * 3600000,
    stato: 'in-asta',
    offerte: [],
    acconto30: input.acconto30,
    urgente: input.urgente,
    ricorsivo: input.ricorsivo,
    fotoConsegna: [],
    feedbackLasciato: { richiedente: false, professionista: false },
  }
  state.lavori.unshift(lavoro)
  toast('Annuncio pubblicato: l\'asta al ribasso è partita 🔨', 'successo')
  commit()
  return lavoro.id
}

export function annullaAnnuncio(id: string): void {
  const l = lavoroById(id)
  if (!l || l.stato !== 'in-asta') return
  l.stato = 'annullato'
  toast('Annuncio annullato')
  commit()
}

export function ripubblicaAnnuncio(id: string): void {
  const l = lavoroById(id)
  if (!l || l.stato !== 'scaduto') return
  const t = adesso()
  l.stato = 'in-asta'
  l.offerte = []
  l.creatoIl = t
  l.scadeIl = t + l.durataOre * 3600000
  toast('Annuncio ripubblicato: nuova asta avviata', 'successo')
  commit()
}

export function faiOfferta(lavoroId: string, importo: number, messaggio?: string): { ok: boolean; errore?: string } {
  const u = utenteCorrente()
  const l = lavoroById(lavoroId)
  if (!u || !l) return { ok: false, errore: 'Annuncio non trovato' }
  if (l.stato !== 'in-asta' || l.scadeIl <= adesso()) return { ok: false, errore: "L'asta è chiusa" }
  if (l.richiedenteId === u.id) return { ok: false, errore: 'Non puoi fare offerte sul tuo annuncio' }
  if (!Number.isFinite(importo) || importo < 5) return { ok: false, errore: 'Importo non valido (minimo 5 €)' }
  if (importo > l.budgetMax) return { ok: false, errore: `L'offerta deve essere entro il budget di ${fmtEur(l.budgetMax)}` }
  const migliore = migliorOfferta(l)
  if (migliore && migliore.proId !== u.id && importo >= migliore.importo)
    return { ok: false, errore: `Devi offrire meno di ${fmtEur(migliore.importo)} (offerta attuale)` }
  if (migliore && migliore.proId === u.id && importo >= migliore.importo)
    return { ok: false, errore: 'Sei già in testa: puoi solo ribassare la tua offerta' }
  l.offerte = l.offerte.filter((o) => o.proId !== u.id)
  l.offerte.push({ id: uid('off'), lavoroId: l.id, proId: u.id, importo: Math.round(importo), messaggio, data: adesso() })
  toast(`Offerta inviata: ${fmtEur(Math.round(importo))} — sei in testa 🏁`, 'successo')
  commit()
  return { ok: true }
}

function pianifica(l: Lavoro, secMin: number, secMax: number): void {
  l.botProssimaAzione = adesso() + (secMin + Math.random() * (secMax - secMin)) * 1000
}

function aggiudicaA(l: Lavoro, proId: string, prezzo: number, presoSubito = false): void {
  l.stato = 'aggiudicato'
  l.aggiudicatarioId = proId
  l.prezzoFinale = prezzo
  l.aggiudicatoIl = adesso()
  l.presoSubito = presoSubito
  const owner = utenteById(l.richiedenteId)
  if (owner?.bot) pianifica(l, 18, 40)
}

/** "Prendi subito il lavoro": aggiudicazione immediata al prezzo fuori mercato. */
export function prendiSubito(lavoroId: string): { ok: boolean; errore?: string } {
  const u = utenteCorrente()
  const l = lavoroById(lavoroId)
  if (!u || !l) return { ok: false, errore: 'Annuncio non trovato' }
  if (l.stato !== 'in-asta' || l.scadeIl <= adesso()) return { ok: false, errore: "L'asta è chiusa" }
  if (l.richiedenteId === u.id) return { ok: false, errore: 'È il tuo annuncio' }
  aggiudicaA(l, u.id, l.prezzoSubito, true)
  toast(`Lavoro aggiudicato subito a ${fmtEur(l.prezzoSubito)} ⚡️`, 'successo')
  commit()
  return { ok: true }
}

/** Il richiedente aggiudica manualmente a un'offerta scelta (anche in base al feedback). */
export function aggiudicaOfferta(lavoroId: string, offertaId: string): void {
  const u = utenteCorrente()
  const l = lavoroById(lavoroId)
  if (!u || !l || l.richiedenteId !== u.id || l.stato !== 'in-asta') return
  const off = l.offerte.find((o) => o.id === offertaId)
  if (!off) return
  aggiudicaA(l, off.proId, off.importo)
  const pro = utenteById(off.proId)
  toast(`Lavoro aggiudicato a ${pro?.nome ?? 'professionista'} per ${fmtEur(off.importo)}`, 'successo')
  commit()
}

// ─── Azioni: escrow e pagamenti ──────────────────────────────────────────────

function genCodice(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function registraRilascioAlPro(l: Lavoro, importoLordo: number, tipo: 'acconto' | 'saldo' | 'accordo', t: number): void {
  const pro = utenteById(l.aggiudicatarioId ?? '')
  const perc = l.escrow?.commissionePerc ?? COMMISSIONE_STANDARD
  l.escrow?.rilasci.push({ tipo, importo: importoLordo, data: t })
  if (pro && !pro.bot) {
    const commissione = Math.round(importoLordo * perc) / 100
    state.transazioni.unshift({
      id: uid('tx'),
      data: t,
      descrizione: `Pagamento ricevuto — ${l.titolo}`,
      importo: importoLordo,
      tipo: 'rilascio',
      lavoroId: l.id,
    })
    state.transazioni.unshift({
      id: uid('tx'),
      data: t,
      descrizione: `Commissione Ribasso ${perc}% — ${l.titolo}`,
      importo: -commissione,
      tipo: 'commissione',
      lavoroId: l.id,
    })
  }
}

export function depositaEscrow(lavoroId: string): void {
  const u = utenteCorrente()
  const l = lavoroById(lavoroId)
  if (!u || !l || l.richiedenteId !== u.id || l.stato !== 'aggiudicato' || !l.aggiudicatarioId || !l.prezzoFinale) return
  depositaEscrowInterno(l, false)
  toast(`${fmtEur(l.prezzoFinale)} depositati in custodia: il professionista può iniziare 🔒`, 'successo')
  commit()
}

function depositaEscrowInterno(l: Lavoro, botCliente: boolean): void {
  const pro = utenteById(l.aggiudicatarioId ?? '')
  const t = adesso()
  l.escrow = {
    depositatoIl: t,
    codice: genCodice(),
    accontoRilasciato: false,
    rilasci: [],
    commissionePerc: commissionePercPer(pro),
  }
  l.stato = 'in-corso'
  const owner = utenteById(l.richiedenteId)
  if (owner && !owner.bot && l.prezzoFinale) {
    state.transazioni.unshift({
      id: uid('tx'),
      data: t,
      descrizione: `Deposito in custodia — ${l.titolo}`,
      importo: -l.prezzoFinale,
      tipo: 'deposito',
      lavoroId: l.id,
    })
  }
  if (botCliente && pro && !pro.bot) {
    toast(`Il cliente ha depositato ${fmtEur(l.prezzoFinale ?? 0)} in custodia: puoi iniziare «${l.titolo}» 🔒`, 'successo')
  }
  if (pro?.bot) pianifica(l, 35, 70)
}

export function rilasciaAcconto(lavoroId: string, codice: string): { ok: boolean; errore?: string } {
  const u = utenteCorrente()
  const l = lavoroById(lavoroId)
  if (!u || !l || !l.escrow || l.richiedenteId !== u.id || l.stato !== 'in-corso') return { ok: false, errore: 'Operazione non disponibile' }
  if (!l.acconto30 || l.escrow.accontoRilasciato) return { ok: false, errore: 'Acconto già rilasciato' }
  if (codice.trim() !== l.escrow.codice) return { ok: false, errore: 'Codice di sblocco errato' }
  const t = adesso()
  const acconto = Math.round((l.prezzoFinale ?? 0) * 0.3)
  l.escrow.accontoRilasciato = true
  registraRilascioAlPro(l, acconto, 'acconto', t)
  toast(`Acconto del 30% (${fmtEur(acconto)}) rilasciato al professionista`, 'successo')
  commit()
  return { ok: true }
}

export function segnaCompletato(lavoroId: string, foto: string[]): void {
  const u = utenteCorrente()
  const l = lavoroById(lavoroId)
  if (!u || !l || l.aggiudicatarioId !== u.id || l.stato !== 'in-corso') return
  l.stato = 'completato-da-confermare'
  l.fotoConsegna = foto
  const owner = utenteById(l.richiedenteId)
  if (owner?.bot) pianifica(l, 25, 55)
  toast('Lavoro segnato come completato: in attesa di conferma del cliente', 'successo')
  commit()
}

export function confermaEPaga(lavoroId: string, codice: string): { ok: boolean; errore?: string } {
  const u = utenteCorrente()
  const l = lavoroById(lavoroId)
  if (!u || !l || !l.escrow || l.richiedenteId !== u.id) return { ok: false, errore: 'Operazione non disponibile' }
  if (!['completato-da-confermare', 'in-corso'].includes(l.stato)) return { ok: false, errore: 'Operazione non disponibile' }
  if (codice.trim() !== l.escrow.codice) return { ok: false, errore: 'Codice di sblocco errato' }
  chiudiPagamentoTotale(l)
  toast('Pagamento rilasciato al professionista ✅ Lascia un feedback!', 'successo')
  commit()
  return { ok: true }
}

function chiudiPagamentoTotale(l: Lavoro): void {
  const t = adesso()
  const residuo = (l.prezzoFinale ?? 0) - accontoRilasciato(l)
  registraRilascioAlPro(l, residuo, 'saldo', t)
  l.stato = 'pagato'
  const pro = utenteById(l.aggiudicatarioId ?? '')
  if (pro) pro.lavoriCompletati += 1
  if (pro?.bot) pianifica(l, 12, 30)
  const owner = utenteById(l.richiedenteId)
  if (owner?.bot) pianifica(l, 12, 30)
}

// ─── Azioni: disputa e mediazione ────────────────────────────────────────────

export function apriDisputa(lavoroId: string, motivo: string, foto: string[], proposta: number): { ok: boolean; errore?: string } {
  const u = utenteCorrente()
  const l = lavoroById(lavoroId)
  if (!u || !l || l.richiedenteId !== u.id || l.stato !== 'completato-da-confermare') return { ok: false, errore: 'Operazione non disponibile' }
  if (foto.length === 0) return { ok: false, errore: 'Documenta il problema con almeno una foto' }
  const minimo = accontoRilasciato(l)
  if (!Number.isFinite(proposta) || proposta < minimo) return { ok: false, errore: `La proposta non può essere inferiore all'acconto già versato (${fmtEur(minimo)})` }
  if (proposta >= (l.prezzoFinale ?? 0)) return { ok: false, errore: 'La proposta deve essere inferiore al prezzo pattuito' }
  l.stato = 'in-disputa'
  l.disputa = {
    apertaIl: adesso(),
    motivo,
    foto,
    proposte: [{ da: u.id, importo: Math.round(proposta), data: adesso(), nota: motivo }],
    stato: 'negoziazione',
    accettatoDa: [],
  }
  const pro = utenteById(l.aggiudicatarioId ?? '')
  if (pro?.bot) pianifica(l, 20, 45)
  toast('Disputa aperta: Ribasso farà da mediatore tra le parti 🤝')
  commit()
  return { ok: true }
}

function contropartePer(l: Lavoro, userId: string): string {
  return l.richiedenteId === userId ? l.aggiudicatarioId ?? '' : l.richiedenteId
}

export function accettaProposta(lavoroId: string): void {
  const u = utenteCorrente()
  const l = lavoroById(lavoroId)
  if (!u || !l || !l.disputa || l.stato !== 'in-disputa') return
  const ultima = l.disputa.proposte[l.disputa.proposte.length - 1]
  if (!ultima || ultima.da === u.id) return
  chiudiAccordo(l, ultima.importo)
  toast(`Accordo raggiunto: ${fmtEur(ultima.importo)} al professionista`, 'successo')
  commit()
}

export function controproposta(lavoroId: string, importo: number, nota?: string): { ok: boolean; errore?: string } {
  const u = utenteCorrente()
  const l = lavoroById(lavoroId)
  if (!u || !l || !l.disputa || l.stato !== 'in-disputa') return { ok: false, errore: 'Operazione non disponibile' }
  const minimo = accontoRilasciato(l)
  if (!Number.isFinite(importo) || importo < minimo || importo > (l.prezzoFinale ?? 0))
    return { ok: false, errore: 'Importo fuori dai limiti della transazione' }
  l.disputa.proposte.push({ da: u.id, importo: Math.round(importo), data: adesso(), nota })
  const altro = utenteById(contropartePer(l, u.id))
  if (altro?.bot) pianifica(l, 18, 40)
  toast('Controproposta inviata alla controparte')
  commit()
  return { ok: true }
}

export function richiediMediazione(lavoroId: string): void {
  const u = utenteCorrente()
  const l = lavoroById(lavoroId)
  if (!u || !l || !l.disputa || l.stato !== 'in-disputa' || l.disputa.stato === 'mediazione') return
  avviaMediazione(l)
  commit()
}

function avviaMediazione(l: Lavoro): void {
  if (!l.disputa) return
  const prezzoPieno = l.prezzoFinale ?? 0
  const proposteCliente = l.disputa.proposte.filter((p) => p.da === l.richiedenteId).map((p) => p.importo)
  const propostePro = l.disputa.proposte.filter((p) => p.da === l.aggiudicatarioId).map((p) => p.importo)
  const c = proposteCliente.length ? Math.max(...proposteCliente) : Math.round(prezzoPieno * 0.5)
  const p = propostePro.length ? Math.min(...propostePro) : prezzoPieno
  const proposta = Math.min(prezzoPieno, Math.max(accontoRilasciato(l), Math.round((c + p) / 2 / 5) * 5))
  l.disputa.stato = 'mediazione'
  l.disputa.importoMediazione = proposta
  l.disputa.accettatoDa = []
  l.disputa.mediazioneTesto = `Dopo aver esaminato la documentazione fotografica e le proposte di entrambe le parti, il team di mediazione Ribasso propone di riconoscere al professionista ${fmtEur(
    proposta
  )} su ${fmtEur(prezzoPieno)} pattuiti. La proposta tiene conto del lavoro effettivamente svolto e dei difetti documentati.`
  pianifica(l, 10, 25)
  toast('Mediazione Ribasso avviata: riceverai una proposta a breve ⚖️')
}

export function accettaMediazione(lavoroId: string): void {
  const u = utenteCorrente()
  const l = lavoroById(lavoroId)
  if (!u || !l || !l.disputa || l.disputa.stato !== 'mediazione' || l.disputa.importoMediazione == null) return
  if (!l.disputa.accettatoDa.includes(u.id)) l.disputa.accettatoDa.push(u.id)
  const altro = contropartePer(l, u.id)
  if (l.disputa.accettatoDa.includes(altro)) {
    chiudiAccordo(l, l.disputa.importoMediazione)
    toast('Accordo di mediazione concluso ⚖️', 'successo')
  } else {
    toast('Hai accettato la proposta: in attesa della controparte')
  }
  commit()
}

function chiudiAccordo(l: Lavoro, importoTotaleAlPro: number): void {
  const t = adesso()
  if (!l.disputa || !l.escrow) return
  l.disputa.stato = 'accordo'
  l.disputa.importoAccordo = importoTotaleAlPro
  const giaRilasciato = accontoRilasciato(l)
  const extraPro = Math.max(0, importoTotaleAlPro - giaRilasciato)
  const rimborso = Math.max(0, (l.prezzoFinale ?? 0) - importoTotaleAlPro)
  if (extraPro > 0) registraRilascioAlPro(l, extraPro, 'accordo', t)
  if (rimborso > 0) {
    l.escrow.rilasci.push({ tipo: 'rimborso', importo: rimborso, data: t })
    const owner = utenteById(l.richiedenteId)
    if (owner && !owner.bot) {
      state.transazioni.unshift({
        id: uid('tx'),
        data: t,
        descrizione: `Rimborso da accordo — ${l.titolo}`,
        importo: rimborso,
        tipo: 'rimborso',
        lavoroId: l.id,
      })
    }
  }
  l.stato = 'risolto'
  const pro = utenteById(l.aggiudicatarioId ?? '')
  if (pro) pro.lavoriCompletati += 1
  if (pro?.bot) pianifica(l, 12, 30)
  const owner = utenteById(l.richiedenteId)
  if (owner?.bot) pianifica(l, 12, 30)
}

// ─── Azioni: feedback ────────────────────────────────────────────────────────

export function lasciaFeedback(lavoroId: string, stelle: number, commento: string): void {
  const u = utenteCorrente()
  const l = lavoroById(lavoroId)
  if (!u || !l) return
  const sonoRichiedente = l.richiedenteId === u.id
  const destinatario = sonoRichiedente ? l.aggiudicatarioId : l.richiedenteId
  if (!destinatario) return
  if (sonoRichiedente && l.feedbackLasciato.richiedente) return
  if (!sonoRichiedente && l.feedbackLasciato.professionista) return
  state.recensioni.unshift({
    id: uid('rec'),
    lavoroId: l.id,
    autoreId: u.id,
    destinatarioId: destinatario,
    stelle: Math.max(1, Math.min(5, Math.round(stelle))),
    commento: commento.trim(),
    data: adesso(),
    ruoloAutore: sonoRichiedente ? 'richiedente' : 'professionista',
  })
  if (sonoRichiedente) l.feedbackLasciato.richiedente = true
  else l.feedbackLasciato.professionista = true
  toast('Feedback pubblicato: grazie per aver reso Ribasso più affidabile ⭐️', 'successo')
  commit()
}

// ─── Azioni: swipe ───────────────────────────────────────────────────────────

export function swipeScarta(lavoroId: string): void {
  if (!state.scartati.includes(lavoroId)) state.scartati.push(lavoroId)
  commit()
}

export function swipePreferisci(lavoroId: string): void {
  if (!state.preferiti.includes(lavoroId)) state.preferiti.push(lavoroId)
  toast('Salvato nei preferiti ❤️')
  commit()
}

export function rimuoviPreferito(lavoroId: string): void {
  state.preferiti = state.preferiti.filter((id) => id !== lavoroId)
  commit()
}

export function resetScartati(): void {
  state.scartati = []
  toast('Annunci scartati ripristinati nel deck')
  commit()
}

// ─── Demo: avanzamento del tempo ─────────────────────────────────────────────

export function demoAvanzaOre(ore: number): void {
  state.clockOffset += ore * 3600000
  toast(`⏩ Tempo demo avanzato di ${ore} ${ore === 1 ? 'ora' : 'ore'}`)
  tick()
}

// ─── Motore della simulazione ────────────────────────────────────────────────

const FRASI_OFFERTA_BOT = [
  'Posso fare un sopralluogo gratuito domani.',
  'Disponibile anche nel weekend.',
  'Prezzo tutto incluso, materiali compresi.',
  'Ho già fatto lavori simili in zona, referenze disponibili.',
  undefined,
  undefined,
]

function botOfferte(l: Lavoro, dtMs: number, t: number): void {
  const u = utenteCorrente()
  // Con grandi salti temporali (fast-forward) i bot possono piazzare più rilanci
  const tentativi = 1 + Math.min(3, Math.floor(dtMs / 7200000))
  const notifica = dtMs < 600000 // evita raffiche di notifiche durante il catch-up
  for (let k = 0; k < tentativi; k++) {
    const probabilita = Math.min(0.55, (dtMs / 60000) * 0.16)
    if (Math.random() > probabilita) continue
    const migliore = migliorOfferta(l)
    // Se l'utente è in testa, i bot non lo superano sempre: gli lasciano spazio
    if (migliore && u && migliore.proId === u.id && Math.random() < 0.5) continue
    const pavimento = Math.round(l.prezzoSubito * (1.05 + (hashStr(l.id) % 18) / 100))
    const attuale = migliore?.importo ?? Math.round(l.budgetMax * (0.94 + Math.random() * 0.06))
    const prossimo = Math.max(pavimento, Math.round((attuale * (0.92 + Math.random() * 0.05)) / 5) * 5)
    if (prossimo >= attuale) return
    const candidati = state.utenti.filter(
      (x) => x.bot && x.ruolo === 'professionista' && x.categorie.includes(l.categoria) && x.id !== migliore?.proId
    )
    if (candidati.length === 0) return
    const autore = candidati[Math.floor(Math.random() * candidati.length)]
    l.offerte = l.offerte.filter((o) => o.proId !== autore.id)
    l.offerte.push({
      id: uid('off'),
      lavoroId: l.id,
      proId: autore.id,
      importo: prossimo,
      data: t - Math.floor(Math.random() * Math.min(dtMs, 3600000)),
      messaggio: FRASI_OFFERTA_BOT[Math.floor(Math.random() * FRASI_OFFERTA_BOT.length)],
    })
    if (u && notifica) {
      if (migliore && migliore.proId === u.id) toast(`Sei stato superato su «${l.titolo}»: nuova offerta ${fmtEur(prossimo)} 📉`)
      else if (l.richiedenteId === u.id) toast(`Nuova offerta su «${l.titolo}»: ${fmtEur(prossimo)} 📉`)
    }
  }
}

function risolviAsta(l: Lavoro): void {
  const u = utenteCorrente()
  const migliore = migliorOfferta(l)
  if (!migliore) {
    l.stato = 'scaduto'
    if (u && l.richiedenteId === u.id) toast(`Asta scaduta senza offerte per «${l.titolo}». Puoi ripubblicare.`)
    return
  }
  aggiudicaA(l, migliore.proId, migliore.importo)
  const pro = utenteById(migliore.proId)
  const owner = utenteById(l.richiedenteId)
  if (u && migliore.proId === u.id) toast(`🏆 Ti sei aggiudicato «${l.titolo}» per ${fmtEur(migliore.importo)}!`, 'successo')
  else if (u && l.richiedenteId === u.id)
    toast(`Asta conclusa: «${l.titolo}» aggiudicato a ${pro?.nome ?? 'professionista'} per ${fmtEur(migliore.importo)}`, 'successo')
  // Aste interamente tra bot: si chiudono senza flusso di pagamento visibile
  if (pro?.bot && owner?.bot) {
    l.stato = 'pagato'
    pro.lavoriCompletati += 1
  }
}

function botRispondeDisputa(l: Lavoro, t: number): void {
  const u = utenteCorrente()
  if (!l.disputa || !u) return
  const d = l.disputa
  if (d.stato === 'mediazione') {
    const botId = contropartePer(l, u.id)
    if (!d.accettatoDa.includes(botId)) {
      d.accettatoDa.push(botId)
      const bot = utenteById(botId)
      toast(`${bot?.nome ?? 'La controparte'} ha accettato la proposta di mediazione`)
      if (d.accettatoDa.includes(u.id) && d.importoMediazione != null) {
        chiudiAccordo(l, d.importoMediazione)
        toast('Accordo di mediazione concluso ⚖️', 'successo')
      }
    }
    return
  }
  const ultima = d.proposte[d.proposte.length - 1]
  if (!ultima || ultima.da !== u.id) return
  const botId = contropartePer(l, u.id)
  const bot = utenteById(botId)
  if (!bot?.bot) return
  const prezzoPieno = l.prezzoFinale ?? 0
  const botEPro = l.aggiudicatarioId === botId
  const round = d.proposte.length
  if (botEPro) {
    // Il professionista bot valuta la proposta del cliente
    if (ultima.importo >= prezzoPieno * 0.7) {
      chiudiAccordo(l, ultima.importo)
      toast(`${bot.nome} ha accettato la tua proposta di ${fmtEur(ultima.importo)} ✅`, 'successo')
    } else if (round < 3) {
      const contro = Math.min(prezzoPieno, Math.round(((ultima.importo + prezzoPieno) / 2 / 5)) * 5)
      d.proposte.push({ da: botId, importo: contro, data: t, nota: 'Capisco le osservazioni, ma il lavoro svolto ha comunque un valore: propongo una via di mezzo.' })
      toast(`${bot.nome} ha fatto una controproposta: ${fmtEur(contro)}`)
    } else {
      avviaMediazione(l)
    }
  } else {
    // Il cliente bot valuta la controproposta del professionista
    if (ultima.importo <= prezzoPieno * 0.85) {
      chiudiAccordo(l, ultima.importo)
      toast(`${bot.nome} ha accettato la tua controproposta di ${fmtEur(ultima.importo)} ✅`, 'successo')
    } else if (round < 3) {
      const contro = Math.max(accontoRilasciato(l), Math.round(((ultima.importo * 0.82) / 5)) * 5)
      d.proposte.push({ da: botId, importo: contro, data: t, nota: 'Il difetto documentato richiede un intervento di sistemazione: questa è la mia ultima proposta.' })
      toast(`${bot.nome} ha fatto una controproposta: ${fmtEur(contro)}`)
    } else {
      avviaMediazione(l)
    }
  }
}

function botApreDisputa(l: Lavoro, t: number): void {
  const cat = categoria(l.categoria)
  const proposta = Math.max(accontoRilasciato(l), Math.round(((l.prezzoFinale ?? 0) * (0.5 + Math.random() * 0.2)) / 5) * 5)
  l.stato = 'in-disputa'
  l.disputa = {
    apertaIl: t,
    motivo: 'Il risultato non corrisponde a quanto concordato: alcune finiture sono incomplete e ho documentato i difetti con le foto allegate.',
    foto: [fotoPlaceholder('📷', cat.gradiente[0], cat.gradiente[1], 'Documentazione cliente')],
    proposte: [
      {
        da: l.richiedenteId,
        importo: proposta,
        data: t,
        nota: 'Vista la situazione, propongo questo importo per chiudere la pratica.',
      },
    ],
    stato: 'negoziazione',
    accettatoDa: [],
  }
  toast(`⚠️ Il cliente ha aperto una disputa su «${l.titolo}»: trova un accordo o chiedi la mediazione`, 'errore')
}

function botFeedback(l: Lavoro, t: number): void {
  const u = utenteCorrente()
  if (!u) return
  const ioSonoOwner = l.richiedenteId === u.id
  const botId = ioSonoOwner ? l.aggiudicatarioId : l.richiedenteId
  const bot = utenteById(botId ?? '')
  if (!bot?.bot) return
  const botERichiedente = l.richiedenteId === bot.id
  if (botERichiedente && l.feedbackLasciato.richiedente) return
  if (!botERichiedente && l.feedbackLasciato.professionista) return
  const conDisputa = !!l.disputa
  const stelle = conDisputa ? 3 : Math.random() < 0.75 ? 5 : 4
  const pool = stelle >= 4 ? COMMENTI_FEEDBACK_BOT : COMMENTI_FEEDBACK_BOT_MEDI
  state.recensioni.unshift({
    id: uid('rec'),
    lavoroId: l.id,
    autoreId: bot.id,
    destinatarioId: u.id,
    stelle,
    commento: pool[Math.floor(Math.random() * pool.length)],
    data: t,
    ruoloAutore: botERichiedente ? 'richiedente' : 'professionista',
  })
  if (botERichiedente) l.feedbackLasciato.richiedente = true
  else l.feedbackLasciato.professionista = true
  toast(`⭐️ Hai ricevuto un nuovo feedback (${stelle}/5) da ${bot.nome}`, 'successo')
}

/** Mantiene vivo il marketplace: nuovi annunci bot quando le aste si esauriscono. */
function rigeneraMarketplace(t: number): void {
  const u = utenteCorrente()
  if (!u) return
  const aperti = state.lavori.filter((l) => l.stato === 'in-asta' && l.scadeIl > t).length
  if (aperti >= 6) return
  const seed = generaSeed({ citta: u.citta, lat: u.lat, lng: u.lng }, t)
  const nuovi = seed.lavori.filter(() => Math.random() < 0.4).slice(0, 8 - aperti)
  // Riusa i clienti bot già esistenti per non far crescere gli utenti all'infinito
  const clientiBot = state.utenti.filter((x) => x.bot && x.ruolo === 'richiedente')
  for (const l of nuovi) {
    if (clientiBot.length > 0) l.richiedenteId = clientiBot[Math.floor(Math.random() * clientiBot.length)].id
    // Le offerte seed puntano a pro nuovi: rimappale sui pro esistenti
    const prosEsistenti = state.utenti.filter((x) => x.bot && x.ruolo === 'professionista' && x.categorie.includes(l.categoria))
    l.offerte = l.offerte
      .map((o, i) => (prosEsistenti[i % Math.max(1, prosEsistenti.length)] ? { ...o, proId: prosEsistenti[i % prosEsistenti.length].id } : o))
      .filter((o) => prosEsistenti.length > 0)
  }
  state.lavori.push(...nuovi)
}

export function tick(): void {
  if (!state.onboardingCompletato) return
  const t = adesso()
  const dt = Math.max(0, t - state.ultimoTick)
  const u = utenteCorrente()

  for (const l of state.lavori) {
    switch (l.stato) {
      case 'in-asta': {
        if (t >= l.scadeIl) risolviAsta(l)
        else botOfferte(l, dt, t)
        break
      }
      case 'aggiudicato': {
        const owner = utenteById(l.richiedenteId)
        if (owner?.bot) {
          if (!l.botProssimaAzione) pianifica(l, 18, 40)
          else if (t >= l.botProssimaAzione) depositaEscrowInterno(l, true)
        }
        break
      }
      case 'in-corso': {
        const pro = utenteById(l.aggiudicatarioId ?? '')
        if (pro?.bot && l.botProssimaAzione && t >= l.botProssimaAzione) {
          const cat = categoria(l.categoria)
          l.stato = 'completato-da-confermare'
          l.fotoConsegna = [
            fotoPlaceholder(cat.emoji, cat.gradiente[0], cat.gradiente[1], 'Foto di fine lavori'),
            fotoPlaceholder('✅', '#a7f3d0', '#10b981', 'Dettaglio consegna'),
          ]
          l.botProssimaAzione = undefined
          if (u && l.richiedenteId === u.id)
            toast(`📸 ${pro.nome} ha segnato «${l.titolo}» come completato: verifica e conferma il pagamento`, 'successo')
        }
        break
      }
      case 'completato-da-confermare': {
        const owner = utenteById(l.richiedenteId)
        if (owner?.bot && l.botProssimaAzione && t >= l.botProssimaAzione) {
          l.botProssimaAzione = undefined
          if (Math.random() < 0.8) {
            chiudiPagamentoTotale(l)
            const netto = ((l.prezzoFinale ?? 0) - accontoRilasciato(l)) * (1 - (l.escrow?.commissionePerc ?? 12) / 100)
            if (u && l.aggiudicatarioId === u.id)
              toast(`💸 ${owner.nome} ha confermato il lavoro: saldo rilasciato (≈ ${fmtEur(Math.round(netto))} netti)`, 'successo')
          } else {
            botApreDisputa(l, t)
          }
        }
        break
      }
      case 'in-disputa': {
        if (l.botProssimaAzione && t >= l.botProssimaAzione) {
          l.botProssimaAzione = undefined
          botRispondeDisputa(l, t)
        }
        break
      }
      case 'pagato':
      case 'risolto': {
        const coinvolto = u && (l.richiedenteId === u.id || l.aggiudicatarioId === u.id)
        if (coinvolto && l.botProssimaAzione && t >= l.botProssimaAzione) {
          l.botProssimaAzione = undefined
          botFeedback(l, t)
        }
        break
      }
      default:
        break
    }
  }

  rigeneraMarketplace(t)
  state.ultimoTick = t
  commit()
}

export function avviaMotore(): () => void {
  tick()
  const id = setInterval(() => tick(), 4000)
  return () => clearInterval(id)
}
