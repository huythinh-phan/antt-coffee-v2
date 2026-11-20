import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="card max-w-md space-y-3 text-center" data-testid="error-boundary" role="alert">
          <h1 className="text-xl font-bold">Đã có lỗi xảy ra</h1>
          <p className="muted">Xin lỗi, trang gặp sự cố. Hãy tải lại trang. Nếu vẫn lỗi, quản trị viên có thể đặt lại dữ liệu demo.</p>
          <button type="button" className="btn btn-primary" data-testid="error-reload" onClick={() => window.location.reload()}>
            Tải lại
          </button>
        </div>
      </div>
    )
  }
}

