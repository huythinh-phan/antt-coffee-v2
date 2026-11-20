import { Link, useParams } from 'react-router-dom'
import { useApp, useCurrentUser } from '../context/useApp.js'
import { useConfirm } from '../hooks/useConfirm.js'
import OrderCard from '../components/OrderCard.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import NotFound from '../components/NotFound.jsx'
import Forbidden from '../components/Forbidden.jsx'

export default function OrderDetail() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const user = useCurrentUser()
  const { confirm, dialogProps } = useConfirm()
  const order = state.db.orders.find((o) => o.id === id)

  if (!order) return <NotFound />
  const isOwner = order.userId === user.id
  if (!isOwner && user.role !== 'admin') return <Forbidden message="Bạn chỉ xem được đơn của chính mình." />

  const cancel = async (o) => {
    const ok = await confirm({ title: `Hủy đơn #${o.code}?`, message: 'Đơn đã hủy không thể khôi phục.', confirmLabel: 'Hủy đơn', danger: true })
    if (ok) dispatch({ type: 'ORDER_STATUS', id: o.id, status: 'CANCELED', now: Date.now() })
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Chi tiết đơn</h1>
      {order.status === 'CREATED' && isOwner && (
        <p className="rounded-lg bg-amber-100 p-3 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
          Đưa mã <b>#{order.code}</b> cho nhân viên và thanh toán tại quầy.
        </p>
      )}
      <OrderCard order={order} isOwner={isOwner} onCancel={cancel} />
      <div className="flex flex-wrap gap-2">
        <Link to="/history" className="btn btn-secondary">
          Xem lịch sử
        </Link>
        <Link to="/order" className="btn btn-primary">
          Đặt thêm
        </Link>
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  )
}

