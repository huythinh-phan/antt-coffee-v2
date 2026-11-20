import { test, expect } from '@playwright/test'
import { tid, collectErrors, isMobile } from './helpers.js'

// TC-SMOKE-*, TC-MENU-*, FR-SYS-01/02/06, FR-MENU-01/02, NFR-PERF-01

test.describe('Smoke', () => {
  test('TC-SMOKE-01 trang chủ tải, tiêu đề đúng, không có lỗi console', async ({ page }) => {
    const errors = collectErrors(page)
    const res = await page.goto('/')
    expect(res.status()).toBe(200)
    await expect(page).toHaveTitle(/Coffee Manager/i)
    await expect(page.locator('#root')).not.toBeEmpty()
    await expect(page.getByText('CoffeeManager').first()).toBeVisible()
    expect(errors).toEqual([])
  })

  for (const path of ['/menu', '/order', '/login', '/register']) {
    test(`TC-SMOKE-02 mở trực tiếp ${path} không 404/trang trắng`, async ({ page }) => {
      const errors = collectErrors(page)
      const res = await page.goto(path)
      expect(res.status()).toBe(200)
      await expect(page.locator('#root')).not.toBeEmpty()
      await expect(tid(page, 'not-found')).toHaveCount(0)
      expect(errors).toEqual([])
    })
  }

  test('TC-SMOKE-03 URL không tồn tại → trang NotFound thân thiện', async ({ page }) => {
    await page.goto('/duong-dan-khong-ton-tai')
    await expect(tid(page, 'not-found')).toBeVisible()
    await page.locator('[data-testid="not-found"] a').first().click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('TC-SMOKE-04 dark mode chuyển được và được ghi nhớ sau F5', async ({ page }) => {
    await page.goto('/')
    if (isMobile(page)) await expect(tid(page, 'theme-toggle').first()).toBeVisible()
    const html = page.locator('html')
    const before = await html.getAttribute('class')
    await page.locator('[data-testid="theme-toggle"]:visible').click()
    const after = await html.getAttribute('class')
    expect(after).not.toBe(before)
    const isDark = /\bdark\b/.test(after || '')
    await page.reload()
    expect(/\bdark\b/.test((await html.getAttribute('class')) || '')).toBe(isDark)
  })

  test('TC-SMOKE-05 thời gian tải trang chủ < 3 giây', async ({ page }) => {
    const t0 = Date.now()
    await page.goto('/', { waitUntil: 'load' })
    await expect(page.getByText('CoffeeManager').first()).toBeVisible()
    expect(Date.now() - t0).toBeLessThan(3000)
  })
})

test.describe('Menu (khách vãng lai)', () => {
  test('TC-MENU-01 hiển thị 5 món mẫu với tên, loại, giá', async ({ page }) => {
    await page.goto('/menu')
    await expect(tid(page, 'menu-card')).toHaveCount(5)
    await expect(page.locator('[data-testid="menu-card"][data-name="Latte"]')).toContainText(/45\.000/)
    await expect(page.locator('[data-testid="menu-card"][data-name="Trà đào"]')).toContainText('Trà')
  })

  test('TC-MENU-02 tìm kiếm không phân biệt hoa/thường, bỏ khoảng trắng đầu/cuối', async ({ page }) => {
    await page.goto('/menu')
    await tid(page, 'menu-search').fill('  LATTE ')
    await expect(tid(page, 'menu-card')).toHaveCount(1)
    await tid(page, 'menu-search').fill('cappu')
    await expect(page.locator('[data-testid="menu-card"]')).toHaveAttribute('data-name', 'Cappuccino')
  })

  test('TC-MENU-03 không có kết quả → thông báo rỗng', async ({ page }) => {
    await page.goto('/menu')
    await tid(page, 'menu-search').fill('zzzzzz')
    await expect(tid(page, 'menu-card')).toHaveCount(0)
    await expect(tid(page, 'menu-empty')).toBeVisible()
    await tid(page, 'menu-search').fill('')
    await expect(tid(page, 'menu-card')).toHaveCount(5)
  })
})

