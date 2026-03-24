import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

function Register() {
  const [username,  setUsername]  = useState('')
  const [password,  setPassword]  = useState('')
  const [konfirm,   setKonfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [sukses,    setSukses]    = useState('')

  const navigate = useNavigate()

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
      setError('Password dan konfirmasi password tidak sama!')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', { username, password })
      setSukses('Registrasi berhasil! Mengarahkan ke halaman login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal, coba lagi!')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#0d1117',
    border: '1px solid #21262d',
    borderRadius: 10,
    color: '#e2e8f0',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0d1117',
      padding: 20,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#161b22',
        border: '1px solid #21262d',
        borderRadius: 16,
        padding: '40px 32px',
      }}>

        {/* Logo & Judul */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/aus.png"
            alt="Logo"
            style={{ width: 52, height: 52, marginBottom: 16 }}
          />
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            Buat Akun
          </h1>
          <p style={{ fontSize: 13, color: '#4a5568' }}>
            Daftarkan akun untuk mengakses dashboard
          </p>
        </div>

        {/* Pesan Error */}
        {error && (
          <div style={{
            padding: '12px 16px', marginBottom: 20,
            backgroundColor: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, color: '#f87171',
            fontSize: 13, textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Pesan Sukses */}
        {sukses && (
          <div style={{
            padding: '12px 16px', marginBottom: 20,
            backgroundColor: 'rgba(52,211,153,0.06)',
            border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 10, color: '#34d399',
            fontSize: 13, textAlign: 'center',
          }}>
            {sukses}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, color: '#718096', fontWeight: 600 }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Minimal 3 karakter"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#34d399'}
              onBlur={e  => e.target.style.borderColor = '#21262d'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, color: '#718096', fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#34d399'}
              onBlur={e  => e.target.style.borderColor = '#21262d'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, color: '#718096', fontWeight: 600 }}>
              Konfirmasi Password
            </label>
            <input
              type="password"
              placeholder="Ulangi password"
              value={konfirm}
              onChange={e => setKonfirm(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#34d399'}
              onBlur={e  => e.target.style.borderColor = '#21262d'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: '13px',
              background: loading ? '#2d3748' : 'linear-gradient(135deg, #34d399, #059669)',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Mendaftarkan...' : 'Daftar'}
          </button>

        </form>

        {/* Link ke Login */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#4a5568' }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: '#34d399', fontWeight: 600, textDecoration: 'none' }}>
            Masuk di sini
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Register