import { useEffect, useId, useRef } from 'react'

/**
 * Hộp thoại dùng chung: role="dialog", Esc/click nền để đóng, focus phần tử đầu tiên được chỉ định.
 */
export default function Modal({ open, onClose, title, children, testId, initialFocusRef }) {
  const labelId = useId()
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current?.()
      }
    }
    document.addEventListener('keydown', onKey)
    const target = initialFocusRef?.current || panelRef.current
    target?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      if (prev && typeof prev.focus === 'function') prev.focus()
    }
  }, [open, initialFocusRef])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        data-testid={testId}
        className="card w-full max-w-md space-y-4 focus:outline-none"
      >
        <h2 id={labelId} className="text-lg font-semibold">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}

