import { useRef } from 'react'
import { comprimiFoto } from '../lib/format'
import { Icon } from './Icon'
import { toast } from '../lib/toast'

export function FotoUploader({ foto, onChange, max = 4 }: { foto: string[]; onChange: (f: string[]) => void; max?: number }) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function onFiles(files: FileList | null) {
    if (!files) return
    const nuove: string[] = []
    for (const f of Array.from(files).slice(0, max - foto.length)) {
      try {
        nuove.push(await comprimiFoto(f))
      } catch {
        toast('Impossibile leggere una delle foto', 'errore')
      }
    }
    if (nuove.length > 0) onChange([...foto, ...nuove])
  }

  return (
    <div className="foto-uploader">
      <div className="foto-grid">
        {foto.map((f, i) => (
          <span key={i} className="foto-thumb">
            <img src={f} alt={`Foto ${i + 1}`} />
            <button className="foto-rimuovi" onClick={() => onChange(foto.filter((_, j) => j !== i))} aria-label="Rimuovi foto">
              <Icon nome="x" size={12} />
            </button>
          </span>
        ))}
        {foto.length < max && (
          <button className="foto-aggiungi" onClick={() => inputRef.current?.click()}>
            <Icon nome="camera" size={22} />
            <span className="small">Aggiungi</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          void onFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
