import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { currency } from '../lib/format.js'

export default function MenuPage() {
  const { state } = useApp()
  const menu = state.db.menu
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const categories = useMemo(() => [...new Set(menu.map((m) => m.category))], [menu])
  const needle = q.trim().toLowerCase()
  const items = menu.filter((x) => x.name.toLowerCase().includes(needle) && (!cat || x.category === cat))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Thực đơn</h1>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="menu-search" className="sr-only">
          Tìm món
        </label>
        <input
          id="menu-search"
          data-testid="menu-search"
          placeholder="Tìm món..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo danh mục">
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
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((x) => (
          <div key={x.id} className="card" data-testid="menu-card" data-name={x.name}>
            <div className="font-semibold">{x.name}</div>
            <div className="muted text-sm">{x.category}</div>
            <div className="mt-2 font-bold tabular-nums">{currency(x.price)}</div>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <p className="muted" data-testid="menu-empty">
          Không tìm thấy món phù hợp.
        </p>
      )}
      <Link to="/order" className="btn btn-primary">
        Đặt món ngay
      </Link>
    </div>
  )
}
