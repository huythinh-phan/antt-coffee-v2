# TC-ADMIN – Quản trị

Tiền điều kiện: đăng nhập `admin/admin`, dữ liệu seed.

## Đơn hàng

| ID | P | Truy vết | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|---|
| TC-ADM-01 | P0 | FR-ADM-01, BUG-09 | `/admin/orders`, xem thẻ DEMO02 | Thấy tên khách "Khách hàng", món Espresso × 2, ghi chú "Ít đường" (nổi bật), 70.000 ₫, "Chờ thanh toán" | E 04 |
| TC-ADM-02 | P0 | FR-ADM-02 | Quan sát nút hành động theo trạng thái | DEMO02: chỉ "Xác nhận thanh toán" + "Hủy"; DEMO01 (hoàn tất): không có nút nào | E 04 |
| TC-ADM-03 | P0 | FR-ADM-02, FR-LOY-01 | DEMO02: PAID → PREPARING → FULFILLED; đăng nhập `khach` | Nhãn đổi đúng từng bước; hoàn tất không còn nút; F5 giữ; khách có **15** điểm | E 04 |
| TC-ADM-04 | P0 | FR-ADM-02 | DEMO02 → Hủy (Hủy bỏ rồi xác nhận) | Có hộp thoại xác nhận; "Đã hủy", không còn nút; khách vẫn 8 điểm | E 04 |
| TC-ADM-05 | P1 | FR-ADM-01 | Tìm `demo01`; lọc "Chờ thanh toán"; bỏ lọc | 1 đơn → 1 đơn (DEMO02) → 2 đơn | E 04 |
| TC-ADM-06 | P0 | FR-ADM-01 | Khách đặt 2 Cappuccino + 1 Trà đào, ghi chú "Không đá, ít ngọt" → admin | Thẻ hiển thị đủ 2 món và ghi chú | E 04 |
| TC-ADM-07 | P0 | FR-SYS-03 | Hủy DEMO02 → "Đặt lại dữ liệu demo" → Hủy bỏ → làm lại → Xác nhận | Hủy bỏ: giữ nguyên; xác nhận: DEMO02 trở lại "Chờ thanh toán" | E 04 |

## Menu

| ID | P | Truy vết | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|---|
| TC-ADM-10 | P0 | FR-MENU-04 | `/admin/menu` bấm Lưu khi form trống | Lỗi dưới ô Tên, Giá, Danh mục; vẫn 5 món | E 04; U validators |
| TC-ADM-11 | P0 | FR-MENU-04 | Giá `0`, `-5`, `1.5` | Báo lỗi giá; không thêm | E 04; U |
| TC-ADM-12 | P0 | BUG-04 | Thêm Mocha 55.000 rồi Matcha 60.000 **không bấm "Mới"**; sửa Matcha; xoá Mocha (Hủy bỏ rồi xác nhận) | 7 món; sửa chỉ ảnh hưởng Matcha; xoá chỉ mất Mocha (còn 6); khách thấy Matcha, F5 vẫn còn | E 04 |
| TC-ADM-13 | P0 | FR-MENU-05 | Xoá Latte | Đơn DEMO01 vẫn hiện "Latte" (admin & khách); `/order` không còn món Latte | E 04; U |
| TC-ADM-14 | P1 | FR-MENU-05 | Sửa giá Espresso thành 50.000 | Giỏ mới tính 50.000; DEMO02 vẫn 70.000 | E 04; U |

## Ưu đãi

| ID | P | Truy vết | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|---|
| TC-ADM-20 | P0 | FR-PROMO-01 | Phần trăm 150; mã `ab`; mã `welcome10` | Mỗi trường hợp báo lỗi đúng ô; vẫn 2 ưu đãi | E 04; U |
| TC-ADM-21 | P0 | FR-PROMO-01/03 | Tạo `summer5` (5%); khách dùng; tắt; khách dùng; xoá | Mã tự in hoa `SUMMER5`; khách được giảm 3.500 trên 70.000; sau tắt: "Mã ưu đãi đã tắt"; xoá có xác nhận | E 04 |

## Phản hồi & khách hàng

| ID | P | Truy vết | Bước | Kết quả mong đợi | Auto |
|---|---|---|---|---|---|
| TC-ADM-30 | P0 | FR-ADM-03 | Admin `/admin/feedback` (rỗng) → khách đánh giá DEMO01 5 sao "Latte rất ngon" → admin xem lại | Trước: trạng thái rỗng; sau: 1 thẻ có mã DEMO01, 5 sao, nhận xét | E 04 |
| TC-ADM-40 | P1 | FR-ADM-04 | `/admin/customers`: khach +5, rồi −100 | 8 → 13 → 0 (không âm); F5 giữ | E 04; U |
| TC-ADM-41 | P2 | FR-ADM-05 | Thẻ tổng quan | Số đơn hôm nay, doanh thu đơn hoàn tất | M |

