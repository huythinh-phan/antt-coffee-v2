import React from 'react'
export default function StatusBadge({ s }){
  const map = { CREATED:'bg-yellow-200 text-yellow-900', PAID:'bg-blue-200 text-blue-900', FULFILLED:'bg-green-200 text-green-900', CANCELED:'bg-red-200 text-red-900' }
  return <span className={`badge ${map[s]||'bg-neutral-200 text-neutral-900'}`}>{s}</span>
}