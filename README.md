# ☕ ANTT Coffee v3

Hệ thống Web Quản Lý & Bán Hàng Quán Cà Phê — **Đồ án tổng hợp (HCMUT - Khoa KH&KT Máy Tính)**.
Bản hợp nhất hoàn chỉnh (`antt-coffee-v3`) giữa giao diện **Bootstrap 4 (ANTT Coffee)** + **Backend Express API & Database `my_coffee_shop`** của nhóm và bộ lõi kiểm tra nghiệp vụ + kiểm thử tự động (**Vitest + Playwright**).

- **Live Demo (Vercel):** https://antt-coffee-v2.vercel.app/

## Tài khoản mặc định (từ `db.sql`)

| Vai trò | Tên đăng nhập | Mật khẩu | Ghi chú |
|---|---|---|---|
| **Admin (Quản trị)** | `admin` | `admin123` | Quản lý đơn hàng (có Popup chi tiết), thực đơn, voucher, khách hàng, phản hồi |
| **Customer (Khách hàng)** | `user` | `123456` | Có sẵn 220 điểm (Hạng Silver), đơn hàng mẫu & hồ sơ cá nhân |
| **Customer khác** | `ccc` / `bbb` / `aaa` | `123456` | Các tài khoản khách hàng trong `db.sql` |

## Cấu trúc dự án

```
antt-coffee-v3/
├─ public/                  # Toàn bộ giao diện Frontend gốc ANTT Coffee (12 trang HTML, CSS Bootstrap 4, JS, Images)
├─ server/                  # Backend Express API (Node.js)
│  ├─ app.js                # Express app phục vụ cả /api/* và static frontend public/
│  ├─ index.js              # Entry point chạy server local (cổng 3000)
│  ├─ routes/api.js         # Các endpoint REST (/api/menu, /api/product/:id, /api/orders, /api/vouchers, /api/customers, /api/feedback...)
│  ├─ db/seedData.js        # Dữ liệu gốc 100% từ db.sql (19 món, 5 voucher, 12 đơn hàng, 4 đánh giá, 5 tài khoản)
│  ├─ db/store.js           # Embedded Store + logic nghiệp vụ (tính tiền, voucher, điểm & hạng thành viên, soft-delete)
│  ├─ db/database.js        # Kết nối MySQL (XAMPP) tuỳ chọn khi USE_MYSQL=true
│  └─ models/db.sql         # File SQL gốc của nhóm (MariaDB/MySQL)
├─ api/index.js             # Serverless entry point để deploy 1-click lên Vercel
├─ src/lib/                 # Các module nghiệp vụ thuần (pricing, orderStatus, loyalty, validators, format, id)
├─ testsuite/               # Bộ kiểm thử hồi quy tự động (152 Unit tests Vitest + 42 E2E tests Playwright)
└─ vercel.json              # Cấu hình routing & security headers trên Vercel
```

## Chạy ở máy local

Yêu cầu: **Node.js ≥ 20** (không bắt buộc bật XAMPP vì hệ thống đã tích hợp sẵn Embedded Store từ `db.sql`; nếu muốn kết nối MySQL XAMPP chỉ cần đặt `USE_MYSQL=true` trong `.env`).

```bash
npm install
npm start
# Mở http://localhost:3000
```

## Kiểm thử hồi quy (Regression Test)

```bash
npm run lint         # Kiểm tra mã nguồn với ESLint (0 warning)
npm run test:unit    # Chạy 152 unit & backend integration tests (Vitest)
npm run test:e2e     # Chạy E2E Playwright trên cả Desktop & Mobile
npm run check        # Chạy toàn bộ cổng chất lượng (lint + unit + build)
```

## Triển khai Vercel

Import repository lên Vercel (hoặc đẩy lên nhánh `main` đã kết nối Vercel). Vercel tự động chạy `api/index.js` cho mọi đường dẫn `/api/*` và phục vụ giao diện từ `public/`.
