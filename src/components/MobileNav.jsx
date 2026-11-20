import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { navLinksFor } from './navLinks.js'

export default function MobileNav({ user, points, onClose, onLogout }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const linkCls = ({ isActive }) =>
    `block rounded-lg px-3 py-3 text-base ${isActive ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'}`

  return (
    <nav
      id="mobile-nav"
      data-testid="mobile-nav"
      aria-label="Menu điều hướng"
      className="border-t border-neutral-200 bg-white px-4 pb-4 pt-2 shadow-lg sm:hidden dark:border-neutral-800 dark:bg-neutral-900"
    >
      {user && (
        <div className="mb-2 flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3 text-sm dark:border-neutral-800">
          <span data-testid="user-badge" className="font-medium">
            {user.name} · {user.role === 'admin' ? 'Admin' : 'Khách hàng'}
          </span>
          <span data-testid="points-badge" className="badge bg-amber-100 text-amber-950 dark:bg-amber-900 dark:text-amber-50">
            {points} điểm
          </span>
        </div>
      )}
      <ul className="space-y-1">
        {navLinksFor(user).map((l) => (
          <li key={l.to}>
            <NavLink to={l.to} data-testid={l.id} className={linkCls} onClick={onClose}>
              {l.label}
            </NavLink>
          </li>
        ))}
        {!user && (
          <>
            <li>
              <NavLink to="/login" data-testid="nav-login" className={linkCls} onClick={onClose}>
                Đăng nhập
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" data-testid="nav-register" className={linkCls} onClick={onClose}>
                Đăng ký
              </NavLink>
            </li>
          </>
        )}
      </ul>
      {user && (
        <button type="button" data-testid="nav-logout" className="btn btn-primary mt-3 w-full" onClick={onLogout}>
          Đăng xuất
        </button>
      )}
    </nav>
  )
}

