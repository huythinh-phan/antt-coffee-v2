import { test, expect } from '@playwright/test'
import { tid, login, resetBackend, ADMIN, USER } from './helpers.js'

test.describe('Xác thực, Đăng ký, Khôi phục mật khẩu & Hồ sơ', () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request)
  })

  test('TC-AUTH-01 đăng nhập sai mật khẩu hiển thị thông báo lỗi trên form', async ({ page }) => {
    await page.goto('/login.html')
    await page.locator('#username').fill('user')
    await page.locator('#password').fill('sai-mat-khau')
    await page.locator('#loginForm button[type="submit"]').click()
    await expect(page.locator('#errorMessage')).toContainText('Sai thông tin đăng nhập')
    await expect(page).toHaveURL(/login\.html/)
  })

  test('TC-AUTH-02 đăng nhập khách hàng (user/123456) -> về trang chủ, giữ phiên sau F5, xem hồ sơ cá nhân', async ({ page }) => {
    await login(page, USER)
    await expect(page).toHaveURL(/index\.html/)
    await expect(tid(page, 'user-badge')).toContainText('Hello, user')

    await page.reload()
    await expect(tid(page, 'user-badge')).toContainText('Hello, user')

    // Trang hồ sơ cá nhân (user.html)
    await page.goto('/user.html')
    await expect(page.locator('#fullname')).toHaveValue('Ú Ẻ')
    await expect(page.locator('#points')).toHaveValue(/220/)
    await page.locator('#address').fill('123 Võ Văn Ngân, Thủ Đức')
    await page.locator('#profileForm button[type="submit"]').click()
    await expect(tid(page, 'toast')).toContainText('Cập nhật hồ sơ thành công')
  })

  test('TC-AUTH-03 đăng ký tài khoản mới và khôi phục mật khẩu', async ({ page }) => {
    await page.goto('/register.html')
    await page.locator('#fullname').fill('Trần Khánh An')
    await page.locator('#username').fill('khanhan')
    await page.locator('#email').fill('an@antt.com')
    await page.locator('#password').fill('123456')
    await page.locator('#confirmPassword').fill('123456')
    await page.locator('#registerForm button[type="submit"]').click()
    await expect(page).toHaveURL(/login\.html/)

    // Khôi phục mật khẩu
    page.on('dialog', (d) => d.accept())
    await page.goto('/forget-password.html')
    await page.locator('#username').fill('khanhan')
    await page.locator('#email').fill('an@antt.com')
    await page.locator('#newPassword').fill('newpass123')
    await page.locator('#resetForm button[type="submit"]').click()
    await expect(page).toHaveURL(/login\.html/)

    // Đăng nhập bằng mật khẩu mới
    await login(page, { username: 'khanhan', password: 'newpass123' })
    await expect(tid(page, 'user-badge')).toContainText('Hello, khanhan')
  })

  test('TC-AUTH-04 đăng nhập Admin (admin/admin123) tự động chuyển tới trang Quản trị admin.html', async ({ page }) => {
    await login(page, ADMIN)
    await expect(page).toHaveURL(/admin\.html/)
    await expect(page.locator('.navbar-brand')).toContainText('ANTT')
  })
})
