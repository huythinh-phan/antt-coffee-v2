import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'

// Chạy từ thư mục gốc project:  npm run test:e2e
// Có thể trỏ vào URL đã deploy:  BASE_URL=https://xxx.vercel.app npm run test:e2e   (bỏ qua webServer)
const root = fileURLToPath(new URL('../..', import.meta.url))
const PORT = 4173
const external = process.env.BASE_URL
const baseURL = external || `http://localhost:${PORT}`

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.js/,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../../playwright-report' }]],
  outputDir: '../../test-results',
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure', locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 } } },
  ],
  webServer: external
    ? undefined
    : {
        command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
        cwd: root,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})

