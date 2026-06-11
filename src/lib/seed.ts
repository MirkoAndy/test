import type { CategoriaId, Lavoro, Recensione, Utente } from './types'
import { puntoVicino } from './geo'
import { uid } from './format'

// ─── Professionisti bot ──────────────────────────────────────────────────────

interface BotProDef {
  nome: string
  emoji: string
  categorie: CategoriaId[]
  bio: string
  competenze: string[]
  rating: number
  recensioni: number
  lavori: number
  premium?: boolean
  social: { linkedin?: string; instagram?: string; tiktok?: string; sito?: string }
}

const BOT_PROS: BotProDef[] = [
  {
    nome: 'Marco Rinaldi', emoji: '👨‍🔧', categorie: ['imbiancatura', 'falegnameria'],
    bio: 'Imbianchino e decoratore da 15 anni. Preventivi chiari, cantiere pulito, tempi rispettati.',
    competenze: ['Pareti interne', 'Stucco veneziano', 'Antimuffa'], rating: 4.8, recensioni: 127, lavori: 214, premium: true,
    social: { instagram: 'marco.rinaldi.decor', linkedin: 'marco-rinaldi-decor', sito: 'rinaldidecor.it' },
  },
  {
    nome: 'Giulia Ferri', emoji: '👩‍🎨', categorie: ['grafica', 'web'],
    bio: 'Graphic designer freelance. Brand identity, social e packaging per piccole imprese.',
    competenze: ['Logo', 'Brand identity', 'Social media'], rating: 4.9, recensioni: 89, lavori: 142, premium: true,
    social: { instagram: 'giuliaferri.design', linkedin: 'giulia-ferri-design', tiktok: 'giuliaferri.design' },
  },
  {
    nome: 'Trasporti Fratelli Espo', emoji: '🚚', categorie: ['traslochi'],
    bio: 'Traslochi e sgomberi con furgone e piattaforma aerea. Smontaggio e rimontaggio inclusi.',
    competenze: ['Montaggio mobili', 'Piattaforma aerea', 'Furgone proprio'], rating: 4.6, recensioni: 203, lavori: 380,
    social: { instagram: 'fratelliespo.traslochi', sito: 'fratelliespo.it' },
  },
  {
    nome: 'Luca Bianchi', emoji: '🧑‍🔧', categorie: ['idraulica', 'climatizzazione'],
    bio: 'Idraulico certificato F-GAS. Pronto intervento perdite, caldaie e condizionatori.',
    competenze: ['Perdite', 'Caldaie', 'Installazione split'], rating: 4.7, recensioni: 156, lavori: 290,
    social: { linkedin: 'luca-bianchi-impianti' },
  },
  {
    nome: 'Elena Marini', emoji: '👩‍💼', categorie: ['pulizie'],
    bio: 'Impresa di pulizie professionale: case, uffici e post cantiere. Prodotti eco-certificati.',
    competenze: ['Domestiche', 'Uffici', 'Post cantiere'], rating: 4.9, recensioni: 174, lavori: 412, premium: true,
    social: { instagram: 'elenamarini.clean', tiktok: 'elenaclean' },
  },
  {
    nome: 'Davide Greco', emoji: '👨‍🌾', categorie: ['giardinaggio'],
    bio: 'Giardiniere e potatore. Manutenzione del verde, impianti di irrigazione, progettazione.',
    competenze: ['Potatura', 'Prato', 'Irrigazione'], rating: 4.5, recensioni: 67, lavori: 121,
    social: { instagram: 'greco.garden' },
  },
  {
    nome: 'Sara Colombo', emoji: '👩‍🏫', categorie: ['ripetizioni'],
    bio: 'Laureata in matematica, 8 anni di esperienza con studenti di medie e superiori. Anche online.',
    competenze: ['Matematica', 'Preparazione esami', 'DSA'], rating: 5.0, recensioni: 58, lavori: 96,
    social: { linkedin: 'sara-colombo-tutor', tiktok: 'saraspiegamate' },
  },
  {
    nome: 'Antonio Russo', emoji: '👨‍🔬', categorie: ['elettricista', 'climatizzazione'],
    bio: 'Elettricista con 20 anni di esperienza. Impianti a norma, certificazioni e domotica.',
    competenze: ['Impianti civili', 'Certificazioni', 'Domotica'], rating: 4.7, recensioni: 142, lavori: 265,
    social: { sito: 'russoimpianti.it', linkedin: 'antonio-russo-impianti' },
  },
  {
    nome: 'Chiara Vitale', emoji: '📸', categorie: ['fotografia', 'grafica'],
    bio: 'Fotografa di eventi e ritratti. Drone certificato, post-produzione professionale inclusa.',
    competenze: ['Eventi', 'Drone', 'Video editing'], rating: 4.8, recensioni: 73, lavori: 118, premium: true,
    social: { instagram: 'chiaravitale.ph', tiktok: 'chiaravitale.ph', sito: 'chiaravitale.com' },
  },
  {
    nome: 'Pietro Galli', emoji: '🧑‍💻', categorie: ['web', 'grafica'],
    bio: 'Sviluppatore web full-stack. Siti vetrina, e-commerce e piccole app su misura.',
    competenze: ['Siti web', 'E-commerce', 'SEO'], rating: 4.6, recensioni: 51, lavori: 84,
    social: { linkedin: 'pietro-galli-dev', sito: 'pietrogalli.dev' },
  },
  {
    nome: 'Anna De Luca', emoji: '🧹', categorie: ['pulizie', 'giardinaggio'],
    bio: 'Pulizie domestiche e piccola manutenzione del verde. Affidabile, puntuale, automunita.',
    competenze: ['Domestiche', 'Vetri', 'Siepi'], rating: 4.4, recensioni: 39, lavori: 71,
    social: { instagram: 'annadeluca.home' },
  },
  {
    nome: 'Stefano Moretti', emoji: '🛠️', categorie: ['falegnameria', 'traslochi'],
    bio: 'Falegname artigiano: mobili su misura, restauro e montaggi complessi.',
    competenze: ['Mobili su misura', 'Restauro', 'Montaggio mobili'], rating: 4.7, recensioni: 95, lavori: 167,
    social: { instagram: 'moretti.legno', sito: 'morettilegno.it' },
  },
  {
    nome: 'Karim Haddad', emoji: '👨‍🎨', categorie: ['imbiancatura', 'pulizie'],
    bio: 'Imbianchino e cartongessista, squadra di 2 persone. Velocità e prezzo onesto.',
    competenze: ['Pareti interne', 'Cartongesso', 'Post cantiere'], rating: 4.5, recensioni: 64, lavori: 138,
    social: { instagram: 'karim.colora', tiktok: 'karimcolora' },
  },
  {
    nome: 'Lucia Santoro', emoji: '👩‍🔧', categorie: ['grafica', 'fotografia', 'web'],
    bio: 'Visual designer e content creator: grafica, foto prodotto e piccoli siti.',
    competenze: ['Social media', 'E-commerce', 'Ritratti'], rating: 4.6, recensioni: 47, lavori: 79,
    social: { linkedin: 'lucia-santoro-design', instagram: 'lucia.santoro.design' },
  },
  {
    nome: 'Officina Verde Snc', emoji: '🌳', categorie: ['giardinaggio', 'traslochi'],
    bio: 'Manutenzione del verde e sgomberi con mezzi propri. Preventivi in giornata.',
    competenze: ['Potatura', 'Siepi', 'Sgomberi'], rating: 4.4, recensioni: 88, lavori: 195,
    social: { sito: 'officinaverde.it' },
  },
]

// ─── Clienti bot ─────────────────────────────────────────────────────────────

const BOT_CLIENTS: { nome: string; emoji: string; rating: number; recensioni: number }[] = [
  { nome: 'Francesca P.', emoji: '👩', rating: 4.9, recensioni: 21 },
  { nome: 'Roberto M.', emoji: '👨‍🦱', rating: 4.6, recensioni: 14 },
  { nome: 'Martina L.', emoji: '👱‍♀️', rating: 4.8, recensioni: 9 },
  { nome: 'Studio Legale Bonetti', emoji: '🏢', rating: 4.7, recensioni: 32 },
  { nome: 'Alessandro T.', emoji: '🧔', rating: 4.5, recensioni: 11 },
]

// ─── Annunci demo ────────────────────────────────────────────────────────────

interface JobDef {
  titolo: string
  descrizione: string
  categoria: CategoriaId
  budget: number
  oreRimaste: number
  urgente?: boolean
  ricorsivo?: boolean
  acconto30?: boolean
  offerteIniziali?: number
}

const JOB_DEFS: JobDef[] = [
  {
    titolo: 'Imbiancare trilocale 90 m²',
    descrizione: 'Appartamento vuoto da imbiancare completamente: 3 camere, soggiorno, cucina e corridoio. Pareti in buono stato, bianco semplice. Pittura a carico del professionista. Disponibile da subito, consegna entro 10 giorni.',
    categoria: 'imbiancatura', budget: 950, oreRimaste: 7.5, offerteIniziali: 3, acconto30: true,
  },
  {
    titolo: 'Trasloco bilocale, 3° piano senza ascensore',
    descrizione: 'Trasloco da bilocale a bilocale, distanza 6 km. Mobili da smontare e rimontare (armadio, letto, cucina piccola). Circa 25 scatoloni. Serve furgone. Weekend preferito.',
    categoria: 'traslochi', budget: 700, oreRimaste: 22, offerteIniziali: 2,
  },
  {
    titolo: 'Logo + biglietti da visita per pizzeria',
    descrizione: 'Nuova pizzeria in apertura: cerchiamo logo moderno ma caldo, palette colori e biglietti da visita pronti per la stampa. Consegna file sorgente inclusa. Abbiamo già il nome e qualche idea di stile.',
    categoria: 'grafica', budget: 450, oreRimaste: 30, offerteIniziali: 4,
  },
  {
    titolo: 'Perdita sotto il lavello della cucina',
    descrizione: 'Perdita d\'acqua dal sifone sotto il lavello, il mobile si sta rovinando. Intervento rapido, possibilmente entro 24 ore. Foto disponibili in chat.',
    categoria: 'idraulica', budget: 180, oreRimaste: 3, urgente: true, offerteIniziali: 2,
  },
  {
    titolo: 'Sostituire 6 punti luce e 2 prese',
    descrizione: 'Appartamento anni \'80: sostituzione di 6 punti luce con faretti LED e aggiunta di 2 prese schuko in cucina. Richiesta dichiarazione di conformità.',
    categoria: 'elettricista', budget: 320, oreRimaste: 12, offerteIniziali: 1,
  },
  {
    titolo: 'Potatura siepe e 2 ulivi in giardino',
    descrizione: 'Giardino privato 200 m²: potatura siepe di lauro (15 m lineari) e due ulivi ornamentali, con smaltimento del verde incluso.',
    categoria: 'giardinaggio', budget: 260, oreRimaste: 26, offerteIniziali: 2,
  },
  {
    titolo: 'Pulizie settimanali ufficio 120 m²',
    descrizione: 'Studio professionale cerca impresa per pulizie settimanali (venerdì sera o sabato mattina): uffici, sala riunioni, 2 bagni, vetri una volta al mese. Contratto continuativo.',
    categoria: 'pulizie', budget: 90, oreRimaste: 40, ricorsivo: true, offerteIniziali: 2,
  },
  {
    titolo: 'Libreria su misura a parete (3,2 m)',
    descrizione: 'Parete soggiorno: libreria su misura in legno chiaro, 3,2 m larghezza × 2,6 m altezza, con zona TV integrata. Progetto, fornitura e posa.',
    categoria: 'falegnameria', budget: 2400, oreRimaste: 46, acconto30: true, offerteIniziali: 1,
  },
  {
    titolo: 'Ripetizioni di matematica — maturità scientifica',
    descrizione: 'Cerco tutor per mio figlio in preparazione alla maturità scientifica: 2 lezioni a settimana da 1,5 h fino a giugno, in presenza o online.',
    categoria: 'ripetizioni', budget: 35, oreRimaste: 18, ricorsivo: true, offerteIniziali: 3,
  },
  {
    titolo: 'Servizio fotografico battesimo (3 ore)',
    descrizione: 'Battesimo domenica mattina: cerimonia + pranzo, circa 3 ore di copertura. Richieste 80+ foto editate e consegna entro 2 settimane.',
    categoria: 'fotografia', budget: 420, oreRimaste: 14, offerteIniziali: 2,
  },
  {
    titolo: 'Sito vetrina per B&B (5 pagine)',
    descrizione: 'B&B di 4 camere: sito vetrina con galleria foto, pagina prenotazioni (link a Booking), mappa e contatti. Dominio già acquistato. Italiano + inglese.',
    categoria: 'web', budget: 900, oreRimaste: 34, offerteIniziali: 2,
  },
  {
    titolo: 'Installazione condizionatore dual split',
    descrizione: 'Installazione dual split (macchine già acquistate) in soggiorno e camera, predisposizione esistente. Richiesta certificazione F-GAS.',
    categoria: 'climatizzazione', budget: 380, oreRimaste: 9, offerteIniziali: 1,
  },
  {
    titolo: 'Tinteggiatura cameretta con parete decorativa',
    descrizione: 'Cameretta 14 m²: tinteggiatura completa + una parete con colore di accento e righe geometriche. Idee e campioni benvenuti.',
    categoria: 'imbiancatura', budget: 380, oreRimaste: 16, offerteIniziali: 1,
  },
  {
    titolo: 'Restyling menu e locandine ristorante',
    descrizione: 'Ristorante di pesce: restyling grafico del menu (4 pagine), 2 locandine eventi e template per le storie Instagram. Brand esistente da rispettare.',
    categoria: 'grafica', budget: 380, oreRimaste: 5, urgente: true, offerteIniziali: 2,
  },
  {
    titolo: 'Manutenzione giardino condominiale — mensile',
    descrizione: 'Condominio di 8 unità: taglio prato, siepi e pulizia vialetti una volta al mese, marzo–ottobre. Fatturazione richiesta.',
    categoria: 'giardinaggio', budget: 220, oreRimaste: 44, ricorsivo: true, offerteIniziali: 1,
  },
]

const COMMENTI_POSITIVI = [
  'Lavoro impeccabile e consegna puntuale. Consigliatissimo!',
  'Professionale, preciso e molto disponibile. Tornerò sicuramente.',
  'Ottimo rapporto qualità/prezzo, comunicazione chiara dall\'inizio alla fine.',
  'Velocissimo e molto curato nei dettagli. Esperienza perfetta.',
  'Persona seria e affidabile, il risultato ha superato le aspettative.',
  'Tutto come da accordi, anzi meglio. Cinque stelle meritate.',
  'Gentile, puntuale e bravissimo nel suo lavoro.',
  'Ha risolto in poche ore un problema che ci portavamo dietro da mesi.',
]

const COMMENTI_MEDI = [
  'Buon lavoro nel complesso, qualche piccolo ritardo sulla consegna.',
  'Risultato discreto, comunicazione migliorabile ma prezzo onesto.',
  'Lavoro corretto anche se è servito un piccolo ritocco finale.',
]

// ─── Generazione ─────────────────────────────────────────────────────────────

function rndTra(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function round5(n: number): number {
  return Math.max(5, Math.round(n / 5) * 5)
}

export interface SeedResult {
  utenti: Utente[]
  lavori: Lavoro[]
  recensioni: Recensione[]
}

/** Genera bot, annunci e recensioni attorno alla posizione dell'utente. */
export function generaSeed(centro: { citta: string; lat: number; lng: number }, adesso: number): SeedResult {
  const utenti: Utente[] = []
  const recensioni: Recensione[] = []
  const lavori: Lavoro[] = []

  const pros: Utente[] = BOT_PROS.map((d) => {
    const p = puntoVicino(centro.lat, centro.lng, 9)
    return {
      id: uid('pro'),
      nome: d.nome,
      emoji: d.emoji,
      ruolo: 'professionista' as const,
      citta: centro.citta,
      lat: p.lat,
      lng: p.lng,
      bio: d.bio,
      categorie: d.categorie,
      competenze: d.competenze,
      raggioKm: 25,
      tariffaMinima: 0,
      social: d.social,
      premium: !!d.premium,
      bot: true,
      lavoriCompletati: d.lavori,
      iscrittoIl: adesso - Math.round(rndTra(200, 900)) * 86400000,
    }
  })

  const clients: Utente[] = BOT_CLIENTS.map((d) => {
    const p = puntoVicino(centro.lat, centro.lng, 7)
    return {
      id: uid('cli'),
      nome: d.nome,
      emoji: d.emoji,
      ruolo: 'richiedente' as const,
      citta: centro.citta,
      lat: p.lat,
      lng: p.lng,
      bio: '',
      categorie: [],
      competenze: [],
      raggioKm: 20,
      tariffaMinima: 0,
      social: {},
      premium: false,
      bot: true,
      lavoriCompletati: 0,
      iscrittoIl: adesso - Math.round(rndTra(60, 400)) * 86400000,
    }
  })

  utenti.push(...pros, ...clients)

  // Recensioni storiche per i professionisti bot (autori: clienti bot)
  BOT_PROS.forEach((def, i) => {
    const pro = pros[i]
    const quante = Math.min(def.recensioni, 8) // ne materializziamo solo alcune, il totale resta nel conteggio
    for (let k = 0; k < quante; k++) {
      const alta = Math.random() < (def.rating - 3.4) / 1.6
      const stelle = alta ? 5 : Math.random() < 0.7 ? 4 : 3
      const pool = stelle >= 4 ? COMMENTI_POSITIVI : COMMENTI_MEDI
      const autore = clients[Math.floor(Math.random() * clients.length)]
      recensioni.push({
        id: uid('rec'),
        lavoroId: uid('lav0'),
        autoreId: autore.id,
        destinatarioId: pro.id,
        stelle,
        commento: pool[Math.floor(Math.random() * pool.length)],
        data: adesso - Math.round(rndTra(3, 300)) * 86400000,
        ruoloAutore: 'richiedente',
      })
    }
  })

  // Recensioni per i clienti bot (autori: professionisti bot)
  clients.forEach((cli) => {
    const quante = 2 + Math.floor(Math.random() * 3)
    for (let k = 0; k < quante; k++) {
      const autore = pros[Math.floor(Math.random() * pros.length)]
      recensioni.push({
        id: uid('rec'),
        lavoroId: uid('lav0'),
        autoreId: autore.id,
        destinatarioId: cli.id,
        stelle: Math.random() < 0.8 ? 5 : 4,
        commento: 'Cliente preciso e pagamento immediato tramite Ribasso. Consigliato.',
        data: adesso - Math.round(rndTra(5, 200)) * 86400000,
        ruoloAutore: 'professionista',
      })
    }
  })

  // Annunci aperti
  JOB_DEFS.forEach((d) => {
    const cliente = clients[Math.floor(Math.random() * clients.length)]
    const p = puntoVicino(centro.lat, centro.lng, 8)
    const creato = adesso - Math.round(rndTra(0.5, 6) * 3600000)
    const scade = adesso + Math.round(d.oreRimaste * 3600000)
    const prezzoSubito = round5(d.budget * rndTra(0.5, 0.6))
    const lavoro: Lavoro = {
      id: uid('lav'),
      titolo: d.titolo,
      descrizione: d.descrizione,
      categoria: d.categoria,
      richiedenteId: cliente.id,
      citta: centro.citta,
      lat: p.lat,
      lng: p.lng,
      budgetMax: d.budget,
      prezzoSubito,
      durataOre: Math.round((scade - creato) / 3600000),
      creatoIl: creato,
      scadeIl: scade,
      stato: 'in-asta',
      offerte: [],
      acconto30: !!d.acconto30,
      urgente: !!d.urgente,
      ricorsivo: !!d.ricorsivo,
      fotoConsegna: [],
      feedbackLasciato: { richiedente: false, professionista: false },
    }
    // Offerte bot già presenti
    const n = d.offerteIniziali ?? 0
    const idonei = pros.filter((p2) => p2.categorie.includes(d.categoria))
    let prezzo = d.budget
    for (let k = 0; k < n && idonei.length > 0; k++) {
      prezzo = round5(Math.max(prezzoSubito * 1.12, prezzo * rndTra(0.86, 0.95)))
      const autore = idonei[(k * 7 + 3) % idonei.length]
      if (lavoro.offerte.some((o) => o.proId === autore.id)) continue
      lavoro.offerte.push({
        id: uid('off'),
        lavoroId: lavoro.id,
        proId: autore.id,
        importo: prezzo,
        data: creato + Math.round(((k + 1) / (n + 1)) * (adesso - creato)),
        messaggio: k === 0 ? 'Disponibile già da questa settimana, sopralluogo gratuito.' : undefined,
      })
    }
    lavori.push(lavoro)
  })

  return { utenti, lavori, recensioni }
}

export const COMMENTI_FEEDBACK_BOT = COMMENTI_POSITIVI
export const COMMENTI_FEEDBACK_BOT_MEDI = COMMENTI_MEDI
