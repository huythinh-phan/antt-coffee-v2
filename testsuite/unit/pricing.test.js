import { describe, it, expect } from 'vitest'
import { calcSubtotal, evaluatePromo, calcOrderTotals, PROMO_MESSAGES } from '../../src/lib/pricing.js'

// TC-PROMO-*, FR-ORD-04, FR-PROMO-02/03

const NOW = 1_800_000_000_000
const base = { active: true, desc: '', minSubtotal: 0, firstOrderOnly: false, category: null, expiresAt: null, maxDiscount: null }
const promotions = [
  { ...base, id: 'p1', code: 'WELCOME10', type: 'percent', value: 10, firstOrderOnly: true },
  { ...base, id: 'p2', code: 'CF15K', type: 'amount', value: 15000, category: 'Cà phê' },
  { ...base, id: 'p3', code: 'OFF', type: 'percent', value: 50, active: false },
  { ...base, id: 'p4', code: 'OLD', type: 'amount', value: 5000, expiresAt: NOW - 1 },
  { ...base, id: 'p5', code: 'MIN100', type: 'amount', value: 10000, minSubtotal: 100000 },
  { ...base, id: 'p6', code: 'CAP', type: 'percent', value: 50, maxDiscount: 20000 },
  { ...base, id: 'p7', code: 'BIG', type: 'amount', value: 50000 },
  { ...base, id: 'p8', code: 'FUTURE', type: 'amount', value: 5000, expiresAt: NOW + 1000 },
]
const espresso2 = [{ menuId: 'm1', price: 35000, qty: 2, category: 'Cà phê' }] // 70.000
const latte1 = [{ menuId: 'm2', price: 45000, qty: 1, category: 'Cà phê' }] // 45.000
const tea1 = [{ menuId: 'm4', price: 42000, qty: 1, category: 'Trà' }] // 42.000
const ev = (code, items, userOrderCount = 0) => evaluatePromo({ code, promotions, items, userOrderCount, now: NOW })

describe('calcSubtotal', () => {
  it('cộng price*qty', () => {
    expect(calcSubtotal([{ price: 35000, qty: 2 }, { price: 45000, qty: 1 }])).toBe(115000)
  })
  it('giỏ rỗng = 0', () => {
    expect(calcSubtotal([])).toBe(0)
  })
})

describe('evaluatePromo', () => {
  it('EMPTY: mã rỗng/khoảng trắng → invalid, discount 0', () => {
    for (const code of ['', '   ', undefined, null]) {
      const r = ev(code, espresso2)
      expect(r.valid).toBe(false)
      expect(r.reason).toBe('EMPTY')
      expect(r.discount).toBe(0)
      expect(r.promo).toBeNull()
    }
  })

  it('NOT_FOUND', () => {
    const r = ev('KHONGCO', espresso2)
    expect(r).toMatchObject({ valid: false, reason: 'NOT_FOUND', discount: 0 })
    expect(r.message).toBe(PROMO_MESSAGES.NOT_FOUND)
  })

  it('INACTIVE', () => {
    expect(ev('OFF', espresso2)).toMatchObject({ valid: false, reason: 'INACTIVE', discount: 0 })
  })

  it('EXPIRED khi expiresAt <= now; chưa hết hạn thì hợp lệ', () => {
    expect(ev('OLD', espresso2)).toMatchObject({ valid: false, reason: 'EXPIRED' })
    expect(ev('FUTURE', espresso2)).toMatchObject({ valid: true, discount: 5000 })
  })

  it('không phân biệt hoa/thường và khoảng trắng', () => {
    const r = ev('  welcome10 ', espresso2)
    expect(r.valid).toBe(true)
    expect(r.promo.code).toBe('WELCOME10')
  })

  it('percent: WELCOME10 trên 70.000 → 7.000', () => {
    expect(ev('WELCOME10', espresso2)).toMatchObject({ valid: true, reason: null, discount: 7000 })
  })

  it('percent làm tròn: 10% của 45.005 → 4.501 (Math.round)', () => {
    const items = [{ menuId: 'x', price: 45005, qty: 1, category: 'Trà' }]
    expect(ev('WELCOME10', items).discount).toBe(Math.round(4500.5))
  })

  it('FIRST_ORDER_ONLY khi đã có đơn', () => {
    expect(ev('WELCOME10', espresso2, 1)).toMatchObject({ valid: false, reason: 'FIRST_ORDER_ONLY', discount: 0 })
  })

  it('amount theo danh mục: CF15K trên Latte → 15.000', () => {
    expect(ev('CF15K', latte1)).toMatchObject({ valid: true, discount: 15000 })
  })

  it('CATEGORY_MISMATCH: CF15K chỉ với Trà đào', () => {
    expect(ev('CF15K', tea1)).toMatchObject({ valid: false, reason: 'CATEGORY_MISMATCH', discount: 0 })
  })

  it('danh mục: chỉ tính trên phần thuộc danh mục (amount bị chặn bởi base)', () => {
    const cheapCoffee = [{ menuId: 'a', price: 10000, qty: 1, category: 'Cà phê' }, ...tea1]
    // base = 10.000 < 15.000 → discount = 10.000
    expect(ev('CF15K', cheapCoffee).discount).toBe(10000)
  })

  it('MIN_SUBTOTAL', () => {
    expect(ev('MIN100', espresso2)).toMatchObject({ valid: false, reason: 'MIN_SUBTOTAL', discount: 0 })
    const big = [{ menuId: 'm1', price: 35000, qty: 3, category: 'Cà phê' }] // 105.000
    expect(ev('MIN100', big)).toMatchObject({ valid: true, discount: 10000 })
  })

  it('maxDiscount chặn trần: 50% của 70.000 = 35.000 → 20.000', () => {
    expect(ev('CAP', espresso2).discount).toBe(20000)
  })

  it('amount lớn hơn tạm tính → giảm tối đa bằng tạm tính', () => {
    const one = [{ menuId: 'm1', price: 35000, qty: 1, category: 'Cà phê' }]
    expect(ev('BIG', one).discount).toBe(35000)
  })

  it('PROMO_MESSAGES có thông báo tiếng Việt cho mọi lý do (trừ EMPTY)', () => {
    for (const k of ['NOT_FOUND', 'INACTIVE', 'EXPIRED', 'FIRST_ORDER_ONLY', 'CATEGORY_MISMATCH', 'MIN_SUBTOTAL']) {
      expect(typeof PROMO_MESSAGES[k]).toBe('string')
      expect(PROMO_MESSAGES[k].length).toBeGreaterThan(5)
    }
    expect(PROMO_MESSAGES.FIRST_ORDER_ONLY).toBe('Mã chỉ áp dụng cho đơn đầu tiên')
  })

  it('không mutate đầu vào', () => {
    const items = structuredClone(espresso2)
    const promos = structuredClone(promotions)
    evaluatePromo({ code: 'WELCOME10', promotions: promos, items, userOrderCount: 0, now: NOW })
    expect(items).toEqual(espresso2)
    expect(promos).toEqual(promotions)
  })
})

describe('calcOrderTotals', () => {
  it('không mã: payable = subtotal', () => {
    const t = calcOrderTotals({ items: espresso2, code: '', promotions, userOrderCount: 0, now: NOW })
    expect(t).toMatchObject({ subtotal: 70000, discount: 0, payable: 70000, promo: null })
  })

  it('WELCOME10: 70.000 → giảm 7.000 → 63.000', () => {
    const t = calcOrderTotals({ items: espresso2, code: 'welcome10', promotions, userOrderCount: 0, now: NOW })
    expect(t).toMatchObject({ subtotal: 70000, discount: 7000, payable: 63000 })
    expect(t.promo.code).toBe('WELCOME10')
    expect(t.promoResult.valid).toBe(true)
  })

  it('CF15K trên Latte → payable 30.000', () => {
    const t = calcOrderTotals({ items: latte1, code: 'CF15K', promotions, userOrderCount: 0, now: NOW })
    expect(t).toMatchObject({ subtotal: 45000, discount: 15000, payable: 30000 })
  })

  it('mã không hợp lệ → discount 0, promo null, promoResult.reason có giá trị', () => {
    const t = calcOrderTotals({ items: tea1, code: 'CF15K', promotions, userOrderCount: 0, now: NOW })
    expect(t).toMatchObject({ subtotal: 42000, discount: 0, payable: 42000, promo: null })
    expect(t.promoResult.reason).toBe('CATEGORY_MISMATCH')
  })

  it('payable không bao giờ âm', () => {
    const one = [{ menuId: 'm1', price: 35000, qty: 1, category: 'Cà phê' }]
    const t = calcOrderTotals({ items: one, code: 'BIG', promotions, userOrderCount: 0, now: NOW })
    expect(t.payable).toBe(0)
    expect(t.discount).toBeLessThanOrEqual(t.subtotal)
  })
})

