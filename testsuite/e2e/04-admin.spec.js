import { test, expect } from '@playwright/test'
import { tid, login, resetBackend, ADMIN, USER } from './helpers.js'

const switchAdminTab = async (page, selector) => {
  const tab = page.locator(selector)
  if (!(await tab.isVisible())) {
    await page.locator('.navbar-toggler').click()
    await expect(tab).toBeVisible()
  }
  await tab.click()
}

test.describe('Trang Quản Trị Admin (Đơn hàng, Popup Chi tiết, Menu, Voucher, Khách hàng, Đánh giá)', () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request)
  })

  test('TC-ADM-01 bảo vệ trang admin.html: khách vãng lai hoặc khách thường bị chuyển về login.html', async ({ page }) => {
    await page.goto('/admin.html')
    await expect(page).toHaveURL(/login\.html/)

    await login(page, USER)
    await page.goto('/admin.html')
    await expect(page).toHaveURL(/login\.html/)
  })

  test('TC-ADM-02 xem Popup Chi tiết đơn hàng (#1) và cập nhật trạng thái đơn sang Completed (+điểm cho khách)', async ({ page }) => {
    await login(page, ADMIN)
    await expect(page).toHaveURL(/admin\.html/)

    // Mở popup chi tiết đơn #1
    await tid(page, 'admin-order-detail-1').click()
    const modal = tid(page, 'order-detail-modal')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Chi Tiết Đơn Hàng #1')
    await expect(modal).toContainText('Cà phê Sữa Đá')
    await expect(modal).toContainText('Cappuccino')
    await page.locator('#orderDetailModal .btn-close-modal').click()

    // Chuyển trạng thái đơn #8 (45.750đ của user Acc_id=2) sang Completed -> điểm của user tăng từ 220 lên 224 (+4 điểm)
    await tid(page, 'admin-order-status-8').selectOption('Completed')
    const row8 = page.locator('[data-testid="admin-order-row"][data-order-id="8"]')
    await expect(tid(row8, 'order-status')).toHaveText('Completed')

    await switchAdminTab(page, '#tab-customer')
    const userRow = page.locator('[data-testid="customer-row"][data-username="user"]')
    await expect(tid(userRow, 'customer-points')).toHaveText('224')
  })

  test('TC-ADM-03 quản lý Thực đơn, Voucher, Khách hàng và Khôi phục dữ liệu gốc', async ({ page }) => {
    page.on('dialog', (d) => d.accept())
    await login(page, ADMIN)

    // 1. Thêm món mới trong tab Menu
    await switchAdminTab(page, '#tab-menu')
    await expect(tid(page, 'admin-menu-row')).toHaveCount(19)
    await page.locator('#prodForm input[name="name"]').fill('Cold Brew Cam Sả')
    await page.locator('#prodForm input[name="price"]').fill('52000')
    await page.locator('#prodForm select[name="cate_id"]').selectOption('1')
    await page.locator('#prodForm input[name="description"]').fill('Ủ lạnh 18 giờ')
    await page.locator('#prodForm button[type="submit"]').click()
    await expect(tid(page, 'admin-menu-row')).toHaveCount(20)
    await expect(page.locator('[data-testid="admin-menu-row"][data-name="Cold Brew Cam Sả"]')).toBeVisible()

    // 2. Tạo mã giảm giá mới trong tab Voucher
    await switchAdminTab(page, '#tab-voucher')
    await page.locator('#voucherForm input[name="code"]').fill('ANTT30')
    await page.locator('#voucherForm select[name="type"]').selectOption('percent')
    await page.locator('#voucherForm input[name="value"]').fill('30')
    await page.locator('#voucherForm input[name="min"]').fill('60000')
    await page.locator('#voucherForm button[type="submit"]').click()
    await expect(page.locator('[data-testid="promo-row"][data-code="ANTT30"]')).toBeVisible()

    // 3. Khôi phục dữ liệu gốc
    await switchAdminTab(page, '#tab-orders')
    await tid(page, 'admin-reset-demo').click()
    await switchAdminTab(page, '#tab-menu')
    await expect(tid(page, 'admin-menu-row')).toHaveCount(19)
  })
})
