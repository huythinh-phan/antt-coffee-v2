import React from 'react'
import { loadDB } from '../../utils/db'


export default function AdminFeedback(){
    const db = loadDB()
    const rated = db.orders.filter(o=>o.rating)
    return (
        <div className="space-y-4">
        <h2 className="text-lg font-semibold">Phản hồi đánh giá</h2>
        {rated.map(o=> (
        <div key={o.id} className="bg-white rounded-2xl shadow p-4">
        <div className="font-semibold">Đơn #{o.code} · {o.rating}/5</div>
        <div className="text-sm text-neutral-600">{o.feedback || '(Không có nhận xét)'}</div>
        </div>
        ))}
        {rated.length===0 && <div className="text-sm text-neutral-500">Chưa có đánh giá</div>}
        </div>
    )
}