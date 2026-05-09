import { useState, useEffect, useRef } from 'react'
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import api from '../api'
import { gsap } from 'gsap'
import { Droplets, Thermometer, Wind, Activity } from 'lucide-react'

/* ── Stat Card ─────────────────────────────────────────────── */
function StatCard({ label, value, unit, status, color, Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card__glow" style={{ background: color }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span className="stat-card__label">{label}</span>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color, flexShrink: 0,
        }}>
          <Icon size={16} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
        <span className="stat-card__value">{value ?? '—'}</span>
        <span className="stat-card__unit" style={{ color }}>{unit}</span>
      </div>

      <div className="badge" style={{
        background: `${color}18`, color,
        border: `1px solid ${color}30`,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: color, boxShadow: `0 0 6px ${color}`,
          display: 'inline-block',
        }} />
        {status}
      </div>
    </div>
  )
}

/* ── Chart Tooltip ──────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="text-xs text-muted" style={{ marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}{p.unit}
        </div>
      ))}
    </div>
  )
}

/* ── Dashboard ──────────────────────────────────────────────── */
function Dashboard() {
  const [latest,  setLatest]  = useState(null)
  const [histori, setHistori] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const cardsRef   = useRef(null)
  const contentRef = useRef(null)
  const ZONE = 'zona-a'

  const fetchData = async () => {
    try {
      const [latestRes, historiRes] = await Promise.all([
        api.get(`/sensor/terbaru/${ZONE}`),
        api.get(`/sensor/histori/${ZONE}`),
      ])
      setLatest(latestRes.data)
      setHistori(historiRes.data.map(d => ({
        time:     new Date(d.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        moisture: d.moisture,
        temp:     d.temperature,
        humidity: d.humidity,
      })))
      setError('')
    } catch {
      setError('Gagal mengambil data sensor. Pastikan backend berjalan!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  // GSAP: animate on load
  useEffect(() => {
    if (loading) return
    const tl = gsap.timeline()

    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.stat-card')
      tl.fromTo(cards,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      )
    }
    if (contentRef.current) {
      const sections = contentRef.current.querySelectorAll('.card')
      tl.fromTo(sections,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
        '-=0.2'
      )
    }
  }, [loading])

  if (loading) return (
    <div className="spinner-wrap">
      <div className="spinner" />
      Memuat data...
    </div>
  )

  if (error) return (
    <div className="alert-msg error" style={{ marginTop: 20 }}>{error}</div>
  )

  const moistureColor  = !latest ? 'var(--text-muted)'
    : latest.moisture < 30 ? 'var(--red)'
    : latest.moisture < 50 ? 'var(--yellow)' : 'var(--accent)'

  const moistureStatus = !latest ? '—'
    : latest.moisture < 30 ? 'Terlalu Kering!'
    : latest.moisture < 50 ? 'Cukup' : 'Optimal'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Monitoring real-time kondisi tanaman — Zona A</p>
      </div>

      {/* Stat Cards */}
      <div ref={cardsRef} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <StatCard
          label="Kelembapan Tanah"
          value={latest?.moisture}
          unit="%"
          color={moistureColor.startsWith('var') ? '#34d399' : moistureColor}
          status={moistureStatus}
          Icon={Droplets}
        />
        <StatCard
          label="Suhu Udara"
          value={latest?.temperature}
          unit="°C"
          color="#60a5fa"
          status="Normal"
          Icon={Thermometer}
        />
        <StatCard
          label="Kelembapan Udara"
          value={latest?.humidity}
          unit="%"
          color="#a78bfa"
          status="Baik"
          Icon={Wind}
        />
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Progress bar kelembapan */}
        <div className="card">
          <div className="section-title">
            <Activity size={15} />
            Level Kelembapan Tanah
          </div>
          <div className="progress-wrap">
            <div className="progress-bar" style={{
              width: `${latest?.moisture ?? 0}%`,
              background: `linear-gradient(90deg, ${
                !latest ? '#4a5568'
                : latest.moisture < 30 ? '#f8717188' : latest.moisture < 50 ? '#fbbf2488' : '#34d39988'
              }, ${
                !latest ? '#4a5568'
                : latest.moisture < 30 ? '#f87171' : latest.moisture < 50 ? '#fbbf24' : '#34d399'
              })`,
              boxShadow: `0 0 10px ${
                !latest ? 'transparent'
                : latest.moisture < 30 ? '#f8717133' : latest.moisture < 50 ? '#fbbf2433' : '#34d39933'
              }`,
            }} />
          </div>
          <div className="flex gap-3 mt-3 flex-wrap">
            {[
              { label: 'Kering',  color: '#f87171', range: '0–30%'   },
              { label: 'Cukup',   color: '#fbbf24', range: '30–50%'  },
              { label: 'Optimal', color: '#34d399', range: '50–100%' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 text-xs text-muted">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                {l.label} ({l.range})
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        {histori.length > 0 ? (
          <>
            <div className="card">
              <div className="section-title">
                <Droplets size={15} />
                Kelembapan Tanah — 24 Jam Terakhir
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={histori}>
                  <defs>
                    <linearGradient id="moistGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#34d399" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} interval={5} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="moisture" name="Kelembapan"
                    stroke="#34d399" strokeWidth={2} fill="url(#moistGrad)" unit="%" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="section-title">
                <Thermometer size={15} />
                Suhu & Kelembapan Udara — 24 Jam Terakhir
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={histori}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} interval={5} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="temp"     name="Suhu"       stroke="#60a5fa" strokeWidth={2} dot={false} unit="°C" />
                  <Line type="monotone" dataKey="humidity" name="Kelembapan" stroke="#a78bfa" strokeWidth={2} dot={false} unit="%" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="empty-state">
            Belum ada data histori. Kirim beberapa data sensor lewat Postman!
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard