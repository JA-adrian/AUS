import { useState, useEffect, useRef } from 'react'
import api from '../api'

const ZONES = [
  { id: 'zona-a', name: 'Zona A — Tanaman' },
]

function ToggleSwitch({ active, onToggle, disabled }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      style={{
        width: 52, height: 28,
        borderRadius: 14, border: 'none',
        backgroundColor: active ? '#34d399' : '#2d3748',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        transition: 'background 0.3s',
        boxShadow: active ? '0 0 12px #34d39966' : 'none',
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3,
        left: active ? 26 : 3,
        width: 22, height: 22,
        borderRadius: '50%',
        backgroundColor: '#fff',
        transition: 'left 0.3s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

function ZoneCard({ zone, active, durasi, onDurasiChange, onToggle, loading, countdown }) {
  return (
    <div style={{
      backgroundColor: active ? 'rgba(52,211,153,0.06)' : '#161b22',
      border: `1px solid ${active ? 'rgba(52,211,153,0.3)' : '#21262d'}`,
      borderRadius: 12,
      padding: '18px 20px',
      transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>
            {zone.name}
          </div>
          <div style={{ fontSize: 12, marginTop: 4, color: active ? '#34d399' : '#4a5568' }}>
            {loading ? 'Memproses...'
              : active && countdown > 0 ? `Menyiram... selesai dalam ${countdown} detik`
              : active ? 'Sedang menyiram...'
              : 'Standby'}
          </div>
        </div>
        <ToggleSwitch active={active} onToggle={() => onToggle(zone.id, durasi)} disabled={loading} />
      </div>

      {/* Input durasi */}
      {!active && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#718096' }}>Durasi siram:</span>
          <input
            type="number" min={1} max={300}
            value={durasi}
            onChange={e => onDurasiChange(zone.id, Number(e.target.value))}
            style={{
              width: 70, padding: '6px 10px',
              backgroundColor: '#0d1117',
              border: '1px solid #21262d',
              borderRadius: 8, color: '#e2e8f0',
              fontSize: 13, fontFamily: 'inherit', outline: 'none',
            }}
          />
          <span style={{ fontSize: 12, color: '#718096' }}>detik</span>
        </div>
      )}

      {/* Progress bar countdown */}
      {active && countdown > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{
            height: 6, backgroundColor: 'rgba(255,255,255,0.06)',
            borderRadius: 3, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(countdown / durasi) * 100}%`,
              background: 'linear-gradient(90deg, #34d39988, #34d399)',
              borderRadius: 3,
              transition: 'width 1s linear',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}

function Kontrol() {
  const [pumpStatus,  setPumpStatus]  = useState({})
  const [loadingZone, setLoadingZone] = useState({})
  const [durasi,      setDurasi]      = useState({ 'zona-a': 10, 'zona-b': 10, 'zona-c': 10 })
  const [countdown,   setCountdown]   = useState({})
  const [autoMode,    setAutoMode]    = useState(false)
  const [threshold,   setThreshold]   = useState(35)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const timers = useRef({})

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

  const startCountdown = (zoneId, detik) => {
    // Clear timer lama kalau ada
    if (timers.current[zoneId]) {
      clearInterval(timers.current[zoneId])
    }

    setCountdown(prev => ({ ...prev, [zoneId]: detik }))

    const interval = setInterval(() => {
      setCountdown(prev => {
        const sisa = prev[zoneId] - 1
        if (sisa <= 0) {
          clearInterval(timers.current[zoneId])
          // Matikan pompa otomatis
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
        // Pompa nyala — mulai countdown
        startCountdown(zoneId, durasiDetik)
      } else {
        // Pompa dimatikan manual — stop countdown
        if (timers.current[zoneId]) {
          clearInterval(timers.current[zoneId])
        }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Kontrol</h2>
        <p style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>
          Kelola pompa dan pengaturan otomatis
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, color: '#f87171', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Mode Otomatis */}
      <div style={{
        backgroundColor: '#161b22', border: '1px solid #21262d',
        borderRadius: 12, padding: 20,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Mode Otomatis</div>
            <div style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>
              Pompa menyala otomatis saat kelembapan di bawah threshold
            </div>
            {autoMode && (
              <div style={{ fontSize: 12, color: '#34d399', marginTop: 6 }}>
                ● Aktif — pengaturan threshold di halaman Pengaturan
              </div>
            )}
          </div>
          <ToggleSwitch active={autoMode} onToggle={() => setAutoMode(!autoMode)} />
        </div>
      </div>

      {/* Kontrol Pompa */}
      <div style={{
        backgroundColor: '#161b22', border: '1px solid #21262d',
        borderRadius: 12, padding: 20,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          Kontrol Manual Pompa
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#4a5568', padding: '32px 0' }}>
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
            style={{
              marginTop: 16, width: '100%', padding: 12,
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, color: '#f87171',
              cursor: 'pointer', fontWeight: 600,
              fontSize: 13, fontFamily: 'inherit',
            }}
          >
            Matikan Semua Pompa
          </button>
        )}
      </div>

    </div>
  )
}

export default Kontrol