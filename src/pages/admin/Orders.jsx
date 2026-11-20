import { useState } from 'react'
import { useApp } from '../../context/useApp.js'
import { useConfirm } from '../../hooks/useConfirm.js'
import { getAllowedTransitions } from '../../lib/orderStatus.js'
import { STATUS_LABEL } from '../../lib/constants.js'
import { currency, formatDateTime } from '../../lib/format.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

const ACTION = {
  PAID: { label: 'Xác nhận thanh toán', cls: 'btn-info' },
  PREPARING: { label: 'Bắt đầu pha chế', cls: 'btn-violet' },
  FULFILLED: { label: 'Hoàn tất', cls: 'btn-success' },
  CANCELED: { label: 'Hủy', cls: 'btn-danger' },
}

const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export default function AdminOrders() {
  const { state, dispatch, resetDemo } = useApp()
  const { confirm, dialogProps } = useConfirm()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const { orders, users } = state.db
  const nameOf = (uid) => users.find((u) => u.id === uid)?.name || uid
  const needle = q.trim().toUpperCase()
  const list = orders
    .filter((o) => o.code.toUpperCase().includes(needle) && (!status || o.status === status))
    .sort((a, b) => b.createdAt - a.createdAt)

  const today = startOfToday()
  const todayOrders = orders.filter((o) => o.createdAt >= today)
  const revenue = todayOrders.filter((o) => o.status === 'FULFILLED').reduce((s, o) => s + o.payable, 0)
  const waiting = orders.filter((o) => ['CREATED', 'PAID', 'PREPARING'].includes(o.status)).length

  const setStatusOf = async (o, s) => {
    if (s === 'CANCELED') {
      const ok = await confirm({ title: `Hủy đơn #${o.code}?`, message: 'Đơn đã hủy không thể khôi phục.', confirmLabel: 'Hủy đơn', danger: true })
      if (!ok) return
    }
    dispatch({ type: 'ORDER_STATUS', id: o.id, status: s, now: Date.now() })
  }

  const reset = async () => {
    const ok = await confirm({
      title: 'Đặt lại dữ liệu demo?',
      message: 'Toàn bộ đơn, món, ưu đãi và tài khoản mới sẽ bị xoá và thay bằng dữ liệu mẫu.',
      confirmLabel: 'Đặt lại',
      danger: true,
    })
    if (ok) resetDemo()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card">
          <div className="muted text-sm">Đơn hôm nay</div>
          <div className="text-2xl font-bold">{todayOrders.length}</div>
        </div>
        <div className="card">
          <div className="muted text-sm">Đang chờ xử lý</div>
          <div className="text-2xl font-bold">{waiting}</div>
        </div>
        <div className="card">
          <div className="muted text-sm">Doanh thu hôm nay (hoàn tất)</div>
          <div className="text-2xl font-bold tabular-nums">{currency(revenue)}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <label htmlFor="admin-order-search" className="sr-only">
          Tìm theo mã đơn
        </label>
        <input
          id="admin-order-search"
          data-testid="admin-order-search"
          className="input sm:max-w-xs"
          placeholder="Tìm theo mã đơn"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <label htmlFor="admin-order-filter" className="sr-only">
          Lọc theo trạng thái
        </label>
        <select id="admin-order-filter" data-testid="admin-order-filter" className="input sm:max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((o) => {
          const actions = getAllowedTransitions(o.status, 'admin', false)
          return (
            <article key={o.id} className="card space-y-2" data-testid="admin-order-card" data-code={o.code}>
              <header className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">
                  #{o.code} <span className="muted text-sm font-normal">· {formatDateTime(o.createdAt)}</span>
                </div>
                <StatusBadge status={o.status} />
              </header>
              <div className="text-sm">
                Khách: <b data-testid="admin-order-customer">{nameOf(o.userId)}</b>
              </div>
              <ul className="space-y-1 text-sm" data-testid="admin-order-items">
                {o.items.map((i) => (
                  <li key={i.menuId} className="flex justify-between gap-2">
                    <span>
                      <b>{i.qty}</b> × {i.name}
                    </span>
                    <span className="tabular-nums">{currency(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              {o.note && (
                <p data-testid="admin-order-note" className="break-words rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-950 dark:bg-amber-950 dark:text-amber-100">
                  📝 {o.note}
                </p>
              )}
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span>{o.promoCode ? `Mã: ${o.promoCode} (-${currency(o.discount)})` : 'Không dùng mã'}</span>
                <b className="tabular-nums">{currency(o.payable)}</b>
              </div>
              {actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {actions.map((s) => (
                    <button key={s} type="button" data-testid={`admin-order-action-${s}`} className={`btn ${ACTION[s].cls}`} onClick={() => setStatusOf(o, s)}>
                      {ACTION[s].label}
                    </button>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
      {list.length === 0 && <p className="muted">Chưa có đơn phù hợp.</p>}

      <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <button type="button" className="btn btn-secondary" data-testid="admin-reset-demo" onClick={reset}>
          Đặt lại dữ liệu demo
        </button>
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  )
}
