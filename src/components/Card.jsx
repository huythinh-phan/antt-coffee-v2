import { Link } from 'react-router-dom'

export default function Card({ title, desc, to, icon }) {
  return (
    <Link to={to} className="card block transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
      <div className="flex items-center gap-2 text-lg font-semibold">
        {icon && <span aria-hidden="true">{icon}</span>}
        {title}
      </div>
      <div className="muted text-sm">{desc}</div>
    </Link>
  )
}
