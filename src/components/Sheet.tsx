import { useEffect } from 'react'
import type { ReactNode } from 'react'

export function Sheet({
  aperto,
  onClose,
  titolo,
  children,
}: {
  aperto: boolean
  onClose: () => void
  titolo?: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!aperto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [aperto, onClose])

  if (!aperto) return null
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sheet-handle" />
        {titolo && <h3 className="sheet-title">{titolo}</h3>}
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}
