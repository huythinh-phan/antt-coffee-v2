import { Link } from 'react-router-dom'

export default function Forbidden({ message = 'Bạn không có quyền truy cập trang này.' }) {
  return (
    <div className="card mx-auto max-w-md space-y-3 text-center" data-testid="forbidden">
      <div className="text-5xl">🔒</div>
      <h1 className="text-xl font-bold">Không có quyền</h1>
      <p className="muted">{message}</p>
      <Link to="/" className="btn btn-primary">
        Về trang chủ
      </Link>
    </div>
  )
}

