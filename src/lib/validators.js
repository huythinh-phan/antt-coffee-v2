import { MAX_NOTE, MAX_FEEDBACK } from './constants.js'
const res = (errors, value) => ({ ok: Object.keys(errors).length === 0, errors, value })
const int = (n) => typeof n === 'number' && Number.isInteger(n)
const s = (v) => String(v ?? '').trim()

export function validateMenuItem({ name, price, category }) {
  const errors = {}
  const v = { name: s(name), price, category: s(category) }
  if (!v.name || v.name.length > 60) errors.name = 'Tên món 1–60 ký tự'
  if (!int(price) || price < 1 || price > 10_000_000) errors.price = 'Giá phải là số nguyên từ 1 đến 10.000.000'
  if (!v.category) errors.category = 'Danh mục là bắt buộc'
  return res(errors, v)
}

export function validatePromo(promo, existing = []) {
  const errors = {}
  const code = s(promo.code).toUpperCase()
  const minSubtotal = promo.minSubtotal ?? 0
  if (!/^[A-Z0-9_-]{3,20}$/.test(code)) errors.code = 'Mã 3–20 ký tự A–Z, 0–9, _ hoặc -'
  else if (existing.some((p) => String(p.code).toUpperCase() === code && p.id !== promo.id)) errors.code = 'Mã ưu đãi đã tồn tại'
  if (!['percent', 'amount'].includes(promo.type)) errors.type = 'Loại không hợp lệ'
  else if (promo.type === 'percent' ? !(int(promo.value) && promo.value >= 1 && promo.value <= 100) : !(int(promo.value) && promo.value > 0))
    errors.value = promo.type === 'percent' ? 'Phần trăm từ 1 đến 100' : 'Số tiền phải là số nguyên dương'
  if (!int(minSubtotal) || minSubtotal < 0) errors.minSubtotal = 'Đơn tối thiểu phải là số nguyên ≥ 0'
  return res(errors, { ...promo, code, minSubtotal, desc: s(promo.desc) })
}

export function validateRegister({ username, password, name }) {
  const errors = {}
  const u = s(username)
  const n = s(name)
  if (!/^[a-z0-9_]{3,20}$/i.test(u)) errors.username = 'Tên đăng nhập 3–20 ký tự chữ, số, _'
  if (typeof password !== 'string' || password.length < 6 || password.length > 72) errors.password = 'Mật khẩu 6–72 ký tự'
  if (!n || n.length > 40) errors.name = 'Họ tên 1–40 ký tự'
  return res(errors, { username: u.toLowerCase(), password, name: n })
}

export function validateRating({ rating, feedback }) {
  const errors = {}
  const f = s(feedback)
  if (!int(rating) || rating < 1 || rating > 5) errors.rating = 'Điểm từ 1 đến 5'
  if (f.length > MAX_FEEDBACK) errors.feedback = `Tối đa ${MAX_FEEDBACK} ký tự`
  return res(errors, { rating, feedback: f })
}

export function validateNote(note) {
  const errors = {}
  const v = s(note)
  if (v.length > MAX_NOTE) errors.note = `Tối đa ${MAX_NOTE} ký tự`
  return res(errors, v)
}
