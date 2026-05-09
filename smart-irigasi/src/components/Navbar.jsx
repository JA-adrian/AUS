import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { gsap } from 'gsap'
import {
  LayoutDashboard, Droplets, CalendarClock,
  BellRing, Settings, LogOut
} from 'lucide-react'

const navItems = [
  { path: '/',         label: 'Dashboard',  Icon: LayoutDashboard },
  { path: '/kontrol',  label: 'Kontrol',    Icon: Droplets        },
  { path: '/jadwal',   label: 'Jadwal',     Icon: CalendarClock   },
  { path: '/alert',    label: 'Alert',      Icon: BellRing        },
  { path: '/settings', label: 'Pengaturan', Icon: Settings        },
]

function Navbar() {
  const location              = useLocation()
  const navigate              = useNavigate()
  const { user, logout }      = useAuth()
  const navRef                = useRef(null)
  const bottomRef             = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // GSAP: animate navbar in on mount
  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      )
    }
    if (bottomRef.current) {
      gsap.fromTo(bottomRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      )
    }
  }, [])

  return (
    <>
      {/* ── DESKTOP TOP NAVBAR ── */}
      <nav className="navbar" ref={navRef}>
        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <img src="/aus.png" alt="Logo" className="navbar__logo" />
          <div>
            <div className="navbar__name">SmartIrigasi</div>
            <div className="navbar__sub">Sistem Irigasi Otomatis</div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="navbar__links">
          {navItems.map(({ path, label, Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`navbar__link${isActive ? ' active' : ''}`}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="navbar__right">
          <div className="navbar__status">
            <span className="status-dot" />
            Online
          </div>
          <span className="navbar__user">{user?.username}</span>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={13} style={{ display: 'inline', marginRight: 4 }} />
            Logout
          </button>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM NAVBAR ── */}
      <nav className="bottom-nav" ref={bottomRef}>
        {navItems.map(({ path, label, Icon }) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`bottom-nav__item${isActive ? ' active' : ''}`}
            >
              <div className="bottom-nav__icon">
                <Icon size={20} />
              </div>
              <span className="bottom-nav__label">{label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="bottom-nav__item"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div className="bottom-nav__icon" style={{ color: 'var(--red)' }}>
            <LogOut size={20} />
          </div>
          <span className="bottom-nav__label" style={{ color: 'var(--red)' }}>Logout</span>
        </button>
      </nav>
    </>
  )
}

export default Navbar