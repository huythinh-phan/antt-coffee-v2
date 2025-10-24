import React, { useState } from 'react'
import { useApp } from '../context/AppContext'


export default function RateDialog({ order }) {
    const { dispatch } = useApp()
    const [open, setOpen] = useState(false)
    const [rating, setRating] = useState(order.rating || 5)
    const [feedback, setFeedback] = useState(order.feedback || '')
    const save = () => { dispatch({ type: 'ORDER_RATE', id: order.id, rating, feedback }); setOpen(false) }
    return (
        <>
        <button onClick={() => setOpen(true)} className="px-3 py-1 rounded bg-neutral-900 text-white">{order.rating?'Sửa đánh giá':'Đánh giá'}</button>
        {open && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 w-full max-w-md space-y-3">
            <div className="text-lg font-semibold">Đánh giá đơn #{order.code}</div>
            <div className="flex items-center gap-2">
            <span className="text-sm">Điểm:</span>
            <input type="range" min={1} max={5} value={rating} onChange={e=>setRating(+e.target.value)} className="w-full"/>
            <b>{rating}/5</b>
            </div>
            <textarea placeholder="Nhận xét" value={feedback} onChange={e=>setFeedback(e.target.value)} className="w-full border rounded p-2"/>
            <div className="flex justify-end gap-2">
            <button className="px-3 py-1 rounded" onClick={()=>setOpen(false)}>Hủy</button>
            <button className="px-3 py-1 rounded bg-neutral-900 text-white" onClick={save}>Lưu</button>
            </div>
            </div>
            </div>
        )}
        </>
    )
}