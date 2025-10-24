import React, { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { useApp } from '../../context/AppContext'
import { loadDB } from '../../utils/db'
import { currency } from '../../utils/format'


export default function AdminMenu(){
    const { dispatch } = useApp()
    const db = loadDB()
    const [editing, setEditing] = useState(null)
    const [draft, setDraft] = useState({ id:'', name:'', price:0, category:'' })
    const startNew = ()=>{ setEditing(null); setDraft({ id:uuid(), name:'', price:0, category:''}) }
    const startEdit = (m)=>{ setEditing(m.id); setDraft({...m}) }
    const save = ()=>{ if(!draft.name) return; dispatch({type: editing?'MENU_UPDATE':'MENU_CREATE', item:draft}); setEditing(null); setDraft({ id:'', name:'', price:0, category:''}) }
    const del = (id)=> dispatch({type:'MENU_DELETE', id})
    return (
        <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
        <h2 className="text-lg font-semibold mb-2">Danh sách món</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {db.menu.map(m=> (
        <div key={m.id} className="bg-white rounded-xl p-4 shadow card">
        <div className="font-semibold">{m.name}</div>
        <div className="text-xs text-neutral-500">{m.category}</div>
        <div className="mt-1 font-bold">{currency(m.price)}</div>
        <div className="mt-2 flex gap-2">
        <button className="px-3 py-1 rounded bg-neutral-900 text-white" onClick={()=>startEdit(m)}>Sửa</button>
        <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={()=>del(m.id)}>Xóa</button>
        </div>
        </div>
        ))}
        </div>
        </div>
        <div>
        <h2 className="text-lg font-semibold mb-2">{editing?'Sửa món':'Thêm món'}</h2>
        <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <input className="w-full border rounded p-2" placeholder="Tên món" value={draft.name} onChange={e=>setDraft({...draft, name:e.target.value})}/>
        <input className="w-full border rounded p-2" placeholder="Giá" type="number" value={draft.price} onChange={e=>setDraft({...draft, price:+e.target.value})}/>
        <input className="w-full border rounded p-2" placeholder="Danh mục" value={draft.category} onChange={e=>setDraft({...draft, category:e.target.value})}/>
        <div className="flex gap-2">
        <button className="px-3 py-2 rounded bg-neutral-900 text-white" onClick={save}>Lưu</button>
        <button className="px-3 py-2 rounded" onClick={startNew}>Mới</button>
        </div>
        </div>
        </div>
        </div>
    )
}