import { useState, useEffect } from 'react'
import api from '../api'

const ZONE_OPTIONS = [
  { label: 'Zona A — Tanaman', value: 'zona-a' },
]

function JadwalRow({ jadwal, onDelete }) {
  const zoneLabel = ZONE_OPTIONS.find(z => z.value === jadwal.zone)?.label ?? jadwal.zone

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12,
      padding: '14px 16px',
      backgroundColor: 'rgba(255,255,255,0.02)',
      border: '1px solid #21262d', borderRadius: 10,
    }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>{jadwal.time}</div>
        <div style={{ fontSize: 12, color: '#4a5568', marginTop: 3 }}>
          {zoneLabel} · {jadwal.duration} menit
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          fontSize: 11, color: '#34d399',
          backgroundColor: 'rgba(52,211,153,0.1)',
          padding: '3px 10px', borderRadius: 10, fontWeight: 600,
        }}>Aktif</div>
        <button
          onClick={() => onDelete(jadwal._id)}
          style={{
            background: 'none', border: 'none',
            color: '#4a5568', cursor: 'pointer', fontSize: 18, padding: 4,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = '#4a5568'}
        >✕</button>
      </div>
    </div>
  )
}

function Jadwal() {
  const [jadwalList, setJadwalList] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [form,       setForm]       = useState({
    time: '07:00', zone: 'zona-a', duration: 10
  })

  const fetchJadwal = async () => {
    try {
      const res = await api.get('/jadwal')
      setJadwalList(res.data)
    } catch {
      setError('Gagal mengambil jadwal!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJadwal() }, [])

  const handleTambah = async () => {
    if (form.duration < 1 || form.duration > 60) {
      setError('Durasi harus antara 1–60 menit!')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/jadwal', form)
      setForm({ time: '07:00', zone: 'zona-a', duration: 10 })
      fetchJadwal()
    } catch {
      setError('Gagal menyimpan jadwal!')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/jadwal/${id}`)
      setJadwalList(prev => prev.filter(j => j._id !== id))
    } catch {
      setError('Gagal menghapus jadwal!')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Jadwal</h2>
        <p style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>Atur jadwal penyiraman otomatis</p>
      </div>

      {/* Form */}
      <div style={{
        backgroundColor: '#161b22', border: '1px solid #21262d',
        borderRadius: 12, padding: 20,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Tambah Jadwal Baru</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#718096' }}>Waktu</label>
            <input type="time" value={form.time}
              onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
              style={{ backgroundColor: '#0d1117', border: '1px solid #21262d', color: '#e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#718096' }}>Zona</label>
            <select value={form.zone}
              onChange={e => setForm(p => ({ ...p, zone: e.target.value }))}
              style={{ backgroundColor: '#0d1117', border: '1px solid #21262d', color: '#e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}
            >
              {ZONE_OPTIONS.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#718096' }}>Durasi (menit)</label>
            <input type="number" min={1} max={60} value={form.duration}
              onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))}
              style={{ backgroundColor: '#0d1117', border: '1px solid #21262d', color: '#e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 90 }}
            />
          </div>
          <button onClick={handleTambah} disabled={saving}
            style={{
              padding: '10px 24px',
              background: saving ? '#2d3748' : 'linear-gradient(135deg, #34d399, #059669)',
              border: 'none', borderRadius: 8, color: '#fff',
              fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
        {error && <div style={{ marginTop: 10, fontSize: 13, color: '#f87171' }}>{error}</div>}
      </div>

      {/* List */}
      <div style={{
        backgroundColor: '#161b22', border: '1px solid #21262d',
        borderRadius: 12, padding: 20,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          Jadwal Aktif ({jadwalList.length})
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#4a5568', padding: '32px 0' }}>Memuat jadwal...</div>
        ) : jadwalList.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#4a5568', padding: '32px 0' }}>Belum ada jadwal. Tambahkan di atas!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {jadwalList.map(j => <JadwalRow key={j._id} jadwal={j} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

    </div>
  )
}

export default Jadwal