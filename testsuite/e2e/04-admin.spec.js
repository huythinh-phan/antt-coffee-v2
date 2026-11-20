import { test, expect } from '@playwright/test'
import { tid, login, logout, nav, adminCard, card, currentPoints, ADMIN, KHACH } from './helpers.js'

// TC-ADM-*, FR-ADM-01..05, FR-MENU-04/05, FR-PROMO-01, FR-SYS-03, BUG-04, BUG-09

const menuCard = (page, name) => page.locator(`[data-testid="admin-menu-card"][data-name="${name}"]`)
const promoRow = (page, code) => page.locator(`[data-testid="promo-row"][data-code="${code}"]`)

test.describe('Quản lý đơn', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN)
    await page.goto('/admin/orders')
  })

  test('TC-ADM-01 thẻ đơn hiển thị tên khách, món × SL, ghi chú, tiền, trạng thái', async ({ page }) => {
    const c = adminCard(page, 'DEMO02')
    await expect(c).toBeVisible()
    await expect(tid(c, 'admin-order-customer')).toContainText('Khách hàng')
    await expect(tid(c, 'admin-order-items')).toContainText('Espresso')
    await expect(tid(c, 'admin-order-items')).toContainText('2')
    await expect(tid(c, 'admin-order-note')).toContainText('Ít đường')
    await expect(tid(c, 'order-status')).toHaveText('Chờ thanh toán')
    await expect(c).toContainText(/70\.000/)
  })

  test('TC-ADM-02 chỉ hiện các nút hành động hợp lệ theo trạng thái', async ({ page }) => {
    const c = adminCard(page, 'DEMO02')
    await expect(tid(c, 'admin-order-action-PAID')).toBeVisible()
    await expect(tid(c, 'admin-order-action-CANCELED')).toBeVisible()
    await expect(tid(c, 'admin-order-action-PREPARING')).toHaveCount(0)
    await expect(tid(c, 'admin-order-action-FULFILLED')).toHaveCount(0)
    // đơn đã hoàn tất: không còn hành động nào
    const done = adminCard(page, 'DEMO01')
    for (const s of ['PAID', 'PREPARING', 'FULFILLED', 'CANCELED']) {
      await expect(tid(done, `admin-order-action-${s}`)).toHaveCount(0)
    }
  })

  test('TC-ADM-03 luồng CREATED → PAID → PREPARING → FULFILLED; khách nhận điểm khi hoàn tất', async ({ page }) => {
    const c = adminCard(page, 'DEMO02')
    await tid(c, 'admin-order-action-PAID').click()
    await expect(tid(c, 'order-status')).toHaveText('Đã thanh toán')
    await expect(tid(c, 'admin-order-action-PREPARING')).toBeVisible()
    await expect(tid(c, 'admin-order-action-PAID')).toHaveCount(0)
    await tid(c, 'admin-order-action-PREPARING').click()
    await expect(tid(c, 'order-status')).toHaveText('Đang pha chế')
    await tid(c, 'admin-order-action-FULFILLED').click()
    await expect(tid(c, 'order-status')).toHaveText('Hoàn tất')
    for (const s of ['PAID', 'PREPARING', 'FULFILLED', 'CANCELED']) await expect(tid(c, `admin-order-action-${s}`)).toHaveCount(0)

    await page.reload()
    await expect(tid(adminCard(page, 'DEMO02'), 'order-status')).toHaveText('Hoàn tất')

    await logout(page)
    await login(page, KHACH)
    expect(await currentPoints(page)).toBe(15) // 8 + floor(70.000 / 10.000)
  })

  test('TC-ADM-04 huỷ đơn cần xác nhận; huỷ không cộng điểm', async ({ page }) => {
    const c = adminCard(page, 'DEMO02')
    await tid(c, 'admin-order-action-CANCELED').click()
    await expect(tid(page, 'confirm-dialog')).toBeVisible()
    await tid(page, 'confirm-cancel').click()
    await expect(tid(c, 'order-status')).toHaveText('Chờ thanh toán')
    await tid(c, 'admin-order-action-CANCELED').click()
    await tid(page, 'confirm-ok').click()
    await expect(tid(c, 'order-status')).toHaveText('Đã hủy')
    for (const s of ['PAID', 'PREPARING', 'FULFILLED', 'CANCELED']) await expect(tid(c, `admin-order-action-${s}`)).toHaveCount(0)
    await logout(page)
    await login(page, KHACH)
    expect(await currentPoints(page)).toBe(8)
  })

  test('TC-ADM-05 tìm theo mã (không phân biệt hoa/thường) và lọc theo trạng thái', async ({ page }) => {
    await expect(tid(page, 'admin-order-card')).toHaveCount(2)
    await tid(page, 'admin-order-search').fill('demo01')
    await expect(tid(page, 'admin-order-card')).toHaveCount(1)
    await expect(adminCard(page, 'DEMO01')).toBeVisible()
    await tid(page, 'admin-order-search').fill('')
    await tid(page, 'admin-order-filter').selectOption('CREATED')
    await expect(tid(page, 'admin-order-card')).toHaveCount(1)
    await expect(adminCard(page, 'DEMO02')).toBeVisible()
    await tid(page, 'admin-order-filter').selectOption('')
    await expect(tid(page, 'admin-order-card')).toHaveCount(2)
  })

  test('TC-ADM-06 đơn khách vừa tạo xuất hiện với món và ghi chú đầy đủ', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'vi-VN' })
    const p = await context.newPage()
    await login(p, KHACH)
    await p.goto('/order')
    await tid(p, 'order-add-m3').click()
    await tid(p, 'order-add-m3').click()
    await tid(p, 'order-add-m4').click()
    await tid(p, 'order-note').fill('Không đá, ít ngọt')
    await tid(p, 'place-order').click()
    await expect(p).toHaveURL(/\/orders\/.+/)
    await p.goto('/')
    await logout(p)
    await login(p, ADMIN)
    await p.goto('/admin/orders')
    const c = p.locator('[data-testid="admin-order-card"]', { hasText: 'Không đá, ít ngọt' })
    await expect(c).toHaveCount(1)
    await expect(tid(c, 'admin-order-items')).toContainText('Cappuccino')
    await expect(tid(c, 'admin-order-items')).toContainText('Trà đào')
    await context.close()
  })

  test('TC-ADM-07 "Đặt lại dữ liệu demo" khôi phục seed (có xác nhận)', async ({ page }) => {
    await adminCard(page, 'DEMO02').getByTestId('admin-order-action-CANCELED').click()
    await tid(page, 'confirm-ok').click()
    await tid(page, 'admin-reset-demo').click()
    await tid(page, 'confirm-cancel').click()
    await expect(tid(adminCard(page, 'DEMO02'), 'order-status')).toHaveText('Đã hủy')
    await tid(page, 'admin-reset-demo').click()
    await tid(page, 'confirm-ok').click()
    await expect(tid(adminCard(page, 'DEMO02'), 'order-status')).toHaveText('Chờ thanh toán')
  })
})

test.describe('Quản lý menu', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN)
    await page.goto('/admin/menu')
  })

  test('TC-ADM-10 form trống → lỗi dưới từng ô, không thêm món', async ({ page }) => {
    await expect(tid(page, 'admin-menu-card')).toHaveCount(5)
    await tid(page, 'menu-form-save').click()
    await expect(tid(page, 'menu-form-error-name')).toBeVisible()
    await expect(tid(page, 'menu-form-error-price')).toBeVisible()
    await expect(tid(page, 'menu-form-error-category')).toBeVisible()
    await expect(tid(page, 'admin-menu-card')).toHaveCount(5)
  })

  test('TC-ADM-11 giá không hợp lệ (0, âm, số lẻ) bị từ chối', async ({ page }) => {
    for (const bad of ['0', '-5', '1.5']) {
      await tid(page, 'menu-form-name').fill('Thử')
      await tid(page, 'menu-form-category').fill('Khác')
      await tid(page, 'menu-form-price').fill(bad)
      await tid(page, 'menu-form-save').click()
      await expect(tid(page, 'menu-form-error-price')).toBeVisible()
      await expect(tid(page, 'admin-menu-card')).toHaveCount(5)
    }
  })

  test('TC-ADM-12 thêm 2 món liên tiếp (không bấm "Mới") đều có id riêng; sửa/xoá đúng món (BUG-04)', async ({ page }) => {
    for (const [name, price, cat] of [['Mocha', '55000', 'Cà phê'], ['Matcha', '60000', 'Trà']]) {
      await tid(page, 'menu-form-name').fill(name)
      await tid(page, 'menu-form-price').fill(price)
      await tid(page, 'menu-form-category').fill(cat)
      await tid(page, 'menu-form-save').click()
      await expect(menuCard(page, name)).toBeVisible()
    }
    await expect(tid(page, 'admin-menu-card')).toHaveCount(7)

    // sửa Matcha → chỉ Matcha đổi
    await tid(menuCard(page, 'Matcha'), 'admin-menu-edit').click()
    await tid(page, 'menu-form-price').fill('65000')
    await tid(page, 'menu-form-save').click()
    await expect(menuCard(page, 'Matcha')).toContainText(/65\.000/)
    await expect(menuCard(page, 'Mocha')).toContainText(/55\.000/)
    await expect(tid(page, 'admin-menu-card')).toHaveCount(7)

    // xoá Mocha (có xác nhận) → Matcha còn
    await tid(menuCard(page, 'Mocha'), 'admin-menu-delete').click()
    await tid(page, 'confirm-cancel').click()
    await expect(menuCard(page, 'Mocha')).toBeVisible()
    await tid(menuCard(page, 'Mocha'), 'admin-menu-delete').click()
    await tid(page, 'confirm-ok').click()
    await expect(menuCard(page, 'Mocha')).toHaveCount(0)
    await expect(menuCard(page, 'Matcha')).toBeVisible()
    await expect(tid(page, 'admin-menu-card')).toHaveCount(6)

    // khách thấy món mới, F5 vẫn còn
    await page.goto('/menu')
    await expect(page.locator('[data-testid="menu-card"][data-name="Matcha"]')).toBeVisible()
    await page.reload()
    await expect(page.locator('[data-testid="menu-card"][data-name="Matcha"]')).toBeVisible()
  })

  test('TC-ADM-13 xoá món không làm hỏng đơn cũ (snapshot)', async ({ page }) => {
    await tid(menuCard(page, 'Latte'), 'admin-menu-delete').click()
    await tid(page, 'confirm-ok').click()
    await expect(menuCard(page, 'Latte')).toHaveCount(0)
    await page.goto('/admin/orders')
    await expect(tid(adminCard(page, 'DEMO01'), 'admin-order-items')).toContainText('Latte')
    await logout(page)
    await login(page, KHACH)
    await page.goto('/history')
    await expect(tid(card(page, 'DEMO01'), 'order-items')).toContainText('Latte')
    await page.goto('/order')
    await expect(tid(page, 'order-add-m2')).toHaveCount(0)
  })

  test('TC-ADM-14 đổi giá món → đơn mới theo giá mới, đơn cũ giữ giá cũ', async ({ page }) => {
    await tid(menuCard(page, 'Espresso'), 'admin-menu-edit').click()
    await tid(page, 'menu-form-price').fill('50000')
    await tid(page, 'menu-form-save').click()
    await logout(page)
    await login(page, KHACH)
    await page.goto('/order')
    await tid(page, 'order-add-m1').click()
    await expect(tid(page, 'summary-subtotal')).toContainText(/50\.000/)
    await page.goto('/history')
    await expect(card(page, 'DEMO02')).toContainText(/70\.000/)
  })
})

test.describe('Quản lý ưu đãi', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN)
    await page.goto('/admin/promos')
  })

  test('TC-ADM-20 validate: phần trăm > 100, mã quá ngắn, mã trùng', async ({ page }) => {
    await tid(page, 'promo-form-code').fill('abcde')
    await tid(page, 'promo-form-type').selectOption('percent')
    await tid(page, 'promo-form-value').fill('150')
    await tid(page, 'promo-form-save').click()
    await expect(tid(page, 'promo-form-error-value')).toBeVisible()
    await tid(page, 'promo-form-code').fill('ab')
    await tid(page, 'promo-form-value').fill('10')
    await tid(page, 'promo-form-save').click()
    await expect(tid(page, 'promo-form-error-code')).toBeVisible()
    await tid(page, 'promo-form-code').fill('welcome10')
    await tid(page, 'promo-form-save').click()
    await expect(tid(page, 'promo-form-error-code')).toBeVisible()
    await expect(tid(page, 'promo-row')).toHaveCount(2)
  })

  test('TC-ADM-21 tạo SUMMER5 (mã tự viết hoa) → khách dùng được; tắt → khách bị từ chối; xoá', async ({ page }) => {
    await tid(page, 'promo-form-code').fill('summer5')
    await tid(page, 'promo-form-type').selectOption('percent')
    await tid(page, 'promo-form-value').fill('5')
    await tid(page, 'promo-form-desc').fill('Hè giảm 5%')
    await tid(page, 'promo-form-save').click()
    await expect(promoRow(page, 'SUMMER5')).toBeVisible()

    await logout(page)
    await login(page, KHACH)
    await page.goto('/order')
    await tid(page, 'order-add-m1').click()
    await tid(page, 'order-add-m1').click()
    await tid(page, 'promo-input').fill('summer5')
    await expect(tid(page, 'summary-discount')).toContainText(/3\.500/)
    await expect(tid(page, 'promo-message')).toContainText('Hè giảm 5%')

    await logout(page)
    await login(page, ADMIN)
    await page.goto('/admin/promos')
    await tid(promoRow(page, 'SUMMER5'), 'promo-toggle').click()
    await logout(page)
    await login(page, KHACH)
    await page.goto('/order')
    await tid(page, 'order-add-m1').click()
    await tid(page, 'promo-input').fill('SUMMER5')
    await expect(tid(page, 'promo-message')).toContainText('Mã ưu đãi đã tắt')

    await logout(page)
    await login(page, ADMIN)
    await page.goto('/admin/promos')
    await tid(promoRow(page, 'SUMMER5'), 'promo-delete').click()
    await tid(page, 'confirm-ok').click()
    await expect(promoRow(page, 'SUMMER5')).toHaveCount(0)
  })
})

test.describe('Phản hồi & khách hàng', () => {
  test('TC-ADM-30 phản hồi hiển thị đánh giá khách vừa gửi; trạng thái rỗng khi chưa có', async ({ page }) => {
    await login(page, ADMIN)
    await page.goto('/admin/feedback')
    await expect(tid(page, 'feedback-empty')).toBeVisible()
    await logout(page)
    await login(page, KHACH)
    await page.goto('/history')
    await tid(card(page, 'DEMO01'), 'order-rate').click()
    await tid(page, 'rate-range').fill('5')
    await tid(page, 'rate-feedback').fill('Latte rất ngon')
    await tid(page, 'rate-submit').click()
    await logout(page)
    await login(page, ADMIN)
    await page.goto('/admin/feedback')
    await expect(tid(page, 'feedback-card')).toHaveCount(1)
    await expect(tid(page, 'feedback-card')).toContainText('Latte rất ngon')
    await expect(tid(page, 'feedback-card')).toContainText('DEMO01')
    await expect(tid(page, 'feedback-card')).toContainText('5')
  })

  test('TC-ADM-40 cộng/trừ điểm thủ công; không xuống dưới 0', async ({ page }) => {
    await login(page, ADMIN)
    await page.goto('/admin/customers')
    const row = page.locator('[data-testid="customer-row"][data-username="khach"]')
    await expect(tid(row, 'customer-points')).toHaveText('8')
    await tid(row, 'customer-delta').fill('5')
    await tid(row, 'customer-apply').click()
    await expect(tid(row, 'customer-points')).toHaveText('13')
    await tid(row, 'customer-delta').fill('-100')
    await tid(row, 'customer-apply').click()
    await expect(tid(row, 'customer-points')).toHaveText('0')
    await page.reload()
    await expect(tid(row, 'customer-points')).toHaveText('0')
  })
})

