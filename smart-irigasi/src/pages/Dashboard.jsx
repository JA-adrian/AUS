import { useState, useEffect } from 'react'
import {
  AreaChart, Area,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import api from '../api'

function StatCard({ label, value, unit, status, color }) {
  return (
    <div style={{
      backgroundColor: '#161b22',
      border: '1px solid #21262d',
      borderRadius: 12,
      padding: '20px 24px',
      flex: '1 1 160px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle at 100% 0%, ${color}22 0%, transparent 70%)`
      }} />
      <div style={{ fontSize: 13, color: '#4a5568', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{value ?? '—'}</span>
        <span style={{ fontSize: 14, color, fontWeight: 600 }}>{unit}</span>
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        backgroundColor: `${color}18`, borderRadius: 20,
        padding: '3px 10px',
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          backgroundColor: color, boxShadow: `0 0 6px ${color}`
        }} />
        <span style={{ fontSize: 11, color, fontWeight: 600 }}>{status}</span>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      backgroundColor: '#1a202c',
      border: '1px solid #21262d',
      borderRadius: 10, padding: '10px 14px'
    }}>
      <div style={{ fontSize: 12, color: '#718096', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}{p.unit}
        </div>
      ))}
    </div>
  )
}

function Dashboard() {
  const [latest,  setLatest]  = useState(null)
  const [histori, setHistori] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

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
    } catch (err) {
      setError('Gagal mengambil data sensor. Pastikan backend berjalan!')
    } finally {
      setLoading(false)
    }
  }

  // Fetch pertama kali + setiap 5 detik
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div style={{ textAlign: 'center', color: '#4a5568', padding: '60px 0' }}>
      Memuat data...
    </div>
  )

  if (error) return (
    <div style={{
      textAlign: 'center', padding: '40px 20px',
      backgroundColor: 'rgba(239,68,68,0.06)',
      border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: 12, color: '#f87171',
    }}>
      {error}
    </div>
  )

  const moistureColor  = !latest ? '#4a5568'
    : latest.moisture < 30 ? '#f87171'
    : latest.moisture < 50 ? '#fbbf24' : '#34d399'

  const moistureStatus = !latest ? '—'
    : latest.moisture < 30 ? 'Terlalu Kering!'
    : latest.moisture < 50 ? 'Cukup' : 'Optimal'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Dashboard</h2>
        <p style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>
          Monitoring real-time kondisi tanaman
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <StatCard
          label="Kelembapan Tanah"
          value={latest?.moisture} unit="%"
          color={moistureColor} status={moistureStatus}
        />
        <StatCard
          label="Suhu Udara"
          value={latest?.temperature} unit="°C"
          color="#60a5fa" status="Normal"
        />
        <StatCard
          label="Kelembapan Udara"
          value={latest?.humidity} unit="%"
          color="#a78bfa" status="Baik"
        />
      </div>

      {/* Progress bar */}
      <div style={{
        backgroundColor: '#161b22', border: '1px solid #21262d',
        borderRadius: 12, padding: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Level Kelembapan Tanah</span>
        </div>
        <div style={{
          height: 12, backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: 6, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${latest?.moisture ?? 0}%`,
            background: `linear-gradient(90deg, ${moistureColor}88, ${moistureColor})`,
            borderRadius: 6, transition: 'width 1s ease',
            boxShadow: `0 0 10px ${moistureColor}66`,
          }} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Kering',  color: '#f87171', range: '0–30%'   },
            { label: 'Cukup',   color: '#fbbf24', range: '30–50%'  },
            { label: 'Optimal', color: '#34d399', range: '50–100%' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#718096' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: l.color }} />
              {l.label} ({l.range})
            </div>
          ))}
        </div>
      </div>

      {/* Chart Kelembapan */}
      {histori.length > 0 ? (
        <>
          <div style={{
            backgroundColor: '#161b22', border: '1px solid #21262d',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              Kelembapan Tanah — 24 Jam Terakhir
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={histori}>
                <defs>
                  <linearGradient id="moistGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fill: '#4a5568', fontSize: 10 }} interval={5} />
                <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="moisture" name="Kelembapan"
                  stroke="#34d399" strokeWidth={2} fill="url(#moistGrad)" unit="%" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            backgroundColor: '#161b22', border: '1px solid #21262d',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              Suhu & Kelembapan Udara — 24 Jam Terakhir
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={histori}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fill: '#4a5568', fontSize: 10 }} interval={5} />
                <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="temp"     name="Suhu"       stroke="#60a5fa" strokeWidth={2} dot={false} unit="°C" />
                <Line type="monotone" dataKey="humidity" name="Kelembapan" stroke="#a78bfa" strokeWidth={2} dot={false} unit="%" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div style={{
          textAlign: 'center', color: '#4a5568', padding: '32px 0',
          backgroundColor: '#161b22', border: '1px solid #21262d', borderRadius: 12,
        }}>
          Belum ada data histori. Kirim beberapa data sensor dulu lewat Postman!
        </div>
      )}

    </div>
  )
}

export default Dashboard