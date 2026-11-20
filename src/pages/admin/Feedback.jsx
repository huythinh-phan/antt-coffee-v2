import { useApp } from '../../context/useApp.js'
import { formatDateTime } from '../../lib/format.js'

export default function AdminFeedback() {
  const { state } = useApp()
  const { orders, users } = state.db
  const nameOf = (uid) => users.find((u) => u.id === uid)?.name || uid
  const rated = orders.filter((o) => o.rating).sort((a, b) => (b.ratedAt || 0) - (a.ratedAt || 0))
  const avg = rated.length ? (rated.reduce((s, o) => s + o.rating, 0) / rated.length).toFixed(1) : null

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Phản hồi đánh giá</h1>
      {avg && (
        <p className="muted">
          {rated.length} đánh giá · trung bình {avg}/5
        </p>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        {rated.map((o) => (
          <article key={o.id} className="card space-y-1" data-testid="feedback-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold">Đơn #{o.code}</div>
              <div aria-label={`${o.rating} trên 5 sao`}>
                <span className="text-amber-600 dark:text-amber-400" aria-hidden="true">
                  {'★'.repeat(o.rating)}
                  {'☆'.repeat(5 - o.rating)}
                </span>{' '}
                <b>{o.rating}/5</b>
              </div>
            </div>
            <div className="muted text-sm">
              {nameOf(o.userId)}
              {o.ratedAt ? ` · ${formatDateTime(o.ratedAt)}` : ''}
            </div>
            <p className="break-words">{o.feedback || <span className="muted">(Không có nhận xét)</span>}</p>
          </article>
        ))}
      </div>
      {rated.length === 0 && (
        <p className="muted" data-testid="feedback-empty">
          Chưa có đánh giá.
        </p>
      )}
    </div>
  )
}
