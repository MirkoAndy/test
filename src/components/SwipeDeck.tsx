import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface SwipeDeckProps<T> {
  items: T[]
  getKey: (item: T) => string
  render: (item: T, inCima: boolean) => ReactNode
  onScarta: (item: T) => void
  onSalva: (item: T) => void
  onApri: (item: T) => void
}

interface Drag {
  dx: number
  dy: number
}

export function SwipeDeck<T>({ items, getKey, render, onScarta, onSalva, onApri }: SwipeDeckProps<T>) {
  const [drag, setDrag] = useState<Drag | null>(null)
  const [ritorno, setRitorno] = useState(false)
  const [uscita, setUscita] = useState<{ key: string; dir: 1 | -1 } | null>(null)
  const start = useRef<{ x: number; y: number; t: number } | null>(null)
  const uscitaTimer = useRef<number | null>(null)

  const top = items[0]

  function lancia(dir: 1 | -1) {
    if (!top || uscita) return
    const item = top
    setUscita({ key: getKey(item), dir })
    setDrag(null)
    uscitaTimer.current = window.setTimeout(() => {
      setUscita(null)
      if (dir === 1) onSalva(item)
      else onScarta(item)
    }, 280)
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (uscita) return
    start.current = { x: e.clientX, y: e.clientY, t: Date.now() }
    setRitorno(false)
    setDrag({ dx: 0, dy: 0 })
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!start.current || uscita) return
    setDrag({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y })
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!start.current || !top) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    const dt = Date.now() - start.current.t
    const distanza = Math.hypot(dx, dy)
    start.current = null
    if (distanza < 8 && dt < 500) {
      setDrag(null)
      onApri(top)
      return
    }
    if (Math.abs(dx) > 96 || (Math.abs(dx) > 48 && dt < 220)) {
      lancia(dx > 0 ? 1 : -1)
    } else {
      setRitorno(true)
      setDrag(null)
    }
  }

  const visibili = items.slice(0, 3)

  return (
    <div className="deck-wrap">
      <div className="deck">
        {visibili
          .map((item, i) => {
            const key = getKey(item)
            const inCima = i === 0
            const inUscita = uscita?.key === key
            let style: React.CSSProperties = {
              zIndex: 10 - i,
              transform: `translateY(${i * 12}px) scale(${1 - i * 0.045})`,
              opacity: i === 2 ? 0.55 : 1,
            }
            let classi = 'deck-card'
            if (inCima && drag) {
              style = {
                zIndex: 10,
                transform: `translate(${drag.dx}px, ${drag.dy * 0.35}px) rotate(${drag.dx * 0.055}deg)`,
              }
              classi += ' trascinata'
            } else if (inCima && inUscita) {
              style = {
                zIndex: 10,
                transform: `translate(${uscita.dir * 140}%, -6%) rotate(${uscita.dir * 22}deg)`,
                opacity: 0,
              }
              classi += ' in-uscita'
            } else if (inCima && ritorno) {
              classi += ' ritorno'
            }
            const intensita = inCima && drag ? Math.max(-1, Math.min(1, drag.dx / 120)) : inUscita ? uscita!.dir : 0
            return (
              <div
                key={key}
                className={classi}
                style={style}
                onPointerDown={inCima ? onPointerDown : undefined}
                onPointerMove={inCima ? onPointerMove : undefined}
                onPointerUp={inCima ? onPointerUp : undefined}
                onPointerCancel={inCima ? () => { start.current = null; setDrag(null) } : undefined}
              >
                {render(item, inCima)}
                {inCima && (
                  <>
                    <div className="deck-stamp salva" style={{ opacity: Math.max(0, intensita) }}>
                      <Icon nome="heart" size={20} /> Salva
                    </div>
                    <div className="deck-stamp passa" style={{ opacity: Math.max(0, -intensita) }}>
                      <Icon nome="x" size={20} /> Passa
                    </div>
                  </>
                )}
              </div>
            )
          })
          .reverse()}
      </div>
      <div className="deck-actions">
        <button className="deck-btn passa" onClick={() => lancia(-1)} aria-label="Passa">
          <Icon nome="x" size={26} />
        </button>
        <button className="deck-btn apri" onClick={() => top && onApri(top)} aria-label="Apri annuncio">
          Apri
        </button>
        <button className="deck-btn salva" onClick={() => lancia(1)} aria-label="Salva">
          <Icon nome="heart" size={24} />
        </button>
      </div>
      <p className="deck-hint muted small">Trascina la card: ← passa · → salva · tocca per aprire</p>
    </div>
  )
}
