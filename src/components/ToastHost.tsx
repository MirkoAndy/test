import { useSyncExternalStore } from 'react'
import { chiudiToast, getToasts, subscribeToasts } from '../lib/toast'

export function ToastHost() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts)
  if (toasts.length === 0) return null
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tipo}`} onClick={() => chiudiToast(t.id)}>
          {t.testo}
        </div>
      ))}
    </div>
  )
}
