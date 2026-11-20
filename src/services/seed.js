import { SCHEMA_VERSION } from '../lib/constants.js'

const H = 3600_000
export function createSeedDB(now = Date.now()) {
  const promo = { minSubtotal: 0, firstOrderOnly: false, category: null, expiresAt: null, maxDiscount: null }
  const mk = (code, id, user, items, total, status, createdAt, extra = {}) => ({
    id, code, userId: user, items, total, discount: 0, payable: total, promoCode: null, status, note: '', createdAt,
    statusHistory: [{ status: 'CREATED', at: createdAt }], rating: null, feedback: '', ratedAt: null, pointsAwarded: 0, ...extra,
  })
  const o1 = mk('DEMO01', 'o-seed-1', 'u-kh',
    [{ menuId: 'm2', name: 'Latte', category: 'Cà phê', price: 45000, qty: 1 }, { menuId: 'm5', name: 'Bạc xỉu', category: 'Cà phê', price: 38000, qty: 1 }],
    83000, 'FULFILLED', now - 48 * H, { pointsAwarded: 8 })
  o1.statusHistory = ['CREATED', 'PAID', 'PREPARING', 'FULFILLED'].map((status, i) => ({ status, at: o1.createdAt + i * 60_000 }))
  const o2 = mk('DEMO02', 'o-seed-2', 'u-kh', [{ menuId: 'm1', name: 'Espresso', category: 'Cà phê', price: 35000, qty: 2 }], 70000, 'CREATED', now - H, { note: 'Ít đường' })
  return {
    schemaVersion: SCHEMA_VERSION,
    users: [
      { id: 'u-admin', username: 'admin', password: 'admin', role: 'admin', name: 'Quản trị', createdAt: now },
      { id: 'u-kh', username: 'khach', password: '123', role: 'customer', name: 'Khách hàng', createdAt: now },
    ],
    menu: [
      { id: 'm1', name: 'Espresso', price: 35000, category: 'Cà phê' },
      { id: 'm2', name: 'Latte', price: 45000, category: 'Cà phê' },
      { id: 'm3', name: 'Cappuccino', price: 48000, category: 'Cà phê' },
      { id: 'm4', name: 'Trà đào', price: 42000, category: 'Trà' },
      { id: 'm5', name: 'Bạc xỉu', price: 38000, category: 'Cà phê' },
    ],
    promotions: [
      { id: 'p1', code: 'WELCOME10', type: 'percent', value: 10, active: true, desc: 'Giảm 10% cho đơn đầu', ...promo, firstOrderOnly: true },
      { id: 'p2', code: 'CF15K', type: 'amount', value: 15000, active: true, desc: 'Giảm 15K cho đồ uống cà phê', ...promo, category: 'Cà phê' },
    ],
    orders: [o2, o1],
    loyalty: { 'u-admin': 0, 'u-kh': 8 },
  }
}
