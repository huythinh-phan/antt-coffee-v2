import { useEffect, useMemo, useReducer } from 'react'
import { AppCtx } from './appContext.js'
import { reducer, createInitialState } from '../store/reducer.js'
import { loadDB, saveDB, parseExternalDB } from '../services/db.js'
import { createSeedDB } from '../services/seed.js'
import { local, readJSON } from '../services/storage.js'
import { DB_KEY, SESSION_KEY } from '../lib/constants.js'

function init() {
  const db = loadDB()
  const s = readJSON(local, SESSION_KEY)
  const session = s && typeof s.userId === 'string' && db.users.some((u) => u.id === s.userId) ? { userId: s.userId } : null
  return createInitialState({ db, session })
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  // Lưu DB mỗi khi đổi
  useEffect(() => {
    saveDB(state.db)
  }, [state.db])

  // Lưu phiên
  useEffect(() => {
    if (state.session) local.set(SESSION_KEY, JSON.stringify(state.session))
    else local.remove(SESSION_KEY)
  }, [state.session])

  // Đồng bộ giữa các tab cùng trình duyệt
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== DB_KEY) return
      const db = parseExternalDB(e.newValue)
      if (db) dispatch({ type: 'DB_REPLACE', db })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Tự ẩn toast sau 4 giây
  const toastId = state.toast?.id
  useEffect(() => {
    if (toastId == null) return
    const t = setTimeout(() => dispatch({ type: 'TOAST_CLEAR' }), 4000)
    return () => clearTimeout(t)
  }, [toastId])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      resetDemo: () => dispatch({ type: 'DB_RESET', db: createSeedDB() }),
    }),
    [state],
  )
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
