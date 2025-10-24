import React from 'react'
import { Link } from 'react-router-dom'
export default function Card({ title, desc, to }){
  return (
    <Link to={to} className="card block">
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-sm text-neutral-600 dark:text-neutral-400">{desc}</div>
    </Link>
  )
}