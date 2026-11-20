import { test, expect } from '@playwright/test'
import { tid, login, resetBackend, USER } from './helpers.js'

test.describe('Giỏ hàng, Voucher, Đặt đơn, Lịch sử & Đánh giá', () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request)
  })

  test('TC-ORD-01 thêm món vào giỏ, áp dụng voucher TEST10, đặt hàng thành công và xuất hiện trong Lịch sử', async ({ page }) => {
    await login(page, USER)
    await page.goto('/menu.html')

    // Thêm Cappuccino (45.000đ) x 2 = 90.000đ
    await tid(page, 'order-add-4').click()
    await tid(page, 'order-add-4').click()
    await expect(page.locator('#cartCount')).toHaveText('2')

    await page.goto('/cart.html')
    await expect(tid(page, 'cart-item-4')).toBeVisible()
    await expect(page.locator('#cartTotal')).toContainText('90.000')

    // Thông tin giao hàng được tự động điền từ hồ sơ của user
    await expect(page.locator('#shipName')).toHaveValue('Ú Ẻ')
    await page.locator('#shipAddress').fill('ĐH Bách Khoa TP.HCM')

    // Áp dụng mã TEST10 (-10.000đ cho đơn từ 50.000đ) -> còn 80.000đ
    await page.locator('#voucherInput').fill('TEST10')
    await page.locator('button[onclick="applyVoucher()"]').click()
    await expect(page.locator('#voucherMessage')).toContainText('Đã giảm 10.000')
    await expect(page.locator('#finalTotal')).toContainText('80.000')

    // Thanh toán
    await page.locator('button[onclick="processCheckout()"]').click()
    await expect(page).toHaveURL(/checkout\.html/)
    await expect(page.locator('h2')).toContainText('Đặt Hàng Thành Công')

    // Kiểm tra trong Lịch sử đơn hàng (history.html)
    await page.goto('/history.html')
    const firstOrder = tid(page, 'order-card').first()
    await expect(firstOrder).toContainText('80.000')
    await expect(firstOrder).toContainText('Cappuccino')
    await expect(tid(firstOrder, 'order-status')).toHaveText('CREATED')
  })

  test('TC-ORD-02 khách hủy đơn chờ xác nhận trong Lịch sử & gửi đánh giá cho đơn đã hoàn thành', async ({ page }) => {
    page.on('dialog', (d) => d.accept())
    await login(page, USER)
    await page.goto('/history.html')

    // Đơn #10 của user đang ở trạng thái CREATED -> hủy được
    await tid(page, 'order-cancel-10').click()
    const card10 = page.locator('[data-testid="order-card"][data-order-id="10"]')
    await expect(tid(card10, 'order-status')).toHaveText('Cancelled')

    // Đơn #11 của user đang ở trạng thái Completed -> có nút Viết nhận xét
    await tid(page, 'order-rate-11').click()
    await expect(page).toHaveURL(/reviews\.html\?orderId=11/)
    await page.locator('#dish_name').fill('Cappuccino Đậm Đà')
    await page.locator('#rating').selectOption('5')
    await page.locator('#content').fill('Cà phê rất thơm và giao nhanh!')
    await page.locator('#reviewForm button[type="submit"]').click()

    await expect(page).toHaveURL(/gallery\.html/)
    await expect(page.locator('#gallery-container')).toContainText('Cappuccino Đậm Đà')
    await expect(page.locator('#gallery-container')).toContainText('Cà phê rất thơm và giao nhanh!')
  })
})
