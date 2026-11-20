import { useRef } from 'react'
import Modal from './Modal.jsx'

export default function ConfirmDialog({ open, title = 'Xác nhận', message, confirmLabel = 'Đồng ý', danger = false, onConfirm, onCancel }) {
  const cancelRef = useRef(null)
  return (
    <Modal open={open} onClose={onCancel} title={title} testId="confirm-dialog" initialFocusRef={cancelRef}>
      {message && <p className="muted">{message}</p>}
      <div className="flex justify-end gap-2">
        <button ref={cancelRef} type="button" className="btn btn-secondary" data-testid="confirm-cancel" onClick={onCancel}>
          Hủy bỏ
        </button>
        <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} data-testid="confirm-ok" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

