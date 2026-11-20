import { useRef, useState } from 'react'
import { useApp } from '../context/useApp.js'
import { MAX_FEEDBACK } from '../lib/constants.js'
import Modal from './Modal.jsx'

export default function RateDialog({ order }) {
  const { dispatch } = useApp()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const textRef = useRef(null)

  const openDialog = () => {
    setRating(order.rating || 5)
    setFeedback(order.feedback || '')
    setOpen(true)
  }
  const save = (e) => {
    e.preventDefault()
    dispatch({ type: 'ORDER_RATE', id: order.id, rating, feedback, now: Date.now() })
    setOpen(false)
  }
  const onRange = (e) => setRating(Number(e.target.value))

  return (
    <>
      <button type="button" className="btn btn-primary" data-testid="order-rate" onClick={openDialog}>
        {order.rating ? 'Sửa đánh giá' : 'Đánh giá'}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Đánh giá đơn #${order.code}`} initialFocusRef={textRef}>
        <form onSubmit={save} className="space-y-3">
          <div>
            <label htmlFor={`rate-${order.id}`} className="label">
              Điểm: <b>{rating}/5</b> <span aria-hidden="true">{'★'.repeat(rating)}</span>
            </label>
            <input
              id={`rate-${order.id}`}
              type="range"
              min={1}
              max={5}
              step={1}
              value={rating}
              onChange={onRange}
              onInput={onRange}
              data-testid="rate-range"
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label htmlFor={`fb-${order.id}`} className="label">
              Nhận xét
            </label>
            <textarea
              id={`fb-${order.id}`}
              ref={textRef}
              rows={3}
              maxLength={MAX_FEEDBACK}
              placeholder="Chia sẻ cảm nhận của bạn"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              data-testid="rate-feedback"
              className="input"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" data-testid="rate-submit">
              Lưu
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
