import { describe, it, expect } from 'vitest'
import { pointsFor } from '../../src/lib/loyalty.js'
import { newId, newOrderCode } from '../../src/lib/id.js'
import { currency, formatDateTime } from '../../src/lib/format.js'

// FR-LOY-01, FR-ORD-06, NFR-REL-01

describe('pointsFor (1 điểm / 10.000₫, làm tròn xuống)', () => {
  it.each([
    [0, 0],
    [9999, 0],
    [10000, 1],
    [19999, 1],
    [83000, 8],
    [70000, 7],
    [1_000_000, 100],
  ])('payable %i → %i điểm', (payable, pts) => {
    expect(pointsFor(payable)).toBe(pts)
  })

  it('giá trị không hợp lệ → 0', () => {
    for (const v of [-5000, NaN, undefined, null, Infinity, 'abc']) expect(pointsFor(v)).toBe(0)
  })
})

describe('newId', () => {
  it('trả chuỗi uuid v4 và không trùng', () => {
    const a = newId()
    const b = newId()
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(a).not.toBe(b)
  })
})

describe('newOrderCode', () => {
  it('6 ký tự, chỉ A-Z (trừ I,O) và 2-9', () => {
    for (let i = 0; i < 200; i++) expect(newOrderCode()).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ2-9]{6}$/)
  })

  it('không trùng mã đã có (thử lại khi va chạm)', () => {
    const seq = [...Array(6).fill(0), ...Array(6).fill(0.5)] // lần 1 → "AAAAAA", lần 2 → "SSSSSS"
    let i = 0
    const rand = () => seq[i++]
    expect(newOrderCode(['AAAAAA'], rand)).toBe('SSSSSS')
  })

  it('không có va chạm → dùng ngay lần đầu', () => {
    const rand = () => 0
    expect(newOrderCode([], rand)).toBe('AAAAAA')
  })
})

describe('format', () => {
  it('currency vi-VN VND', () => {
    // Intl dùng NBSP trước ký hiệu ₫ → chuẩn hoá khoảng trắng trước khi so sánh
    const norm = (s) => s.replace(/\s/g, ' ')
    expect(norm(currency(35000))).toBe('35.000 ₫')
    expect(norm(currency(0))).toBe('0 ₫')
    expect(norm(currency(1234567))).toBe('1.234.567 ₫')
  })

  it('formatDateTime dạng dd/MM/yyyy HH:mm (vi-VN)', () => {
    const s = formatDateTime(new Date(2026, 0, 5, 9, 7).getTime()) // giờ địa phương
    expect(s).toMatch(/05\/01\/2026/)
    expect(s).toMatch(/09:07/)
  })
})

