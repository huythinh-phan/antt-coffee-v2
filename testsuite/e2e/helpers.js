import { expect } from '@playwright/test'

export const ADMIN = { username: 'admin', password: 'admin123' }
export const USER = { username: 'user', password: '123456' }

export const tid = (page, id) => page.getByTestId(id)

/** Đặt lại dữ liệu Backend về trạng thái gốc của db.sql trước mỗi test cần DB sạch */
export async function resetBackend(request) {
  const res = await request.post('/api/reset')
  expect(res.ok()).toBe(true)
}

export async function login(page, { username, password }) {
  await page.goto('/login.html')
  await page.locator('#username').fill(username)
  await page.locator('#password').fill(password)
  await page.locator('#loginForm button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.endsWith('login.html'))
}

export function collectErrors(page) {
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('favicon')) {
      errors.push(`console.error: ${m.text()}`)
    }
  })
  return errors
}
