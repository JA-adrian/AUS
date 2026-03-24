import { useState, useEffect } from 'react'
import api from '../api'
import { usePushNotification } from '../hooks/usePushNotification'

function AlertCard({ alert, onDelete }) {
  const isWarning = alert.type === 'warning'
  const color     = isWarning ? '#fbbf24' : '#60a5fa'
  const bgColor   = isWarning ? 'rgba(251,191,36,0.05)' : 'rgba(96,165,250,0.05)'
  const border    = isWarning ? 'rgba(251,191,36,0.2)'  : 'rgba(96,165,250,0.2)'
  const icon      = isWarning ? '⚠️' : 'ℹ️'
  const typeLabel = isWarning ? 'Peringatan' : 'Informasi'

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      gap: 14, padding: '16px 18px',
      backgroundColor: bgColor,
      border: `1px solid ${border}`,
      borderRadius: 12,
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
            {alert.judul}
          </span>
          <span style={{
            fontSize: 11, color, fontWeight: 600,
            backgroundColor: `${color}18`,
            padding: '2px 8px', borderRadius: 10,
          }}>
            {typeLabel}
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>
          {alert.pesan}
        </div>
        <div style={{ fontSize: 11, color: '#4a5568', marginTop: 6 }}>
          {new Date(alert.createdAt).toLocaleString('id-ID')}
        </div>
      </div>
      <button
        onClick={() => onDelete(alert._id)}
        style={{
          background: 'none', border: 'none',
          color: '#4a5568', cursor: 'pointer',
          fontSize: 18, padding: 4, flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
        onMouseLeave={e => e.currentTarget.style.color = '#4a5568'}
      >✕</button>
    </div>
  )
}

function Alert() {
  const [alerts,  setAlerts]  = useState([])
  const [filter,  setFilter]  = useState('semua')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // Hook dipanggil di sini, bukan di AlertCard
  const { status, mintaIzin } = usePushNotification()

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

  const handleDelete = async (id) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Judul */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Alert</h2>
        <p style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>
          Notifikasi dan peringatan sistem
        </p>
      </div>

      {/* Card Notifikasi */}
      {status !== 'granted' ? (
        <div style={{
          backgroundColor: 'rgba(52,211,153,0.06)',
          border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 12, padding: '16px 20px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
              Aktifkan Notifikasi Chrome
            </div>
            <div style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>
              Terima notifikasi walaupun web tidak dibuka
            </div>
          </div>
          <button
            onClick={mintaIzin}
            style={{
              padding: '9px 20px',
              background: 'linear-gradient(135deg, #34d399, #059669)',
              border: 'none', borderRadius: 8,
              color: '#fff', fontWeight: 700,
              fontSize: 13, fontFamily: 'inherit',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Aktifkan Sekarang
          </button>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'rgba(52,211,153,0.06)',
          border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 12, padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: '#34d399', boxShadow: '0 0 8px #34d399',
          }} />
          <span style={{ fontSize: 13, color: '#34d399', fontWeight: 600 }}>
            Notifikasi sudah aktif
          </span>
        </div>
      )}

      {/* Error */}
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

      {/* Ringkasan */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{
          flex: '1 1 140px', padding: '16px 20px',
          backgroundColor: 'rgba(251,191,36,0.06)',
          border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12,
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fbbf24' }}>{jumlahWarning}</div>
          <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>Peringatan</div>
        </div>
        <div style={{
          flex: '1 1 140px', padding: '16px 20px',
          backgroundColor: 'rgba(96,165,250,0.06)',
          border: '1px solid rgba(96,165,250,0.2)', borderRadius: 12,
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#60a5fa' }}>{jumlahInfo}</div>
          <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>Informasi</div>
        </div>
      </div>

      {/* Filter + Hapus Semua */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['semua', 'warning', 'info'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: 8, border: 'none',
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
              fontFamily: 'inherit',
              backgroundColor: filter === f ? 'rgba(52,211,153,0.12)' : 'transparent',
              color: filter === f ? '#34d399' : '#4a5568',
              transition: 'all 0.2s',
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {alerts.length > 0 && (
          <button
            onClick={hapusSemua}
            style={{
              padding: '7px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #21262d',
              borderRadius: 8, color: '#718096',
              cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = '#718096'}
          >
            Hapus Semua
          </button>
        )}
      </div>

      {/* List Alert */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#4a5568', padding: '48px 0' }}>
          Memuat alert...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', color: '#4a5568', padding: '48px 0',
          backgroundColor: '#161b22', border: '1px solid #21262d', borderRadius: 12,
        }}>
          Tidak ada alert saat ini
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(a => (
            <AlertCard key={a._id} alert={a} onDelete={handleDelete} />
          ))}
        </div>
      )}

    </div>
  )
}

export default Alert