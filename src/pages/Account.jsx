import { useApp, useCurrentUser } from '../context/useApp.js'
import { currency } from '../lib/format.js'

export default function Account() {
  const { state } = useApp()
  const user = useCurrentUser()
  const points = state.db.loyalty[user.id] || 0
  const now = Date.now()
  const promos = state.db.promotions.filter((p) => p.active && (p.expiresAt == null || p.expiresAt > now))
  const orderCount = state.db.orders.filter((o) => o.userId === user.id).length

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Tài khoản</h1>
      <div className="card grid gap-3 sm:grid-cols-3">
        <div>
          <div className="muted text-sm">Họ tên</div>
          <div className="font-semibold" data-testid="account-name">
            {user.name}
          </div>
          <div className="muted text-xs">@{user.username}</div>
        </div>
        <div>
          <div className="muted text-sm">Điểm tích luỹ</div>
          <div className="text-2xl font-bold" data-testid="account-points">
            {points}
          </div>
        </div>
        <div>
          <div className="muted text-sm">Số đơn</div>
          <div className="text-2xl font-bold">{orderCount}</div>
        </div>
      </div>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">Ưu đãi đang áp dụng</h2>
        <ul className="space-y-2" data-testid="account-promos">
          {promos.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <div>
                <code className="font-bold">{p.code}</code>
                <div className="muted text-sm">{p.desc}</div>
              </div>
              <span className="badge bg-amber-100 text-amber-950 dark:bg-amber-900 dark:text-amber-50">
                {p.type === 'percent' ? `-${p.value}%` : `-${currency(p.value)}`}
              </span>
            </li>
          ))}
          {promos.length === 0 && <li className="muted">Hiện chưa có ưu đãi.</li>}
        </ul>
      </section>
      <p className="muted text-sm">Quên mật khẩu chưa được hỗ trợ trong bản demo.</p>
    </div>
  )
}

