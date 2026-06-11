interface IconProps {
  nome: IconName
  size?: number
  className?: string
}

export type IconName =
  | 'cards'
  | 'briefcase'
  | 'plus'
  | 'megaphone'
  | 'user'
  | 'star'
  | 'pin'
  | 'clock'
  | 'bolt'
  | 'shield'
  | 'check'
  | 'x'
  | 'heart'
  | 'euro'
  | 'chevron-left'
  | 'chevron-right'
  | 'sparkles'
  | 'camera'
  | 'link'
  | 'refresh'
  | 'info'
  | 'gavel'
  | 'wallet'
  | 'lock'
  | 'send'
  | 'repeat'
  | 'scale'

const PATHS: Record<IconName, JSX.Element> = {
  cards: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="3" />
      <path d="M3 7v10M21 7v10" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12h18" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  megaphone: (
    <>
      <path d="M3 10v4a1 1 0 0 0 1 1h2l4 4V5L6 9H4a1 1 0 0 0-1 1Z" />
      <path d="M14 8a4 4 0 0 1 0 8M17.5 5.5a8 8 0 0 1 0 13" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  star: <path d="m12 3 2.7 5.7 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.9 1.1-6.1L3.2 9.5l6.1-.8L12 3Z" />,
  pin: (
    <>
      <path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  bolt: <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" />,
  shield: (
    <>
      <path d="M12 3 5 5.5v6c0 4.5 3 7.6 7 9.5 4-1.9 7-5 7-9.5v-6L12 3Z" />
      <path d="m9 11.5 2.2 2.2L15.5 9" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  heart: <path d="M12 20.5S4 15 4 9.6A4.6 4.6 0 0 1 12 6.5a4.6 4.6 0 0 1 8 3.1c0 5.4-8 10.9-8 10.9Z" />,
  euro: (
    <>
      <path d="M17.5 5.5A7.5 7.5 0 1 0 17.5 18.5" />
      <path d="M4.5 10.5h9M4.5 13.5h8" />
    </>
  ),
  'chevron-left': <path d="M14.5 5.5 8 12l6.5 6.5" />,
  'chevron-right': <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  sparkles: (
    <>
      <path d="M12 4.5 13.6 9 18 10.5 13.6 12 12 16.5 10.4 12 6 10.5 10.4 9 12 4.5Z" />
      <path d="M19 15.5v4M17 17.5h4M5.5 4v3M4 5.5h3" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M8.5 7 10 4.5h4L15.5 7" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 1 0 13 5.3l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 1 0 11 18.7l1-1" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 3.5V8h-4.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5v.5" />
    </>
  ),
  gavel: (
    <>
      <path d="m9 7 5.5 5.5M12 4l5.5 5.5M3.5 20.5 11 13M14.5 2.5l6 6-3 3-6-6 3-3Z" />
      <path d="M13 21h8" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="14" rx="3" />
      <path d="M3 10h18M16 15h2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="3" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  send: <path d="m4 11 16-7-5 16-3.5-6L4 11Z" />,
  repeat: (
    <>
      <path d="M4 12a8 8 0 0 1 8-8h5" />
      <path d="M14.5 1.5 17 4l-2.5 2.5" />
      <path d="M20 12a8 8 0 0 1-8 8H7" />
      <path d="M9.5 22.5 7 20l2.5-2.5" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16M5 7h14M12 20h0M8 20h8" />
      <path d="M5 7 2.5 13a3 3 0 0 0 5 0L5 7ZM19 7l-2.5 6a3 3 0 0 0 5 0L19 7Z" />
    </>
  ),
}

export function Icon({ nome, size = 22, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[nome]}
    </svg>
  )
}
