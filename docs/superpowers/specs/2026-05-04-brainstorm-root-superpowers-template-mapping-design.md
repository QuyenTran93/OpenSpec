# Thiết kế: đồng bộ template OpenSpec với skill Superpowers (brainstorm-root)

**Ngày:** 2026-05-04  
**Trạng thái:** Đã duyệt khái niệm (hội thoại)

---

## 1) Vấn đề

Template `openspec-brainstorm` và `openspec-writing-plans` yêu cầu chạy skill Superpowers tương ứng, nhưng lại **cấm** hoặc **thay đường dẫn** so với văn bản trong skill Superpowers (`docs/superpowers/specs/…`, `docs/superpowers/plans/…`). Agent chỉ đọc một nguồn sẽ thấy **mâu thuẫn** (lệch pha). Ngoài ra, cặp skill/command trong `brainstorm-root` chưa bám quy ước **spec-driven** (đặc biệt phần **Input** và tên section **Guardrails**).

---

## 2) Mục tiêu

- Giữ **một nguồn sự thật** cho artifact theo từng change: `openspec/changes/<change-name>/brainstorm.md` và `execution-plan.md` (không mở rộng dual-write sang `docs/superpowers/…` trong workflow này).
- Làm **explicit** lớp adapter: vẫn làm theo quy trình/tinh thần skill Superpowers, nhưng **ánh xạ đường dẫn và bước** sang quy ước OpenSpec.
- **Đồng bộ** nội dung cốt lõi giữa skill và command; chỉ lệch những chỗ **có chủ đích** giống spec-driven.

---

## 3) Quyết định thiết kế

### 3.1 Ánh xạ Superpowers → OpenSpec (nội dung bắt buộc trong template)

**Brainstorming (`brainstorming` → `openspec-brainstorm`):**

- Mọi chỗ skill Superpowers yêu cầu ghi design tại `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`: trong profile brainstorm-root, **bước tương đương** là cập nhật `openspec/changes/<change-name>/brainstorm.md` với cùng tiêu chí chất lượng (rõ ràng, không placeholder mơ hồ, self-review, v.v.).
- **Không** tạo file mới dưới `docs/superpowers/specs/` khi chạy workflow brainstorm-root này (tránh trùng nguồn sự thật với artifact của change).
- Bước **“commit design doc”** trong skill Superpowers `brainstorming`: **không áp dụng** cho workflow OpenSpec này — template **không** hướng dẫn ánh xạ bước đó sang commit `brainstorm.md` hay bất kỳ nghĩa vụ commit ring-fence nào; cập nhật nội dung `brainstorm.md` theo tiến độ phiên làm việc.

**Writing plans (`writing-plans` → `openspec-writing-plans`):**

- Mọi chỗ skill Superpowers nói lưu plan tại `docs/superpowers/plans/…`: lưu tại `openspec/changes/<change-name>/execution-plan.md`.
- Header, cấu trúc task, self-review, quy tắc “no placeholders” của skill Superpowers **vẫn áp dụng**; chỉ đổi **đích file**.
- Phần execution handoff (subagent-driven vs inline): vẫn hợp lệ sau khi plan đã ghi đúng `execution-plan.md`; thông báo hoàn thành plan phải dùng đường dẫn OpenSpec thực tế, không dẫn tới `docs/superpowers/plans/…`.

### 3.2 Đồng bộ skill và command (bám spec-driven)

- **Khối ánh xạ** ở trên: **giống hệt** trong `instructions` (skill) và `content` (command) cho từng workflow — khuyến nghị **một hằng chuỗi dùng chung** trong TypeScript để skill/command không lệch sau khi sửa.
- Thêm hoặc chuẩn hoá **`**Input**`** ở **command** (`OPSX: Brainstorm`, `OPSX: Writing-plans`): tham số sau slash command (cùng style `propose` / `new-change` / `apply`). Skill giữ cách diễn đạt theo “user đã nêu tên change / ngữ cảnh phiên…”.
- Đổi tên section **Requirements** trên command thành **Guardrails** nếu skill dùng **Guardrails**, để **khớp** cặp propose spec-driven.
- Phần thân quy trình (change selection, artifact bắt buộc, cấm implement trong bước này, v.v.): **song song** đầy đủ giữa skill và command — không để command là bản rút gọn thiếu requirement (hiện tượng đã thấy ở `writing-plans`).

### 3.3 Phạm vi file mã

- `src/core/templates/workflows/brainstorm-root/brainstorm.ts`
- `src/core/templates/workflows/brainstorm-root/writing-plans.ts`
- Tuỳ chọn: module nhỏ cùng thư mục (ví dụ export chuỗi mapping) — ưu tiên một nguồn chuỗi cho mỗi workflow.

### 3.4 Kiểm thử

- Cập nhật `EXPECTED_BRAINSTORM_ROOT_FUNCTION_HASHES` trong `test/core/templates/skill-templates-parity.test.ts` sau khi đổi payload.
- Tuỳ chọn: thêm `expect(...).toContain(...)` ngắn để neo cụm từ khóa mapping (nếu không làm test quá cứng).

### 3.5 Ngoài phạm vi lần này

- Không sửa repository Superpowers ngoài OpenSpec.
- Không đổi `propose.ts` / `apply-change.ts` trừ khi sau này cần một dòng cross-link.

---

## 4) Tự kiểm nhanh (self-review)

- Không còn “TBD” mang tính triển khai; phạm vi một implementation plan sau này.
- Không mâu thuẫn với thiết kế cũ `2026-04-28-openspec-superpowers-brainstorm-root-design.md` (override `execution-plan.md` đã nêu; bản này cụ thể hoá **văn bản template** và **parity skill/command**).

---

## 5) Việc tiếp theo

Sau khi đọc và chốt file này: lập **implementation plan** (skill `writing-plans`) rồi chỉnh mã theo mục 3.
