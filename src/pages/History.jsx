import React from 'react'
import { useApp } from '../context/AppContext'
import { loadDB } from '../utils/db'
import { currency } from '../utils/format'
import StatusBadge from '../components/StatusBadge'
import RateDialog from '../components/RateDialog'


export default function HistoryPage(){
    const { state, dispatch } = useApp()
    const db = loadDB()
    const orders = db.orders.filter(o=> state.user? o.userId===state.user.id: true)
    const cancel = (o) => dispatch({ type:'ORDER_STATUS', id:o.id, status:'CANCELED' })
    return (
        <div className="space-y-4">
        <h2 className="font-semibold text-lg">Lịch sử đơn</h2>
        <div className="grid gap-3">
        {orders.map(o=> (
        <div key={o.id} className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center justify-between">
        <div className="font-semibold">#{o.code} · {new Date(o.createdAt).toLocaleString()}</div>
        <StatusBadge s={o.status} />
        </div>
        <div className="text-sm text-neutral-600 mt-1">{o.items.length} món · Tạm tính {currency(o.total)} · Ưu đãi {currency(o.discount)} · Thanh toán {currency(o.payable)}</div>
        {o.note && <div className="text-xs text-neutral-500">Ghi chú: {o.note}</div>}
        <div className="mt-3 flex gap-2 flex-wrap">
        {o.status!=='CANCELED' && o.status!=='FULFILLED' && (
        <button onClick={()=>cancel(o)} className="px-3 py-1 rounded bg-red-600 text-white">Hủy đơn</button>
        )}
        <RateDialog order={o} />
        </div>
        </div>
        ))}
        {orders.length===0 && <div className="text-sm text-neutral-500">Chưa có đơn nào</div>}
        </div>
        </div>
    )
}