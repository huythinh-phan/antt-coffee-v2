import { test, expect } from '@playwright/test'
import { tid, collectErrors, resetBackend } from './helpers.js'

test.describe('Smoke & Giao diện ANTT Coffee (Bootstrap 4 + Express API)', () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request)
  })

  test('TC-SMOKE-01 trang chủ index.html tải nhanh, đúng thương hiệu ANTT Coffee, không có lỗi 404 script', async ({ page }) => {
    const errors = collectErrors(page)
    const res = await page.goto('/index.html')
    expect(res.status()).toBe(200)
    await expect(page).toHaveTitle(/ANTT Coffee/i)
    await expect(page.locator('.navbar-brand')).toContainText('ANTT')
    expect(errors).toEqual([])
  })

  for (const path of ['/menu.html', '/voucher.html', '/gallery.html', '/cart.html', '/login.html', '/register.html', '/forget-password.html']) {
    test(`TC-SMOKE-02 mở trực tiếp ${path} trả 200 và không có lỗi JS`, async ({ page }) => {
      const errors = collectErrors(page)
      const res = await page.goto(path)
      expect(res.status()).toBe(200)
      await expect(page.locator('.navbar-brand')).toContainText('ANTT')
      expect(errors).toEqual([])
    })
  }

  test('TC-MENU-01 trang Thực đơn hiển thị đầy đủ 19 món từ db.sql và tìm kiếm món hoạt động', async ({ page }) => {
    await page.goto('/menu.html')
    await expect(tid(page, 'menu-card')).toHaveCount(19)
    await expect(page.locator('[data-testid="menu-card"][data-name="Cappuccino"]')).toContainText('45.000')

    await page.locator('#searchInput').fill('Cappuccino')
    await page.locator('#searchBtn').click()
    await expect(tid(page, 'menu-card')).toHaveCount(1)

    await page.locator('#searchInput').fill('khong-co-mon-nay')
    await page.locator('#searchBtn').click()
    await expect(tid(page, 'menu-empty')).toBeVisible()
  })

  test('TC-MENU-02 trang Chi tiết sản phẩm (detail.html) tải đúng thông tin từ /api/product/:id và thêm vào giỏ', async ({ page }) => {
    await page.goto('/detail.html?id=4')
    await expect(page.locator('#prod-name')).toHaveText('Cappuccino')
    await expect(page.locator('#prod-price')).toContainText('45.000')
    await page.locator('.quantity-right-plus').click()
    await expect(page.locator('#quantity')).toHaveValue('2')
    await page.locator('#btn-add-cart').click()
    await expect(page.locator('#cartCount')).toHaveText('2')
  })

  test('TC-VOUCHER-01 & TC-GALLERY-01 trang Voucher và Gallery hiển thị dữ liệu từ API', async ({ page }) => {
    await page.goto('/voucher.html')
    await expect(tid(page, 'voucher-card')).toHaveCount(5)
    await expect(page.locator('[data-testid="voucher-card"][data-code="TEST10"]')).toBeVisible()

    await page.goto('/gallery.html')
    await expect(tid(page, 'gallery-card')).toHaveCount(4)
  })
})
