import { useState } from 'react'
import { useApp } from '../../context/useApp.js'
import { useConfirm } from '../../hooks/useConfirm.js'
import { validatePromo } from '../../lib/validators.js'
import { newId } from '../../lib/id.js'
import { currency } from '../../lib/format.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

const EMPTY = { code: '', type: 'percent', value: '', minSubtotal: '', firstOrderOnly: false, desc: '' }
const toNum = (s) => (s === '' || s == null ? NaN : Number(s))

export default function AdminPromos() {
  const { state, dispatch } = useApp()
  const { confirm, dialogProps } = useConfirm()
  const [draft, setDraft] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const promotions = state.db.promotions

  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const save = (e) => {
    e.preventDefault()
    const promo = {
      id: newId(),
      code: draft.code,
      type: draft.type,
      value: toNum(draft.value),
      active: true,
      desc: draft.desc,
      minSubtotal: draft.minSubtotal === '' ? 0 : toNum(draft.minSubtotal),
      firstOrderOnly: draft.firstOrderOnly,
      category: null,
      expiresAt: null,
      maxDiscount: null,
    }
    const v = validatePromo(promo, promotions)
    if (!v.ok) {
      setErrors(v.errors)
      return
    }
    dispatch({ type: 'PROMO_SAVE', promo: v.value })
    setDraft(EMPTY)
    setErrors({})
  }
  const toggle = (p) => dispatch({ type: 'PROMO_SAVE', promo: { ...p, active: !p.active } })
  const del = async (p) => {
    const ok = await confirm({ title: `Xóa mã ${p.code}?`, confirmLabel: 'Xóa', danger: true })
    if (ok) dispatch({ type: 'PROMO_DELETE', id: p.id })
  }

  const describe = (p) => {
    const parts = [p.type === 'percent' ? `Giảm ${p.value}%` : `Giảm ${currency(p.value)}`]
    if (p.category) parts.push(`danh mục ${p.category}`)
    if (p.minSubtotal) parts.push(`đơn từ ${currency(p.minSubtotal)}`)
    if (p.firstOrderOnly) parts.push('chỉ đơn đầu')
    return parts.join(' · ')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="space-y-3 lg:col-span-2">
        <h1 className="text-2xl font-bold">Ưu đãi</h1>
        {promotions.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center justify-between gap-3" data-testid="promo-row" data-code={p.code}>
            <div className="min-w-0">
              <div className="font-semibold">
                <code>{p.code}</code>{' '}
                {!p.active && <span className="badge bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">Đã tắt</span>}
              </div>
              <div className="muted text-sm">{describe(p)}</div>
              {p.desc && <div className="text-sm">{p.desc}</div>}
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary" data-testid="promo-toggle" onClick={() => toggle(p)}>
                {p.active ? 'Tắt' : 'Bật'}
              </button>
              <button type="button" className="btn btn-danger" data-testid="promo-delete" onClick={() => del(p)}>
                Xóa
              </button>
            </div>
          </div>
        ))}
        {promotions.length === 0 && <p className="muted">Chưa có ưu đãi.</p>}
      </section>

      <form className="card h-fit space-y-3" onSubmit={save} noValidate>
        <h2 className="text-lg font-semibold">Tạo ưu đãi</h2>
        <div>
          <label htmlFor="promo-form-code" className="label">
            Mã
          </label>
          <input
            id="promo-form-code"
            data-testid="promo-form-code"
            className="input uppercase"
            value={draft.code}
            onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value.toUpperCase() }))}
            aria-invalid={!!errors.code}
          />
          {errors.code && (
            <p className="field-error" data-testid="promo-form-error-code">
              {errors.code}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="promo-form-type" className="label">
            Loại
          </label>
          <select id="promo-form-type" data-testid="promo-form-type" className="input" value={draft.type} onChange={set('type')}>
            <option value="percent">Phần trăm (%)</option>
            <option value="amount">Số tiền (₫)</option>
          </select>
        </div>
        <div>
          <label htmlFor="promo-form-value" className="label">
            Giá trị
          </label>
          <input
            id="promo-form-value"
            data-testid="promo-form-value"
            type="number"
            inputMode="numeric"
            className="input"
            value={draft.value}
            onChange={set('value')}
            aria-invalid={!!errors.value}
          />
          {errors.value && (
            <p className="field-error" data-testid="promo-form-error-value">
              {errors.value}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="promo-form-min" className="label">
            Đơn tối thiểu (₫, tuỳ chọn)
          </label>
          <input id="promo-form-min" data-testid="promo-form-min" type="number" inputMode="numeric" className="input" value={draft.minSubtotal} onChange={set('minSubtotal')} />
          {errors.minSubtotal && <p className="field-error">{errors.minSubtotal}</p>}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" data-testid="promo-form-first" checked={draft.firstOrderOnly} onChange={set('firstOrderOnly')} className="h-4 w-4 accent-amber-500" />
          Chỉ áp dụng cho đơn đầu tiên
        </label>
        <div>
          <label htmlFor="promo-form-desc" className="label">
            Mô tả
          </label>
          <input id="promo-form-desc" data-testid="promo-form-desc" className="input" value={draft.desc} onChange={set('desc')} />
        </div>
        <button type="submit" className="btn btn-primary w-full" data-testid="promo-form-save">
          Lưu ưu đãi
        </button>
      </form>
      <ConfirmDialog {...dialogProps} />
    </div>
  )
}
