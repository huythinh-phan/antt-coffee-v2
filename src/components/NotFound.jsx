import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md space-y-3 text-center" data-testid="not-found">
      <div className="text-5xl">☕</div>
      <h1 className="text-xl font-bold">Không tìm thấy trang</h1>
      <p className="muted">Đường dẫn không tồn tại hoặc đã bị thay đổi.</p>
      <Link to="/" className="btn btn-primary">
        Về trang chủ
      </Link>
    </div>
  )
}

