# ☕ Coffee Manager

Web đặt đồ uống & quản lý quán cà phê – **bản demo** của Đồ án tổng hợp (HCMUT, K251).
React 19 · Vite 7 · Tailwind CSS 3 · React Router 7 · dữ liệu lưu `localStorage` · triển khai tĩnh trên Vercel.

**Demo:** _(điền URL Vercel sau khi deploy)_

## Tài khoản demo

| Vai trò | Tên đăng nhập | Mật khẩu |
|---|---|---|
| Quản trị | `admin` | `admin` |
| Khách hàng | `khach` | `123` |

Khách có thể tự **đăng ký** tài khoản mới (mã `WELCOME10` giảm 10% cho đơn đầu tiên).

## Tính năng

- **Khách:** xem/tìm menu, giỏ hàng, mã ưu đãi (kiểm tra điều kiện, báo lý do), ghi chú, đặt đơn, lịch sử, hủy đơn chờ thanh toán, đánh giá đơn hoàn tất, điểm tích luỹ, trang tài khoản.
- **Quản trị:** quản lý đơn theo quy trình *Chờ thanh toán → Đã thanh toán → Đang pha chế → Hoàn tất* (hoặc Hủy), thống kê nhanh, quản lý menu/ưu đãi, xem phản hồi, cộng/trừ điểm khách, đặt lại dữ liệu demo.
- Giao diện mobile-first, sáng/tối, tiếng Việt; F5/mở link sâu không lỗi.

## Chạy local

Yêu cầu Node ≥ 20 (khuyến nghị 22).

```bash
npm ci
npm run dev          # http://localhost:5173
```

| Lệnh | Tác dụng |
|---|---|
| `npm run build` / `npm run preview` | Build production → `dist/` / xem bản build |
| `npm run lint` | ESLint (0 cảnh báo) |
| `npm run test:unit` | Unit test (Vitest) |
| `npm run test:e2e` | E2E (Playwright, desktop + mobile) – lần đầu: `npx playwright install chromium` |
| `npm run check` | lint + unit + build |

## Triển khai

Import repo vào Vercel (preset **Vite**, output `dist`) – `vercel.json` đã cấu hình SPA rewrite và header. Kiểm tra sau deploy:

```bash
node testsuite/scripts/verify-deploy.mjs https://<ten-du-an>.vercel.app
```

## Giới hạn của bản demo

- Dữ liệu lưu **trên từng trình duyệt** (không chia sẻ giữa thiết bị). Demo khách + quản trị bằng 2 tab cùng trình duyệt.
- Xác thực chỉ mang tính minh hoạ (mật khẩu chưa băm) – **đừng dùng mật khẩu thật**. Băm mật khẩu & backend thuộc Phase B.
- Thanh toán giả lập (thanh toán tại quầy, quản trị xác nhận).

## Kiểm thử

Bộ kiểm thử (145 unit test Vitest + 194 E2E Playwright): xem [testsuite/README.md](testsuite/README.md).

