/** Danh sách liên kết điều hướng theo vai trò (dùng chung cho thanh ngang & drawer mobile). */
export function navLinksFor(user) {
  const links = [
    { to: '/menu', label: 'Menu', id: 'nav-menu' },
    { to: '/order', label: 'Tạo đơn', id: 'nav-order' },
  ]
  if (user) {
    links.push({ to: '/history', label: 'Lịch sử', id: 'nav-history' }, { to: '/account', label: 'Tài khoản', id: 'nav-account' })
  }
  if (user?.role === 'admin') {
    links.push(
      { to: '/admin/orders', label: 'QL đơn', id: 'nav-admin-orders' },
      { to: '/admin/menu', label: 'QL menu', id: 'nav-admin-menu' },
      { to: '/admin/promos', label: 'Ưu đãi', id: 'nav-admin-promos' },
      { to: '/admin/feedback', label: 'Phản hồi', id: 'nav-admin-feedback' },
      { to: '/admin/customers', label: 'Khách hàng', id: 'nav-admin-customers' },
    )
  }
  return links
}

export const navLinkCls = ({ isActive }) =>
  `nav-link ${isActive ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'}`

/** Trang cần quay lại sau đăng nhập/đăng ký (từ location.state.from). */
export function targetFrom(location) {
  const f = location.state?.from
  const p = f?.pathname
  if (!p || p === '/login' || p === '/register') return '/'
  return p + (f.search || '')
}

