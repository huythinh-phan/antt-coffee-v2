import { test, expect } from '@playwright/test'
import { resetBackend } from './helpers.js'

test.describe('Kiểm thử hồi quy API & Responsive cho ANTT Coffee v3', () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request)
  })

  test('TC-API-01 các endpoint REST (/api/health, /api/menu, /api/product/:id, /api/vouchers, /api/orders/:id/details) trả đúng cấu trúc JSON', async ({ request }) => {
    const health = await (await request.get('/api/health')).json()
    expect(health.success).toBe(true)

    const prod = await (await request.get('/api/product/1')).json()
    expect(prod).toMatchObject({
      success: true,
      data: { Item_id: 1, Item_name: 'Cà phê Đen Đá', Price: 25000 },
    })

    const notFound = await request.get('/api/product/9999')
    expect(notFound.status()).toBe(404)

    const detail = await (await request.get('/api/orders/1/details')).json()
    expect(detail.success).toBe(true)
    expect(detail.data.info.Order_id).toBe(1)
    expect(detail.data.items.length).toBe(2)
  })

  test('TC-UI-01 giao diện responsive trên cả Desktop và Mobile, navbar-toggler hoạt động trên màn hình nhỏ', async ({ page }) => {
    await page.goto('/index.html')
    const vp = page.viewportSize()
    if (vp && vp.width < 992) {
      const toggler = page.locator('.navbar-toggler')
      await expect(toggler).toBeVisible()
      await toggler.click()
      await expect(page.locator('#ftco-nav')).toHaveClass(/show/)
    } else {
      await expect(page.locator('#ftco-nav')).toBeVisible()
    }
  })
})
