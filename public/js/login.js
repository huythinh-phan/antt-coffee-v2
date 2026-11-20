class AuthManager {
  constructor() {
    this.form = document.getElementById('loginForm')
    this.errorMessage = document.getElementById('errorMessage')
    if (this.form) this.bindEvents()
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleLogin(e))
  }

  async handleLogin(e) {
    e.preventDefault()
    const username = document.getElementById('username').value.trim()
    const password = document.getElementById('password').value

    try {
      const res = await API.post('/login', { username, password })

      if (res.success && res.user) {
        localStorage.setItem('currentUser', JSON.stringify(res.user))
        const role = (res.user.Role || res.user.role || '').toLowerCase()
        if (role === 'admin') window.location.href = 'admin.html'
        else window.location.href = 'index.html'
      } else {
        this.showError(res.error || res.message || 'Sai thông tin đăng nhập')
      }
    } catch (error) {
      this.showError('Lỗi kết nối Server.')
      console.error(error)
    }
  }

  showError(message) {
    if (this.errorMessage) {
      this.errorMessage.textContent = message
      this.errorMessage.style.display = 'block'
    } else {
      alert(message)
    }
  }
}

new AuthManager()
