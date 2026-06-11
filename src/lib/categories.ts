import type { Categoria, CategoriaId } from './types'

export const CATEGORIE: Categoria[] = [
  {
    id: 'imbiancatura',
    nome: 'Imbiancatura',
    emoji: '🎨',
    gradiente: ['#fde68a', '#f59e0b'],
    competenze: ['Pareti interne', 'Facciate', 'Cartongesso', 'Stucco veneziano', 'Antimuffa'],
  },
  {
    id: 'traslochi',
    nome: 'Traslochi',
    emoji: '📦',
    gradiente: ['#bfdbfe', '#3b82f6'],
    competenze: ['Montaggio mobili', 'Imballaggio', 'Piattaforma aerea', 'Furgone proprio', 'Sgomberi'],
  },
  {
    id: 'grafica',
    nome: 'Grafica & Design',
    emoji: '✏️',
    gradiente: ['#fbcfe8', '#ec4899'],
    competenze: ['Logo', 'Brand identity', 'Social media', 'Packaging', 'Illustrazione'],
  },
  {
    id: 'idraulica',
    nome: 'Idraulica',
    emoji: '🔧',
    gradiente: ['#a5f3fc', '#06b6d4'],
    competenze: ['Perdite', 'Sanitari', 'Caldaie', 'Scarichi', 'Ristrutturazione bagno'],
  },
  {
    id: 'elettricista',
    nome: 'Elettricista',
    emoji: '⚡️',
    gradiente: ['#fef08a', '#eab308'],
    competenze: ['Impianti civili', 'Certificazioni', 'Domotica', 'Quadri elettrici', 'Illuminazione'],
  },
  {
    id: 'giardinaggio',
    nome: 'Giardinaggio',
    emoji: '🌿',
    gradiente: ['#bbf7d0', '#22c55e'],
    competenze: ['Potatura', 'Prato', 'Irrigazione', 'Siepi', 'Progettazione giardini'],
  },
  {
    id: 'pulizie',
    nome: 'Pulizie',
    emoji: '🧽',
    gradiente: ['#c7d2fe', '#6366f1'],
    competenze: ['Domestiche', 'Uffici', 'Post cantiere', 'Vetri', 'Sanificazione'],
  },
  {
    id: 'falegnameria',
    nome: 'Falegnameria',
    emoji: '🪚',
    gradiente: ['#fed7aa', '#ea580c'],
    competenze: ['Mobili su misura', 'Restauro', 'Porte e infissi', 'Parquet', 'Cucine'],
  },
  {
    id: 'ripetizioni',
    nome: 'Ripetizioni',
    emoji: '📚',
    gradiente: ['#ddd6fe', '#8b5cf6'],
    competenze: ['Matematica', 'Lingue', 'Informatica', 'Preparazione esami', 'DSA'],
  },
  {
    id: 'fotografia',
    nome: 'Fotografia & Video',
    emoji: '📷',
    gradiente: ['#e9d5ff', '#a855f7'],
    competenze: ['Eventi', 'Ritratti', 'Drone', 'Video editing', 'E-commerce'],
  },
  {
    id: 'web',
    nome: 'Web & IT',
    emoji: '💻',
    gradiente: ['#bae6fd', '#0ea5e9'],
    competenze: ['Siti web', 'E-commerce', 'App mobile', 'SEO', 'Assistenza PC'],
  },
  {
    id: 'climatizzazione',
    nome: 'Clima & Caldaie',
    emoji: '❄️',
    gradiente: ['#cffafe', '#0891b2'],
    competenze: ['Installazione split', 'Manutenzione', 'Ricarica gas', 'Pompe di calore', 'F-GAS'],
  },
]

export function categoria(id: CategoriaId): Categoria {
  return CATEGORIE.find((c) => c.id === id) ?? CATEGORIE[0]
}
