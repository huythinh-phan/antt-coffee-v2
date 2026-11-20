import { Link } from 'react-router-dom'
import { currency, formatDateTime } from '../lib/format.js'
import StatusBadge from './StatusBadge.jsx'
import RateDialog from './RateDialog.jsx'

/** Thẻ đơn dùng cho Lịch sử & Chi tiết đơn (phía khách). */
export default function OrderCard({ order, isOwner, onCancel, linkToDetail = false }) {
  const canCancel = isOwner && order.status === 'CREATED'
  const canRate = isOwner && order.status === 'FULFILLED'
  return (
    <article className="card space-y-3" data-testid="order-card" data-code={order.code}>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold">
          {linkToDetail ? (
            <Link to={`/orders/${order.id}`} className="underline-offset-2 hover:underline">
              #{order.code}
            </Link>
          ) : (
            <>#{order.code}</>
          )}{' '}
          <span className="muted text-sm font-normal">· {formatDateTime(order.createdAt)}</span>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <ul className="space-y-1 text-sm" data-testid="order-items">
        {order.items.map((i) => (
          <li key={i.menuId} className="flex justify-between gap-2">
            <span>
              {i.name} × {i.qty}
            </span>
            <span className="tabular-nums">{currency(i.price * i.qty)}</span>
          </li>
        ))}
      </ul>

      {order.note && (
        <p className="break-words rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
          Ghi chú: {order.note}
        </p>
      )}

      <div className="space-y-1 border-t border-neutral-200 pt-2 text-sm dark:border-neutral-800">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span className="tabular-nums">{currency(order.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Ưu đãi{order.promoCode ? ` (${order.promoCode})` : ''}</span>
          <span className="tabular-nums">-{currency(order.discount)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Thanh toán</span>
          <span className="tabular-nums">{currency(order.payable)}</span>
        </div>
        {order.pointsAwarded > 0 && <div className="muted text-xs">+{order.pointsAwarded} điểm tích luỹ</div>}
        {order.rating && (
          <div className="muted text-xs">
            Đánh giá: {order.rating}/5{order.feedback ? ` – ${order.feedback}` : ''}
          </div>
        )}
      </div>

      {(canCancel || canRate) && (
        <div className="flex flex-wrap gap-2">
          {canCancel && (
            <button type="button" className="btn btn-danger" data-testid="order-cancel" onClick={() => onCancel?.(order)}>
              Hủy đơn
            </button>
          )}
          {canRate && <RateDialog order={order} />}
        </div>
      )}
    </article>
  )
}

