import { describe, it, expect } from 'vitest'
import {
  validateMenuItem,
  validatePromo,
  validateRegister,
  validateRating,
  validateNote,
} from '../../src/lib/validators.js'

// FR-MENU-04, FR-PROMO-01, FR-AUTH-04, FR-HIS-03, FR-ORD-02, BUG-10

describe('validateMenuItem', () => {
  it('hợp lệ → ok, chuẩn hoá (trim)', () => {
    const r = validateMenuItem({ name: '  Mocha  ', price: 55000, category: ' Cà phê ' })
    expect(r.ok).toBe(true)
    expect(r.errors).toEqual({})
    expect(r.value).toMatchObject({ name: 'Mocha', price: 55000, category: 'Cà phê' })
  })

  it('tên rỗng/khoảng trắng/quá 60 ký tự → lỗi name', () => {
    for (const name of ['', '   ', 'x'.repeat(61)]) {
      const r = validateMenuItem({ name, price: 1000, category: 'Trà' })
      expect(r.ok).toBe(false)
      expect(r.errors.name).toBeTruthy()
    }
    expect(validateMenuItem({ name: 'x'.repeat(60), price: 1000, category: 'Trà' }).ok).toBe(true)
  })

  it('giá không hợp lệ → lỗi price', () => {
    for (const price of [0, -1, 1.5, NaN, undefined, null, 10_000_001]) {
      const r = validateMenuItem({ name: 'A', price, category: 'Trà' })
      expect(r.ok).toBe(false)
      expect(r.errors.price).toBeTruthy()
    }
    expect(validateMenuItem({ name: 'A', price: 1, category: 'Trà' }).ok).toBe(true)
    expect(validateMenuItem({ name: 'A', price: 10_000_000, category: 'Trà' }).ok).toBe(true)
  })

  it('danh mục rỗng → lỗi category', () => {
    const r = validateMenuItem({ name: 'A', price: 1000, category: '  ' })
    expect(r.ok).toBe(false)
    expect(r.errors.category).toBeTruthy()
  })

  it('nhiều lỗi cùng lúc', () => {
    const r = validateMenuItem({ name: '', price: 0, category: '' })
    expect(Object.keys(r.errors).sort()).toEqual(['category', 'name', 'price'])
  })
})

describe('validatePromo', () => {
  const ok = { id: 'n1', code: 'summer-10', type: 'percent', value: 10, active: true, desc: 'Hè' }

  it('hợp lệ: mã được viết hoa, minSubtotal mặc định 0', () => {
    const r = validatePromo(ok, [])
    expect(r.ok).toBe(true)
    expect(r.value.code).toBe('SUMMER-10')
    expect(r.value.minSubtotal).toBe(0)
  })

  it('định dạng mã', () => {
    for (const code of ['', 'AB', 'A'.repeat(21), 'có dấu', 'a b']) {
      const r = validatePromo({ ...ok, code }, [])
      expect(r.ok).toBe(false)
      expect(r.errors.code).toBeTruthy()
    }
    for (const code of ['ABC', 'A_B-1', 'A'.repeat(20)]) expect(validatePromo({ ...ok, code }, []).ok).toBe(true)
  })

  it('mã trùng (không phân biệt hoa/thường) khác id → lỗi; cùng id → ok', () => {
    const existing = [{ id: 'p1', code: 'WELCOME10' }]
    expect(validatePromo({ ...ok, code: 'welcome10' }, existing).errors.code).toBeTruthy()
    expect(validatePromo({ ...ok, id: 'p1', code: 'WELCOME10' }, existing).ok).toBe(true)
  })

  it('percent 1..100 nguyên', () => {
    for (const value of [0, -5, 101, 10.5, NaN]) {
      const r = validatePromo({ ...ok, type: 'percent', value }, [])
      expect(r.ok).toBe(false)
      expect(r.errors.value).toBeTruthy()
    }
    expect(validatePromo({ ...ok, type: 'percent', value: 100 }, []).ok).toBe(true)
    expect(validatePromo({ ...ok, type: 'percent', value: 1 }, []).ok).toBe(true)
  })

  it('amount nguyên > 0 (có thể > 100)', () => {
    expect(validatePromo({ ...ok, type: 'amount', value: 15000 }, []).ok).toBe(true)
    for (const value of [0, -1, 1.5]) expect(validatePromo({ ...ok, type: 'amount', value }, []).errors.value).toBeTruthy()
  })

  it('type không hợp lệ → lỗi type', () => {
    expect(validatePromo({ ...ok, type: 'gift' }, []).errors.type).toBeTruthy()
  })

  it('minSubtotal âm/lẻ → lỗi', () => {
    expect(validatePromo({ ...ok, minSubtotal: -1 }, []).errors.minSubtotal).toBeTruthy()
    expect(validatePromo({ ...ok, minSubtotal: 50000 }, []).ok).toBe(true)
  })
})

describe('validateRegister', () => {
  const ok = { username: 'Nguyen_An', password: 'secret1', name: ' Nguyễn An ' }

  it('hợp lệ → username lowercase, name trim', () => {
    const r = validateRegister(ok)
    expect(r.ok).toBe(true)
    expect(r.value.username).toBe('nguyen_an')
    expect(r.value.name).toBe('Nguyễn An')
  })

  it('username: 3..20, chỉ chữ/số/_', () => {
    for (const username of ['', 'ab', 'a'.repeat(21), 'a b', 'có-dấu', 'a@b']) {
      expect(validateRegister({ ...ok, username }).errors.username).toBeTruthy()
    }
  })

  it('password: 6..72', () => {
    for (const password of ['', '12345', 'x'.repeat(73)]) {
      expect(validateRegister({ ...ok, password }).errors.password).toBeTruthy()
    }
    expect(validateRegister({ ...ok, password: '123456' }).ok).toBe(true)
  })

  it('name: 1..40', () => {
    for (const name of ['', '   ', 'x'.repeat(41)]) expect(validateRegister({ ...ok, name }).errors.name).toBeTruthy()
  })
})

describe('validateRating', () => {
  it('rating nguyên 1..5', () => {
    for (const rating of [0, 6, 3.5, NaN, undefined, '5x']) {
      const r = validateRating({ rating, feedback: '' })
      expect(r.ok).toBe(false)
      expect(r.errors.rating).toBeTruthy()
    }
    for (const rating of [1, 2, 3, 4, 5]) expect(validateRating({ rating, feedback: '' }).ok).toBe(true)
  })

  it('feedback ≤ 500, được trim', () => {
    expect(validateRating({ rating: 5, feedback: 'x'.repeat(501) }).errors.feedback).toBeTruthy()
    const r = validateRating({ rating: 5, feedback: '  Ngon  ' })
    expect(r.ok).toBe(true)
    expect(r.value).toMatchObject({ rating: 5, feedback: 'Ngon' })
  })
})

describe('validateNote', () => {
  it('≤ 200 ký tự, trim', () => {
    expect(validateNote('x'.repeat(200)).ok).toBe(true)
    expect(validateNote('x'.repeat(201)).ok).toBe(false)
    expect(validateNote('  ít đường ').value).toBe('ít đường')
    expect(validateNote(undefined).ok).toBe(true)
    expect(validateNote(undefined).value).toBe('')
  })
})

