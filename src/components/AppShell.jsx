import { useCallback, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp, useCurrentUser } from '../context/useApp.js'
import { session } from '../services/storage.js'
import ThemeToggle from './ThemeToggle.jsx'
import MobileNav from './MobileNav.jsx'
import { navLinksFor, navLinkCls } from './navLinks.js'

const BANNER_KEY = 'coffee_banner_closed'

function DemoBanner() {
  const [closed, setClosed] = useState(() => session.get(BANNER_KEY) === '1')
  if (closed) return null
  return (
    <div className="bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100">
      <div className="container flex items-center gap-2 py-1 text-xs sm:text-sm">
        <span className="flex-1">Bản demo – dữ liệu chỉ lưu trên trình duyệt này.</span>
        <button
          type="button"
          aria-label="Đóng thông báo demo"
          className="rounded px-2 font-bold hover:bg-amber-200 dark:hover:bg-amber-900"
          onClick={() => {
            session.set(BANNER_KEY, '1')
            setClosed(true)
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default function AppShell({ children }) {
  const { state, dispatch } = useApp()
  const user = useCurrentUser()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const points = user ? state.db.loyalty[user.id] || 0 : 0
  const close = useCallback(() => setOpen(false), [])

  const logout = () => {
    setOpen(false)
    dispatch({ type: 'LOGOUT' })
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90">
        <DemoBanner />
        <div className="container flex items-center gap-2 py-3">
          <Link to="/" className="mr-auto whitespace-nowrap text-xl font-black tracking-wider" onClick={close}>
            ☕ CoffeeManager
          </Link>
          {user && (
            <div className="hidden items-center gap-2 text-sm sm:flex">
              <span data-testid="user-badge" className="rounded bg-neutral-200 px-2 py-1 dark:bg-neutral-800">
                {user.name} · {user.role === 'admin' ? 'Admin' : 'Khách hàng'}
              </span>
              <span data-testid="points-badge" className="badge bg-amber-100 text-amber-950 dark:bg-amber-900 dark:text-amber-50">
                {points} điểm
              </span>
            </div>
          )}
          <ThemeToggle />
          {user ? (
            <button type="button" data-testid="nav-logout" className="btn btn-primary hidden sm:inline-flex" onClick={logout}>
              Đăng xuất
            </button>
          ) : (
            <div className="hidden gap-2 sm:flex">
              <NavLink to="/register" data-testid="nav-register" className="btn btn-secondary">
                Đăng ký
              </NavLink>
              <NavLink to="/login" data-testid="nav-login" className="btn btn-primary">
                Đăng nhập
              </NavLink>
            </div>
          )}
          <button
            type="button"
            className="btn btn-ghost px-3 text-xl sm:hidden"
            data-testid="mobile-menu-button"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden="true">{open ? '✕' : '☰'}</span>
          </button>
        </div>
        <nav aria-label="Điều hướng chính" className="container hidden flex-wrap gap-2 pb-3 sm:flex">
          {navLinksFor(user).map((l) => (
            <NavLink key={l.to} to={l.to} data-testid={l.id} className={navLinkCls}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        {open && <MobileNav user={user} points={points} onClose={close} onLogout={logout} />}
      </header>

      <main className="container flex-1 py-6">{children}</main>

      <footer className="container py-6 text-center text-xs text-neutral-600 dark:text-neutral-400">
        Coffee Manager · Đồ án tổng hợp HCMUT · Bản demo
      </footer>
    </div>
  )
}
