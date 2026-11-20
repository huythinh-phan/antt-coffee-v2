document.addEventListener('DOMContentLoaded', () => {
  updateCartCount()
  checkLoginNav()
})

window.updateCartCount = function () {
  let cart = []
  try {
    cart = JSON.parse(localStorage.getItem('myCart')) || []
  } catch {
    cart = []
  }
  const count = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
  const el = document.getElementById('cartCount')
  if (el) el.textContent = count

  const nav = document.getElementById('cartNav')
  if (nav) {
    nav.style.display = 'block'
  }
}

function checkLoginNav() {
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('currentUser'))
  } catch {
    user = null
  }
  const container = document.getElementById('loginContainer')
  if (!container) return

  if (user && user.Username) {
    const isAdmin = String(user.Role || user.role || '').toLowerCase() === 'admin'
    container.className = 'nav-item dropdown'
    container.innerHTML = `
      <a class="nav-link dropdown-toggle" href="#" id="userDrop" data-toggle="dropdown" data-testid="user-badge">Hello, ${user.Username}</a>
      <div class="dropdown-menu">
        ${isAdmin ? '<a class="dropdown-item" href="admin.html" data-testid="nav-admin">Trang Quản Trị</a>' : ''}
        <a class="dropdown-item" href="history.html" data-testid="nav-history">Lịch sử đơn hàng</a>
        <a class="dropdown-item" href="user.html" data-testid="nav-account">Hồ sơ cá nhân</a>
        <div class="dropdown-divider"></div>
        <a class="dropdown-item" href="#" data-testid="nav-logout" onclick="doLogout(); return false;">Đăng xuất</a>
      </div>`
  } else {
    container.className = 'nav-item'
    container.innerHTML = `<a href="login.html" class="nav-link" data-testid="nav-login">Login</a>`
  }
}

window.doLogout = () => {
  localStorage.removeItem('currentUser')
  window.location.href = 'index.html'
}
