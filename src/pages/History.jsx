import { Link } from 'react-router-dom'
import { useApp, useCurrentUser } from '../context/useApp.js'
import { useConfirm } from '../hooks/useConfirm.js'
import OrderCard from '../components/OrderCard.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function HistoryPage() {
  const { state, dispatch } = useApp()
  const user = useCurrentUser()
  const { confirm, dialogProps } = useConfirm()
  const orders = state.db.orders.filter((o) => o.userId === user.id).sort((a, b) => b.createdAt - a.createdAt)

  const cancel = async (o) => {
    const ok = await confirm({ title: `Hủy đơn #${o.code}?`, message: 'Đơn đã hủy không thể khôi phục.', confirmLabel: 'Hủy đơn', danger: true })
    if (ok) dispatch({ type: 'ORDER_STATUS', id: o.id, status: 'CANCELED', now: Date.now() })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Lịch sử đơn</h1>
      <div className="grid gap-3 lg:grid-cols-2">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} isOwner onCancel={cancel} linkToDetail />
        ))}
      </div>
      {orders.length === 0 && (
        <div className="card space-y-2" data-testid="history-empty">
          <p className="muted">Chưa có đơn nào.</p>
          <Link to="/order" className="btn btn-primary">
            Đặt đơn đầu tiên
          </Link>
        </div>
      )}
      <ConfirmDialog {...dialogProps} />
    </div>
  )
}
