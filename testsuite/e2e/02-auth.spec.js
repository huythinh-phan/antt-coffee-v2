import { test, expect } from '@playwright/test'
import { tid, login, logout, nav, expectLoggedInAs, currentPoints, ADMIN, KHACH } from './helpers.js'

// TC-AUTH-*, FR-AUTH-01..06

test.describe('Đăng nhập / đăng xuất', () => {
  test('TC-AUTH-01 form đăng nhập không điền sẵn, có gợi ý tài khoản demo', async ({ page }) => {
    await page.goto('/login')
    await expect(tid(page, 'login-username')).toHaveValue('')
    await expect(tid(page, 'login-password')).toHaveValue('')
    await expect(page.getByText(/admin\s*\/\s*admin/)).toBeVisible()
    await expect(page.getByText(/khach\s*\/\s*123/)).toBeVisible()
  })

  test('TC-AUTH-02 sai mật khẩu → thông báo lỗi, vẫn ở trang đăng nhập', async ({ page }) => {
    await page.goto('/login')
    await tid(page, 'login-username').fill('khach')
    await tid(page, 'login-password').fill('sai-mat-khau')
    await tid(page, 'login-submit').click()
    await expect(tid(page, 'login-error')).toHaveText('Sai tài khoản hoặc mật khẩu')
    await expect(page).toHaveURL(/\/login/)
  })

  test('TC-AUTH-03 đăng nhập khách → về trang chủ, hiện tên và điểm (8)', async ({ page }) => {
    await login(page, KHACH)
    await expect(page).toHaveURL(/\/$/)
    await expectLoggedInAs(page, 'Khách hàng')
    expect(await currentPoints(page)).toBe(8)
  })

  test('TC-AUTH-04 giữ phiên sau F5; đăng xuất thì F5 vẫn là khách vãng lai', async ({ page }) => {
    await login(page, KHACH)
    await page.reload()
    await expectLoggedInAs(page, 'Khách hàng')
    await logout(page)
    await page.reload()
    await expect(page.locator('[data-testid="nav-login"]:visible, [data-testid="mobile-menu-button"]:visible').first()).toBeVisible()
    await page.goto('/history')
    await expect(page).toHaveURL(/\/login/)
  })

  test('TC-AUTH-05 username không phân biệt hoa/thường', async ({ page }) => {
    await login(page, { username: '  KHACH ', password: '123' })
    await expectLoggedInAs(page, 'Khách hàng')
  })

  test('TC-AUTH-06 đã đăng nhập mà mở /login → chuyển về trang chủ', async ({ page }) => {
    await login(page, KHACH)
    await page.goto('/login')
    await expect(page).toHaveURL(/\/$/)
  })
})

test.describe('Đăng ký', () => {
  test('TC-AUTH-10 đăng ký hợp lệ → tự đăng nhập, điểm 0', async ({ page }) => {
    await page.goto('/register')
    await tid(page, 'register-name').fill('Nguyễn An')
    await tid(page, 'register-username').fill('AnNguyen')
    await tid(page, 'register-password').fill('matkhau1')
    await tid(page, 'register-submit').click()
    await page.waitForURL((u) => !u.pathname.startsWith('/register'))
    await expectLoggedInAs(page, 'Nguyễn An')
    expect(await currentPoints(page)).toBe(0)
    // đăng xuất rồi đăng nhập lại bằng username viết thường
    await logout(page)
    await login(page, { username: 'annguyen', password: 'matkhau1' })
    await expectLoggedInAs(page, 'Nguyễn An')
  })

  test('TC-AUTH-11 trùng username (khach) → báo lỗi', async ({ page }) => {
    await page.goto('/register')
    await tid(page, 'register-name').fill('Ai Đó')
    await tid(page, 'register-username').fill('KHACH')
    await tid(page, 'register-password').fill('matkhau1')
    await tid(page, 'register-submit').click()
    await expect(tid(page, 'register-error')).toHaveText('Tên đăng nhập đã tồn tại')
    await expect(page).toHaveURL(/\/register/)
  })

  test('TC-AUTH-12 mật khẩu < 6 ký tự / username có ký tự lạ → báo lỗi, không tạo tài khoản', async ({ page }) => {
    await page.goto('/register')
    await tid(page, 'register-name').fill('Ai Đó')
    await tid(page, 'register-username').fill('ai_do')
    await tid(page, 'register-password').fill('123')
    await tid(page, 'register-submit').click()
    await expect(tid(page, 'register-error')).toBeVisible()
    await tid(page, 'register-password').fill('matkhau1')
    await tid(page, 'register-username').fill('ai do!')
    await tid(page, 'register-submit').click()
    await expect(tid(page, 'register-error')).toBeVisible()
    await expect(page).toHaveURL(/\/register/)
  })
})

test.describe('Điều hướng theo vai trò', () => {
  test('TC-AUTH-20 khách chỉ thấy liên kết khách; admin thấy thêm 5 liên kết quản trị', async ({ page }) => {
    await login(page, KHACH)
    await expect(page.locator('[data-testid="nav-admin-orders"]:visible')).toHaveCount(0)
    await logout(page)
    await login(page, ADMIN)
    for (const id of ['nav-admin-orders', 'nav-admin-menu', 'nav-admin-promos', 'nav-admin-feedback', 'nav-admin-customers']) {
      if (id === 'nav-admin-orders') {
        // đảm bảo drawer/mobile cũng thấy được
        await nav(page, id)
        await expect(page).toHaveURL(/\/admin\/orders/)
      } else {
        await nav(page, id)
        await expect(page).toHaveURL(new RegExp(id.replace('nav-', '/').replace('-', '/')))
      }
    }
  })
})

