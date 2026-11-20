# TC-UI & TC-DATA & TC-SMOKE – Giao diện, độ bền dữ liệu, smoke

## Smoke

| ID | P | Truy vết | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|---|
| TC-SMOKE-01 | P0 | G3 | Mở `/` | 200, tiêu đề "Coffee Manager", **không** có lỗi console/pageerror | E 01 |
| TC-SMOKE-02 | P0 | FR-SYS-01 | Mở trực tiếp `/menu`, `/order`, `/login`, `/register` | 200, có nội dung, không NotFound | E 01 |
| TC-SMOKE-03 | P0 | FR-SYS-02 | Mở `/duong-dan-khong-ton-tai` | Trang NotFound; link về trang chủ hoạt động | E 01 |
| TC-SMOKE-04 | P0 | FR-SYS-06 | Bấm nút giao diện sáng/tối, F5 | Chuyển được, ghi nhớ sau F5 | E 01 |
| TC-SMOKE-05 | P1 | NFR-PERF-01 | Đo tải `/` | < 3 giây | E 01 |

## Giao diện

| ID | P | Truy vết | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|---|
| TC-UI-01 | P0 | NFR-UX-01 | Mỗi trang chính (khách/admin) ở 375px & 1280px | Không cuộn ngang | E 06 |
| TC-UI-10 | P0 | UX-03 | Mobile: bấm ☰ | Drawer với liên kết; `aria-expanded=true`; Esc đóng; chọn liên kết điều hướng & đóng | E 06 |
| TC-UI-11 | P0 | UX-03 | Mobile, admin | Drawer có đủ 5 liên kết quản trị, Đăng xuất, thông tin user | E 06 |
| TC-UI-12 | P1 | – | Desktop | Không có ☰; thanh ngang hiện | E 06 |
| TC-UI-13 | P1 | NFR-UX-01 | Mobile: chiều cao nút chính | ≥ 40px | E 06 |
| TC-UI-20 | P0 | UX-02, FR-SYS-06 | Light & Dark: form đăng nhập | Tương phản chữ/nền ≥ 4.5:1 (ô nhập, nút) | E 06 |
| TC-UI-21 | P0 | UX-02 | Light & Dark: `/order`, `/menu` | Như trên | E 06 |
| TC-UI-22 | P0 | UX-01/02 | Light & Dark: `/admin/*` và hộp thoại đánh giá | Như trên; nút "Mới", "Hủy" không còn chữ tối trên nền tối | E 06 |
| TC-UI-30 | P1 | NFR-A11Y-01 | Duyệt luồng đặt đơn chỉ bằng bàn phím (Tab/Enter/Esc) | Mọi control focus được, thấy viền focus; Esc đóng dialog | M |
| TC-UI-31 | P1 | NFR-A11Y-01 | Mọi `input` có label/aria-label | Có | M (hoặc axe) |
| TC-UI-32 | P1 | UX-05/06 | Kiểm tra nhãn trạng thái & ngày giờ | Nhãn tiếng Việt; ngày `dd/MM/yyyy HH:mm` | E 03/04; U misc |

## Độ bền dữ liệu

| ID | P | Truy vết | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|---|
| TC-DATA-01 | P1 | FR-SYS-05 | `coffee_demo_db` = JSON hỏng | Dùng lại seed, app chạy | E 05 |
| TC-DATA-02 | P1 | FR-SYS-05 | `coffee_demo_db` = `{"users":"x","menu":5}` | Dùng lại seed | E 05; U migrate |
| TC-DATA-03 | P1 | FR-SYS-05 | Dữ liệu schema v0 (đơn không có tên món) | Migrate; lịch sử hiện tên món, "Món đã xóa" cho món không còn | E 05; U migrate |
| TC-DATA-04 | P1 | FR-SYS-04 | `localStorage.setItem` ném lỗi | Không crash; đăng nhập/duyệt được trong phiên | E 05 |
| TC-DATA-05 | P0 | FR-SYS-02 | Dữ liệu làm render lỗi | `ErrorBoundary` + nút "Tải lại", không trang trắng | E 05 |
| TC-DATA-06 | P1 | – | Unit: `migrate` idempotent, không mutate | Đạt | U migrate |
| TC-DATA-07 | P2 | – | Hai tab: đổi dữ liệu ở tab A | Tab B tự cập nhật qua `storage` event (`DB_REPLACE`) | M |

## Kiểm tra tĩnh (thủ công/lệnh)

| ID | P | Lệnh | Mong đợi |
|---|---|---|---|
| TC-STATIC-01 | P0 | `npm run lint` | 0 error, 0 warning |
| TC-STATIC-02 | P0 | `npm run build` | Thành công; JS gzip < 150 kB |
| TC-STATIC-03 | P0 | `grep -rn "dangerouslySetInnerHTML" src` | Không có |
| TC-STATIC-04 | P0 | `grep -rnE "localStorage\|Date\.now\(\|Math\.random\(\|uuid" src/lib src/store --exclude=id.js` | Không có (lib/store thuần; `id.js` là ngoại lệ và không được import trong `src/store`) |
| TC-STATIC-05 | P0 | `grep -rn "loadDB" src/pages src/components` | Không có (trang không đọc DB trực tiếp) |
| TC-STATIC-06 | P1 | `grep -rnE "text-white" src/pages` | Không có `text-white` trần trên input |
| TC-STATIC-07 | P0 | Kiểm tra `package.json` | Không có `overrides`/`rolldown-vite`; có `engines.node` |
| TC-STATIC-08 | P0 | Kiểm tra file | Không còn `src/App.css`, `src/assets/react.svg`; có `vercel.json` |
