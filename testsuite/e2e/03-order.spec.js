import { test, expect } from '@playwright/test'
import { tid, login, logout, nav, addToCart, card, ADMIN, KHACH } from './helpers.js'

// TC-ORD-*, TC-PROMO-*, TC-HIS-*, FR-ORD-*, FR-PROMO-03, FR-HIS-*, NFR-SEC-01, NFR-REL-01

test.describe('Giỏ hàng', () => {
  test('TC-ORD-01 bấm món 2 lần → số lượng đúng 2 (không nhảy 4)', async ({ page }) => {
    await page.goto('/order')
    await addToCart(page, 'm1', 2)
    await expect(tid(page, 'cart-qty-m1')).toHaveText('2')
    await expect(tid(page, 'summary-subtotal')).toContainText(/70\.000/)
  })

  test('TC-ORD-02 tăng/giảm/xoá; giảm về 0 thì món biến mất, giỏ rỗng hiện thông báo', async ({ page }) => {
    await page.goto('/order')
    await addToCart(page, 'm2')
    await tid(page, 'cart-inc-m2').click()
    await expect(tid(page, 'cart-qty-m2')).toHaveText('2')
    await tid(page, 'cart-dec-m2').click()
    await expect(tid(page, 'cart-qty-m2')).toHaveText('1')
    await tid(page, 'cart-dec-m2').click()
    await expect(tid(page, 'cart-item-m2')).toHaveCount(0)
    await expect(tid(page, 'cart-empty')).toBeVisible()
    await addToCart(page, 'm3')
    await addToCart(page, 'm4')
    await tid(page, 'cart-remove-m3').click()
    await expect(tid(page, 'cart-item-m3')).toHaveCount(0)
    await expect(tid(page, 'cart-item-m4')).toBeVisible()
  })

  test('TC-ORD-03 số lượng tối đa 50 mỗi món', async ({ page }) => {
    await page.goto('/order')
    await addToCart(page, 'm1')
    for (let i = 0; i < 55; i++) {
      const inc = tid(page, 'cart-inc-m1')
      if (await inc.isDisabled()) break
      await inc.click()
    }
    await expect(tid(page, 'cart-qty-m1')).toHaveText('50')
  })

  test('TC-ORD-04 tổng tiền nhiều món: 2×Espresso + 1×Latte = 115.000', async ({ page }) => {
    await page.goto('/order')
    await addToCart(page, 'm1', 2)
    await addToCart(page, 'm2')
    await expect(tid(page, 'summary-subtotal')).toContainText(/115\.000/)
    await expect(tid(page, 'summary-discount')).toContainText(/0/)
    await expect(tid(page, 'summary-payable')).toContainText(/115\.000/)
  })
})

test.describe('Khách vãng lai đặt đơn', () => {
  test('TC-ORD-10 chưa đăng nhập: có gợi ý, bấm đặt → đăng nhập → quay lại /order, giỏ còn nguyên', async ({ page }) => {
    await page.goto('/order')
    await addToCart(page, 'm2', 2)
    await expect(tid(page, 'login-required-hint')).toBeVisible()
    await tid(page, 'place-order').click()
    await expect(page).toHaveURL(/\/login/)
    await login(page, KHACH, { goto: false })
    await expect(page).toHaveURL(/\/order/)
    await expect(tid(page, 'cart-qty-m2')).toHaveText('2')
    await expect(tid(page, 'login-required-hint')).toHaveCount(0)
  })
})

test.describe('Mã ưu đãi', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, KHACH)
    await page.goto('/order')
  })

  test('TC-PROMO-01 CF15K (viết thường) trên Latte → giảm 15.000, thanh toán 30.000', async ({ page }) => {
    await addToCart(page, 'm2')
    await tid(page, 'promo-input').fill('cf15k')
    await expect(tid(page, 'summary-discount')).toContainText(/15\.000/)
    await expect(tid(page, 'summary-payable')).toContainText(/30\.000/)
    await expect(tid(page, 'promo-message')).toContainText('Giảm 15K cho đồ uống cà phê')
  })

  test('TC-PROMO-02 CF15K chỉ có Trà đào → báo thiếu danh mục, không giảm', async ({ page }) => {
    await addToCart(page, 'm4')
    await tid(page, 'promo-input').fill('CF15K')
    await expect(tid(page, 'promo-message')).toContainText('Đơn chưa có món thuộc danh mục áp dụng')
    await expect(tid(page, 'summary-payable')).toContainText(/42\.000/)
  })

  test('TC-PROMO-03 WELCOME10 với khach (đã có đơn) → chỉ áp dụng đơn đầu', async ({ page }) => {
    await addToCart(page, 'm1', 2)
    await tid(page, 'promo-input').fill('WELCOME10')
    await expect(tid(page, 'promo-message')).toContainText('Mã chỉ áp dụng cho đơn đầu tiên')
    await expect(tid(page, 'summary-payable')).toContainText(/70\.000/)
  })

  test('TC-PROMO-04 mã không tồn tại', async ({ page }) => {
    await addToCart(page, 'm1')
    await tid(page, 'promo-input').fill('KHONGCO')
    await expect(tid(page, 'promo-message')).toContainText('Mã ưu đãi không tồn tại')
  })

  test('TC-PROMO-05 tài khoản mới dùng WELCOME10: 70.000 → giảm 7.000 → 63.000', async ({ page }) => {
    await logout(page)
    await page.goto('/register')
    await tid(page, 'register-name').fill('Khách Mới')
    await tid(page, 'register-username').fill('khachmoi')
    await tid(page, 'register-password').fill('matkhau1')
    await tid(page, 'register-submit').click()
    await page.waitForURL((u) => !u.pathname.startsWith('/register'))
    await page.goto('/order')
    await addToCart(page, 'm1', 2)
    await tid(page, 'promo-input').fill('welcome10')
    await expect(tid(page, 'summary-discount')).toContainText(/7\.000/)
    await expect(tid(page, 'summary-payable')).toContainText(/63\.000/)
    await tid(page, 'place-order').click()
    await expect(page).toHaveURL(/\/orders\/.+/)
    await expect(page.getByText(/63\.000/).first()).toBeVisible()
  })
})

test.describe('Tạo đơn thành công & lịch sử', () => {
  test('TC-ORD-20 đặt đơn: toast, chuyển tới chi tiết đơn, lịch sử có đúng 1 đơn mới (không nhân đôi)', async ({ page }) => {
    await login(page, KHACH)
    await page.goto('/order')
    await addToCart(page, 'm2')
    await tid(page, 'promo-input').fill('cf15k')
    await tid(page, 'order-note').fill('Ít đá')
    await tid(page, 'place-order').click()
    await expect(tid(page, 'toast')).toContainText('Đã tạo đơn #')
    await expect(page).toHaveURL(/\/orders\/.+/)
    await expect(page.getByText('Latte').first()).toBeVisible()
    await expect(page.getByText('Ít đá').first()).toBeVisible()

    await page.goto('/history')
    await expect(tid(page, 'order-card')).toHaveCount(3)
    const first = tid(page, 'order-card').first()
    await expect(tid(first, 'order-status')).toHaveText('Chờ thanh toán')
    await expect(tid(first, 'order-items')).toContainText('Latte')
    // F5 không mất, không nhân đôi
    await page.reload()
    await expect(tid(page, 'order-card')).toHaveCount(3)
    // giỏ đã được dọn
    await page.goto('/order')
    await expect(tid(page, 'cart-empty')).toBeVisible()
  })

  test('TC-HIS-01 khách thấy đúng 2 đơn mẫu của mình, hiển thị món, ghi chú và nhãn tiếng Việt', async ({ page }) => {
    await login(page, KHACH)
    await page.goto('/history')
    await expect(tid(page, 'order-card')).toHaveCount(2)
    const demo1 = card(page, 'DEMO01')
    const demo2 = card(page, 'DEMO02')
    await expect(tid(demo1, 'order-status')).toHaveText('Hoàn tất')
    await expect(tid(demo1, 'order-items')).toContainText('Latte')
    await expect(tid(demo1, 'order-items')).toContainText('Bạc xỉu')
    await expect(tid(demo2, 'order-status')).toHaveText('Chờ thanh toán')
    await expect(demo2).toContainText('Ít đường')
    await expect(demo2).toContainText(/70\.000/)
  })

  test('TC-HIS-02 chỉ đơn CREATED mới có nút Hủy; hủy cần xác nhận', async ({ page }) => {
    await login(page, KHACH)
    await page.goto('/history')
    await expect(tid(card(page, 'DEMO01'), 'order-cancel')).toHaveCount(0)
    await tid(card(page, 'DEMO02'), 'order-cancel').click()
    await expect(tid(page, 'confirm-dialog')).toBeVisible()
    await tid(page, 'confirm-cancel').click()
    await expect(tid(card(page, 'DEMO02'), 'order-status')).toHaveText('Chờ thanh toán')
    await tid(card(page, 'DEMO02'), 'order-cancel').click()
    await tid(page, 'confirm-ok').click()
    await expect(tid(card(page, 'DEMO02'), 'order-status')).toHaveText('Đã hủy')
    await expect(tid(card(page, 'DEMO02'), 'order-cancel')).toHaveCount(0)
    await page.reload()
    await expect(tid(card(page, 'DEMO02'), 'order-status')).toHaveText('Đã hủy')
    // hủy đơn không cộng điểm
    await page.goto('/account')
    await expect(tid(page, 'account-points')).toContainText('8')
  })

  test('TC-HIS-03 chỉ đánh giá được đơn Hoàn tất; sửa được; lưu sau F5', async ({ page }) => {
    await login(page, KHACH)
    await page.goto('/history')
    await expect(tid(card(page, 'DEMO02'), 'order-rate')).toHaveCount(0)
    await tid(card(page, 'DEMO01'), 'order-rate').click()
    await tid(page, 'rate-range').fill('4')
    await tid(page, 'rate-feedback').fill('Ngon, phục vụ nhanh')
    await tid(page, 'rate-submit').click()
    await expect(tid(page, 'toast')).toBeVisible()
    await page.reload()
    await expect(tid(card(page, 'DEMO01'), 'order-rate')).toContainText('Sửa')
    await tid(card(page, 'DEMO01'), 'order-rate').click()
    await expect(tid(page, 'rate-range')).toHaveValue('4')
    await expect(tid(page, 'rate-feedback')).toHaveValue('Ngon, phục vụ nhanh')
    await page.keyboard.press('Escape')
    await expect(tid(page, 'rate-submit')).toHaveCount(0)
  })

  test('TC-SEC-10 ghi chú chứa HTML/script được hiển thị dạng văn bản (không thực thi)', async ({ page }) => {
    await login(page, KHACH)
    await page.goto('/order')
    await addToCart(page, 'm1')
    const payload = '<img src=x onerror="window.__xss=1"><b>đậm</b>'
    await tid(page, 'order-note').fill(payload)
    await tid(page, 'place-order').click()
    await expect(page).toHaveURL(/\/orders\/.+/)
    await expect(page.getByText(payload, { exact: false }).first()).toBeVisible()
    expect(await page.evaluate(() => window.__xss)).toBeUndefined()
    await expect(page.locator('main b', { hasText: 'đậm' })).toHaveCount(0)
  })

  test('TC-ORD-21 ghi chú > 200 ký tự bị chặn (không tạo đơn)', async ({ page }) => {
    await login(page, KHACH)
    await page.goto('/order')
    await addToCart(page, 'm1')
    await tid(page, 'order-note').fill('x'.repeat(250))
    await tid(page, 'place-order').click()
    // hoặc input bị giới hạn maxLength=200 (đặt đơn được với 200 ký tự), hoặc báo lỗi; cả hai đều chấp nhận
    const len = await tid(page, 'order-note').evaluate((el) => el.value.length)
    if (len > 200) {
      await expect(tid(page, 'toast')).toBeVisible()
      await page.goto('/history')
      await expect(tid(page, 'order-card')).toHaveCount(2)
    } else {
      expect(len).toBeLessThanOrEqual(200)
    }
  })
})

test.describe('Đồng bộ giữa hai tab (cùng trình duyệt)', () => {
  test('TC-ORD-30 khách đặt ở tab A → admin ở tab B thấy đơn sau khi mở/tải lại', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'vi-VN' })
    const a = await context.newPage()
    const b = await context.newPage()
    await login(a, KHACH)
    await a.goto('/order')
    await addToCart(a, 'm5', 1)
    await tid(a, 'order-note').fill('Tab A')
    await tid(a, 'place-order').click()
    await expect(a).toHaveURL(/\/orders\/.+/)

    await b.goto('/')
    await logout(b)
    await login(b, ADMIN)
    await b.goto('/admin/orders')
    await expect(b.locator('[data-testid="admin-order-card"]', { hasText: 'Tab A' })).toHaveCount(1)
    await context.close()
  })
})
