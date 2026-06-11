import { useEffect, useState } from 'react'
import { adesso } from '../lib/store'
import { fmtDurata } from '../lib/format'
import { Icon } from './Icon'

export function Countdown({ scadeIl, label = true }: { scadeIl: number; label?: boolean }) {
  const [, setN] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setN((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const resto = scadeIl - adesso()
  const urgente = resto > 0 && resto < 2 * 3600000
  return (
    <span className={`countdown ${resto <= 0 ? 'scaduto' : urgente ? 'urgente' : ''}`}>
      <Icon nome="clock" size={14} />
      {resto <= 0 ? 'Asta chiusa' : label ? `Si chiude tra ${fmtDurata(resto)}` : fmtDurata(resto)}
    </span>
  )
}
