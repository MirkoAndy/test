export interface Toast {
  id: number
  testo: string
  tipo: 'info' | 'successo' | 'errore' | 'premium'
}

let prossimoId = 1
let toasts: Toast[] = []
const listeners = new Set<() => void>()

export function toast(testo: string, tipo: Toast['tipo'] = 'info'): void {
  const t: Toast = { id: prossimoId++, testo, tipo }
  toasts = [...toasts, t]
  listeners.forEach((l) => l())
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id)
    listeners.forEach((l) => l())
  }, 4200)
}

export function chiudiToast(id: number): void {
  toasts = toasts.filter((x) => x.id !== id)
  listeners.forEach((l) => l())
}

export function getToasts(): Toast[] {
  return toasts
}

export function subscribeToasts(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
