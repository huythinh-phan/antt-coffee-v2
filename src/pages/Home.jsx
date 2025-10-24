import React from 'react'
import Card from '../components/Card'
import { useApp } from '../context/AppContext'
import { loadDB } from '../utils/db'


export default function Home(){
  const { state } = useApp()
  const db = loadDB()
  const points = db.loyalty[state.user?.id] || 0
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card title="Tạo đơn" desc="Chọn đồ uống, áp mã ưu đãi, thanh toán" to="/order" />
      <Card title="Lịch sử đơn" desc="Xem, đánh giá và hủy nếu cần" to="/history" />
      <Card title="Menu" desc="Xem danh sách đồ uống" to="/menu" />
      {state.user?.role==='admin' && (
        <>
          <Card title="Quản lý đơn" desc="Theo dõi & cập nhật trạng thái" to="/admin/orders" />
          <Card title="Quản lý menu" desc="Thêm/sửa/xóa món" to="/admin/menu" />
          <Card title="Tạo ưu đãi" desc="Thêm mã giảm giá" to="/admin/promos" />
        </>
      )}
      <div className="md:col-span-3 card flex items-center justify-between">
        <div>
          <div className="text-sm text-neutral-500">Tích điểm</div>
          <div className="text-2xl font-bold">{points} điểm</div>
        </div>
        <div className="text-sm text-neutral-500">1 điểm / 10.000đ thanh toán</div>
      </div>
    </div>
  )
}