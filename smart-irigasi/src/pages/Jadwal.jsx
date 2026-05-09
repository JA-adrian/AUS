import { useState, useEffect, useRef } from 'react'
import api from '../api'
import { gsap } from 'gsap'
import { CalendarClock, Plus, Clock, MapPin, Timer, X } from 'lucide-react'

const ZONE_OPTIONS = [
  { label: 'Zona A — Tanaman', value: 'zona-a' },
]

/* ── Jadwal Row ─────────────────────────────────────────────── */
function JadwalRow({ jadwal, onDelete }) {
  const zoneLabel = ZONE_OPTIONS.find(z => z.value === jadwal.zone)?.label ?? jadwal.zone

  return (
    <div className="jadwal-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42, height: 42,
          borderRadius: 10,
          background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)', flexShrink: 0,
        }}>
          <Clock size={18} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {jadwal.time}
          </div>
          <div className="text-xs text-muted mt-1">
            {zoneLabel} · {jadwal.duration} menit
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="badge badge-green">Aktif</span>
        <button
          className="btn-icon-delete"
          onClick={() => onDelete(jadwal._id)}
          title="Hapus jadwal"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}

/* ── Jadwal Page ─────────────────────────────────────────────── */
function Jadwal() {
  const [jadwalList, setJadwalList] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [form,       setForm]       = useState({
    time: '07:00', zone: 'zona-a', duration: 10
  })

  const pageRef = useRef(null)

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

  // GSAP animate on mount
  useEffect(() => {
    if (loading) return
    if (pageRef.current) {
      const els = pageRef.current.querySelectorAll('.card, .jadwal-row')
      gsap.fromTo(els,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      )
    }
  }, [loading])

  const handleTambah = async () => {
    if (form.duration < 1 || form.duration > 300) {
      setError('Durasi harus antara 1–300 detik!')
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
    <div ref={pageRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div className="page-header">
        <h2>Jadwal Siram</h2>
        <p>Atur jadwal penyiraman otomatis</p>
      </div>

      {/* Form Tambah */}
      <div className="card">
        <div className="section-title">
          <Plus size={15} />
          Tambah Jadwal Baru
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> Waktu
            </label>
            <input
              type="time"
              value={form.time}
              onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
              className="input"
              style={{ width: 130 }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} /> Zona
            </label>
            <select
              value={form.zone}
              onChange={e => setForm(p => ({ ...p, zone: e.target.value }))}
              className="input"
              style={{ width: 'auto' }}
            >
              {ZONE_OPTIONS.map(z => (
                <option key={z.value} value={z.value}>{z.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Timer size={11} /> Durasi (detik)
            </label>
            <input
              type="number" min={1} max={300}
              value={form.duration}
              onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))}
              className="input"
              style={{ width: 100 }}
            />
          </div>

          <button
            onClick={handleTambah}
            disabled={saving}
            className="btn btn-primary"
          >
            <Plus size={15} />
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>

        {error && (
          <div className="alert-msg error mt-3">{error}</div>
        )}
      </div>

      {/* List Jadwal */}
      <div className="card">
        <div className="section-title">
          <CalendarClock size={15} />
          Jadwal Aktif ({jadwalList.length})
        </div>

        {loading ? (
          <div className="spinner-wrap">
            <div className="spinner" />
            Memuat jadwal...
          </div>
        ) : jadwalList.length === 0 ? (
          <div className="empty-state">
            Belum ada jadwal. Tambahkan di atas!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {jadwalList.map(j => (
              <JadwalRow key={j._id} jadwal={j} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default Jadwal