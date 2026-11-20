# TC-ORDER – Menu, giỏ hàng, ưu đãi, đặt đơn, lịch sử, đánh giá

Tiền điều kiện chung: dữ liệu seed (menu `m1…m5`, `khach` có 2 đơn mẫu `DEMO01` hoàn tất, `DEMO02` chờ thanh toán, 8 điểm). Giá: m1 Espresso 35.000 · m2 Latte 45.000 · m3 Cappuccino 48.000 · m4 Trà đào 42.000 · m5 Bạc xỉu 38.000.

## Menu

| ID | P | Truy vết | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|---|
| TC-MENU-01 | P0 | FR-MENU-01 | Khách vãng lai mở `/menu` | 5 món có tên, loại, giá (Latte 45.000 ₫) | E 01 |
| TC-MENU-02 | P0 | FR-MENU-02 | Gõ `  LATTE ` rồi `cappu` | Còn 1 món tương ứng | E 01 |
| TC-MENU-03 | P1 | FR-MENU-02 | Gõ `zzzzzz`, rồi xoá ô | Hiện "không có kết quả"; xoá ô → 5 món | E 01 |
| TC-MENU-04 | P2 | FR-MENU-03 | Chọn chip danh mục "Trà" | Chỉ Trà đào | M |

## Giỏ hàng & đặt đơn

| ID | P | Truy vết | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|---|
| TC-ORD-01 | P0 | FR-ORD-01, BUG-02 | `/order` → bấm Espresso 2 lần | Số lượng **2**, tạm tính 70.000 ₫ | E 03 |
| TC-ORD-02 | P0 | FR-ORD-01 | Tăng, giảm, giảm về 0, xoá | Món biến mất khi về 0; giỏ rỗng hiện thông báo; xoá đúng món | E 03 |
| TC-ORD-03 | P1 | FR-ORD-01 | Bấm `+` tới 50 | Dừng ở 50, nút `+` bị khoá | E 03; U reducer |
| TC-ORD-04 | P0 | FR-ORD-04 | 2×Espresso + 1×Latte | Tạm tính = Thanh toán = 115.000 ₫, giảm 0 | E 03 |
| TC-ORD-10 | P0 | FR-ORD-05 | Khách vãng lai thêm 2 Latte → bấm "Đăng nhập để đặt đơn" → đăng nhập | Về `/order`, giỏ còn 2 Latte; gợi ý đăng nhập biến mất | E 03 |
| TC-ORD-20 | P0 | FR-ORD-06, NFR-REL-01 | `khach`: Latte + `cf15k` + ghi chú "Ít đá" → Đặt đơn | Toast "Đã tạo đơn #…", chuyển `/orders/:id`, đúng món/ghi chú; `/history` có **đúng 3** đơn, đơn mới đầu tiên "Chờ thanh toán"; F5 vẫn 3; giỏ trống | E 03; U reducer |
| TC-ORD-21 | P1 | FR-ORD-02 | Ghi chú 250 ký tự | Bị chặn (giới hạn ô hoặc báo lỗi), không tạo đơn dài > 200 | E 03; U |
| TC-ORD-22 | P0 | BUG-08 | Unit: `ORDER_CREATE` kèm giá/tổng giả | Đơn dùng giá menu thật, bỏ qua dữ liệu client | U reducer |
| TC-ORD-23 | P0 | NFR-REL-01 | Unit: `ORDER_CREATE` cùng `id` hai lần | Chỉ 1 đơn | U reducer |
| TC-ORD-24 | P1 | FR-MENU-05 | Unit: đổi giá/xoá món rồi đặt đơn mới | Đơn mới theo giá mới/bị từ chối nếu món đã xoá; đơn cũ giữ snapshot | U reducer |
| TC-ORD-30 | P1 | FR-ADM-01 | Hai tab cùng trình duyệt: tab A đặt đơn, tab B admin mở `/admin/orders` | Admin thấy đơn | E 03 |
| TC-ORD-40 | P1 | FR-ORD-07 | Thêm món, F5 | Giỏ còn nguyên (sessionStorage) | M |

## Trạng thái đơn (state machine) – ADR-0005

| ID | P | Truy vết | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|---|
| TC-ORD-STATE-01 | P0 | FR-ADM-02 | Unit `TRANSITIONS`/`canTransition` | Khớp bảng chuẩn; không nhảy bước/lùi; trạng thái cuối khoá | U orderStatus |
| TC-ORD-STATE-02 | P0 | FR-HIS-02 | Unit quyền khách | Chủ đơn chỉ huỷ khi `CREATED`; không phải chủ đơn → không gì cả | U orderStatus, reducer |
| TC-ORD-STATE-03 | P0 | FR-LOY-01 | Unit: đi hết luồng `DEMO02` | Điểm cộng đúng 1 lần khi `FULFILLED` (8→15), huỷ không cộng | U reducer |

## Ưu đãi

| ID | P | Truy vết | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|---|
| TC-PROMO-01 | P0 | FR-PROMO-03 | `khach`: Latte + `cf15k` | Giảm 15.000, thanh toán 30.000; hiện mô tả mã | E 03; U pricing |
| TC-PROMO-02 | P0 | FR-PROMO-02 | Chỉ Trà đào + `CF15K` | "Đơn chưa có món thuộc danh mục áp dụng", thanh toán 42.000 | E 03; U |
| TC-PROMO-03 | P0 | FR-PROMO-02 | `khach` + `WELCOME10` | "Mã chỉ áp dụng cho đơn đầu tiên" | E 03; U |
| TC-PROMO-04 | P0 | FR-PROMO-03 | Mã `KHONGCO` | "Mã ưu đãi không tồn tại" | E 03; U |
| TC-PROMO-05 | P0 | FR-PROMO-02 | Tài khoản mới: 2 Espresso + `welcome10` → đặt đơn | Giảm 7.000, thanh toán 63.000; đơn lưu `promoCode='WELCOME10'` | E 03; U |
| TC-PROMO-06 | P1 | FR-PROMO-02 | Unit: hết hạn, đơn tối thiểu, tắt, trần giảm, giảm quá tạm tính | Đúng quy tắc ARCHITECTURE §4 | U pricing |
| TC-PROMO-07 | P1 | – | Unit: đơn đã huỷ không tính vào "đơn đầu" | `WELCOME10` áp dụng được | U reducer |

## Lịch sử & đánh giá

| ID | P | Truy vết | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|---|
| TC-HIS-01 | P0 | FR-HIS-01 | `khach` mở `/history` | Đúng 2 đơn của mình; DEMO01 "Hoàn tất" (Latte, Bạc xỉu), DEMO02 "Chờ thanh toán" (ghi chú "Ít đường", 70.000 ₫) | E 03 |
| TC-HIS-02 | P0 | FR-HIS-02 | DEMO01 không có "Hủy"; DEMO02 → Hủy → Hủy bỏ → Hủy → Xác nhận | Hộp thoại xác nhận; sau xác nhận "Đã hủy", mất nút Hủy, F5 vẫn "Đã hủy"; điểm vẫn 8 | E 03 |
| TC-HIS-03 | P0 | FR-HIS-03 | DEMO02 không có "Đánh giá"; DEMO01 → 4 sao + nhận xét → Lưu → F5 → mở lại | Lưu được; nút đổi thành "Sửa đánh giá"; giá trị được giữ; Esc đóng không lưu | E 03; U |
| TC-HIS-04 | P0 | FR-HIS-03 | Unit: đánh giá đơn chưa hoàn tất / không phải chủ đơn / rating 0,6,2.5 | Bị từ chối, dữ liệu không đổi | U reducer |

