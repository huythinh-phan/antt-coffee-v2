import { expect } from '@playwright/test'

export const ADMIN = { username: 'admin', password: 'admin' }
export const KHACH = { username: 'khach', password: '123' }

export const tid = (page, id) => page.getByTestId(id)
export const isMobile = (page) => (page.viewportSize()?.width ?? 1280) < 640

/** Liên kết điều hướng: trên mobile phải mở drawer; chỉ chọn phần tử đang hiển thị. */
export async function nav(page, id) {
  if (isMobile(page)) {
    await tid(page, 'mobile-menu-button').click()
    await expect(tid(page, 'mobile-nav')).toBeVisible()
  }
  await page.locator(`[data-testid="${id}"]:visible`).click()
}

export async function login(page, { username, password }, { goto = true } = {}) {
  if (goto) await page.goto('/login')
  await tid(page, 'login-username').fill(username)
  await tid(page, 'login-password').fill(password)
  await tid(page, 'login-submit').click()
  await page.waitForURL((u) => !u.pathname.startsWith('/login'))
}

export async function logout(page) {
  await nav(page, 'nav-logout')
  await expect(page.locator('[data-testid="nav-login"]:visible, [data-testid="mobile-menu-button"]:visible').first()).toBeVisible()
}

/** Có ít nhất một chỗ hiển thị tên người dùng (desktop: header; mobile: trong drawer). */
export async function expectLoggedInAs(page, name) {
  if (isMobile(page)) await tid(page, 'mobile-menu-button').click()
  await expect(page.locator('[data-testid="user-badge"]:visible')).toContainText(name)
  if (isMobile(page)) await page.keyboard.press('Escape')
}

export async function currentPoints(page) {
  if (isMobile(page)) await tid(page, 'mobile-menu-button').click()
  const text = await page.locator('[data-testid="points-badge"]:visible').innerText()
  if (isMobile(page)) await page.keyboard.press('Escape')
  return Number(text.replace(/[^\d]/g, ''))
}

export const card = (page, code) => page.locator(`[data-testid="order-card"][data-code="${code}"]`)
export const adminCard = (page, code) => page.locator(`[data-testid="admin-order-card"][data-code="${code}"]`)

/** Gom lỗi console/pageerror để khẳng định "không có lỗi console". */
export function collectErrors(page) {
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`)
  })
  return errors
}

/** Thêm món vào giỏ n lần từ trang /order. */
export async function addToCart(page, menuId, times = 1) {
  for (let i = 0; i < times; i++) await tid(page, `order-add-${menuId}`).click()
}

/** Tỉ lệ tương phản WCAG giữa màu chữ và nền (đi ngược cây DOM tới nền không trong suốt). */
export async function contrastOf(locator) {
  return locator.evaluate((el) => {
    const parse = (c) => {
      const m = c.match(/rgba?\(([^)]+)\)/)
      if (!m) return null
      const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
      return { r, g, b, a }
    }
    const lum = ({ r, g, b }) => {
      const f = (v) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      }
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    const fg = parse(getComputedStyle(el).color)
    let bg = null
    for (let n = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor)
      if (c && c.a > 0.5) { bg = c; break }
    }
    if (!bg) bg = { r: 255, g: 255, b: 255, a: 1 }
    const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a)
    return (l1 + 0.05) / (l2 + 0.05)
  })
}

