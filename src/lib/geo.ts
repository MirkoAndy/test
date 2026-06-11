export interface Citta {
  nome: string
  lat: number
  lng: number
}

export const CITTA: Citta[] = [
  { nome: 'Milano', lat: 45.4642, lng: 9.19 },
  { nome: 'Roma', lat: 41.9028, lng: 12.4964 },
  { nome: 'Torino', lat: 45.0703, lng: 7.6869 },
  { nome: 'Bologna', lat: 44.4949, lng: 11.3426 },
  { nome: 'Napoli', lat: 40.8518, lng: 14.2681 },
  { nome: 'Firenze', lat: 43.7696, lng: 11.2558 },
  { nome: 'Bari', lat: 41.1171, lng: 16.8719 },
  { nome: 'Verona', lat: 45.4384, lng: 10.9916 },
  { nome: 'Palermo', lat: 38.1157, lng: 13.3615 },
  { nome: 'Genova', lat: 44.4056, lng: 8.9463 },
]

/** Distanza haversine in km. */
export function distanzaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function fmtDistanza(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1).replace('.', ',')} km`
}

/** Punto casuale entro `maxKm` km da (lat, lng). */
export function puntoVicino(lat: number, lng: number, maxKm: number, rnd: () => number = Math.random): { lat: number; lng: number } {
  const r = (maxKm / 111) * Math.sqrt(rnd())
  const theta = rnd() * 2 * Math.PI
  return { lat: lat + r * Math.cos(theta), lng: lng + (r * Math.sin(theta)) / Math.cos((lat * Math.PI) / 180) }
}

/** Geolocalizzazione del browser; restituisce la città nota più vicina. */
export function rilevaPosizione(): Promise<{ citta: Citta; lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        let best = CITTA[0]
        let bestD = Infinity
        for (const c of CITTA) {
          const d = distanzaKm(latitude, longitude, c.lat, c.lng)
          if (d < bestD) {
            bestD = d
            best = c
          }
        }
        resolve({ citta: best, lat: latitude, lng: longitude })
      },
      () => resolve(null),
      { timeout: 6000, maximumAge: 600000 }
    )
  })
}
