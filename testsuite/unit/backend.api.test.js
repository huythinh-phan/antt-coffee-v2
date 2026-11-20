import { describe, it, expect, beforeEach } from 'vitest'
import {
  resetStore,
  listMenu,
  findProductById,
  upsertProduct,
  removeProduct,
  listVouchers,
  upsertVoucher,
  removeVoucher,
  calcVoucherDiscount,
  createOrderRecord,
  listUserOrders,
  listAllOrders,
  findOrderDetails,
  changeOrderStatus,
  removeOrder,
  registerAccount,
  authenticateUser,
  resetAccountPassword,
  listCustomers,
  upsertCustomer,
  removeCustomer,
  listFeedbacks,
  addFeedback,
  removeFeedback,
} from '../../server/db/store.js'
import { computeLevel } from '../../server/db/seedData.js'

describe('ANTT Coffee v3 Backend Store & Business Logic Regression', () => {
  beforeEach(() => {
    resetStore()
  })

  it('khởi tạo đúng toàn bộ dữ liệu gốc từ db.sql (19 món, 5 voucher, 12 đơn, 4 feedback)', () => {
    const menu = listMenu()
    expect(menu.length).toBe(19)
    expect(menu[0]).toMatchObject({ Item_id: 1, Item_name: 'Cà phê Đen Đá', Price: 25000, category: 'Cà phê' })
    expect(listVouchers().length).toBe(5)
    expect(listAllOrders().length).toBe(12)
    expect(listFeedbacks().length).toBe(4)
  })

  it('computeLevel tính đúng hạng thành viên Bronze / Silver / Gold / Diamond', () => {
    expect(computeLevel(0)).toBe('Bronze')
    expect(computeLevel(199)).toBe('Bronze')
    expect(computeLevel(200)).toBe('Silver')
    expect(computeLevel(499)).toBe('Silver')
    expect(computeLevel(500)).toBe('Gold')
    expect(computeLevel(999)).toBe('Gold')
    expect(computeLevel(1000)).toBe('Diamond')
  })

  it('product detail sửa lỗi rows.lengths và trả đúng object sản phẩm', () => {
    const p = findProductById(4)
    expect(p).toMatchObject({ Item_id: 4, Item_name: 'Cappuccino', Price: 45000, category: 'Cà phê' })
    expect(findProductById(9999)).toBeNull()
  })

  it('thêm, sửa, xóa món: món đã có trong đơn hàng được soft-delete (ẩn khỏi menu nhưng giữ lịch sử đơn)', () => {
    const created = upsertProduct({ name: 'Bạc Xỉu Muối', price: 38000, cate_id: 1, description: 'Thơm béo' })
    expect(created.ok).toBe(true)
    expect(listMenu().length).toBe(20)

    const updated = upsertProduct({ id: created.item.Item_id, name: 'Bạc Xỉu Kem Muối', price: 42000, cate_id: 1 })
    expect(updated.ok).toBe(true)
    expect(findProductById(created.item.Item_id).Price).toBe(42000)

    // Món mới chưa có đơn → xóa cứng
    const delNew = removeProduct(created.item.Item_id)
    expect(delNew).toMatchObject({ ok: true, softDeleted: false })
    expect(listMenu().length).toBe(19)

    // Món #2 (Cà phê Sữa Đá) đã có trong đơn hàng #1 -> soft delete
    const delUsed = removeProduct(2)
    expect(delUsed).toMatchObject({ ok: true, softDeleted: true })
    expect(listMenu().length).toBe(18)
    // Chi tiết đơn #1 vẫn giữ tên món 'Cà phê Sữa Đá'
    const order1 = findOrderDetails(1)
    expect(order1.items.map((i) => i.Item_name)).toContain('Cà phê Sữa Đá')
  })

  it('voucher: tính giảm giá đúng cho cả percent và amount, chặn đơn chưa đủ tối thiểu', () => {
    const vouchers = listVouchers()
    const xmas = vouchers.find((v) => v.Voucher_code === 'XMAS10K') // 50%, min 50.000
    const test10 = vouchers.find((v) => v.Voucher_code === 'TEST10') // 10.000, min 50.000

    expect(calcVoucherDiscount(xmas, 40000).valid).toBe(false)
    expect(calcVoucherDiscount(xmas, 100000)).toMatchObject({ valid: true, discount: 50000 })
    expect(calcVoucherDiscount(test10, 60000)).toMatchObject({ valid: true, discount: 10000 })

    // Tạo mã mới, chặn trùng mã
    const dup = upsertVoucher({ code: 'test10', value: 5000, min: 0, type: 'amount' })
    expect(dup.ok).toBe(false)
    const okV = upsertVoucher({ code: 'ANTT20', value: 20, min: 30000, type: 'percent' })
    expect(okV.ok).toBe(true)
    expect(removeVoucher(okV.voucher.Voucher_id).ok).toBe(true)
  })

  it('tạo đơn hàng: tính lại tổng tiền từ giá chuẩn DB, áp dụng voucher, chặn khách vãng lai dùng voucher', () => {
    const guestWithVoucher = createOrderRecord({
      userId: null,
      items: [{ id: 1, qty: 2, price: 1 }],
      voucherCode: 'TEST10',
      guestInfo: { name: 'Khách', phone: '0900000000', address: 'HCM' },
    })
    expect(guestWithVoucher.ok).toBe(false)

    // Thành viên đặt 2 Cappuccino (45.000 x 2 = 90.000) + mã TEST10 (-10.000) = 80.000 (bỏ qua giá giả 1đ từ client)
    const orderRes = createOrderRecord({
      userId: 2,
      items: [{ id: 4, qty: 2, price: 1 }],
      voucherCode: 'test10',
      guestInfo: { name: 'Ú Ẻ', phone: '0234567891', address: 'Thủ Đức' },
    })
    expect(orderRes.ok).toBe(true)
    expect(orderRes.order).toMatchObject({
      Init_amount: 90000,
      Discount_amount: 10000,
      Total_amount: 80000,
      Status: 'CREATED',
    })

    // Xem chi tiết đơn (popup Admin)
    const detail = findOrderDetails(orderRes.order.Order_id)
    expect(detail.info.Voucher_code).toBe('TEST10')
    expect(detail.items[0]).toMatchObject({ Item_name: 'Cappuccino', Quantity: 2, Price: 45000 })

    // Khi Admin chuyển trạng thái sang Completed -> khách được cộng 8 điểm (80.000 / 10.000)
    const beforePts = listCustomers().find((c) => c.Acc_id === 2).Points
    changeOrderStatus(orderRes.order.Order_id, 'Completed')
    const afterPts = listCustomers().find((c) => c.Acc_id === 2).Points
    expect(afterPts).toBe(beforePts + 8)

    // Chuyển lại Completed lần nữa không bị cộng điểm nhân đôi
    changeOrderStatus(orderRes.order.Order_id, 'Completed')
    expect(listCustomers().find((c) => c.Acc_id === 2).Points).toBe(afterPts)

    // Lịch sử đơn của user 2 có đơn mới tạo
    expect(listUserOrders(2).some((o) => o.Order_id === orderRes.order.Order_id)).toBe(true)
    expect(removeOrder(orderRes.order.Order_id).ok).toBe(true)
  })

  it('xác thực, đăng ký, khôi phục mật khẩu và tự động tạo hồ sơ customer để gửi đánh giá ngay', () => {
    expect(authenticateUser({ username: 'admin', password: 'admin123' })).toMatchObject({ Username: 'admin', Role: 'Admin' })
    expect(authenticateUser({ username: 'user', password: '123456' })).toMatchObject({ Username: 'user', Role: 'Customer' })
    expect(authenticateUser({ username: 'user', password: 'wrong' })).toBeNull()

    // Đăng ký tài khoản mới -> tự có hồ sơ customer -> gửi feedback thành công ngay
    const reg = registerAccount({ username: 'newmember', password: 'password123', email: 'new@antt.com', fullname: 'Thành Viên Mới' })
    expect(reg.ok).toBe(true)
    const fb = addFeedback({ acc_id: reg.user.Acc_id, content: 'Cà phê rất thơm', rating: 5, dish_name: 'Cappuccino' })
    expect(fb.ok).toBe(true)
    expect(listFeedbacks()[0]).toMatchObject({ Content: 'Cà phê rất thơm', Full_name: 'Thành Viên Mới' })
    expect(removeFeedback(fb.feedback.Feedback_id).ok).toBe(true)

    // Reset mật khẩu
    const rst = resetAccountPassword({ username: 'newmember', email: 'new@antt.com', newPassword: 'newpassword123' })
    expect(rst.ok).toBe(true)
    expect(authenticateUser({ username: 'newmember', password: 'newpassword123' })).toBeTruthy()

    // Cập nhật và xóa khách hàng
    expect(upsertCustomer({ acc_id: reg.user.Acc_id, fullname: 'Tên Mới', email: 'new@antt.com', phone: '0911222333', points: 550 }).ok).toBe(true)
    expect(listCustomers().find((c) => c.Acc_id === reg.user.Acc_id)).toMatchObject({ Full_name: 'Tên Mới', Points: 550, Level: 'Gold' })
    expect(removeCustomer(reg.user.Acc_id).ok).toBe(true)
  })
})
