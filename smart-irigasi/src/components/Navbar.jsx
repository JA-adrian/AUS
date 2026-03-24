import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/',          label: 'Dashboard'  },
  { path: '/kontrol',   label: 'Kontrol'    },
  { path: '/jadwal',    label: 'Jadwal'     },
  { path: '/alert',     label: 'Alert'      },
  { path: '/settings',  label: 'Pengaturan' },
]

function Navbar() {
  const location      = useLocation()
  const navigate      = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{
      backgroundColor: '#161b22',
      borderBottom: 'none',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>

      {/* Baris atas */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 14,
        paddingBottom: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img 
            src="/aus.png"
            alt="Logo"
            style={{ width: 50, height: 50 }}
        />

        <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>SmartIrigasi</div>
            <div style={{ fontSize: 11, color: '#4a5568' }}>Sistem Irigasi Otomatis</div>
        </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: '#34d399', boxShadow: '0 0 8px #34d399',
            }} />
            <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>Online</span>
          </div>

          {/* Info user + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#4a5568' }}>
              {user?.username}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '5px 12px',
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8,
                color: '#f87171',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Menu navigasi */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: '8px 16px',
                borderRadius: '8px 8px 0 0',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                color:           isActive ? '#34d399' : '#4a5568',
                backgroundColor: isActive ? 'rgba(52,211,153,0.1)' : 'transparent',
                borderBottom:    isActive ? '2px solid #34d399' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default Navbar