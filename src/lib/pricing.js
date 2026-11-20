export const PROMO_MESSAGES = {
  NOT_FOUND: 'Mã ưu đãi không tồn tại',
  INACTIVE: 'Mã ưu đãi đã tắt',
  EXPIRED: 'Mã ưu đãi đã hết hạn',
  FIRST_ORDER_ONLY: 'Mã chỉ áp dụng cho đơn đầu tiên',
  CATEGORY_MISMATCH: 'Đơn chưa có món thuộc danh mục áp dụng',
  MIN_SUBTOTAL: 'Chưa đạt giá trị đơn tối thiểu',
}

export const calcSubtotal = (items) => items.reduce((s, x) => s + x.price * x.qty, 0)

const fail = (reason) => ({ valid: false, reason, message: PROMO_MESSAGES[reason] || '', promo: null, discount: 0 })

export function evaluatePromo({ code, promotions, items, userOrderCount, now }) {
  const c = String(code ?? '').trim().toUpperCase()
  if (!c) return fail('EMPTY')
  const promo = promotions.find((p) => String(p.code).toUpperCase() === c)
  if (!promo) return fail('NOT_FOUND')
  if (!promo.active) return fail('INACTIVE')
  if (promo.expiresAt != null && promo.expiresAt <= now) return fail('EXPIRED')
  if (promo.firstOrderOnly && userOrderCount > 0) return fail('FIRST_ORDER_ONLY')
  const subtotal = calcSubtotal(items)
  const eligible = promo.category ? items.filter((i) => i.category === promo.category) : items
  if (promo.category && eligible.length === 0) return fail('CATEGORY_MISMATCH')
  if (subtotal < (promo.minSubtotal || 0)) return fail('MIN_SUBTOTAL')
  const base = promo.category ? calcSubtotal(eligible) : subtotal
  let discount = promo.type === 'percent' ? Math.round((base * promo.value) / 100) : Math.min(base, promo.value)
  if (promo.maxDiscount != null) discount = Math.min(discount, promo.maxDiscount)
  discount = Math.min(discount, subtotal)
  return { valid: true, reason: null, message: '', promo, discount }
}

export function calcOrderTotals({ items, code, promotions, userOrderCount, now }) {
  const subtotal = calcSubtotal(items)
  const promoResult = evaluatePromo({ code, promotions, items, userOrderCount, now })
  const discount = promoResult.valid ? promoResult.discount : 0
  return { subtotal, discount, payable: Math.max(0, subtotal - discount), promo: promoResult.valid ? promoResult.promo : null, promoResult }
}
