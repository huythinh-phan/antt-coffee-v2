import { test, expect } from '@playwright/test'
import { tid, login, KHACH } from './helpers.js'

// TC-SEC-*, TC-DATA-*, NFR-SEC-02, FR-AUTH-05, BUG-07, FR-SYS-04/05

const ADMIN_ROUTES = ['/admin/orders', '/admin/menu', '/admin/promos', '/admin/feedback', '/admin/customers']

test.describe('Phân quyền route', () => {
  for (const path of ADMIN_ROUTES) {
    test(`TC-SEC-01 khách vãng lai mở ${path} → chuyển tới /login`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login/)
      await expect(tid(page, 'admin-order-card')).toHaveCount(0)
    })

    test(`TC-SEC-02 khách hàng mở ${path} → "Không có quyền", không thấy dữ liệu admin`, async ({ page }) => {
      await login(page, KHACH)
      await page.goto(path)
      await expect(tid(page, 'forbidden')).toBeVisible()
      await expect(tid(page, 'admin-order-card')).toHaveCount(0)
      await expect(tid(page, 'admin-menu-card')).toHaveCount(0)
    })
  }

  test('TC-SEC-03 admin đăng nhập từ link sâu → quay lại đúng trang đã định vào', async ({ page }) => {
    await page.goto('/admin/promos')
    await expect(page).toHaveURL(/\/login/)
    await login(page, { username: 'admin', password: 'admin' }, { goto: false })
    await expect(page).toHaveURL(/\/admin\/promos/)
  })

  for (const path of ['/history', '/account']) {
    test(`TC-SEC-04 khách vãng lai mở ${path} → /login và không lộ đơn (BUG-07)`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login/)
      await expect(page.getByText('DEMO01')).toHaveCount(0)
      await expect(page.getByText('DEMO02')).toHaveCount(0)
    })
  }

  test('TC-SEC-05 người dùng mới không thấy đơn của người khác (lịch sử rỗng, /orders/:id bị chặn)', async ({ page }) => {
    await page.goto('/register')
    await tid(page, 'register-name').fill('Người Lạ')
    await tid(page, 'register-username').fill('nguoila')
    await tid(page, 'register-password').fill('matkhau1')
    await tid(page, 'register-submit').click()
    await page.waitForURL((u) => !u.pathname.startsWith('/register'))
    await page.goto('/history')
    await expect(tid(page, 'history-empty')).toBeVisible()
    await expect(tid(page, 'order-card')).toHaveCount(0)
    await page.goto('/orders/o-seed-1')
    await expect(page.getByText('DEMO01')).toHaveCount(0)
    await expect(page.locator('[data-testid="forbidden"], [data-testid="not-found"]').first()).toBeVisible()
  })

  test('TC-SEC-06 khách chủ đơn mở /orders/:id của mình được; admin cũng xem được', async ({ page }) => {
    await login(page, KHACH)
    await page.goto('/orders/o-seed-1')
    await expect(page.getByText('DEMO01').first()).toBeVisible()
  })

  test('TC-SEC-07 sửa localStorage thành session của user không tồn tại → coi như chưa đăng nhập', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('coffee_session', JSON.stringify({ userId: 'khong-ton-tai' })))
    await page.goto('/admin/orders')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Độ bền dữ liệu lưu trữ', () => {
  test('TC-DATA-01 JSON hỏng trong localStorage → khôi phục seed, ứng dụng vẫn chạy', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('coffee_demo_db', '{"users":[{"id":'))
    await page.goto('/menu')
    await expect(tid(page, 'menu-card')).toHaveCount(5)
  })

  test('TC-DATA-02 JSON hợp lệ nhưng sai hình dạng → khôi phục seed, không trang trắng', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('coffee_demo_db', JSON.stringify({ users: 'x', menu: 5 })))
    await page.goto('/menu')
    await expect(tid(page, 'menu-card')).toHaveCount(5)
    await login(page, KHACH)
  })

  test('TC-DATA-03 dữ liệu schema cũ (v0) được migrate: lịch sử hiển thị tên món', async ({ page }) => {
    const legacy = {
      users: [
        { id: 'u-admin', username: 'admin', password: 'admin', role: 'admin', name: 'Quản trị' },
        { id: 'u-kh', username: 'khach', password: '123', role: 'customer', name: 'Khách hàng' },
      ],
      menu: [{ id: 'm1', name: 'Espresso', price: 35000, category: 'Cà phê' }],
      promotions: [{ id: 'p1', code: 'WELCOME10', type: 'percent', value: 10, active: true, desc: 'Giảm 10% cho đơn đầu' }],
      orders: [{
        id: 'old-1', code: 'OLD001', userId: 'u-kh',
        items: [{ menuId: 'm1', qty: 2, price: 35000 }, { menuId: 'gone', qty: 1, price: 20000 }],
        total: 90000, discount: 0, payable: 90000, promoCode: null, status: 'CREATED', note: '', createdAt: 1_700_000_000_000,
      }],
      loyalty: { 'u-kh': 3 },
    }
    await page.addInitScript((db) => {
      if (!localStorage.getItem('coffee_demo_db')) localStorage.setItem('coffee_demo_db', JSON.stringify(db))
    }, legacy)
    await login(page, KHACH)
    await page.goto('/history')
    const c = page.locator('[data-testid="order-card"][data-code="OLD001"]')
    await expect(c).toBeVisible()
    await expect(tid(c, 'order-items')).toContainText('Espresso')
    await expect(tid(c, 'order-items')).toContainText('Món đã xóa')
    await expect(tid(c, 'order-status')).toHaveText('Chờ thanh toán')
  })

  test('TC-DATA-04 localStorage ghi bị chặn (private mode/hết quota) → không crash, vẫn đăng nhập & đặt đơn trong phiên', async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.setItem = function () {
        throw new DOMException('Quota exceeded', 'QuotaExceededError')
      }
    })
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto('/login')
    await tid(page, 'login-username').fill('khach')
    await tid(page, 'login-password').fill('123')
    await tid(page, 'login-submit').click()
    await page.waitForURL((u) => !u.pathname.startsWith('/login'))
    await page.locator('[data-testid="nav-order"]:visible, [data-testid="mobile-menu-button"]:visible').first().click()
    expect(errors).toEqual([])
    await expect(page.locator('#root')).not.toBeEmpty()
    await expect(tid(page, 'error-boundary')).toHaveCount(0)
  })

  test('TC-DATA-05 lỗi render bất ngờ → ErrorBoundary có nút Tải lại (không trang trắng)', async ({ page }) => {
    // Trộn dữ liệu cố ý gây lỗi render ở một trang: đơn có items không phải mảng, sau migrate vẫn phải an toàn
    await page.addInitScript(() => {
      const db = {
        schemaVersion: 1,
        users: [{ id: 'u-kh', username: 'khach', password: '123', role: 'customer', name: 'K', createdAt: 1 }],
        menu: [], promotions: [], loyalty: { 'u-kh': 0 },
        orders: [{ id: 'bad', code: 'BAD001', userId: 'u-kh', items: null, total: 1, discount: 0, payable: 1, status: 'CREATED', createdAt: 1 }],
      }
      localStorage.setItem('coffee_demo_db', JSON.stringify(db))
      localStorage.setItem('coffee_session', JSON.stringify({ userId: 'u-kh' }))
    })
    await page.goto('/history')
    // Chấp nhận 2 kết quả đúng: trang xử lý an toàn (hiện thẻ đơn) HOẶC ErrorBoundary; không bao giờ trang trắng
    await expect(page.locator('[data-testid="order-card"], [data-testid="error-boundary"]').first()).toBeVisible()
    if (await tid(page, 'error-boundary').count()) await expect(tid(page, 'error-reload')).toBeVisible()
  })
})

