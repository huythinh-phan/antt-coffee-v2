import { useCallback, useState } from 'react'

/**
 * const { confirm, dialogProps } = useConfirm()
 * if (await confirm({ title, message, danger: true })) { ... }
 * <ConfirmDialog {...dialogProps} />
 */
export function useConfirm() {
  const [req, setReq] = useState(null)
  const confirm = useCallback((opts = {}) => new Promise((resolve) => setReq({ ...opts, resolve })), [])
  const close = (value) => {
    req?.resolve(value)
    setReq(null)
  }
  return {
    confirm,
    dialogProps: {
      open: !!req,
      title: req?.title,
      message: req?.message,
      confirmLabel: req?.confirmLabel,
      danger: req?.danger,
      onConfirm: () => close(true),
      onCancel: () => close(false),
    },
  }
}

