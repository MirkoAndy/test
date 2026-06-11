import { useSyncExternalStore } from 'react'

function getHash(): string {
  const h = location.hash.slice(1)
  return h || '/'
}

export function nav(to: string): void {
  if (getHash() === to) return
  location.hash = to
}

export function indietro(): void {
  history.back()
}

export function useRoute(): string {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('hashchange', cb)
      return () => window.removeEventListener('hashchange', cb)
    },
    getHash,
    getHash
  )
}
