import React, { useState } from 'react'
import { loadDB } from '../utils/db'
import { currency } from '../utils/format'


export default function MenuPage(){
  const db = loadDB()
  const [q, setQ] = useState('')
  const items = db.menu.filter(x => x.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-4">
      <input placeholder="Tìm món..." value={q} onChange={e=>setQ(e.target.value)} className="w-full sm:max-w-sm border rounded-lg p-2 bg-white dark:bg-neutral-900" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(x => (
          <div key={x.id} className="card">
            <div className="font-semibold">{x.name}</div>
            <div className="text-sm text-neutral-500">{x.category}</div>
            <div className="mt-2 font-bold">{currency(x.price)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}