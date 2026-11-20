import Card from '../components/Card.jsx'
import { useApp, useCurrentUser } from '../context/useApp.js'

export default function Home() {
  const { state } = useApp()
  const user = useCurrentUser()
  const points = user ? state.db.loyalty[user.id] || 0 : 0

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">{user ? `Xin chào, ${user.name}!` : 'Chào mừng đến Coffee Manager'}</h1>
        <p className="muted">Chọn đồ uống, áp mã ưu đãi và đặt đơn chỉ trong vài thao tác.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card icon="🧾" title="Tạo đơn" desc="Chọn đồ uống, áp mã ưu đãi, đặt đơn" to="/order" />
        <Card icon="📋" title="Menu" desc="Xem danh sách đồ uống" to="/menu" />
        {user ? (
          <>
            <Card icon="🕘" title="Lịch sử đơn" desc="Theo dõi, hủy hoặc đánh giá đơn" to="/history" />
            <Card icon="👤" title="Tài khoản" desc="Điểm tích luỹ & ưu đãi" to="/account" />
          </>
        ) : (
          <Card icon="🔑" title="Đăng nhập / Đăng ký" desc="Để đặt đơn và tích điểm" to="/login" />
        )}
        {user?.role === 'admin' && (
          <>
            <Card icon="📦" title="Quản lý đơn" desc="Theo dõi & cập nhật trạng thái" to="/admin/orders" />
            <Card icon="☕" title="Quản lý menu" desc="Thêm/sửa/xóa món" to="/admin/menu" />
            <Card icon="🏷️" title="Ưu đãi" desc="Tạo và bật/tắt mã giảm giá" to="/admin/promos" />
            <Card icon="⭐" title="Phản hồi" desc="Xem đánh giá của khách" to="/admin/feedback" />
            <Card icon="👥" title="Khách hàng" desc="Điểm tích luỹ, cộng điểm thủ công" to="/admin/customers" />
          </>
        )}
      </div>

      {user && (
        <div className="card flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="muted text-sm">Tích điểm</div>
            <div className="text-2xl font-bold">{points} điểm</div>
          </div>
          <div className="muted text-sm">1 điểm / 10.000₫ khi đơn hoàn tất</div>
        </div>
      )}
    </div>
  )
}
