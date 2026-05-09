import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { gsap } from 'gsap'
import { Droplets, Zap, ShieldCheck, User, Lock, CheckCircle } from 'lucide-react'

function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [konfirm,  setKonfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [sukses,   setSukses]   = useState('')

  const navigate = useNavigate()
  const sideRef  = useRef(null)
  const formRef  = useRef(null)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSukses('')

    if (!username || !password || !konfirm) {
      setError('Semua field wajib diisi!')
      return
    }
    if (username.length < 3) {
      setError('Username minimal 3 karakter!')
      return
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter!')
      return
    }
    if (password !== konfirm) {
      setError('Password dan konfirmasi tidak sama!')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', { username, password })
      setSukses('Registrasi berhasil! Mengarahkan ke login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal, coba lagi!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const tl = gsap.timeline()
    if (sideRef.current) {
      tl.fromTo(sideRef.current,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      )
    }
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

      {/* ── LEFT SIDE ── */}
      <div className="auth-side" ref={sideRef}>
        <div className="auth-side__orb" style={{
          width: 300, height: 300,
          background: 'var(--accent)',
          opacity: 0.08, top: -80, left: -80,
        }} />
        <div className="auth-side__orb" style={{
          width: 200, height: 200,
          background: '#a78bfa',
          opacity: 0.06, bottom: 40, right: -40,
        }} />

        <div className="auth-side__content">
          <img src="/aus.png" alt="Logo" className="auth-side__logo" />
          <h1 className="auth-side__title">Buat Akun</h1>
          <p className="auth-side__desc">
            Daftarkan diri untuk mulai mengelola sistem irigasi pintarmu
          </p>

          <div className="auth-side__features">
            <div className="auth-feature">
              <Droplets size={16} />
              Monitoring sensor real-time
            </div>
            <div className="auth-feature">
              <Zap size={16} />
              Jadwal siram otomatis
            </div>
            <div className="auth-feature">
              <ShieldCheck size={16} />
              Aman & terenkripsi
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE ── */}
      <div className="auth-form-side">
        <div className="auth-form-box" ref={formRef}>

          {/* Mobile logo */}
          <div className="auth-form-logo-mobile anim-item">
            <img src="/aus.png" alt="Logo" />
            <div style={{ fontWeight: 700, fontSize: 18 }}>SmartIrigasi</div>
          </div>

          <h2 className="auth-form-title anim-item">Buat Akun Baru</h2>
          <p className="auth-form-subtitle anim-item">Lengkapi data di bawah untuk mendaftar</p>

          {error && (
            <div className="alert-msg error anim-item" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          {sukses && (
            <div className="alert-msg success anim-item" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={15} />
              {sukses}
            </div>
          )}

          <form onSubmit={handleRegister}>
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
                  placeholder="Minimal 3 karakter"
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
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            <div className="form-group anim-item">
              <label className="label">Konfirmasi Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
                <input
                  type="password"
                  placeholder="Ulangi password"
                  value={konfirm}
                  onChange={e => setKonfirm(e.target.value)}
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
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="anim-item" style={{
            textAlign: 'center', marginTop: 24,
            fontSize: 13, color: 'var(--text-muted)',
          }}>
            Sudah punya akun?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Masuk di sini
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Register