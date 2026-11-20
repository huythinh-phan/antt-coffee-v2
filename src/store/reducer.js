import { MAX_QTY } from '../lib/constants.js'
import { calcOrderTotals } from '../lib/pricing.js'
import { canTransition } from '../lib/orderStatus.js'
import { pointsFor } from '../lib/loyalty.js'
import { validateMenuItem, validatePromo, validateRegister, validateRating, validateNote } from '../lib/validators.js'

export const createInitialState = ({ db, session = null }) => ({ db, session, toast: null, authError: null, lastOrderId: null })

const err = (state, message) => ({ ...state, toast: { id: (state.toast?.id ?? 0) + 1, type: 'error', message } })
const ok = (state, patch, message, type = 'success') => ({
  ...state, ...patch, toast: message ? { id: (state.toast?.id ?? 0) + 1, type, message } : state.toast,
})
const firstError = (errors) => Object.values(errors)[0]
const currentUser = (s) => s.db.users.find((u) => u.id === s.session?.userId) || null
const isAdmin = (s) => currentUser(s)?.role === 'admin'

export function reducer(state, action) {
  const { db } = state
  switch (action.type) {
    case 'LOGIN': {
      const uname = String(action.username ?? '').trim().toLowerCase()
      const u = db.users.find((x) => x.username.toLowerCase() === uname && x.password === action.password)
      if (!u) return { ...state, authError: 'Sai tài khoản hoặc mật khẩu' }
      return { ...state, session: { userId: u.id }, authError: null }
    }
    case 'LOGOUT':
      return { ...state, session: null }
    case 'REGISTER': {
      const v = validateRegister(action)
      if (!v.ok) return { ...state, authError: firstError(v.errors) }
      if (db.users.some((u) => u.username.toLowerCase() === v.value.username)) return { ...state, authError: 'Tên đăng nhập đã tồn tại' }
      const user = { id: action.id, username: v.value.username, password: v.value.password, role: 'customer', name: v.value.name, createdAt: action.now }
      return {
        ...state,
        db: { ...db, users: [...db.users, user], loyalty: { ...db.loyalty, [user.id]: 0 } },
        session: { userId: user.id },
        authError: null,
      }
    }
    case 'MENU_CREATE':
    case 'MENU_UPDATE': {
      if (!isAdmin(state)) return err(state, 'Không có quyền')
      const v = validateMenuItem(action.item)
      if (!v.ok) return err(state, firstError(v.errors))
      const item = { id: action.item.id, ...v.value }
      const idx = db.menu.findIndex((m) => m.id === item.id)
      if (action.type === 'MENU_CREATE') {
        if (idx >= 0) return err(state, 'Món đã tồn tại')
        return ok(state, { db: { ...db, menu: [...db.menu, item] } }, 'Đã thêm món')
      }
      if (idx < 0) return err(state, 'Không tìm thấy món')
      return ok(state, { db: { ...db, menu: db.menu.map((m, i) => (i === idx ? item : m)) } }, 'Đã cập nhật món')
    }
    case 'MENU_DELETE':
      if (!isAdmin(state)) return err(state, 'Không có quyền')
      return ok(state, { db: { ...db, menu: db.menu.filter((m) => m.id !== action.id) } }, 'Đã xóa món')
    case 'PROMO_SAVE': {
      if (!isAdmin(state)) return err(state, 'Không có quyền')
      const v = validatePromo(action.promo, db.promotions)
      if (!v.ok) return err(state, v.errors.code === 'Mã ưu đãi đã tồn tại' ? v.errors.code : firstError(v.errors))
      const idx = db.promotions.findIndex((p) => p.id === v.value.id)
      const promotions = idx >= 0 ? db.promotions.map((p, i) => (i === idx ? v.value : p)) : [...db.promotions, v.value]
      return ok(state, { db: { ...db, promotions } }, 'Đã lưu ưu đãi')
    }
    case 'PROMO_DELETE':
      if (!isAdmin(state)) return err(state, 'Không có quyền')
      return ok(state, { db: { ...db, promotions: db.promotions.filter((p) => p.id !== action.id) } }, 'Đã xóa ưu đãi')
    case 'ORDER_CREATE': {
      const user = currentUser(state)
      if (!user) return err(state, 'Vui lòng đăng nhập để đặt đơn')
      if (db.orders.some((o) => o.id === action.id)) return state
      if (!Array.isArray(action.items) || action.items.length === 0) return err(state, 'Giỏ hàng trống')
      const merged = new Map()
      for (const { menuId, qty } of action.items) {
        if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1) return err(state, 'Số lượng không hợp lệ')
        merged.set(menuId, (merged.get(menuId) || 0) + qty)
      }
      const items = []
      for (const [menuId, qty] of merged) {
        if (qty > MAX_QTY) return err(state, 'Số lượng không hợp lệ')
        const m = db.menu.find((x) => x.id === menuId)
        if (!m) return err(state, 'Có món không còn trong menu')
        items.push({ menuId, name: m.name, category: m.category, price: m.price, qty })
      }
      const note = validateNote(action.note)
      if (!note.ok) return err(state, firstError(note.errors))
      const userOrderCount = db.orders.filter((o) => o.userId === user.id && o.status !== 'CANCELED').length
      const t = calcOrderTotals({ items, code: action.promoCode, promotions: db.promotions, userOrderCount, now: action.createdAt })
      const order = {
        id: action.id, code: action.code, userId: user.id, items, total: t.subtotal, discount: t.discount, payable: t.payable,
        promoCode: t.promo ? t.promo.code : null, status: 'CREATED', note: note.value, createdAt: action.createdAt,
        statusHistory: [{ status: 'CREATED', at: action.createdAt }], rating: null, feedback: '', ratedAt: null, pointsAwarded: 0,
      }
      const pr = t.promoResult
      const msg = `Đã tạo đơn #${order.code}` + (pr.reason && pr.reason !== 'EMPTY' ? ` (không áp dụng ưu đãi: ${pr.message})` : '')
      return ok(state, { db: { ...db, orders: [order, ...db.orders] }, lastOrderId: order.id }, msg)
    }
    case 'ORDER_STATUS': {
      const user = currentUser(state)
      if (!user) return err(state, 'Không có quyền')
      const o = db.orders.find((x) => x.id === action.id)
      if (!o) return err(state, 'Không tìm thấy đơn')
      const isOwner = o.userId === user.id
      if (user.role !== 'admin' && !isOwner) return err(state, 'Không có quyền')
      if (!canTransition(o.status, action.status, user.role, isOwner)) return err(state, 'Không thể chuyển trạng thái')
      const upd = { ...o, status: action.status, statusHistory: [...o.statusHistory, { status: action.status, at: action.now }] }
      let loyalty = db.loyalty
      if (action.status === 'FULFILLED') {
        upd.pointsAwarded = pointsFor(o.payable)
        loyalty = { ...loyalty, [o.userId]: (loyalty[o.userId] || 0) + upd.pointsAwarded }
      }
      return ok(state, { db: { ...db, orders: db.orders.map((x) => (x.id === o.id ? upd : x)), loyalty } }, 'Đã cập nhật đơn')
    }
    case 'ORDER_RATE': {
      const user = currentUser(state)
      const o = db.orders.find((x) => x.id === action.id)
      if (!user || !o) return err(state, o ? 'Không có quyền' : 'Không tìm thấy đơn')
      if (o.userId !== user.id) return err(state, 'Không có quyền')
      if (o.status !== 'FULFILLED') return err(state, 'Chỉ đánh giá được đơn đã hoàn tất')
      const v = validateRating(action)
      if (!v.ok) return err(state, firstError(v.errors))
      const upd = { ...o, rating: v.value.rating, feedback: v.value.feedback, ratedAt: action.now }
      return ok(state, { db: { ...db, orders: db.orders.map((x) => (x.id === o.id ? upd : x)) } }, 'Đã lưu đánh giá')
    }
    case 'POINTS_ADJUST': {
      if (!isAdmin(state)) return err(state, 'Không có quyền')
      const target = db.users.find((u) => u.id === action.userId)
      if (!target) return err(state, 'Không tìm thấy khách')
      if (typeof action.delta !== 'number' || !Number.isInteger(action.delta) || action.delta === 0) return err(state, 'Số điểm không hợp lệ')
      const cur = db.loyalty[target.id] || 0
      return ok(state, { db: { ...db, loyalty: { ...db.loyalty, [target.id]: Math.max(0, cur + action.delta) } } }, 'Đã cập nhật điểm')
    }
    case 'DB_RESET': {
      if (!isAdmin(state)) return err(state, 'Không có quyền')
      const keep = action.db.users.some((u) => u.id === state.session?.userId)
      return ok(state, { db: action.db, session: keep ? state.session : null }, 'Đã đặt lại dữ liệu demo', 'info')
    }
    case 'DB_REPLACE': {
      const keep = action.db.users.some((u) => u.id === state.session?.userId)
      return { ...state, db: action.db, session: keep ? state.session : null }
    }
    case 'TOAST_CLEAR':
      return { ...state, toast: null }
    default:
      return state
  }
}
