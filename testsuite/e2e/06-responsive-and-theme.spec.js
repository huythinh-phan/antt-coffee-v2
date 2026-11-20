import { test, expect } from '@playwright/test'
import { tid, login, isMobile, contrastOf, ADMIN, KHACH } from './helpers.js'

// TC-UI-*, NFR-UX-01, FR-SYS-06, UX-01/02/03

const noHScroll = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)

test.describe('Không cuộn ngang', () => {
  for (const path of ['/', '/menu', '/order', '/login', '/register']) {
    test(`TC-UI-01 ${path}`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('#root')).not.toBeEmpty()
      expect(await noHScroll(page)).toBe(true)
    })
  }

  for (const path of ['/history', '/account']) {
    test(`TC-UI-01 ${path} (khách)`, async ({ page }) => {
      await login(page, KHACH)
      await page.goto(path)
      expect(await noHScroll(page)).toBe(true)
    })
  }

  for (const path of ['/admin/orders', '/admin/menu', '/admin/promos', '/admin/feedback', '/admin/customers']) {
    test(`TC-UI-01 ${path} (admin)`, async ({ page }) => {
      await login(page, ADMIN)
      await page.goto(path)
      expect(await noHScroll(page)).toBe(true)
    })
  }
})

test.describe('Điều hướng mobile', () => {
  test('TC-UI-10 mobile: có nút ☰ mở drawer với mọi liên kết; Esc/chọn liên kết thì đóng', async ({ page }) => {
    test.skip(!isMobile(page), 'chỉ áp dụng cho viewport mobile')
    await page.goto('/')
    await expect(tid(page, 'mobile-menu-button')).toBeVisible()
    await expect(tid(page, 'mobile-nav')).toHaveCount(0)
    await tid(page, 'mobile-menu-button').click()
    await expect(tid(page, 'mobile-menu-button')).toHaveAttribute('aria-expanded', 'true')
    for (const id of ['nav-menu', 'nav-order', 'nav-login', 'nav-register']) {
      await expect(page.locator(`[data-testid="${id}"]:visible`)).toBeVisible()
    }
    await page.keyboard.press('Escape')
    await expect(tid(page, 'mobile-nav')).toHaveCount(0)
    await tid(page, 'mobile-menu-button').click()
    await page.locator('[data-testid="nav-menu"]:visible').click()
    await expect(page).toHaveURL(/\/menu/)
    await expect(tid(page, 'mobile-nav')).toHaveCount(0)
  })

  test('TC-UI-11 mobile: admin thấy đủ 5 liên kết quản trị và thông tin user trong drawer', async ({ page }) => {
    test.skip(!isMobile(page), 'chỉ áp dụng cho viewport mobile')
    await login(page, ADMIN)
    await tid(page, 'mobile-menu-button').click()
    for (const id of ['nav-admin-orders', 'nav-admin-menu', 'nav-admin-promos', 'nav-admin-feedback', 'nav-admin-customers', 'nav-logout', 'user-badge']) {
      await expect(page.locator(`[data-testid="${id}"]:visible`)).toBeVisible()
    }
  })

  test('TC-UI-12 desktop: không có nút ☰, thanh điều hướng ngang hiện', async ({ page }) => {
    test.skip(isMobile(page), 'chỉ áp dụng cho viewport desktop')
    await page.goto('/')
    await expect(tid(page, 'mobile-menu-button')).toBeHidden()
    await expect(page.locator('[data-testid="nav-menu"]:visible')).toBeVisible()
  })

  test('TC-UI-13 vùng chạm các nút chính ≥ 40px chiều cao trên mobile', async ({ page }) => {
    test.skip(!isMobile(page), 'chỉ áp dụng cho viewport mobile')
    await page.goto('/order')
    const h = (await tid(page, 'order-add-m1').boundingBox()).height
    expect(h).toBeGreaterThanOrEqual(40)
    await page.goto('/login')
    expect((await tid(page, 'login-submit').boundingBox()).height).toBeGreaterThanOrEqual(40)
  })
})

test.describe('Đọc được ở cả light và dark (tương phản ≥ 4.5:1)', () => {
  for (const scheme of ['light', 'dark']) {
    const setTheme = (page) =>
      page.addInitScript((t) => localStorage.setItem('theme', t), scheme)

    test(`TC-UI-20 ${scheme}: form đăng nhập`, async ({ page }) => {
      await setTheme(page)
      await page.goto('/login')
      for (const id of ['login-username', 'login-password']) {
        await tid(page, id).fill('abc')
        expect(await contrastOf(tid(page, id))).toBeGreaterThanOrEqual(4.5)
      }
      expect(await contrastOf(tid(page, 'login-submit'))).toBeGreaterThanOrEqual(4.5)
    })

    test(`TC-UI-21 ${scheme}: trang tạo đơn và menu`, async ({ page }) => {
      await setTheme(page)
      await page.goto('/order')
      await tid(page, 'order-add-m1').click()
      for (const id of ['order-add-m2', 'promo-input', 'order-note', 'summary-payable', 'place-order']) {
        expect(await contrastOf(tid(page, id)), id).toBeGreaterThanOrEqual(4.5)
      }
      await page.goto('/menu')
      expect(await contrastOf(tid(page, 'menu-search'))).toBeGreaterThanOrEqual(4.5)
      expect(await contrastOf(tid(page, 'menu-card').first())).toBeGreaterThanOrEqual(4.5)
    })

    test(`TC-UI-22 ${scheme}: trang admin (đơn, menu, ưu đãi) và hộp thoại đánh giá`, async ({ page }) => {
      await setTheme(page)
      await login(page, ADMIN)
      await page.goto('/admin/orders')
      expect(await contrastOf(tid(page, 'admin-order-search'))).toBeGreaterThanOrEqual(4.5)
      expect(await contrastOf(tid(page, 'admin-order-card').first())).toBeGreaterThanOrEqual(4.5)
      expect(await contrastOf(tid(page, 'admin-order-items').first())).toBeGreaterThanOrEqual(4.5)
      await page.goto('/admin/menu')
      for (const id of ['menu-form-name', 'menu-form-price', 'menu-form-category', 'menu-form-save']) {
        expect(await contrastOf(tid(page, id)), id).toBeGreaterThanOrEqual(4.5)
      }
      expect(await contrastOf(tid(page, 'menu-form-new'))).toBeGreaterThanOrEqual(4.5)
      await page.goto('/admin/promos')
      for (const id of ['promo-form-code', 'promo-form-type', 'promo-form-value', 'promo-form-desc', 'promo-form-save']) {
        expect(await contrastOf(tid(page, id)), id).toBeGreaterThanOrEqual(4.5)
      }

      // hộp thoại đánh giá (đăng nhập khách)
      await page.evaluate(() => localStorage.setItem('coffee_session', JSON.stringify({ userId: 'u-kh' })))
      await page.goto('/history')
      await tid(page, 'order-rate').first().click()
      expect(await contrastOf(tid(page, 'rate-feedback'))).toBeGreaterThanOrEqual(4.5)
      expect(await contrastOf(tid(page, 'rate-submit'))).toBeGreaterThanOrEqual(4.5)
      const dialogText = page.locator('[role="dialog"]').first()
      expect(await contrastOf(dialogText)).toBeGreaterThanOrEqual(4.5)
    })
  }
})

