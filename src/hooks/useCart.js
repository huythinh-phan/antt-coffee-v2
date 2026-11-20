import { useCallback, useEffect, useMemo, useState } from 'react'
import { CART_KEY, MAX_QTY } from '../lib/constants.js'
import { session, readJSON } from '../services/storage.js'

function readCart() {
  const v = readJSON(session, CART_KEY, [])
  if (!Array.isArray(v)) return []
  return v.filter((l) => l && typeof l.menuId === 'string' && Number.isInteger(l.qty) && l.qty >= 1).map((l) => ({ menuId: l.menuId, qty: Math.min(l.qty, MAX_QTY) }))
}

/** Giỏ hàng bất biến, lưu sessionStorage để giữ khi đi đăng nhập/F5. */
export function useCart(menu) {
  const [lines, setLines] = useState(readCart)

  useEffect(() => {
    if (lines.length) session.set(CART_KEY, JSON.stringify(lines))
    else session.remove(CART_KEY)
  }, [lines])

  const items = useMemo(
    () =>
      lines
        .map((l) => {
          const m = menu.find((x) => x.id === l.menuId)
          return m ? { menuId: m.id, name: m.name, category: m.category, price: m.price, qty: l.qty } : null
        })
        .filter(Boolean),
    [lines, menu],
  )

  const add = useCallback(
    (menuId) =>
      setLines((ls) => {
        const found = ls.find((l) => l.menuId === menuId)
        if (!found) return [...ls, { menuId, qty: 1 }]
        return ls.map((l) => (l.menuId === menuId ? { ...l, qty: Math.min(MAX_QTY, l.qty + 1) } : l))
      }),
    [],
  )
  const dec = useCallback(
    (menuId) => setLines((ls) => ls.map((l) => (l.menuId === menuId ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0)),
    [],
  )
  const remove = useCallback((menuId) => setLines((ls) => ls.filter((l) => l.menuId !== menuId)), [])
  const clear = useCallback(() => setLines([]), [])

  return { items, add, dec, remove, clear }
}

