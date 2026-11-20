import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, useCurrentUser } from '../context/useApp.js'
import { useCart } from '../hooks/useCart.js'
import { calcOrderTotals } from '../lib/pricing.js'
import { currency } from '../lib/format.js'
import { newId, newOrderCode } from '../lib/id.js'
import { MAX_QTY, MAX_NOTE } from '../lib/constants.js'

const QUICK_NOTES = ['Ít đường', 'Không đá', 'Ít đá', 'Size lớn']

export default function OrderPage() {
  const { state, dispatch } = useApp()
  const user = useCurrentUser()
  const navigate = useNavigate()
  const { menu, promotions, orders } = state.db
  const { items, add, dec, remove, clear } = useCart(menu)
  const [promo, setPromo] = useState('')
  const [note, setNote] = useState('')
  const [cat, setCat] = useState('')
  const idRef = useRef(null)
  const [pendingId, setPendingId] = useState(null)

  const categories = useMemo(() => [...new Set(menu.map((m) => m.category))], [menu])
  const userOrderCount = user ? orders.filter((o) => o.userId === user.id && o.status !== 'CANCELED').length : 0
  const totals = calcOrderTotals({ items, code: promo, promotions, userOrderCount, now: Date.now() })
  const pr = totals.promoResult
  const qtyOf = (id) => items.find((i) => i.menuId === id)?.qty || 0

  // Khi đơn vừa đặt đã có trong DB → dọn giỏ & chuyển tới chi tiết đơn
  useEffect(() => {
    if (pendingId && orders.some((o) => o.id === pendingId)) {
      idRef.current = null
      setPendingId(null)
      clear()
      setPromo('')
      setNote('')
      navigate(`/orders/${pendingId}`)
    }
  }, [orders, pendingId, clear, navigate])

  const placeOrder = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/order' } } })
      return
    }
    if (items.length === 0) return
    if (!idRef.current) idRef.current = newId()
    const id = idRef.current
    setPendingId(id)
    dispatch({
      type: 'ORDER_CREATE',
      id,
      code: newOrderCode(orders.map((o) => o.code)),
      createdAt: Date.now(),
      items: items.map(({ menuId, qty }) => ({ menuId, qty })),
      promoCode: promo,
      note,
    })
  }

  const addQuick = (t) => setNote((n) => (n.includes(t) ? n : n ? `${n}, ${t}` : t))
  const visibleMenu = menu.filter((m) => !cat || m.category === cat)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <h1 className="mb-3 text-2xl font-bold">Chọn món</h1>
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Lọc theo danh mục">
          {['', ...categories].map((c) => (
            <button
              key={c || 'all'}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={`btn ${cat === c ? 'btn-primary' : 'btn-secondary'}`}
            >
              {c || 'Tất cả'}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleMenu.map((m) => {
            const q = qtyOf(m.id)
            return (
              <button
                key={m.id}
                type="button"
                data-testid={`order-add-${m.id}`}
                onClick={() => add(m.id)}
                disabled={q >= MAX_QTY}
                aria-label={`Thêm ${m.name} vào giỏ`}
                className="card text-left transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold">{m.name}</div>
                  {q > 0 && <span className="badge bg-amber-100 text-amber-950 dark:bg-amber-900 dark:text-amber-50">×{q}</span>}
                </div>
                <div className="muted text-sm">{m.category}</div>
                <div className="mt-1 font-bold tabular-nums">{currency(m.price)}</div>
              </button>
            )
          })}
        </div>
        {menu.length === 0 && <p className="muted">Menu đang trống.</p>}
      </section>

      <section aria-labelledby="cart-title">
        <h2 id="cart-title" className="mb-3 text-2xl font-bold">
          Giỏ hàng
        </h2>
        <div className="card space-y-3">
          {items.length === 0 && (
            <p className="muted text-sm" data-testid="cart-empty">
              Chưa có món. Bấm vào món bên cạnh để thêm.
            </p>
          )}
          {items.map((i) => (
            <div key={i.menuId} data-testid={`cart-item-${i.menuId}`} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-medium">{i.name}</div>
                <div className="muted text-xs tabular-nums">
                  {currency(i.price)} × <span data-testid={`cart-qty-${i.menuId}`}>{i.qty}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" className="btn btn-secondary px-3" aria-label={`Giảm ${i.name}`} data-testid={`cart-dec-${i.menuId}`} onClick={() => dec(i.menuId)}>
                  −
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-3"
                  aria-label={`Tăng ${i.name}`}
                  data-testid={`cart-inc-${i.menuId}`}
                  disabled={i.qty >= MAX_QTY}
                  onClick={() => add(i.menuId)}
                >
                  +
                </button>
                <button type="button" className="btn btn-danger px-3" aria-label={`Bỏ ${i.name}`} data-testid={`cart-remove-${i.menuId}`} onClick={() => remove(i.menuId)}>
                  ×
                </button>
              </div>
            </div>
          ))}

          <hr className="border-neutral-200 dark:border-neutral-800" />

          <div>
            <label htmlFor="promo-input" className="label">
              Mã ưu đãi
            </label>
            <input
              id="promo-input"
              data-testid="promo-input"
              placeholder="VD: CF15K"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              className="input uppercase placeholder:normal-case"
              autoComplete="off"
            />
            {pr.reason !== 'EMPTY' && (
              <p
                data-testid="promo-message"
                className={`mt-1 text-sm ${pr.valid ? 'text-green-800 dark:text-green-300' : 'text-red-700 dark:text-red-400'}`}
                aria-live="polite"
              >
                {pr.valid ? `✓ ${pr.promo.desc || pr.promo.code}` : pr.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="order-note" className="label">
              Ghi chú cho quán
            </label>
            <div className="mb-2 flex flex-wrap gap-1">
              {QUICK_NOTES.map((t) => (
                <button key={t} type="button" className="btn btn-secondary min-h-0 px-2 py-1 text-xs" onClick={() => addQuick(t)}>
                  + {t}
                </button>
              ))}
            </div>
            <textarea
              id="order-note"
              data-testid="order-note"
              rows={2}
              placeholder="Ít đường, không đá…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input"
            />
            <div className={`mt-1 text-right text-xs ${note.trim().length > MAX_NOTE ? 'text-red-700 dark:text-red-400' : 'muted'}`}>
              {note.trim().length}/{MAX_NOTE}
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <b data-testid="summary-subtotal" className="tabular-nums">
                {currency(totals.subtotal)}
              </b>
            </div>
            <div className="flex justify-between">
              <span>Ưu đãi</span>
              <b data-testid="summary-discount" className="tabular-nums">
                {totals.discount ? `-${currency(totals.discount)}` : currency(0)}
              </b>
            </div>
            <div className="flex justify-between text-lg">
              <span>Thanh toán</span>
              <b data-testid="summary-payable" className="tabular-nums">
                {currency(totals.payable)}
              </b>
            </div>
          </div>

          {!user && (
            <p data-testid="login-required-hint" className="rounded-lg bg-amber-100 p-2 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
              Bạn cần đăng nhập để đặt đơn. Giỏ hàng sẽ được giữ lại.
            </p>
          )}
          <button type="button" data-testid="place-order" disabled={!!user && items.length === 0} onClick={placeOrder} className="btn btn-primary w-full">
            {user ? 'Đặt đơn' : 'Đăng nhập để đặt đơn'}
          </button>
          {user && <p className="muted text-center text-xs">Thanh toán tại quầy khi nhận đồ uống.</p>}
        </div>
      </section>
    </div>
  )
}
