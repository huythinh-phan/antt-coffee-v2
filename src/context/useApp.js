import { useContext, useMemo } from 'react'
import { AppCtx } from './appContext.js'

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

/** Người dùng hiện tại (đã kiểm tra tồn tại trong db) hoặc null. */
export function useCurrentUser() {
  const { state } = useApp()
  const uid = state.session?.userId
  return useMemo(() => state.db.users.find((u) => u.id === uid) || null, [state.db.users, uid])
}

