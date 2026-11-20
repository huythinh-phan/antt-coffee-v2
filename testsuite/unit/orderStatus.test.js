import { describe, it, expect } from 'vitest'
import { TRANSITIONS, getAllowedTransitions, canTransition, isTerminal } from '../../src/lib/orderStatus.js'
import { ORDER_STATUS, STATUS_LABEL } from '../../src/lib/constants.js'

// TC-ORD-STATE-*, FR-ADM-02, FR-HIS-02, ADR-0005

const ALL = ['CREATED', 'PAID', 'PREPARING', 'FULFILLED', 'CANCELED']

describe('constants', () => {
  it('ORDER_STATUS & STATUS_LABEL đủ 5 trạng thái, nhãn tiếng Việt', () => {
    expect(Object.keys(ORDER_STATUS).sort()).toEqual([...ALL].sort())
    expect(STATUS_LABEL).toEqual({
      CREATED: 'Chờ thanh toán',
      PAID: 'Đã thanh toán',
      PREPARING: 'Đang pha chế',
      FULFILLED: 'Hoàn tất',
      CANCELED: 'Đã hủy',
    })
  })
})

describe('TRANSITIONS', () => {
  it('khớp bảng chuẩn', () => {
    expect(TRANSITIONS).toEqual({
      CREATED: ['PAID', 'CANCELED'],
      PAID: ['PREPARING', 'CANCELED'],
      PREPARING: ['FULFILLED', 'CANCELED'],
      FULFILLED: [],
      CANCELED: [],
    })
  })
})

describe('admin', () => {
  it('đi hết luồng chuẩn', () => {
    expect(canTransition('CREATED', 'PAID', 'admin', false)).toBe(true)
    expect(canTransition('PAID', 'PREPARING', 'admin', false)).toBe(true)
    expect(canTransition('PREPARING', 'FULFILLED', 'admin', false)).toBe(true)
  })

  it('huỷ được khi CREATED/PAID/PREPARING', () => {
    for (const s of ['CREATED', 'PAID', 'PREPARING']) expect(canTransition(s, 'CANCELED', 'admin', false)).toBe(true)
  })

  it('không nhảy bước / không đi lùi', () => {
    expect(canTransition('CREATED', 'FULFILLED', 'admin', false)).toBe(false)
    expect(canTransition('CREATED', 'PREPARING', 'admin', false)).toBe(false)
    expect(canTransition('PAID', 'CREATED', 'admin', false)).toBe(false)
    expect(canTransition('PREPARING', 'PAID', 'admin', false)).toBe(false)
  })

  it('trạng thái cuối không chuyển được đi đâu', () => {
    for (const from of ['FULFILLED', 'CANCELED']) {
      for (const to of ALL) expect(canTransition(from, to, 'admin', false)).toBe(false)
      expect(getAllowedTransitions(from, 'admin', false)).toEqual([])
      expect(isTerminal(from)).toBe(true)
    }
    for (const s of ['CREATED', 'PAID', 'PREPARING']) expect(isTerminal(s)).toBe(false)
  })

  it('không tự chuyển sang chính nó', () => {
    for (const s of ALL) expect(canTransition(s, s, 'admin', false)).toBe(false)
  })

  it('getAllowedTransitions trả đúng danh sách', () => {
    expect(getAllowedTransitions('CREATED', 'admin', false)).toEqual(['PAID', 'CANCELED'])
    expect(getAllowedTransitions('PREPARING', 'admin', false)).toEqual(['FULFILLED', 'CANCELED'])
  })
})

describe('customer', () => {
  it('chủ đơn chỉ huỷ được khi CREATED', () => {
    expect(canTransition('CREATED', 'CANCELED', 'customer', true)).toBe(true)
    expect(getAllowedTransitions('CREATED', 'customer', true)).toEqual(['CANCELED'])
  })

  it('chủ đơn không huỷ được khi PAID/PREPARING/FULFILLED/CANCELED', () => {
    for (const s of ['PAID', 'PREPARING', 'FULFILLED', 'CANCELED']) {
      expect(canTransition(s, 'CANCELED', 'customer', true)).toBe(false)
      expect(getAllowedTransitions(s, 'customer', true)).toEqual([])
    }
  })

  it('khách không được tự chuyển PAID/PREPARING/FULFILLED', () => {
    for (const to of ['PAID', 'PREPARING', 'FULFILLED']) expect(canTransition('CREATED', to, 'customer', true)).toBe(false)
  })

  it('không phải chủ đơn → không có quyền gì', () => {
    expect(canTransition('CREATED', 'CANCELED', 'customer', false)).toBe(false)
    expect(getAllowedTransitions('CREATED', 'customer', false)).toEqual([])
  })

  it('role lạ/undefined → không cho phép', () => {
    expect(canTransition('CREATED', 'PAID', undefined, true)).toBe(false)
    expect(getAllowedTransitions('CREATED', 'guest', true)).toEqual([])
  })
})

describe('đầu vào lạ', () => {
  it('trạng thái không tồn tại → [] / false', () => {
    expect(getAllowedTransitions('WHATEVER', 'admin', false)).toEqual([])
    expect(canTransition('WHATEVER', 'PAID', 'admin', false)).toBe(false)
  })
})

