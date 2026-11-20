document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm')
  if (!registerForm) return

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const fullname = document.getElementById('fullname').value.trim()
    const username = document.getElementById('username').value.trim()
    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value
    const confirmPassword = document.getElementById('confirmPassword').value

    document.querySelectorAll('.text-danger').forEach((el) => (el.textContent = ''))

    let isValid = true

    if (fullname.length < 2) {
      document.getElementById('fullnameError').textContent = 'Vui lòng nhập họ tên đầy đủ'
      isValid = false
    }

    if (username.length < 3) {
      document.getElementById('usernameError').textContent = 'Tên đăng nhập phải từ 3 ký tự'
      isValid = false
    }

    if (password.length < 6) {
      document.getElementById('passwordError').textContent = 'Mật khẩu phải từ 6 ký tự'
      isValid = false
    }

    if (password !== confirmPassword) {
      document.getElementById('confirmPasswordError').textContent = 'Mật khẩu xác nhận không khớp'
      isValid = false
    }

    if (isValid) {
      const data = await API.post('/register', {
        fullname,
        username,
        password,
        email,
      })

      if (data.success) {
        if (window.showToast) window.showToast('Đăng ký thành công! Bạn có thể đăng nhập ngay.')
        else alert('Đăng ký thành công! Bạn có thể đăng nhập ngay.')
        window.location.href = 'login.html'
      } else {
        if (data.message && data.message.includes('tồn tại')) {
          document.getElementById('usernameError').textContent = data.message
        } else {
          alert('Lỗi: ' + (data.message || 'Đăng ký thất bại'))
        }
      }
    }
  })
})
