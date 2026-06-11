const eurInt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const eurDec = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })

export function fmtEur(n: number): string {
  return Number.isInteger(n) ? eurInt.format(n) : eurDec.format(n)
}

export function fmtData(ts: number): string {
  return new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function fmtDataBreve(ts: number): string {
  return new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** "7h 32m", "3g 4h", "12m", "adesso" */
export function fmtDurata(ms: number): string {
  if (ms <= 0) return 'scaduta'
  const m = Math.floor(ms / 60000)
  if (m < 1) return "meno di 1 min"
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ${m % 60}m`
  const g = Math.floor(h / 24)
  return `${g}g ${h % 24}h`
}

export function fmtTempoFa(ms: number): string {
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'adesso'
  if (m < 60) return `${m} min fa`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} h fa`
  return `${Math.floor(h / 24)} g fa`
}

export function fmtStelle(n: number): string {
  return n.toFixed(1).replace('.', ',')
}

export function plurale(n: number, sing: string, plur: string): string {
  return n === 1 ? sing : plur
}

let _seq = 0
export function uid(prefix = 'id'): string {
  _seq += 1
  return `${prefix}_${Date.now().toString(36)}${_seq.toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

/** Ridimensiona un'immagine caricata e la restituisce come dataURL JPEG compatta. */
export function comprimiFoto(file: File, maxLato = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scala = Math.min(1, maxLato / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scala)
        canvas.height = Math.round(img.height * scala)
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('canvas'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }
      img.onerror = reject
      img.src = String(reader.result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
