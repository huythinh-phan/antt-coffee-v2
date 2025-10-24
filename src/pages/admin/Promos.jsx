import React, { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { useApp } from '../../context/AppContext'
import { loadDB } from '../../utils/db'
import { currency } from '../../utils/format'


export default function AdminPromos(){
    const { dispatch } = useApp()
    const db = loadDB()
    const [draft, setDraft] = useState({ id: uuid(), code:'', type:'percent', value:0, active:true, desc:'' })
    const save = ()=>{ if(!draft.code) return; dispatch({type:'PROMO_SAVE', promo:draft}); setDraft({ id: uuid(), code:'', type:'percent', value:0, active:true, desc:'' }) }
    const toggle=(p)=> dispatch({type:'PROMO_SAVE', promo:{...p, active:!p.active}})
    const del=(id)=> dispatch({type:'PROMO_DELETE', id})
    return (
        <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
        {db.promotions.map(p=> (
        <div key={p.id} className="bg-white rounded-2xl shadow p-4 flex items-center justify-between card">
        <div>
        <div className="font-semibold">{p.code} {p.active?'':'(Tắt)'}</div>
        <div className="text-sm text-neutral-600">{p.type==='percent'?`Giảm ${p.value}%`:`Giảm ${currency(p.value)}`} · {p.desc}</div>
        </div>
        <div className="flex gap-2">
        <button className="px-3 py-1 rounded bg-neutral-900 text-white" onClick={()=>toggle(p)}>{p.active?'Tắt':'Bật'}</button>
        <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={()=>del(p.id)}>Xóa</button>
        </div>
        </div>
        ))}
        {db.promotions.length===0 && <div className="text-sm text-neutral-500">Chưa có ưu đãi</div>}
        </div>
        <div className="bg-white rounded-2xl shadow p-4 space-y-3 card">
        <h2 className="font-semibold">Tạo ưu đãi</h2>
        <input className="w-full border rounded p-2 text-white" placeholder="Mã" value={draft.code} onChange={e=>setDraft({...draft, code:e.target.value.toUpperCase()})}/>
        <select className="w-full border rounded p-2 text-gray-400" value={draft.type} onChange={e=>setDraft({...draft, type:e.target.value})}>
        <option value="percent">Phần trăm</option>
        <option value="amount">Số tiền</option>
        </select>
        <input className="w-full border rounded p-2 text-white" placeholder="Giá trị" type="number" value={draft.value} onChange={e=>setDraft({...draft, value:+e.target.value})}/>
        <input className="w-full border rounded p-2 text-white" placeholder="Mô tả" value={draft.desc} onChange={e=>setDraft({...draft, desc:e.target.value})}/>
        <button className="w-full py-2 rounded bg-neutral-900 text-white" onClick={save}>Lưu ưu đãi</button>
        </div>
        </div>
    )
}