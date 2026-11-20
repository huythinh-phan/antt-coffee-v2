import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useApp, useCurrentUser } from '../context/useApp.js'
import { targetFrom } from '../components/navLinks.js'
import { newId } from '../lib/id.js'

export default function Register() {
  const { state, dispatch } = useApp()
  const user = useCurrentUser()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', username: '', password: '' })
  const [tried, setTried] = useState(false)

  if (user) return <Navigate to={targetFrom(location)} replace />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = (e) => {
    e.preventDefault()
    setTried(true)
    dispatch({ type: 'REGISTER', id: newId(), now: Date.now(), ...form })
  }

  return (
    <div className="card mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Đăng ký</h1>
      <p className="rounded-lg bg-amber-100 p-3 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
        Bản demo: dữ liệu lưu trên trình duyệt này. <b>Đừng dùng mật khẩu thật.</b>
      </p>
      <form className="space-y-3" onSubmit={submit} noValidate>
        <div>
          <label htmlFor="register-name" className="label">
            Họ tên
          </label>
          <input id="register-name" data-testid="register-name" className="input" autoComplete="name" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label htmlFor="register-username" className="label">
            Tên đăng nhập
          </label>
          <input
            id="register-username"
            data-testid="register-username"
            className="input"
            autoComplete="username"
            aria-describedby="register-username-hint"
            value={form.username}
            onChange={set('username')}
          />
          <p id="register-username-hint" className="muted mt-1 text-xs">
            3–20 ký tự: chữ, số hoặc dấu gạch dưới.
          </p>
        </div>
        <div>
          <label htmlFor="register-password" className="label">
            Mật khẩu
          </label>
          <input
            id="register-password"
            data-testid="register-password"
            type="password"
            className="input"
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
          />
          <p className="muted mt-1 text-xs">Tối thiểu 6 ký tự.</p>
        </div>
        {tried && state.authError && (
          <div className="field-error" role="alert" data-testid="register-error">
            {state.authError}
          </div>
        )}
        <button type="submit" className="btn btn-primary w-full" data-testid="register-submit">
          Tạo tài khoản
        </button>
      </form>
      <p className="muted text-sm">
        Đã có tài khoản?{' '}
        <Link to="/login" state={location.state} className="font-medium underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}

