const GRADIENTI: [string, string][] = [
  ['#fde68a', '#f59e0b'],
  ['#bfdbfe', '#3b82f6'],
  ['#fbcfe8', '#ec4899'],
  ['#a5f3fc', '#06b6d4'],
  ['#bbf7d0', '#22c55e'],
  ['#ddd6fe', '#8b5cf6'],
  ['#fed7aa', '#ea580c'],
  ['#c7d2fe', '#6366f1'],
]

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function Avatar({ emoji, id, size = 44 }: { emoji: string; id: string; size?: number }) {
  const [a, b] = GRADIENTI[hashStr(id) % GRADIENTI.length]
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.52,
        background: `linear-gradient(135deg, ${a}, ${b})`,
      }}
    >
      {emoji}
    </span>
  )
}
