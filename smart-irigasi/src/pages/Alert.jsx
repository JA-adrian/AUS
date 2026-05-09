import { useState, useEffect, useRef } from 'react'
import api from '../api'
import { gsap } from 'gsap'
import { usePushNotification } from '../hooks/usePushNotification'
import { BellRing, AlertTriangle, Info, BellOff, X, Trash2, CheckCircle } from 'lucide-react'

/* ── Alert Card ──────────────────────────────────────────────── */
function AlertCard({ alert, onDelete }) {
  const isWarning = alert.type === 'warning'
  const color     = isWarning ? 'var(--yellow)' : 'var(--blue)'
  const bgColor   = isWarning ? 'var(--yellow-bg)' : 'var(--blue-bg)'
  const borderCol = isWarning ? 'var(--yellow-br)' : 'var(--blue-br)'
  const Icon      = isWarning ? AlertTriangle : Info
  const typeLabel = isWarning ? 'Peringatan' : 'Informasi'

  return (
    <div className="alert-card" style={{
      background: bgColor,
      border: `1px solid ${borderCol}`,
    }}>
      <div style={{
        width: 36, height: 36,
        borderRadius: 10,
        background: `${isWarning ? '#fbbf2420' : '#60a5fa20'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}>
        <Icon size={18} />
      </div>

      <div style={{ flex: 1 }}>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            {alert.judul}
          </span>
          <span className="badge" style={{
            background: `${isWarning ? '#fbbf2418' : '#60a5fa18'}`,
            color,
          }}>
            {typeLabel}
          </span>
        </div>
        <div className="text-sm text-secondary">{alert.pesan}</div>
        <div className="text-xs text-muted mt-1">
          {new Date(alert.createdAt).toLocaleString('id-ID')}
        </div>
      </div>

      <button
        className="btn-icon-delete"
        onClick={() => onDelete(alert._id)}
        title="Hapus alert"
      >
        <X size={15} />
      </button>
    </div>
  )
}

/* ── Alert Page ──────────────────────────────────────────────── */
function Alert() {
  const [alerts,  setAlerts]  = useState([])
  const [filter,  setFilter]  = useState('semua')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const { status, mintaIzin } = usePushNotification()
  const pageRef = useRef(null)

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alert')
      setAlerts(res.data)
      setError('')
    } catch {
      setError('Gagal mengambil alert!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 5000)
    return () => clearInterval(interval)
  }, [])

  // GSAP animate
  useEffect(() => {
    if (loading) return
    if (pageRef.current) {
      const els = pageRef.current.querySelectorAll('.card, .alert-card')
      gsap.fromTo(els,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.07, ease: 'power2.out' }
      )
    }
  }, [loading])

  const handleDelete = async (id) => {
    // animate out
    const card = document.querySelector(`[data-alert-id="${id}"]`)
    if (card) {
      await gsap.to(card, { x: 20, opacity: 0, duration: 0.2, ease: 'power2.in' })
    }
    try {
      await api.delete(`/alert/${id}`)
      setAlerts(prev => prev.filter(a => a._id !== id))
    } catch {
      setError('Gagal menghapus alert!')
    }
  }

  const hapusSemua = async () => {
    try {
      await api.delete('/alert/all')
      setAlerts([])
    } catch {
      setError('Gagal menghapus semua alert!')
    }
  }

  const filtered = alerts.filter(a => {
    if (filter === 'semua')   return true
    if (filter === 'warning') return a.type === 'warning'
    if (filter === 'info')    return a.type === 'info'
    return true
  })

  const jumlahWarning = alerts.filter(a => a.type === 'warning').length
  const jumlahInfo    = alerts.filter(a => a.type === 'info').length

  return (
    <div ref={pageRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div className="page-header">
        <h2>Alert & Notifikasi</h2>
        <p>Peringatan dan informasi sistem</p>
      </div>

      {/* Notifikasi Push */}
      {status !== 'granted' ? (
        <div className="card flex items-center justify-between gap-3" style={{ flexWrap: 'wrap' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--accent-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)',
            }}>
              <BellRing size={18} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Aktifkan Notifikasi Browser</div>
              <div className="text-sm text-muted">Terima alert walaupun tab tidak aktif</div>
            </div>
          </div>
          <button onClick={mintaIzin} className="btn btn-primary" style={{ padding: '9px 20px' }}>
            Aktifkan
          </button>
        </div>
      ) : (
        <div className="card flex items-center gap-3">
          <CheckCircle size={18} style={{ color: 'var(--accent)' }} />
          <span className="text-sm" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Notifikasi sudah aktif
          </span>
        </div>
      )}

      {error && <div className="alert-msg error">{error}</div>}

      {/* Ringkasan */}
      <div className="flex gap-3 flex-wrap">
        <div className="card" style={{ flex: '1 1 140px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8
          }}>
            <AlertTriangle size={16} style={{ color: 'var(--yellow)' }} />
            <span className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Peringatan</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--yellow)', letterSpacing: '-0.03em' }}>
            {jumlahWarning}
          </div>
        </div>
        <div className="card" style={{ flex: '1 1 140px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8
          }}>
            <Info size={16} style={{ color: 'var(--blue)' }} />
            <span className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Informasi</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--blue)', letterSpacing: '-0.03em' }}>
            {jumlahInfo}
          </div>
        </div>
      </div>

      {/* Filter + Hapus Semua */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="filter-tabs">
          {['semua', 'warning', 'info'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-tab${filter === f ? ' active' : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {alerts.length > 0 && (
          <button onClick={hapusSemua} className="btn btn-ghost" style={{ fontSize: 12, padding: '7px 14px' }}>
            <Trash2 size={13} />
            Hapus Semua
          </button>
        )}
      </div>

      {/* List Alert */}
      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          Memuat alert...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <BellOff size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block' }} />
          Tidak ada alert saat ini
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(a => (
            <div key={a._id} data-alert-id={a._id}>
              <AlertCard alert={a} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default Alert