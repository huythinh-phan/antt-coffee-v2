import { useEffect } from 'react'
import { useApp } from '../context/useApp.js'

export default function Toast() {
  const { state, dispatch } = useApp()
  const t = state.toast

  useEffect(() => {
    if (!t) return
    const onKey = (e) => e.key === 'Escape' && dispatch({ type: 'TOAST_CLEAR' })
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [t, dispatch])

  if (!t) return null
  const tone =
    t.type === 'error'
      ? 'bg-red-700 text-white'
      : t.type === 'info'
        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
        : 'bg-green-700 text-white'
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 sm:justify-end">
      <div
        key={t.id}
        data-testid="toast"
        role={t.type === 'error' ? 'alert' : 'status'}
        aria-live={t.type === 'error' ? 'assertive' : 'polite'}
        className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ${tone}`}
      >
        <span className="flex-1">{t.message}</span>
        <button type="button" aria-label="Đóng thông báo" className="font-bold opacity-80 hover:opacity-100" onClick={() => dispatch({ type: 'TOAST_CLEAR' })}>
          ×
        </button>
      </div>
    </div>
  )
}

