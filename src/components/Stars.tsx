import { useState } from 'react'

function Stella({ riempita, size }: { riempita: number; size: number }) {
  // riempita: 0..1
  return (
    <span className="stella" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" className="stella-vuota">
        <path d="m12 3 2.7 5.7 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.9 1.1-6.1L3.2 9.5l6.1-.8L12 3Z" fill="#d2d2d7" />
      </svg>
      <span className="stella-piena" style={{ width: `${riempita * 100}%` }}>
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="m12 3 2.7 5.7 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.9 1.1-6.1L3.2 9.5l6.1-.8L12 3Z" fill="#ff9f0a" />
        </svg>
      </span>
    </span>
  )
}

export function Stars({ valore, size = 14 }: { valore: number; size?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${valore.toFixed(1)} su 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Stella key={i} riempita={Math.max(0, Math.min(1, valore - i))} size={size} />
      ))}
    </span>
  )
}

export function StarPicker({ valore, onChange, size = 34 }: { valore: number; onChange: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0)
  const mostra = hover || valore
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          className="star-picker-btn"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          aria-label={`${i} stelle`}
        >
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path
              d="m12 3 2.7 5.7 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.9 1.1-6.1L3.2 9.5l6.1-.8L12 3Z"
              fill={i <= mostra ? '#ff9f0a' : '#d2d2d7'}
            />
          </svg>
        </button>
      ))}
    </div>
  )
}
