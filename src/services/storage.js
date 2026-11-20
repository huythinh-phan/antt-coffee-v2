// Bọc Web Storage an toàn: không bao giờ ném lỗi; fallback bộ nhớ khi bị chặn/hết quota.
// Truy cập window.localStorage lười (trong hàm) để import được ở môi trường Node.

const memory = { local: new Map(), session: new Map() }

function getStore(kind) {
  try {
    const s = kind === 'session' ? window.sessionStorage : window.localStorage
    return s || null
  } catch {
    return null
  }
}

function make(kind) {
  const mem = memory[kind]
  return {
    get(key) {
      const s = getStore(kind)
      if (s) {
        try {
          const v = s.getItem(key)
          if (v !== null) return v
        } catch {
          /* fallthrough */
        }
      }
      return mem.has(key) ? mem.get(key) : null
    },
    set(key, value) {
      mem.set(key, value)
      const s = getStore(kind)
      if (!s) return false
      try {
        s.setItem(key, value)
        return true
      } catch {
        return false
      }
    },
    remove(key) {
      mem.delete(key)
      const s = getStore(kind)
      if (!s) return
      try {
        s.removeItem(key)
      } catch {
        /* ignore */
      }
    },
  }
}

export const local = make('local')
export const session = make('session')

export const safeGet = (key) => local.get(key)
export const safeSet = (key, value) => local.set(key, value)
export const safeRemove = (key) => local.remove(key)

export function readJSON(store, key, fallback = null) {
  const raw = store.get(key)
  if (raw == null) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

