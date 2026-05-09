import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { gsap } from 'gsap'
import { Droplets, Zap, ShieldCheck, User, Lock } from 'lucide-react'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const { login } = useAuth()
  const navigate  = useNavigate()

  const sideRef  = useRef(null)
  const formRef  = useRef(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Username dan password wajib diisi!')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, coba lagi!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const tl = gsap.timeline()

    // Side panel
    if (sideRef.current) {
      tl.fromTo(sideRef.current,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      )
    }

    // Form elements
    if (formRef.current) {
      const els = formRef.current.querySelectorAll('.anim-item')
      tl.fromTo(els,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
        '-=0.3'
      )
    }
  }, [])

  return (
    <div className="auth-page">

      {/* ── LEFT SIDE (dekstop) ── */}
      <div className="auth-side" ref={sideRef}>
        {/* Orbs */}
        <div className="auth-side__orb" style={{
          width: 300, height: 300,
          background: 'var(--accent)',
          opacity: 0.08,
          top: -80, left: -80,
        }} />
        <div className="auth-side__orb" style={{
          width: 200, height: 200,
          background: '#60a5fa',
          opacity: 0.06,
          bottom: 40, right: -40,
        }} />

        <div className="auth-side__content">
          <img src="/aus.png" alt="Logo" className="auth-side__logo" />
          <h1 className="auth-side__title">SmartIrigasi</h1>
          <p className="auth-side__desc">
            Platform monitoring & kontrol sistem irigasi pintar berbasis IoT
          </p>

          <div className="auth-side__features">
            <div className="auth-feature">
              <Droplets size={16} />
              Monitoring kelembapan tanah real-time
            </div>
            <div className="auth-feature">
              <Zap size={16} />
              Kontrol pompa otomatis & manual
            </div>
            <div className="auth-feature">
              <ShieldCheck size={16} />
              Alert & notifikasi pintar
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE (form) ── */}
      <div className="auth-form-side">
        <div className="auth-form-box" ref={formRef}>

          {/* Mobile logo */}
          <div className="auth-form-logo-mobile anim-item">
            <img src="/aus.png" alt="Logo" />
            <div style={{ fontWeight: 700, fontSize: 18 }}>SmartIrigasi</div>
          </div>

          <h2 className="auth-form-title anim-item">Selamat Datang 👋</h2>
          <p className="auth-form-subtitle anim-item">Masuk untuk mengakses dashboard</p>

          {error && (
            <div className="alert-msg error anim-item" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group anim-item">
              <label className="label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            <div className="form-group anim-item">
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
                <input
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full anim-item"
              style={{ marginTop: 8, padding: '13px' }}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <div className="anim-item" style={{
            textAlign: 'center', marginTop: 24,
            fontSize: 13, color: 'var(--text-muted)',
          }}>
            Belum punya akun?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Daftar di sini
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login