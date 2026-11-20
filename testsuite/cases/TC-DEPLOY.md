# TC-DEPLOY – Kiểm tra sau khi deploy (Vercel)

Tự động: `node testsuite/scripts/verify-deploy.mjs https://<project>.vercel.app` (TC-DEPLOY-01…07). Có thể chạy cả E2E vào URL thật: `BASE_URL=https://<project>.vercel.app npm run test:e2e` (bỏ qua webServer).

| ID | P | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|
| TC-DEPLOY-01 | P0 | GET `/` | 200 `text/html`, có `#root`, `<title>` Coffee Manager, < 3 s | S |
| TC-DEPLOY-02 | P0 | GET `/menu`, `/order`, `/login`, `/register`, `/history`, `/account`, `/admin/*`, `/orders/abc`, đường dẫn bậy | Đều 200 + `index.html` (rewrite) | S |
| TC-DEPLOY-03 | P0 | Tải JS/CSS được tham chiếu | 200, đúng content-type | S |
| TC-DEPLOY-04 | P2 | `/assets/<không tồn tại>` | Thông tin: có thể 200 (rewrite) – chấp nhận | S |
| TC-DEPLOY-05 | P1 | Header phản hồi `/` | `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-Frame-Options` | S |
| TC-DEPLOY-06 | P1 | Header file `/assets/*.js` | `Cache-Control` dài/immutable | S |
| TC-DEPLOY-07 | P1 | Favicon | 200 và không phải HTML | S |
| TC-DEPLOY-10 | P0 | Trên **điện thoại thật** (4G): mở URL → Menu → đăng nhập `khach/123` → đặt đơn | Hoàn tất, không lỗi; ☰ dùng được | M |
| TC-DEPLOY-11 | P0 | Trên máy tính: F5 tại `/admin/orders` khi đã đăng nhập admin | Vẫn ở trang, vẫn đăng nhập (không 404) | M / E |
| TC-DEPLOY-12 | P0 | DevTools Console + Network khi duyệt các trang | Không lỗi đỏ; không request thất bại (404) | M |
| TC-DEPLOY-13 | P1 | Lighthouse (mobile) trên `/` | Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 90 | M |
| TC-DEPLOY-14 | P0 | Chạy `npm run test:e2e` với `BASE_URL` = URL Vercel | Toàn bộ xanh (2 viewport) | E |
| TC-DEPLOY-15 | P1 | Mở bằng cửa sổ ẩn danh | Hoạt động (dữ liệu seed mới); không crash dù bộ nhớ ẩn danh bị hạn chế | M |
| TC-DEPLOY-16 | P1 | README có URL demo và tài khoản demo | Có | M |

Ghi chú: S = `verify-deploy.mjs`; E = Playwright; M = thủ công.

