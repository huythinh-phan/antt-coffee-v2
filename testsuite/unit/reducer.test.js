import { describe, it, expect } from 'vitest'
import { reducer, createInitialState } from '../../src/store/reducer.js'
import { createSeedDB } from '../../src/services/seed.js'

// Hợp đồng: docs/API.md §1. Reducer phải THUẦN (không mutate, không I/O).

const NOW = 1_800_000_000_000
const fresh = (session = null) => createInitialState({ db: createSeedDB(NOW), session })
const admin = () => fresh({ userId: 'u-admin' })
const khach = () => fresh({ userId: 'u-kh' })
const guest = () => fresh(null)

const deepFreeze = (o) => {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o)
    Object.values(o).forEach(deepFreeze)
  }
  return o
}
const run = (state, action) => reducer(state, action)
const order = (state, code) => state.db.orders.find((o) => o.code === code)
const isError = (s) => s.toast && s.toast.type === 'error'

const place = (state, over = {}) =>
  run(state, {
    type: 'ORDER_CREATE',
    id: 'o-new-1',
    code: 'NEW001',
    createdAt: NOW,
    items: [{ menuId: 'm1', qty: 2 }],
    promoCode: '',
    note: '',
    ...over,
  })

describe('seed (hợp đồng dữ liệu mẫu)', () => {
  it('đúng như ARCHITECTURE §5.2', () => {
    const db = createSeedDB(NOW)
    expect(db.schemaVersion).toBe(1)
    expect(db.users.map((u) => u.username)).toEqual(['admin', 'khach'])
    expect(db.menu.map((m) => m.id)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5'])
    expect(db.promotions.map((p) => p.code)).toEqual(['WELCOME10', 'CF15K'])
    expect(db.orders.map((o) => o.code).sort()).toEqual(['DEMO01', 'DEMO02'])
    expect(db.loyalty['u-kh']).toBe(8)
    const o1 = db.orders.find((o) => o.code === 'DEMO01')
    expect(o1).toMatchObject({ status: 'FULFILLED', payable: 83000, userId: 'u-kh', pointsAwarded: 8 })
    const o2 = db.orders.find((o) => o.code === 'DEMO02')
    expect(o2).toMatchObject({ status: 'CREATED', payable: 70000, note: 'Ít đường' })
  })

  it('mỗi lần gọi trả bản mới (không dùng chung tham chiếu)', () => {
    expect(createSeedDB(NOW)).not.toBe(createSeedDB(NOW))
    expect(createSeedDB(NOW)).toEqual(createSeedDB(NOW))
  })
})

describe('AUTH', () => {
  it('LOGIN đúng', () => {
    const s = run(guest(), { type: 'LOGIN', username: 'khach', password: '123' })
    expect(s.session).toEqual({ userId: 'u-kh' })
    expect(s.authError).toBeNull()
  })

  it('LOGIN: username không phân biệt hoa/thường, trim', () => {
    expect(run(guest(), { type: 'LOGIN', username: '  KHACH ', password: '123' }).session).toEqual({ userId: 'u-kh' })
  })

  it('LOGIN sai mật khẩu / sai user', () => {
    for (const a of [
      { username: 'khach', password: 'sai' },
      { username: 'khong', password: '123' },
      { username: 'khach', password: '' },
    ]) {
      const s = run(guest(), { type: 'LOGIN', ...a })
      expect(s.session).toBeNull()
      expect(s.authError).toBe('Sai tài khoản hoặc mật khẩu')
    }
  })

  it('mật khẩu phân biệt hoa/thường', () => {
    expect(run(guest(), { type: 'LOGIN', username: 'admin', password: 'ADMIN' }).session).toBeNull()
  })

  it('LOGOUT', () => {
    expect(run(khach(), { type: 'LOGOUT' }).session).toBeNull()
  })

  it('REGISTER hợp lệ → tạo customer, loyalty 0, tự đăng nhập', () => {
    const s = run(guest(), { type: 'REGISTER', id: 'u-new', name: 'An', username: 'AnNguyen', password: 'secret1', now: NOW })
    expect(s.session).toEqual({ userId: 'u-new' })
    const u = s.db.users.find((x) => x.id === 'u-new')
    expect(u).toMatchObject({ username: 'annguyen', role: 'customer', name: 'An', createdAt: NOW })
    expect(s.db.loyalty['u-new']).toBe(0)
    expect(s.authError).toBeNull()
  })

  it('REGISTER trùng username (không phân biệt hoa/thường)', () => {
    const s = run(guest(), { type: 'REGISTER', id: 'u-x', name: 'X', username: 'KHACH', password: 'secret1', now: NOW })
    expect(s.authError).toBe('Tên đăng nhập đã tồn tại')
    expect(s.db.users).toHaveLength(2)
    expect(s.session).toBeNull()
  })

  it('REGISTER không hợp lệ', () => {
    const s = run(guest(), { type: 'REGISTER', id: 'u-x', name: 'X', username: 'ok_user', password: '123', now: NOW })
    expect(s.authError).toBeTruthy()
    expect(s.db.users).toHaveLength(2)
  })

  it('không thể tự đăng ký role admin qua payload', () => {
    const s = run(guest(), { type: 'REGISTER', id: 'u-x', name: 'X', username: 'hacker', password: 'secret1', role: 'admin', now: NOW })
    expect(s.db.users.find((u) => u.id === 'u-x').role).toBe('customer')
  })
})

describe('ORDER_CREATE', () => {
  it('khách chưa đăng nhập bị từ chối', () => {
    const s = place(guest())
    expect(s.db.orders).toHaveLength(2)
    expect(isError(s)).toBe(true)
    expect(s.toast.message).toBe('Vui lòng đăng nhập để đặt đơn')
  })

  it('tạo đơn: snapshot món, tổng tính lại, status CREATED, unshift', () => {
    const s = place(khach())
    expect(s.db.orders).toHaveLength(3)
    const o = s.db.orders[0]
    expect(o).toMatchObject({
      id: 'o-new-1', code: 'NEW001', userId: 'u-kh', status: 'CREATED',
      total: 70000, discount: 0, payable: 70000, promoCode: null, note: '', createdAt: NOW,
      rating: null, pointsAwarded: 0,
    })
    expect(o.items).toEqual([{ menuId: 'm1', name: 'Espresso', category: 'Cà phê', price: 35000, qty: 2 }])
    expect(o.statusHistory).toEqual([{ status: 'CREATED', at: NOW }])
    expect(s.lastOrderId).toBe('o-new-1')
    expect(s.toast).toMatchObject({ type: 'success' })
    expect(s.toast.message).toContain('NEW001')
  })

  it('bỏ qua giá/tổng do client gửi', () => {
    const s = place(khach(), { items: [{ menuId: 'm1', qty: 2, price: 1, name: 'Hack' }], total: 1, payable: 1, discount: 99999 })
    const o = s.db.orders[0]
    expect(o.total).toBe(70000)
    expect(o.payable).toBe(70000)
    expect(o.discount).toBe(0)
    expect(o.items[0]).toMatchObject({ name: 'Espresso', price: 35000 })
    expect(o.items[0]).not.toHaveProperty('total')
  })

  it('gộp các dòng cùng menuId', () => {
    const s = place(khach(), { items: [{ menuId: 'm1', qty: 1 }, { menuId: 'm1', qty: 2 }] })
    expect(s.db.orders[0].items).toHaveLength(1)
    expect(s.db.orders[0].items[0].qty).toBe(3)
  })

  it('CF15K (viết thường) trên Latte → giảm 15.000, lưu mã chuẩn', () => {
    const s = place(khach(), { items: [{ menuId: 'm2', qty: 1 }], promoCode: 'cf15k' })
    expect(s.db.orders[0]).toMatchObject({ total: 45000, discount: 15000, payable: 30000, promoCode: 'CF15K' })
  })

  it('WELCOME10 không áp dụng cho khách đã có đơn: đơn vẫn tạo, nêu lý do', () => {
    const s = place(khach(), { promoCode: 'WELCOME10' })
    expect(s.db.orders).toHaveLength(3)
    expect(s.db.orders[0]).toMatchObject({ discount: 0, payable: 70000, promoCode: null })
    expect(s.toast.type).toBe('success')
    expect(s.toast.message).toContain('NEW001')
    expect(s.toast.message).toContain('Mã chỉ áp dụng cho đơn đầu tiên')
  })

  it('WELCOME10 áp dụng cho tài khoản mới (chưa có đơn)', () => {
    let s = run(guest(), { type: 'REGISTER', id: 'u-new', name: 'An', username: 'annew', password: 'secret1', now: NOW })
    s = place(s, { promoCode: 'welcome10' })
    expect(s.db.orders[0]).toMatchObject({ userId: 'u-new', total: 70000, discount: 7000, payable: 63000, promoCode: 'WELCOME10' })
  })

  it('đơn đã huỷ không tính vào "đơn đầu tiên"', () => {
    let s = run(guest(), { type: 'REGISTER', id: 'u-new', name: 'An', username: 'annew', password: 'secret1', now: NOW })
    s = place(s, { id: 'o-a', code: 'AAA111' })
    s = run(s, { type: 'ORDER_STATUS', id: 'o-a', status: 'CANCELED', now: NOW })
    expect(order(s, 'AAA111').status).toBe('CANCELED')
    s = place(s, { id: 'o-b', code: 'BBB222', promoCode: 'WELCOME10' })
    expect(order(s, 'BBB222').discount).toBe(7000)
  })

  it('giỏ rỗng', () => {
    const s = place(khach(), { items: [] })
    expect(s.db.orders).toHaveLength(2)
    expect(s.toast.message).toBe('Giỏ hàng trống')
  })

  it.each([0, -1, 51, 1.5, NaN, '2'])('số lượng không hợp lệ: %s', (qty) => {
    const s = place(khach(), { items: [{ menuId: 'm1', qty }] })
    expect(s.db.orders).toHaveLength(2)
    expect(s.toast.message).toBe('Số lượng không hợp lệ')
  })

  it('số lượng tối đa 50 hợp lệ; gộp vượt 50 thì từ chối', () => {
    expect(place(khach(), { items: [{ menuId: 'm1', qty: 50 }] }).db.orders).toHaveLength(3)
    const s = place(khach(), { items: [{ menuId: 'm1', qty: 30 }, { menuId: 'm1', qty: 30 }] })
    expect(s.db.orders).toHaveLength(2)
    expect(s.toast.message).toBe('Số lượng không hợp lệ')
  })

  it('món không tồn tại', () => {
    const s = place(khach(), { items: [{ menuId: 'zzz', qty: 1 }] })
    expect(s.db.orders).toHaveLength(2)
    expect(s.toast.message).toBe('Có món không còn trong menu')
  })

  it('ghi chú quá 200 ký tự bị từ chối', () => {
    const s = place(khach(), { note: 'x'.repeat(201) })
    expect(s.db.orders).toHaveLength(2)
    expect(isError(s)).toBe(true)
  })

  it('idempotent theo id: dispatch 2 lần chỉ tạo 1 đơn', () => {
    const once = place(khach())
    const twice = place(once)
    expect(twice.db.orders).toHaveLength(3)
    expect(twice.db).toEqual(once.db)
  })

  it('admin cũng đặt đơn được', () => {
    expect(place(admin()).db.orders[0].userId).toBe('u-admin')
  })
})

describe('ORDER_STATUS & điểm thưởng', () => {
  const to = (s, id, status) => run(s, { type: 'ORDER_STATUS', id, status, now: NOW + 1 })

  it('admin đi hết luồng; điểm cộng khi FULFILLED; lưu lịch sử', () => {
    let s = admin()
    s = to(s, 'o-seed-2', 'PAID')
    expect(order(s, 'DEMO02').status).toBe('PAID')
    expect(s.db.loyalty['u-kh']).toBe(8) // chưa cộng
    s = to(s, 'o-seed-2', 'PREPARING')
    expect(s.db.loyalty['u-kh']).toBe(8)
    s = to(s, 'o-seed-2', 'FULFILLED')
    const o = order(s, 'DEMO02')
    expect(o.status).toBe('FULFILLED')
    expect(o.pointsAwarded).toBe(7)
    expect(s.db.loyalty['u-kh']).toBe(15)
    expect(o.statusHistory.map((h) => h.status)).toEqual(['CREATED', 'PAID', 'PREPARING', 'FULFILLED'])
    expect(o.statusHistory.at(-1)).toEqual({ status: 'FULFILLED', at: NOW + 1 })
  })

  it('không nhảy bước: CREATED → FULFILLED bị chặn', () => {
    const s = to(admin(), 'o-seed-2', 'FULFILLED')
    expect(order(s, 'DEMO02').status).toBe('CREATED')
    expect(isError(s)).toBe(true)
    expect(s.db.loyalty['u-kh']).toBe(8)
  })

  it('đơn đã hoàn tất không huỷ/đổi được', () => {
    for (const st of ['CANCELED', 'PAID', 'CREATED']) {
      const s = to(admin(), 'o-seed-1', st)
      expect(order(s, 'DEMO01').status).toBe('FULFILLED')
      expect(isError(s)).toBe(true)
    }
  })

  it('huỷ không cộng điểm; đơn huỷ không đổi tiếp', () => {
    let s = to(admin(), 'o-seed-2', 'CANCELED')
    expect(order(s, 'DEMO02').status).toBe('CANCELED')
    expect(s.db.loyalty['u-kh']).toBe(8)
    s = to(s, 'o-seed-2', 'PAID')
    expect(order(s, 'DEMO02').status).toBe('CANCELED')
    expect(isError(s)).toBe(true)
  })

  it('khách huỷ đơn CREATED của mình', () => {
    const s = to(khach(), 'o-seed-2', 'CANCELED')
    expect(order(s, 'DEMO02').status).toBe('CANCELED')
  })

  it('khách không huỷ được đơn đã PAID', () => {
    let s = to(admin(), 'o-seed-2', 'PAID')
    s = { ...s, session: { userId: 'u-kh' } }
    s = to(s, 'o-seed-2', 'CANCELED')
    expect(order(s, 'DEMO02').status).toBe('PAID')
    expect(isError(s)).toBe(true)
  })

  it('khách không tự đặt PAID/FULFILLED', () => {
    for (const st of ['PAID', 'PREPARING', 'FULFILLED']) {
      const s = to(khach(), 'o-seed-2', st)
      expect(order(s, 'DEMO02').status).toBe('CREATED')
      expect(isError(s)).toBe(true)
    }
  })

  it('người khác không huỷ được đơn của khach', () => {
    let s = run(guest(), { type: 'REGISTER', id: 'u-new', name: 'An', username: 'annew', password: 'secret1', now: NOW })
    s = to(s, 'o-seed-2', 'CANCELED')
    expect(order(s, 'DEMO02').status).toBe('CREATED')
    expect(isError(s)).toBe(true)
  })

  it('chưa đăng nhập không đổi được', () => {
    const s = to(guest(), 'o-seed-2', 'CANCELED')
    expect(order(s, 'DEMO02').status).toBe('CREATED')
    expect(isError(s)).toBe(true)
  })

  it('đơn không tồn tại', () => {
    const s = to(admin(), 'nope', 'PAID')
    expect(s.toast.message).toBe('Không tìm thấy đơn')
  })
})

describe('ORDER_RATE', () => {
  const rate = (s, id, rating, feedback = '') => run(s, { type: 'ORDER_RATE', id, rating, feedback, now: NOW + 5 })

  it('khách đánh giá đơn FULFILLED của mình, sửa được', () => {
    let s = rate(khach(), 'o-seed-1', 5, '  Ngon  ')
    expect(order(s, 'DEMO01')).toMatchObject({ rating: 5, feedback: 'Ngon', ratedAt: NOW + 5 })
    s = rate(s, 'o-seed-1', 3, 'Tạm')
    expect(order(s, 'DEMO01')).toMatchObject({ rating: 3, feedback: 'Tạm' })
  })

  it('không đánh giá đơn chưa hoàn tất', () => {
    const s = rate(khach(), 'o-seed-2', 5)
    expect(order(s, 'DEMO02').rating).toBeNull()
    expect(s.toast.message).toBe('Chỉ đánh giá được đơn đã hoàn tất')
  })

  it('rating không hợp lệ', () => {
    for (const r of [0, 6, 2.5]) {
      const s = rate(khach(), 'o-seed-1', r)
      expect(order(s, 'DEMO01').rating).toBeNull()
      expect(isError(s)).toBe(true)
    }
  })

  it('chỉ chủ đơn mới đánh giá (admin/người khác/khách vãng lai bị từ chối)', () => {
    expect(order(rate(admin(), 'o-seed-1', 5), 'DEMO01').rating).toBeNull()
    expect(order(rate(guest(), 'o-seed-1', 5), 'DEMO01').rating).toBeNull()
    const other = run(guest(), { type: 'REGISTER', id: 'u-new', name: 'An', username: 'annew', password: 'secret1', now: NOW })
    const s = rate(other, 'o-seed-1', 5)
    expect(order(s, 'DEMO01').rating).toBeNull()
    expect(isError(s)).toBe(true)
  })
})

describe('MENU (admin)', () => {
  const item = { id: 'm9', name: '  Mocha ', price: 55000, category: 'Cà phê' }

  it('khách/guest không có quyền', () => {
    for (const st of [khach(), guest()]) {
      const s = run(st, { type: 'MENU_CREATE', item })
      expect(s.db.menu).toHaveLength(5)
      expect(s.toast.message).toBe('Không có quyền')
    }
    expect(run(khach(), { type: 'MENU_DELETE', id: 'm1' }).db.menu).toHaveLength(5)
    expect(run(khach(), { type: 'MENU_UPDATE', item: { id: 'm1', name: 'X', price: 1, category: 'Y' } }).db.menu[0].name).toBe('Espresso')
  })

  it('admin thêm món, chuẩn hoá tên', () => {
    const s = run(admin(), { type: 'MENU_CREATE', item })
    expect(s.db.menu).toHaveLength(6)
    expect(s.db.menu.at(-1)).toEqual({ id: 'm9', name: 'Mocha', price: 55000, category: 'Cà phê' })
    expect(s.toast.type).toBe('success')
  })

  it('từ chối dữ liệu sai và id trùng', () => {
    for (const bad of [{ ...item, price: 0 }, { ...item, name: '' }, { ...item, category: '' }, { ...item, price: 1.5 }]) {
      const s = run(admin(), { type: 'MENU_CREATE', item: bad })
      expect(s.db.menu).toHaveLength(5)
      expect(isError(s)).toBe(true)
    }
    const dup = run(admin(), { type: 'MENU_CREATE', item: { ...item, id: 'm1' } })
    expect(dup.db.menu).toHaveLength(5)
    expect(dup.toast.message).toBe('Món đã tồn tại')
  })

  it('MENU_UPDATE sửa đúng món; id không có → lỗi', () => {
    const s = run(admin(), { type: 'MENU_UPDATE', item: { id: 'm1', name: 'Espresso đôi', price: 40000, category: 'Cà phê' } })
    expect(s.db.menu.find((m) => m.id === 'm1')).toMatchObject({ name: 'Espresso đôi', price: 40000 })
    expect(s.db.menu).toHaveLength(5)
    const nf = run(admin(), { type: 'MENU_UPDATE', item: { id: 'zzz', name: 'A', price: 1000, category: 'B' } })
    expect(nf.toast.message).toBe('Không tìm thấy món')
  })

  it('xoá món không làm mất snapshot trong đơn cũ; không ảnh hưởng đơn mới của món khác', () => {
    const s = run(admin(), { type: 'MENU_DELETE', id: 'm2' })
    expect(s.db.menu.find((m) => m.id === 'm2')).toBeUndefined()
    expect(order(s, 'DEMO01').items.map((i) => i.name)).toContain('Latte')
  })

  it('sau khi xoá, đặt món đã xoá bị từ chối', () => {
    let s = run(admin(), { type: 'MENU_DELETE', id: 'm1' })
    s = { ...s, session: { userId: 'u-kh' } }
    s = place(s)
    expect(s.toast.message).toBe('Có món không còn trong menu')
  })

  it('giá món đổi → đơn mới theo giá mới, đơn cũ giữ giá cũ', () => {
    let s = run(admin(), { type: 'MENU_UPDATE', item: { id: 'm1', name: 'Espresso', price: 50000, category: 'Cà phê' } })
    s = { ...s, session: { userId: 'u-kh' } }
    s = place(s)
    expect(s.db.orders[0].total).toBe(100000)
    expect(order(s, 'DEMO02').total).toBe(70000)
  })
})

describe('PROMO (admin)', () => {
  const promo = { id: 'p9', code: 'hello5', type: 'percent', value: 5, active: true, desc: 'Chào' }

  it('khách không có quyền', () => {
    const s = run(khach(), { type: 'PROMO_SAVE', promo })
    expect(s.db.promotions).toHaveLength(2)
    expect(s.toast.message).toBe('Không có quyền')
    expect(run(khach(), { type: 'PROMO_DELETE', id: 'p1' }).db.promotions).toHaveLength(2)
  })

  it('admin tạo: mã chuẩn hoá in hoa', () => {
    const s = run(admin(), { type: 'PROMO_SAVE', promo })
    expect(s.db.promotions).toHaveLength(3)
    expect(s.db.promotions.at(-1)).toMatchObject({ id: 'p9', code: 'HELLO5', minSubtotal: 0 })
  })

  it('bật/tắt (upsert theo id)', () => {
    const p1 = createSeedDB(NOW).promotions[0]
    const s = run(admin(), { type: 'PROMO_SAVE', promo: { ...p1, active: false } })
    expect(s.db.promotions).toHaveLength(2)
    expect(s.db.promotions.find((p) => p.id === 'p1').active).toBe(false)
  })

  it('mã trùng khác id bị từ chối', () => {
    const s = run(admin(), { type: 'PROMO_SAVE', promo: { ...promo, code: 'welcome10' } })
    expect(s.db.promotions).toHaveLength(2)
    expect(s.toast.message).toBe('Mã ưu đãi đã tồn tại')
  })

  it('giá trị sai bị từ chối (percent > 100)', () => {
    const s = run(admin(), { type: 'PROMO_SAVE', promo: { ...promo, value: 150 } })
    expect(s.db.promotions).toHaveLength(2)
    expect(isError(s)).toBe(true)
  })

  it('xoá', () => {
    expect(run(admin(), { type: 'PROMO_DELETE', id: 'p2' }).db.promotions.map((p) => p.code)).toEqual(['WELCOME10'])
  })
})

describe('POINTS_ADJUST / DB_RESET / TOAST_CLEAR / DB_REPLACE', () => {
  it('admin cộng/trừ điểm, không xuống dưới 0', () => {
    let s = run(admin(), { type: 'POINTS_ADJUST', userId: 'u-kh', delta: 5 })
    expect(s.db.loyalty['u-kh']).toBe(13)
    s = run(s, { type: 'POINTS_ADJUST', userId: 'u-kh', delta: -100 })
    expect(s.db.loyalty['u-kh']).toBe(0)
  })

  it('từ chối: khách, user không tồn tại, delta sai', () => {
    expect(run(khach(), { type: 'POINTS_ADJUST', userId: 'u-kh', delta: 5 }).db.loyalty['u-kh']).toBe(8)
    expect(isError(run(admin(), { type: 'POINTS_ADJUST', userId: 'zzz', delta: 5 }))).toBe(true)
    for (const delta of [0, 1.5, NaN, '3']) {
      const s = run(admin(), { type: 'POINTS_ADJUST', userId: 'u-kh', delta })
      expect(s.db.loyalty['u-kh']).toBe(8)
      expect(isError(s)).toBe(true)
    }
  })

  it('DB_RESET: admin → khôi phục seed; khách bị từ chối', () => {
    let s = run(admin(), { type: 'MENU_DELETE', id: 'm1' })
    s = run(s, { type: 'DB_RESET', db: createSeedDB(NOW) })
    expect(s.db).toEqual(createSeedDB(NOW))
    expect(s.session).toEqual({ userId: 'u-admin' })
    const k = run(khach(), { type: 'DB_RESET', db: { ...createSeedDB(NOW), menu: [] } })
    expect(k.db.menu).toHaveLength(5)
    expect(isError(k)).toBe(true)
  })

  it('DB_REPLACE: thay db, session bị bỏ nếu user không còn', () => {
    const db = createSeedDB(NOW)
    db.users = db.users.filter((u) => u.id !== 'u-kh')
    const s = run(khach(), { type: 'DB_REPLACE', db })
    expect(s.db).toBe(db)
    expect(s.session).toBeNull()
  })

  it('TOAST_CLEAR', () => {
    const s = run(place(khach()), { type: 'TOAST_CLEAR' })
    expect(s.toast).toBeNull()
  })

  it('action lạ → state không đổi', () => {
    const st = khach()
    expect(run(st, { type: 'WHATEVER' })).toBe(st)
  })
})

describe('Tính thuần khiết', () => {
  it('không mutate state đầu vào (state đóng băng sâu)', () => {
    const actions = [
      { type: 'LOGIN', username: 'khach', password: '123' },
      { type: 'LOGOUT' },
      { type: 'REGISTER', id: 'u-n', name: 'A', username: 'newuser', password: 'secret1', now: NOW },
      { type: 'MENU_CREATE', item: { id: 'm9', name: 'Mocha', price: 55000, category: 'Cà phê' } },
      { type: 'MENU_UPDATE', item: { id: 'm1', name: 'E', price: 1000, category: 'C' } },
      { type: 'MENU_DELETE', id: 'm1' },
      { type: 'PROMO_SAVE', promo: { id: 'p9', code: 'ABC', type: 'amount', value: 1000, active: true, desc: '' } },
      { type: 'PROMO_DELETE', id: 'p1' },
      { type: 'ORDER_CREATE', id: 'o9', code: 'ZZZ999', createdAt: NOW, items: [{ menuId: 'm1', qty: 1 }], promoCode: 'CF15K', note: '' },
      { type: 'ORDER_STATUS', id: 'o-seed-2', status: 'PAID', now: NOW },
      { type: 'ORDER_RATE', id: 'o-seed-1', rating: 4, feedback: 'ok', now: NOW },
      { type: 'POINTS_ADJUST', userId: 'u-kh', delta: 3 },
      { type: 'DB_RESET', db: createSeedDB(NOW) },
      { type: 'TOAST_CLEAR' },
    ]
    for (const session of [null, { userId: 'u-kh' }, { userId: 'u-admin' }]) {
      for (const a of actions) {
        const st = deepFreeze(fresh(session))
        expect(() => reducer(st, a)).not.toThrow()
      }
    }
  })

  it('cùng đầu vào → cùng kết quả (deterministic)', () => {
    const a = place(khach())
    const b = place(khach())
    expect(a).toEqual(b)
  })

  it('toast.id tăng dần', () => {
    let s = run(guest(), { type: 'MENU_DELETE', id: 'm1' }) // lỗi quyền → toast
    const id1 = s.toast.id
    s = run(s, { type: 'MENU_DELETE', id: 'm1' })
    expect(s.toast.id).toBe(id1 + 1)
  })
})
