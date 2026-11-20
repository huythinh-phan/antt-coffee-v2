import { SCHEMA_VERSION, DB_KEY } from '../lib/constants.js'
import { createSeedDB } from './seed.js'
import { safeGet, safeSet } from './storage.js'

const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x)
const num = (x, d = 0) => (typeof x === 'number' && Number.isFinite(x) ? x : d)

/**
 * Chuẩn hoá dữ liệu về schema hiện tại (v1). THUẦN: không chạm storage.
 * Trả `null` nếu dữ liệu không dùng được (caller dùng seed).
 */
export function migrate(raw) {
  if (!isObj(raw) || !Array.isArray(raw.users)) return null
  const menu = (Array.isArray(raw.menu) ? raw.menu : []).filter(isObj)
  const byId = Object.fromEntries(menu.map((m) => [m.id, m]))
  const now = Date.now()
  const users = raw.users
    .filter((u) => isObj(u) && typeof u.id === 'string' && typeof u.username === 'string')
    .map((u) => ({ ...u, createdAt: typeof u.createdAt === 'number' ? u.createdAt : now }))
  const promotions = (Array.isArray(raw.promotions) ? raw.promotions : []).filter(isObj).map((p) => ({
    minSubtotal: 0,
    firstOrderOnly: false,
    category: null,
    expiresAt: null,
    maxDiscount: null,
    ...p,
  }))
  const orders = (Array.isArray(raw.orders) ? raw.orders : [])
    .filter((o) => isObj(o) && typeof o.id === 'string')
    .map((o) => ({
      note: '',
      ...o,
      code: String(o.code ?? o.id.slice(0, 6)).toUpperCase(),
      total: num(o.total),
      discount: num(o.discount),
      payable: num(o.payable),
      createdAt: num(o.createdAt, now),
      items: (Array.isArray(o.items) ? o.items : []).filter(isObj).map((i) => ({
        ...i,
        price: num(i.price),
        qty: num(i.qty, 1),
        name: i.name ?? byId[i.menuId]?.name ?? 'Món đã xóa',
        category: i.category ?? byId[i.menuId]?.category ?? '',
      })),
      statusHistory:
        Array.isArray(o.statusHistory) && o.statusHistory.length
          ? o.statusHistory
          : [{ status: o.status, at: num(o.createdAt, now) }],
      rating: o.rating ?? null,
      feedback: o.feedback ?? '',
      ratedAt: o.ratedAt ?? null,
      pointsAwarded: o.pointsAwarded ?? 0,
    }))
  const loyalty = { ...(isObj(raw.loyalty) ? raw.loyalty : {}) }
  for (const u of users) if (typeof loyalty[u.id] !== 'number') loyalty[u.id] = 0
  return { schemaVersion: SCHEMA_VERSION, users, menu, promotions, orders, loyalty }
}

let lastSaved = null

/** Đọc DB từ storage → migrate → fallback seed (và ghi lại seed). */
export function loadDB() {
  const raw = safeGet(DB_KEY)
  let db = null
  if (raw) {
    try {
      db = migrate(JSON.parse(raw))
    } catch {
      db = null
    }
  }
  if (!db) db = createSeedDB()
  saveDB(db)
  return db
}

/** Ghi DB (bỏ qua nếu không đổi). Không ném lỗi. */
export function saveDB(db) {
  const s = JSON.stringify(db)
  if (s === lastSaved) return
  lastSaved = s
  safeSet(DB_KEY, s)
}

export function resetDB() {
  const db = createSeedDB()
  saveDB(db)
  return db
}

/** Dùng cho sự kiện `storage` từ tab khác. */
export function parseExternalDB(raw) {
  if (!raw) return null
  try {
    const db = migrate(JSON.parse(raw))
    if (db) lastSaved = JSON.stringify(db)
    return db
  } catch {
    return null
  }
}
