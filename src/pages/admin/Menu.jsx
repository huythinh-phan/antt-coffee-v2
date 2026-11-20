import { useState } from 'react'
import { useApp } from '../../context/useApp.js'
import { useConfirm } from '../../hooks/useConfirm.js'
import { validateMenuItem } from '../../lib/validators.js'
import { newId } from '../../lib/id.js'
import { currency } from '../../lib/format.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

const EMPTY = { name: '', price: '', category: '' }

export default function AdminMenu() {
  const { state, dispatch } = useApp()
  const { confirm, dialogProps } = useConfirm()
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const menu = state.db.menu
  const categories = [...new Set(menu.map((m) => m.category))]

  const reset = () => {
    setEditingId(null)
    setDraft(EMPTY)
    setErrors({})
  }
  const startEdit = (m) => {
    setEditingId(m.id)
    setDraft({ name: m.name, price: String(m.price), category: m.category })
    setErrors({})
  }
  const save = (e) => {
    e.preventDefault()
    const price = draft.price === '' ? NaN : Number(draft.price)
    const v = validateMenuItem({ ...draft, price })
    if (!v.ok) {
      setErrors(v.errors)
      return
    }
    if (editingId) dispatch({ type: 'MENU_UPDATE', item: { id: editingId, ...v.value } })
    else dispatch({ type: 'MENU_CREATE', item: { id: newId(), ...v.value } })
    reset()
  }
  const del = async (m) => {
    const ok = await confirm({ title: `Xóa món "${m.name}"?`, message: 'Đơn cũ vẫn giữ nguyên thông tin món.', confirmLabel: 'Xóa', danger: true })
    if (!ok) return
    dispatch({ type: 'MENU_DELETE', id: m.id })
    if (editingId === m.id) reset()
  }
  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }))

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <h1 className="mb-3 text-2xl font-bold">Quản lý menu</h1>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {menu.map((m) => (
            <div key={m.id} className="card" data-testid="admin-menu-card" data-name={m.name}>
              <div className="font-semibold">{m.name}</div>
              <div className="muted text-xs">{m.category}</div>
              <div className="mt-1 font-bold tabular-nums">{currency(m.price)}</div>
              <div className="mt-2 flex gap-2">
                <button type="button" className="btn btn-primary" data-testid="admin-menu-edit" onClick={() => startEdit(m)}>
                  Sửa
                </button>
                <button type="button" className="btn btn-danger" data-testid="admin-menu-delete" onClick={() => del(m)}>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
        {menu.length === 0 && <p className="muted">Chưa có món.</p>}
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-bold">{editingId ? 'Sửa món' : 'Thêm món'}</h2>
        <form className="card space-y-3" onSubmit={save} noValidate>
          <div>
            <label htmlFor="menu-form-name" className="label">
              Tên món
            </label>
            <input id="menu-form-name" data-testid="menu-form-name" className="input" value={draft.name} onChange={set('name')} aria-invalid={!!errors.name} />
            {errors.name && (
              <p className="field-error" data-testid="menu-form-error-name">
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="menu-form-price" className="label">
              Giá (₫)
            </label>
            <input
              id="menu-form-price"
              data-testid="menu-form-price"
              type="number"
              inputMode="numeric"
              min={1}
              step={1000}
              className="input"
              value={draft.price}
              onChange={set('price')}
              aria-invalid={!!errors.price}
            />
            {errors.price && (
              <p className="field-error" data-testid="menu-form-error-price">
                {errors.price}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="menu-form-category" className="label">
              Danh mục
            </label>
            <input
              id="menu-form-category"
              data-testid="menu-form-category"
              list="menu-categories"
              className="input"
              value={draft.category}
              onChange={set('category')}
              aria-invalid={!!errors.category}
            />
            <datalist id="menu-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {errors.category && (
              <p className="field-error" data-testid="menu-form-error-category">
                {errors.category}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" data-testid="menu-form-save">
              Lưu
            </button>
            <button type="button" className="btn btn-secondary" data-testid="menu-form-new" onClick={reset}>
              Mới
            </button>
          </div>
        </form>
      </section>
      <ConfirmDialog {...dialogProps} />
    </div>
  )
}
