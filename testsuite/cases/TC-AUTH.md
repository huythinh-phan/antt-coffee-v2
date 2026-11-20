# TC-AUTH – Xác thực, phiên, phân quyền

Quy ước: **Auto** = test tự động tương ứng (`U` = unit `testsuite/unit/…`, `E` = e2e `testsuite/e2e/…`, `M` = chỉ thủ công). Tiền điều kiện chung: `localStorage` sạch (dữ liệu seed). Tài khoản: `admin/admin`, `khach/123`.

| ID | P | Truy vết | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|---|
| TC-AUTH-01 | P0 | FR-AUTH-01, SEC-01 | Mở `/login` | Ô tài khoản & mật khẩu **trống**; có gợi ý "admin / admin", "khach / 123" | E 02 |
| TC-AUTH-02 | P0 | FR-AUTH-01 | Nhập `khach` + sai mật khẩu → Đăng nhập | Hiện "Sai tài khoản hoặc mật khẩu", ở lại `/login` | E 02, U reducer |
| TC-AUTH-03 | P0 | FR-AUTH-01 | Đăng nhập `khach/123` | Về `/`; header hiện "Khách hàng" và 8 điểm | E 02 |
| TC-AUTH-04 | P0 | FR-AUTH-02/03 | Đăng nhập → F5 → Đăng xuất → F5 | Sau F5 vẫn đăng nhập; sau đăng xuất + F5 là khách vãng lai; `/history` → `/login` | E 02 |
| TC-AUTH-05 | P1 | FR-AUTH-01 | Đăng nhập với `  KHACH ` | Thành công (username không phân biệt hoa/thường, trim) | E 02, U |
| TC-AUTH-06 | P1 | FR-AUTH-01 | Đã đăng nhập, mở `/login` | Chuyển về `/` | E 02 |
| TC-AUTH-10 | P1 | FR-AUTH-04 | `/register` → Họ tên, `AnNguyen`, `matkhau1` | Tự đăng nhập, điểm 0; đăng nhập lại bằng `annguyen` được | E 02, U |
| TC-AUTH-11 | P1 | FR-AUTH-04 | Đăng ký username `KHACH` | "Tên đăng nhập đã tồn tại" | E 02, U |
| TC-AUTH-12 | P1 | FR-AUTH-04 | Mật khẩu `123` hoặc username `ai do!` | Báo lỗi, không tạo tài khoản | E 02, U |
| TC-AUTH-13 | P1 | NFR-SEC-02 | Gửi `REGISTER` kèm `role:'admin'` (qua unit) | Tài khoản vẫn là `customer` | U reducer |
| TC-AUTH-20 | P0 | FR-AUTH-05 | Đăng nhập khách rồi admin, quan sát điều hướng | Khách **không** thấy liên kết admin; admin thấy 5 liên kết và mở được từng trang | E 02 |
| TC-SEC-01 | P0 | FR-AUTH-05, NFR-SEC-02 | Chưa đăng nhập, mở từng `/admin/*` | Chuyển `/login`, không lộ dữ liệu | E 05 |
| TC-SEC-02 | P0 | NFR-SEC-02 | Đăng nhập `khach`, mở từng `/admin/*` | Khối "Không có quyền" (`forbidden`), không có dữ liệu admin | E 05 |
| TC-SEC-03 | P0 | FR-AUTH-05 | Chưa đăng nhập mở `/admin/promos` → đăng nhập admin | Quay lại đúng `/admin/promos` | E 05 |
| TC-SEC-04 | P0 | BUG-07 | Chưa đăng nhập mở `/history`, `/account` | Chuyển `/login`; không thấy mã `DEMO01/02` | E 05 |
| TC-SEC-05 | P0 | BUG-07 | Đăng ký người mới → `/history`; mở `/orders/o-seed-1` | Lịch sử rỗng; đơn người khác bị chặn (forbidden/not-found) | E 05 |
| TC-SEC-06 | P1 | FR-HIS-01 | `khach` mở `/orders/o-seed-1` | Thấy chi tiết đơn `DEMO01` | E 05 |
| TC-SEC-07 | P1 | NFR-SEC-02 | Đặt `coffee_session` = user không tồn tại, mở `/admin/orders` | Coi như chưa đăng nhập → `/login` | E 05 |
| TC-SEC-08 | P0 | NFR-SEC-02 | Unit: action quản trị (MENU_*, PROMO_*, POINTS_ADJUST, DB_RESET) với session khách/guest | `'Không có quyền'`, DB không đổi | U reducer |
| TC-SEC-10 | P0 | NFR-SEC-01 | Đặt đơn với ghi chú `<img src=x onerror="window.__xss=1"><b>đậm</b>` | Hiển thị nguyên văn; `window.__xss` undefined; không có thẻ `<b>` thật | E 03 |
| TC-SEC-11 | P0 | NFR-SEC-01 | `grep -r dangerouslySetInnerHTML src` | Không có kết quả | M (lệnh ở TEST_PLAN) |
| TC-SEC-12 | P0 | – | `git ls-files | grep -E "\.env"` | Không có file `.env*` được commit | M |

