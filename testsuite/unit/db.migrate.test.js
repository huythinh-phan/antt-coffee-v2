import { describe, it, expect } from 'vitest'
import { migrate } from '../../src/services/db.js'
import { createSeedDB } from '../../src/services/seed.js'

// FR-SYS-05, BUG-11, ADR-0002.  LƯU Ý: `services/db.js` KHÔNG được chạm localStorage khi import.

const NOW = 1_800_000_000_000

// Dữ liệu schema v0 (định dạng cũ của repo trước nâng cấp)
const legacy = () => ({
  users: [
    { id: 'u-admin', username: 'admin', password: 'admin', role: 'admin', name: 'Quản trị' },
    { id: 'u-kh', username: 'khach', password: '123', role: 'customer', name: 'Khách hàng' },
  ],
  menu: [{ id: 'm1', name: 'Espresso', price: 35000, category: 'Cà phê' }],
  promotions: [{ id: 'p1', code: 'WELCOME10', type: 'percent', value: 10, active: true, desc: 'Giảm 10% cho đơn đầu' }],
  orders: [
    {
      id: 'o1', code: 'ABC123', userId: 'u-kh',
      items: [{ menuId: 'm1', qty: 2, price: 35000 }, { menuId: 'deleted', qty: 1, price: 20000 }],
      total: 90000, discount: 0, payable: 90000, promoCode: null, status: 'FULFILLED', note: '', createdAt: NOW,
    },
  ],
  loyalty: { 'u-kh': 3 },
})

describe('migrate', () => {
  it('v0 → v1: schemaVersion, snapshot tên/danh mục dòng đơn, mặc định các trường mới', () => {
    const db = migrate(legacy())
    expect(db.schemaVersion).toBe(1)
    const items = db.orders[0].items
    expect(items[0]).toMatchObject({ menuId: 'm1', name: 'Espresso', category: 'Cà phê', price: 35000, qty: 2 })
    expect(items[1]).toMatchObject({ menuId: 'deleted', name: 'Món đã xóa', price: 20000, qty: 1 })
    expect(typeof items[1].category).toBe('string')
    expect(db.orders[0]).toMatchObject({ rating: null, feedback: '', ratedAt: null })
    expect(db.orders[0].statusHistory.length).toBeGreaterThan(0)
    expect(db.orders[0].pointsAwarded).toBe(0)
    expect(db.promotions[0]).toMatchObject({ minSubtotal: 0, firstOrderOnly: false, category: null, expiresAt: null, maxDiscount: null })
    expect(db.users.every((u) => typeof u.createdAt === 'number')).toBe(true)
  })

  it('loyalty có khoá cho mọi user', () => {
    const db = migrate(legacy())
    expect(db.loyalty['u-kh']).toBe(3)
    expect(db.loyalty['u-admin']).toBe(0)
  })

  it('giữ nguyên dữ liệu hiện có (rating, feedback)', () => {
    const raw = legacy()
    raw.orders[0].rating = 4
    raw.orders[0].feedback = 'Ngon'
    const db = migrate(raw)
    expect(db.orders[0]).toMatchObject({ rating: 4, feedback: 'Ngon' })
  })

  it('idempotent: migrate(migrate(x)) bằng migrate(x)', () => {
    const once = migrate(legacy())
    expect(migrate(structuredClone(once))).toEqual(once)
  })

  it('DB v1 hợp lệ (seed) giữ nguyên', () => {
    const seed = createSeedDB(NOW)
    expect(migrate(structuredClone(seed))).toEqual(seed)
  })

  it('thiếu menu/promotions/orders/loyalty → mặc định rỗng', () => {
    const db = migrate({ users: legacy().users })
    expect(db.menu).toEqual([])
    expect(db.promotions).toEqual([])
    expect(db.orders).toEqual([])
    expect(db.loyalty['u-kh']).toBe(0)
  })

  it('dữ liệu không dùng được → null (để caller dùng seed)', () => {
    for (const bad of [null, undefined, 'abc', 42, [], {}, { users: 'x' }, { users: null }]) {
      expect(migrate(bad)).toBeNull()
    }
  })

  it('không mutate đầu vào', () => {
    const raw = legacy()
    const copy = structuredClone(raw)
    migrate(raw)
    expect(raw).toEqual(copy)
  })
})

