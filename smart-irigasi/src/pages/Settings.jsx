import { useState, useEffect } from 'react'
import api from '../api'

function Settings() {
  const [threshold,   setThreshold]   = useState(35)
  const [durasiSiram, setDurasiSiram] = useState(10)
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [sukses,      setSukses]      = useState('')

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings')
      setThreshold(res.data.threshold)
      setDurasiSiram(res.data.durasiSiram)
    } catch {
      setError('Gagal mengambil settings!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const handleSimpan = async () => {
    setSaving(true)
    setError('')
    setSukses('')
    try {
      await api.put('/settings', { threshold, durasiSiram })
      setSukses('Settings berhasil disimpan!')
      setTimeout(() => setSukses(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan settings!')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', color: '#4a5568', padding: '60px 0' }}>
      Memuat settings...
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Judul */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Pengaturan</h2>
        <p style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>
          Konfigurasi sistem auto siram
        </p>
      </div>

      {/* Sukses */}
      {sukses && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(52,211,153,0.06)',
          border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 10, color: '#34d399', fontSize: 13,
        }}>
          {sukses}
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

      {/* Card Auto Siram */}
      <div style={{
        backgroundColor: '#161b22', border: '1px solid #21262d',
        borderRadius: 12, padding: 20,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
          Konfigurasi Auto Siram
        </div>

        {/* Threshold */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                Threshold Kelembapan
              </div>
              <div style={{ fontSize: 12, color: '#4a5568', marginTop: 2 }}>
                Pompa nyala otomatis kalau kelembapan di bawah nilai ini
              </div>
            </div>
            <span style={{
              fontSize: 20, fontWeight: 700, color: '#34d399',
              minWidth: 60, textAlign: 'right',
            }}>
              {threshold}%
            </span>
          </div>
          <input
            type="range" min={10} max={80} value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#34d399' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4a5568', marginTop: 4 }}>
            <span>10% (Sangat Kering)</span>
            <span>80% (Hampir Basah)</span>
          </div>
        </div>

        {/* Durasi Siram */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                Durasi Auto Siram
              </div>
              <div style={{ fontSize: 12, color: '#4a5568', marginTop: 2 }}>
                Berapa lama pompa menyala saat auto siram
              </div>
            </div>
            <span style={{
              fontSize: 20, fontWeight: 700, color: '#60a5fa',
              minWidth: 80, textAlign: 'right',
            }}>
              {durasiSiram} detik
            </span>
          </div>
          <input
            type="range" min={1} max={300} value={durasiSiram}
            onChange={e => setDurasiSiram(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#60a5fa' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4a5568', marginTop: 4 }}>
            <span>1 detik</span>
            <span>300 detik (5 menit)</span>
          </div>
        </div>

        {/* Tombol Simpan */}
        <button
          onClick={handleSimpan}
          disabled={saving}
          style={{
            width: '100%', padding: 12,
            background: saving ? '#2d3748' : 'linear-gradient(135deg, #34d399, #059669)',
            border: 'none', borderRadius: 10,
            color: '#fff', fontWeight: 700,
            fontSize: 14, fontFamily: 'inherit',
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  )
}

export default Settings