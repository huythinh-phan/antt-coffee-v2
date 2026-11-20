# TEST PLAN – Coffee Manager (Demo Release)

## 1. Mục tiêu & phạm vi
Xác nhận bản nâng cấp (xem [`Agent.md`](../Agent.md)) đạt [PRD](../docs/PRD.md) §7: không bug ở luồng chính, truy cập được trên Vercel, dùng được trên mobile.
Trong phạm vi: SPA Phase A. Ngoài phạm vi: Phase B (backend), test tải, test bảo mật xâm nhập.

## 2. Môi trường
| Hạng mục | Giá trị |
|---|---|
| Node | ≥ 20 (khuyến nghị 22) |
| Trình duyệt tự động | Chromium (Playwright): `desktop` 1280×800, `mobile` 375×812 |
| Locale / múi giờ | `vi-VN`, `Asia/Ho_Chi_Minh` (cấu hình sẵn trong Playwright) |
| Dữ liệu | Seed cố định – mỗi test chạy trong context mới (localStorage sạch) |
| URL | Local: build + `vite preview` cổng 4173 (tự khởi động); Deploy: `BASE_URL` |

## 3. Cấu trúc
```
testsuite/
├─ README.md              hướng dẫn chạy
├─ TEST_PLAN.md           (file này)
├─ report-template.md     mẫu báo cáo kết quả
├─ cases/                 test case Markdown (nguồn sự thật về kỳ vọng)
├─ unit/                  Vitest – lib, reducer, migrate
├─ e2e/                   Playwright – luồng người dùng, 2 viewport
└─ scripts/verify-deploy.mjs   smoke test URL đã deploy
```

## 4. Chiến lược
1. **Unit (nhanh, deterministic)** kiểm chứng toàn bộ luật nghiệp vụ & phân quyền (reducer thuần). Chạy sau **mỗi** phase.
2. **E2E** kiểm chứng luồng thật trên bản build. Chạy sau Phase 4, 5 và trước khi deploy.
3. **Static checks** (lint/grep) đảm bảo ràng buộc kiến trúc ([TC-UI-DATA-SMOKE.md](cases/TC-UI-DATA-SMOKE.md) mục "Kiểm tra tĩnh").
4. **Deploy smoke** sau khi có URL.
5. **Thủ công** cho phần không tự động hoá được (a11y bàn phím, điện thoại thật, Lighthouse).

## 5. Tiêu chí vào/ra
**Vào:** `npm ci` thành công; `npm run build` thành công.
**Ra (Definition of Done):**
- `npm run check` xanh (lint 0 error/0 warning, unit 100%, build).
- `npm run test:e2e` xanh ở cả `desktop` và `mobile` (0 fail; không `test.skip` ngoài các `skip` theo viewport có sẵn).
- Mọi test case **P0** trong `cases/` đạt; **P1** ≥ 90%; P2 không bắt buộc.
- `verify-deploy.mjs` báo 6/6 trên URL Vercel; `TC-DEPLOY-10..12, 14` đạt.
- Không có lỗi console khi duyệt các trang chính.
- Báo cáo kết quả lưu theo [report-template.md](report-template.md).

## 6. Ánh xạ test tự động ↔ test case

| Test case | Unit | E2E |
|---|---|---|
| TC-AUTH-* , TC-SEC-* | `reducer.test.js` (AUTH, quyền), `validators.test.js` | `02-auth`, `05-guard-and-data` |
| TC-MENU-* | – | `01-smoke` |
| TC-ORD-*, TC-PROMO-*, TC-HIS-* | `pricing`, `orderStatus`, `reducer`, `misc` | `03-order` |
| TC-ADM-* | `reducer` (MENU/PROMO/POINTS/DB_RESET) | `04-admin` |
| TC-UI-* | – | `06-responsive-and-theme` |
| TC-DATA-* | `db.migrate.test.js` | `05-guard-and-data` |
| TC-SMOKE-* | – | `01-smoke` |
| TC-DEPLOY-* | – | `scripts/verify-deploy.mjs` + e2e với `BASE_URL` |

## 7. Truy vết yêu cầu → test

| Yêu cầu | Test case |
|---|---|
| FR-AUTH-01…06 | TC-AUTH-01…13, TC-SEC-01…07 |
| FR-MENU-01…05 | TC-MENU-01…04, TC-ADM-10…14 |
| FR-ORD-01…07 | TC-ORD-01…40 |
| FR-PROMO-01…03 | TC-PROMO-01…07, TC-ADM-20…21 |
| FR-HIS-01…03, FR-LOY-01 | TC-HIS-01…04, TC-ORD-STATE-01…03, TC-ADM-03 |
| FR-ADM-01…05 | TC-ADM-01…07, 30, 40, 41 |
| FR-SYS-01…06 | TC-SMOKE-02…04, TC-DATA-01…05, TC-ADM-07, TC-DEPLOY-02 |
| NFR-PERF | TC-SMOKE-05, TC-STATIC-02, TC-DEPLOY-13 |
| NFR-SEC-01/02 | TC-SEC-08, 10, 11 |
| NFR-UX-01, NFR-A11Y | TC-UI-* |
| NFR-REL-01 | TC-ORD-20, 23 |

## 8. Trạng thái ban đầu (kỳ vọng "đỏ")
Test được viết **trước** (TDD). Trên mã hiện tại: unit đỏ vì chưa có `src/lib`, `src/store`, `src/services/seed.js`…; E2E đỏ vì chưa có `data-testid`/route mới. Mỗi phase trong `Agent.md` nêu rõ nhóm test phải chuyển xanh.

> Cập nhật 2026-11-20: sau khi hoàn tất Phase 0–6 của `Agent.md`, unit 145/145 và E2E 190 pass / 4 skip (theo viewport) trên bản build, 43/43 trên dev server (StrictMode) – **không sửa test nào**. Chi tiết: [report-20261120.md](report-20261120.md).

## 9. Quy tắc khi test đỏ
1. Đọc thông báo → đối chiếu hợp đồng (ARCHITECTURE §4, API §1, DESIGN §10).
2. Nếu **code** sai → sửa code.
3. Chỉ sửa **test** khi test mâu thuẫn với PRD/tài liệu; khi đó **sửa tài liệu trước**, ghi lý do vào báo cáo.
4. Không xoá/`skip`/nới lỏng assertion để "xanh".
5. E2E flaky: dùng `expect(...).toBeVisible()`/`toHaveText` (auto-wait), không `waitForTimeout`.

## 10. Rủi ro kiểm thử
| Rủi ro | Giảm thiểu |
|---|---|
| Playwright không cài được Chromium | `npx playwright install chromium`; hoặc chạy thủ công theo `cases/` bằng trình duyệt |
| Cổng 4173 bận | Đóng tiến trình cũ, hoặc đặt `reuseExistingServer` |
| Sandbox chặn kết nối localhost | Báo người dùng chạy `npm run test:e2e` trên máy; không phá cơ chế sandbox |
| Test phụ thuộc giờ | Unit dùng `NOW` cố định; E2E không khẳng định giờ cụ thể (chỉ định dạng) |

