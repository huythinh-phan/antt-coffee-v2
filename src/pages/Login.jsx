import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useApp, useCurrentUser } from '../context/useApp.js'
import { targetFrom } from '../components/navLinks.js'

export default function Login() {
  const { state, dispatch } = useApp()
  const user = useCurrentUser()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [tried, setTried] = useState(false)

  if (user) return <Navigate to={targetFrom(location)} replace />

  const submit = (e) => {
    e.preventDefault()
    setTried(true)
    dispatch({ type: 'LOGIN', username, password })
  }

  return (
    <div className="card mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Đăng nhập</h1>
      <div className="rounded-lg bg-neutral-100 p-3 text-sm dark:bg-neutral-800">
        Tài khoản demo: <code className="font-semibold">admin / admin</code> · <code className="font-semibold">khach / 123</code>
      </div>
      <form className="space-y-3" onSubmit={submit} noValidate>
        <div>
          <label htmlFor="login-username" className="label">
            Tên đăng nhập
          </label>
          <input
            id="login-username"
            data-testid="login-username"
            className="input"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="label">
            Mật khẩu
          </label>
          <input
            id="login-password"
            data-testid="login-password"
            type="password"
            className="input"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {tried && state.authError && (
          <div className="field-error" role="alert" data-testid="login-error">
            {state.authError}
          </div>
        )}
        <button type="submit" className="btn btn-primary w-full" data-testid="login-submit">
          Đăng nhập
        </button>
      </form>
      <p className="muted text-sm">
        Chưa có tài khoản?{' '}
        <Link to="/register" state={location.state} className="font-medium underline">
          Đăng ký
        </Link>
      </p>
    </div>
  )
}
