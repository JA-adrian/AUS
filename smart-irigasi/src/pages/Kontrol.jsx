import { useState, useEffect, useRef } from 'react'
import api from '../api'
import { gsap } from 'gsap'
import { Droplets, Zap, PowerOff, Timer } from 'lucide-react'

const ZONES = [
  { id: 'zona-a', name: 'Zona A — Tanaman' },
]

/* ── Toggle Switch ─────────────────────────────────────────── */
function ToggleSwitch({ active, onToggle, disabled }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`toggle ${active ? 'on' : 'off'}`}
    >
      <div className="toggle__knob" />
    </button>
  )
}

/* ── Zone Card ─────────────────────────────────────────────── */
function ZoneCard({ zone, active, durasi, onDurasiChange, onToggle, loading, countdown }) {
  return (
    <div className={`zone-card${active ? ' active' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplets size={16} style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} />
            {zone.name}
          </div>
          <div style={{ fontSize: 12, marginTop: 4, color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
            {loading ? 'Memproses...'
              : active && countdown > 0 ? `Menyiram... selesai dalam ${countdown}s`
              : active ? 'Sedang menyiram...'
              : 'Standby'}
          </div>
        </div>
        <ToggleSwitch active={active} onToggle={() => onToggle(zone.id, durasi)} disabled={loading} />
      </div>

      {/* Input durasi */}
      {!active && (
        <div className="flex items-center gap-3 mt-3">
          <Timer size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs text-muted">Durasi siram:</span>
          <input
            type="number" min={1} max={300}
            value={durasi}
            onChange={e => onDurasiChange(zone.id, Number(e.target.value))}
            className="input"
            style={{ width: 72, padding: '5px 10px', fontSize: 13 }}
          />
          <span className="text-xs text-muted">detik</span>
        </div>
      )}

      {/* Countdown progress */}
      {active && countdown > 0 && (
        <div className="mt-3">
          <div className="progress-wrap">
            <div className="progress-bar" style={{
              width: `${(countdown / durasi) * 100}%`,
              background: 'linear-gradient(90deg, var(--accent-dark), var(--accent))',
              boxShadow: '0 0 8px var(--accent-glow)',
              transition: 'width 1s linear',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Kontrol Page ─────────────────────────────────────────── */
function Kontrol() {
  const [pumpStatus,  setPumpStatus]  = useState({})
  const [loadingZone, setLoadingZone] = useState({})
  const [durasi,      setDurasi]      = useState({ 'zona-a': 10 })
  const [countdown,   setCountdown]   = useState({})
  const [autoMode,    setAutoMode]    = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const timers = useRef({})
  const pageRef = useRef(null)

  const fetchStatus = async () => {
    try {
      const res = await api.get('/pompa')
      const statusMap = {}
      res.data.forEach(p => { statusMap[p.zone] = p.isActive })
      setPumpStatus(statusMap)
      setError('')
    } catch {
      setError('Gagal mengambil status pompa!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  // GSAP animate on mount
  useEffect(() => {
    if (loading) return
    if (pageRef.current) {
      const els = pageRef.current.querySelectorAll('.card, .zone-card')
      gsap.fromTo(els,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      )
    }
  }, [loading])

  const startCountdown = (zoneId, detik) => {
    if (timers.current[zoneId]) clearInterval(timers.current[zoneId])
    setCountdown(prev => ({ ...prev, [zoneId]: detik }))
    const interval = setInterval(() => {
      setCountdown(prev => {
        const sisa = prev[zoneId] - 1
        if (sisa <= 0) {
          clearInterval(timers.current[zoneId])
          matikanPompa(zoneId)
          return { ...prev, [zoneId]: 0 }
        }
        return { ...prev, [zoneId]: sisa }
      })
    }, 1000)
    timers.current[zoneId] = interval
  }

  const matikanPompa = async (zoneId) => {
    try {
      await api.put(`/pompa/${zoneId}`, { isActive: false })
      setPumpStatus(prev => ({ ...prev, [zoneId]: false }))
    } catch {
      setError(`Gagal matikan pompa ${zoneId}!`)
    }
  }

  const toggleZone = async (zoneId, durasiDetik) => {
    const newStatus = !pumpStatus[zoneId]
    setLoadingZone(prev => ({ ...prev, [zoneId]: true }))
    try {
      await api.put(`/pompa/${zoneId}`, { isActive: newStatus })
      setPumpStatus(prev => ({ ...prev, [zoneId]: newStatus }))
      if (newStatus) {
        startCountdown(zoneId, durasiDetik)
      } else {
        if (timers.current[zoneId]) clearInterval(timers.current[zoneId])
        setCountdown(prev => ({ ...prev, [zoneId]: 0 }))
      }
      setError('')
    } catch {
      setError(`Gagal update pompa ${zoneId}!`)
    } finally {
      setLoadingZone(prev => ({ ...prev, [zoneId]: false }))
    }
  }

  const matikanSemua = async () => {
    try {
      await Promise.all(ZONES.map(z => api.put(`/pompa/${z.id}`, { isActive: false })))
      const allOff = {}
      ZONES.forEach(z => {
        allOff[z.id] = false
        if (timers.current[z.id]) clearInterval(timers.current[z.id])
      })
      setPumpStatus(allOff)
      setCountdown({})
      setError('')
    } catch {
      setError('Gagal mematikan semua pompa!')
    }
  }

  const handleDurasiChange = (zoneId, nilai) => {
    setDurasi(prev => ({ ...prev, [zoneId]: nilai }))
  }

  const adaYangAktif = Object.values(pumpStatus).some(Boolean)

  return (
    <div ref={pageRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div className="page-header">
        <h2>Kontrol Pompa</h2>
        <p>Kelola pompa dan pengaturan irigasi otomatis</p>
      </div>

      {error && (
        <div className="alert-msg error">{error}</div>
      )}

      {/* Mode Otomatis */}
      <div className="card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>
              <Zap size={15} />
              Mode Otomatis
            </div>
            <div className="text-sm text-muted">
              Pompa menyala otomatis saat kelembapan di bawah threshold
            </div>
            {autoMode && (
              <div className="text-sm mt-1" style={{ color: 'var(--accent)' }}>
                ● Aktif — lihat pengaturan threshold di Pengaturan
              </div>
            )}
          </div>
          <ToggleSwitch active={autoMode} onToggle={() => setAutoMode(!autoMode)} />
        </div>
      </div>

      {/* Kontrol Manual */}
      <div className="card">
        <div className="section-title">
          <Droplets size={15} />
          Kontrol Manual Pompa
        </div>

        {loading ? (
          <div className="spinner-wrap">
            <div className="spinner" />
            Memuat status pompa...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ZONES.map(zone => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                active={!!pumpStatus[zone.id]}
                durasi={durasi[zone.id]}
                onDurasiChange={handleDurasiChange}
                onToggle={toggleZone}
                loading={!!loadingZone[zone.id]}
                countdown={countdown[zone.id] || 0}
              />
            ))}
          </div>
        )}

        {adaYangAktif && (
          <button
            onClick={matikanSemua}
            className="btn btn-danger w-full mt-4"
          >
            <PowerOff size={15} />
            Matikan Semua Pompa
          </button>
        )}
      </div>

    </div>
  )
}

export default Kontrol