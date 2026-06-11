import { getState, saldoUtente } from '../lib/store'
import { Icon } from '../components/Icon'
import { fmtData, fmtEur } from '../lib/format'

const TIPO_EMOJI: Record<string, string> = {
  deposito: '🔒',
  rilascio: '💸',
  commissione: '🏛️',
  rimborso: '↩️',
  abbonamento: '✨',
  accredito: '💰',
}

export function Wallet() {
  const { transazioni } = getState()
  const saldo = saldoUtente()
  return (
    <div className="screen">
      <header className="barra-indietro">
        <button className="btn ghost small" onClick={() => history.back()}>
          <Icon nome="chevron-left" size={18} /> Indietro
        </button>
        <span className="barra-titolo">Portafoglio</span>
        <span style={{ width: 86 }} />
      </header>

      <section className="card card-pad saldo-card">
        <span className="muted small">Saldo movimenti Ribasso</span>
        <strong className={`saldo ${saldo >= 0 ? 'verde' : 'rosso'}`}>{fmtEur(Math.round(saldo * 100) / 100)}</strong>
        <span className="muted small">Depositi in custodia, pagamenti ricevuti, commissioni e rimborsi.</span>
      </section>

      <section className="card card-pad">
        <h3>Movimenti</h3>
        {transazioni.length === 0 && <p className="muted small">Nessun movimento ancora: i pagamenti delle tue transazioni appariranno qui.</p>}
        {transazioni.map((t) => (
          <div key={t.id} className="tx-row">
            <span className="tx-emoji">{TIPO_EMOJI[t.tipo] ?? '•'}</span>
            <span className="tx-info">
              <span className="small">{t.descrizione}</span>
              <span className="muted small">{fmtData(t.data)}</span>
            </span>
            <strong className={t.importo >= 0 ? 'verde' : 'rosso'}>
              {t.importo >= 0 ? '+' : ''}
              {fmtEur(Math.round(t.importo * 100) / 100)}
            </strong>
          </div>
        ))}
      </section>

      <p className="muted small centro">
        Le commissioni sulle transazioni e gli abbonamenti Premium sono ciò che sostiene Ribasso: nessun costo nascosto.
      </p>
    </div>
  )
}
