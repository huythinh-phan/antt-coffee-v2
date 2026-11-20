import { useState } from 'react'
import { useApp } from '../../context/useApp.js'
import { useConfirm } from '../../hooks/useConfirm.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

function CustomerRow({ user, points, orderCount, onApply }) {
  const [delta, setDelta] = useState('')
  const apply = (e) => {
    e.preventDefault()
    const n = Number(delta)
    if (delta === '' || !Number.isInteger(n) || n === 0) return
    onApply(user.id, n)
    setDelta('')
  }
  return (
    <form onSubmit={apply} className="card flex flex-wrap items-center justify-between gap-3" data-testid="customer-row" data-username={user.username}>
      <div className="min-w-0">
        <div className="font-semibold">{user.name}</div>
        <div className="muted text-sm">
          @{user.username} · {orderCount} đơn
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm">
          Điểm:{' '}
          <b data-testid="customer-points" className="text-lg tabular-nums">
            {points}
          </b>
        </span>
        <label htmlFor={`delta-${user.id}`} className="sr-only">
          Số điểm cộng/trừ cho {user.name}
        </label>
        <input
          id={`delta-${user.id}`}
          data-testid="customer-delta"
          type="number"
          step={1}
          inputMode="numeric"
          placeholder="±điểm"
          className="input w-24"
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" data-testid="customer-apply">
          Áp dụng
        </button>
      </div>
    </form>
  )
}

export default function AdminCustomers() {
  const { state, dispatch, resetDemo } = useApp()
  const { confirm, dialogProps } = useConfirm()
  const { users, loyalty, orders } = state.db
  const customers = users.filter((u) => u.role === 'customer')

  const reset = async () => {
    const ok = await confirm({ title: 'Đặt lại dữ liệu demo?', message: 'Mọi thay đổi sẽ bị xoá và thay bằng dữ liệu mẫu.', confirmLabel: 'Đặt lại', danger: true })
    if (ok) resetDemo()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Khách hàng</h1>
      <p className="muted text-sm">Cộng (số dương) hoặc trừ (số âm) điểm thủ công cho trường hợp đặc biệt. Điểm không xuống dưới 0.</p>
      <div className="space-y-3">
        {customers.map((u) => (
          <CustomerRow
            key={u.id}
            user={u}
            points={loyalty[u.id] || 0}
            orderCount={orders.filter((o) => o.userId === u.id).length}
            onApply={(userId, delta) => dispatch({ type: 'POINTS_ADJUST', userId, delta })}
          />
        ))}
        {customers.length === 0 && <p className="muted">Chưa có khách hàng.</p>}
      </div>
      <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <button type="button" className="btn btn-secondary" onClick={reset}>
          Đặt lại dữ liệu demo
        </button>
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  )
}

