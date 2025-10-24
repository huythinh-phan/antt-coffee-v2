import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { loadDB } from '../../utils/db'
import StatusBadge from '../../components/StatusBadge'


export default function AdminOrders(){
    const { dispatch } = useApp()
    const db = loadDB()
    const [q, setQ] = useState('')
    const orders = db.orders.filter(o=>o.code.includes(q.toUpperCase()))
    const setStatus=(o, s)=>dispatch({type:'ORDER_STATUS', id:o.id, status:s})
    return (
        <div className="space-y-4">
        <h2 className="text-lg font-semibold">Quản lý đơn hàng</h2>
        <input className="border rounded p-2 text-white" placeholder="Tìm theo mã đơn" value={q} onChange={e=>setQ(e.target.value)} />
        <div className="grid gap-3">
        {orders.map(o=> (
        <div key={o.id} className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center justify-between">
        <div className="font-semibold">#{o.code} · {new Date(o.createdAt).toLocaleString()}</div>
        <StatusBadge s={o.status}/>
        </div>
        <div className="text-sm text-neutral-600 mt-1">{o.items.length} món · KH: {o.userId}</div>
        <div className="flex gap-2 mt-2 flex-wrap">
        {o.status!=='PAID' && <button onClick={()=>setStatus(o, 'PAID')} className="px-3 py-1 rounded bg-blue-600 text-white">Đã thanh toán</button>}
        {o.status!=='FULFILLED' && <button onClick={()=>setStatus(o, 'FULFILLED')} className="px-3 py-1 rounded bg-green-600 text-white">Hoàn tất</button>}
        {o.status!=='CANCELED' && <button onClick={()=>setStatus(o, 'CANCELED')} className="px-3 py-1 rounded bg-red-600 text-white">Hủy</button>}
        </div>
        </div>
        ))}
        {orders.length===0 && <div className="text-sm text-neutral-500">Chưa có đơn</div>}
        </div>
        </div>
    )
}