import React, { useReducer } from 'react'
import { loadDB, saveDB } from '../utils/db'
const AppCtx = React.createContext()
const reducer = (state, action) => {
    const db = loadDB()
    switch (action.type) {
        case 'LOGIN': {
            const u = db.users.find(x => x.username === action.username &&
            x.password === action.password)
            if (!u) return { ...state, error: 'Sai tài khoản hoặc mật khẩu' }
            return { ...state, user: u, error: null }
        }
        case 'LOGOUT':
            return { ...state, user: null }
            case 'MENU_CREATE': {
            db.menu.push(action.item); saveDB(db); 
            return { ...state, _ver: state._ver + 1 }
        }
        case 'MENU_UPDATE': {
            const i = db.menu.findIndex(x => x.id === action.item.id)
            if (i >= 0) db.menu[i] = action.item; saveDB(db); 
            return { ...state, _ver: state._ver + 1 }
        }
        case 'MENU_DELETE': {
            const i = db.menu.findIndex(x => x.id === action.id)
            if (i >= 0) db.menu.splice(i, 1); saveDB(db); 
            return { ...state, _ver: state._ver + 1 }
        }
        case 'PROMO_SAVE': {
            const i = db.promotions.findIndex(x => x.id === action.promo.id)
            if (i >= 0) db.promotions[i] = action.promo; 
            else db.promotions.push(action.promo)
            saveDB(db); 
            return { ...state, _ver: state._ver + 1 }
        }
        case 'PROMO_DELETE': {
            const i = db.promotions.findIndex(x => x.id === action.id)
            if (i >= 0) db.promotions.splice(i, 1); saveDB(db); 
            return { ...state, _ver: state._ver + 1 }
        }
        case 'ORDER_CREATE': {
            db.orders.unshift(action.order)
            const earned = Math.floor(action.order.payable / 10000)
            db.loyalty[action.order.userId] = (db.loyalty[action.order.userId] || 0) + earned
            saveDB(db)
            return { ...state, _ver: state._ver + 1, toast: `Đã tạo đơn #$
            {action.order.code} (+${earned} điểm)` }
        }
        case 'ORDER_STATUS': {
            const i = db.orders.findIndex(x => x.id === action.id)
            if (i >= 0) db.orders[i].status = action.status
            saveDB(db); 
            return { ...state, _ver: state._ver + 1 }
        }
        case 'ORDER_RATE': {
            const i = db.orders.findIndex(x => x.id === action.id)
            if (i >= 0) { db.orders[i].rating = action.rating;
            db.orders[i].feedback = action.feedback }
            saveDB(db); 
            return { ...state, _ver: state._ver + 1 }
        }
        default: return state
    }
}
export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, { user: null, error: null,
    _ver: 0 })
    return <AppCtx.Provider value={{ state, dispatch }}>{children}</AppCtx.Provider>
}
export const useApp = () => React.useContext(AppCtx)