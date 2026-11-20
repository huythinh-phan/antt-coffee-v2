import { useEffect, useState } from 'react'
import { THEME_KEY } from '../lib/constants.js'
import { local } from '../services/storage.js'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    local.set(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark])
  return (
    <button
      type="button"
      className="btn btn-ghost px-2"
      data-testid="theme-toggle"
      aria-label={dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title="Chuyển giao diện sáng/tối"
      onClick={() => setDark((d) => !d)}
    >
      <span aria-hidden="true">{dark ? '🌙' : '☀️'}</span>
    </button>
  )
}

