# Báo cáo kết quả kiểm thử

| | |
|---|---|
| Ngày/giờ | `YYYY-MM-DD HH:mm` |
| Commit | `<sha>` |
| Người/agent chạy | |
| Môi trường | Node `x.y.z` · OS · Chromium `x` · URL (`local`/`https://…`) |

## 1. Tóm tắt

| Nhóm | Tổng | Đạt | Fail | Bỏ qua | Ghi chú |
|---|---|---|---|---|---|
| Lint (`npm run lint`) | – | ☐ | | | 0 error / 0 warning? |
| Build (`npm run build`) | – | ☐ | | | JS gzip = … kB |
| Unit (`npm run test:unit`) | | | | | |
| E2E `desktop` | | | | | |
| E2E `mobile` | | | | | |
| Static checks (TC-STATIC-*) | 8 | | | | |
| Deploy smoke (`verify-deploy.mjs`) | 6 | | | | |
| Thủ công (TC-DEPLOY-10…16, TC-UI-30…31) | | | | | |

**Kết luận:** ☐ ĐẠT Definition of Done (TEST_PLAN §5) · ☐ CHƯA ĐẠT

## 2. Chi tiết test case P0/P1 không đạt

| ID | P | Hiện tượng | Nguyên nhân gốc | Hành động | Trạng thái |
|---|---|---|---|---|---|
| | | | | | ☐ mở / ☐ đã sửa |

## 3. Thay đổi test hoặc tài liệu trong lần chạy này
(ghi lý do nếu có sửa test/doc – xem TEST_PLAN §9)

## 4. Lỗi console/mạng quan sát được

## 5. Số liệu hiệu năng (nếu có)
Lighthouse mobile: Performance … · Accessibility … · Best Practices … · SEO …

## 6. Việc còn lại / rủi ro

