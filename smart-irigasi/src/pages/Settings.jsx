import { useState, useEffect, useRef } from 'react'
import api from '../api'
import { gsap } from 'gsap'
import { useTheme } from '../context/ThemeContext'
import { Settings2, Sun, Moon, Droplets, Timer, Save } from 'lucide-react'

function Settings() {
  const [threshold,   setThreshold]   = useState(35)
  const [durasiSiram, setDurasiSiram] = useState(10)
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [sukses,      setSukses]      = useState('')

  const { theme, toggleTheme } = useTheme()
  const pageRef = useRef(null)

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

  // GSAP animate
  useEffect(() => {
    if (loading) return
    if (pageRef.current) {
      const els = pageRef.current.querySelectorAll('.card')
      gsap.fromTo(els,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      )
    }
  }, [loading])

  const handleSimpan = async () => {
    setSaving(true)
    setError('')
    setSukses('')
    try {
      await api.put('/settings', { threshold, durasiSiram })
      setSukses('Pengaturan berhasil disimpan!')
      setTimeout(() => setSukses(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan settings!')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="spinner-wrap">
      <div className="spinner" />
      Memuat pengaturan...
    </div>
  )

  return (
    <div ref={pageRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div className="page-header">
        <h2>Pengaturan</h2>
        <p>Konfigurasi sistem auto siram dan tampilan</p>
      </div>

      {sukses && <div className="alert-msg success">{sukses}</div>}
      {error  && <div className="alert-msg error">{error}</div>}

      {/* ── Tampilan (Dark / Light Mode) ── */}
      <div className="card">
        <div className="section-title">
          {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
          Tampilan
        </div>

        <div className="flex items-center justify-between" style={{
          padding: '14px 16px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xs)',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}
            </div>
            <div className="text-sm text-muted mt-1">
              {theme === 'dark'
                ? 'Tampilan saat ini gelap (dark mode)'
                : 'Tampilan saat ini terang (light mode)'}
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{ gap: 8, padding: '9px 18px' }}
          >
            {theme === 'dark'
              ? <><Sun size={15} /> Mode Terang</>
              : <><Moon size={15} /> Mode Gelap</>
            }
          </button>
        </div>
      </div>

      {/* ── Auto Siram ── */}
      <div className="card">
        <div className="section-title">
          <Settings2 size={15} />
          Konfigurasi Auto Siram
        </div>

        {/* Threshold */}
        <div style={{ marginBottom: 28 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Droplets size={15} style={{ color: 'var(--accent)' }} />
                Threshold Kelembapan
              </div>
              <div className="text-sm text-muted mt-1">
                Pompa nyala otomatis kalau kelembapan di bawah nilai ini
              </div>
            </div>
            <span style={{
              fontSize: 22, fontWeight: 800,
              color: 'var(--accent)',
              letterSpacing: '-0.03em',
              minWidth: 60, textAlign: 'right',
            }}>
              {threshold}%
            </span>
          </div>
          <input
            type="range" min={10} max={80} value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>10% (Sangat Kering)</span>
            <span>80% (Hampir Basah)</span>
          </div>
        </div>

        {/* Durasi Siram */}
        <div style={{ marginBottom: 28 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Timer size={15} style={{ color: 'var(--blue)' }} />
                Durasi Auto Siram
              </div>
              <div className="text-sm text-muted mt-1">
                Berapa lama pompa menyala saat auto siram
              </div>
            </div>
            <span style={{
              fontSize: 22, fontWeight: 800,
              color: 'var(--blue)',
              letterSpacing: '-0.03em',
              minWidth: 90, textAlign: 'right',
            }}>
              {durasiSiram}s
            </span>
          </div>
          <input
            type="range" min={1} max={300} value={durasiSiram}
            onChange={e => setDurasiSiram(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--blue)' }}
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>1 detik</span>
            <span>300 detik (5 menit)</span>
          </div>
        </div>

        <button
          onClick={handleSimpan}
          disabled={saving}
          className="btn btn-primary w-full"
          style={{ padding: '13px' }}
        >
          <Save size={16} />
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>

    </div>
  )
}

export default Settings