# testsuite

Bộ kiểm thử để **agent/dev xác nhận sau khi nâng cấp code**. Kế hoạch & tiêu chí: [TEST_PLAN.md](TEST_PLAN.md).

## Chạy nhanh

```bash
# 1. Cài đặt (xem Agent.md Phase 0 để thêm devDependencies & script)
npm ci
npx playwright install chromium        # lần đầu

# 2. Unit (nhanh)
npm run test:unit

# 3. Cổng chất lượng: lint + unit + build
npm run check

# 4. E2E (tự build + preview cổng 4173), 2 viewport desktop & mobile
npm run test:e2e
npx playwright show-report playwright-report   # xem báo cáo

# 5. Sau khi deploy
node testsuite/scripts/verify-deploy.mjs https://<project>.vercel.app
BASE_URL=https://<project>.vercel.app npm run test:e2e
```

Chạy một phần:
```bash
npx vitest run testsuite/unit/pricing.test.js
npx playwright test -c testsuite/e2e/playwright.config.js 03-order --project=desktop
npx playwright test -c testsuite/e2e/playwright.config.js -g "TC-ORD-01"
```

## Cấu hình cần có trong dự án (Agent thêm ở Phase 0)

`package.json`
```json
"scripts": {
  "test:unit": "vitest run",
  "test:e2e": "playwright test -c testsuite/e2e/playwright.config.js",
  "check": "npm run lint && npm run test:unit && npm run build"
},
"devDependencies": { "vitest": "^3", "@playwright/test": "^1.50" }
```
`vite.config.js`
```js
export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', include: ['testsuite/unit/**/*.test.js'] },
})
```
`eslint.config.js`: bổ sung `globalIgnores(['dist','playwright-report','test-results'])` và cho phép globals Node cho `testsuite/**` & `*.mjs` (vd. thêm khối `files: ['testsuite/**/*.{js,mjs}']` với `globals.node`), hoặc thêm `testsuite` vào ignores nếu không muốn lint test. `.gitignore`: thêm `playwright-report/`, `test-results/`.

## Nội dung

| Thư mục | Nội dung |
|---|---|
| [`cases/`](cases) | Test case Markdown có ID, ưu tiên, truy vết: `TC-AUTH`, `TC-ORDER`, `TC-ADMIN`, `TC-UI-DATA-SMOKE`, `TC-DEPLOY` |
| [`unit/`](unit) | `pricing`, `orderStatus`, `misc` (loyalty/id/format), `validators`, `reducer`, `db.migrate` |
| [`e2e/`](e2e) | `01-smoke`, `02-auth`, `03-order`, `04-admin`, `05-guard-and-data`, `06-responsive-and-theme` + `helpers.js`, `playwright.config.js` |
| [`scripts/`](scripts) | `verify-deploy.mjs` (không phụ thuộc gói ngoài) |
| [`report-template.md`](report-template.md) | Mẫu báo cáo – agent điền sau khi chạy |

## Hợp đồng mà test phụ thuộc
- Đường dẫn module & chữ ký hàm: [ARCHITECTURE §4](../docs/ARCHITECTURE.md)
- Dữ liệu seed: [ARCHITECTURE §5.2](../docs/ARCHITECTURE.md)
- Action/thông báo lỗi: [API §1](../docs/API.md)
- `data-testid`: [DESIGN §10](../docs/DESIGN.md)

> Đổi bất kỳ hợp đồng nào → cập nhật tài liệu **và** test cùng lúc.

