# Thiết kế hỗ trợ profile `brainstorm` và đồng bộ schema `brainstorm-root`

## 1) Mục tiêu

Bổ sung profile built-in `brainstorm` cho lệnh `openspec config profile` và toàn bộ luồng `init/update/migration`, đồng thời tự động đồng bộ `openspec/config.yaml` sang `schema: brainstorm-root` khi profile hiệu lực là `brainstorm`.

Mục tiêu chính:

- Cải thiện trải nghiệm brainstorm-first bằng một profile chuyên dụng, không buộc người dùng cấu hình thủ công nhiều bước.
- Giữ rõ ràng ranh giới giữa profile (bộ workflow/command được cài) và schema (đồ thị artifact).
- Đảm bảo hành vi nhất quán, có kiểm thử hồi quy đầy đủ cho `init`, `update`, `migration`.

## 2) Phạm vi

### Trong phạm vi

- Thêm giá trị profile mới: `brainstorm`.
- Thêm tập workflow mặc định cho profile `brainstorm`.
- Cập nhật logic resolve workflow theo profile trong lõi.
- Cập nhật luồng `init/update/migration` để đồng bộ `openspec/config.yaml`:
  - Nếu profile hiệu lực là `brainstorm`, đặt `schema: brainstorm-root`.
- Cập nhật tài liệu/help text/changelog liên quan profile mới.
- Bổ sung và chỉnh sửa test cho profile, init, update, migration, drift.

### Ngoài phạm vi

- Không thay đổi cấu trúc schema `brainstorm-root`.
- Không thay đổi semantics precedence runtime hiện tại của `--schema`.
- Không thêm profile kết hợp kiểu `core+brainstorm` trong đợt này.

## 3) Kiến trúc và quyết định thiết kế

### Quyết định 1: Dùng profile mới `brainstorm` (không dùng tên `brainstorm-root` cho profile)

Lý do:

- Tránh nhập nhằng khái niệm profile và schema.
- Giữ khả năng thay đổi schema mặc định trong tương lai mà không làm lệch ngữ nghĩa profile.

### Quyết định 2: Đồng bộ schema trong `openspec/config.yaml` khi chạy `init/update/migration`

Khi profile hiệu lực là `brainstorm`, các lệnh trên sẽ upsert/normalize `openspec/config.yaml` thành:

```yaml
schema: brainstorm-root
```

Lý do:

- Đảm bảo dự án luôn ở trạng thái đúng theo profile đã chọn.
- Giảm lỗi cấu hình lệch giữa command profile và workflow schema.

### Quyết định 3: Giữ precedence runtime của `--schema`

Precedence vẫn như hiện tại:

1. Cờ CLI `--schema`
2. Metadata change (`.openspec.yaml`)
3. Project config (`openspec/config.yaml`)
4. Mặc định hệ thống

Việc normalize `openspec/config.yaml` chỉ đặt mặc định cấp dự án; không phá override runtime của lệnh cụ thể.

## 4) Thiết kế thành phần

### 4.1 `src/core/profiles.ts`

- Thêm `BRAINSTORM_WORKFLOWS`.
- Mở rộng `Profile` liên quan để hỗ trợ `brainstorm`.
- Cập nhật `getProfileWorkflows()`:
  - `core` -> `CORE_WORKFLOWS`
  - `custom` -> `customWorkflows ?? []`
  - `brainstorm` -> `BRAINSTORM_WORKFLOWS`

### 4.2 Global config và validation

- Chấp nhận profile `brainstorm` ở luồng parse/validate/load/save config toàn cục.
- Đảm bảo migration từ config cũ không làm rơi giá trị profile mới.

### 4.3 Luồng `init`

- Resolve profile hiệu lực.
- Nếu là `brainstorm`, cập nhật hoặc tạo `openspec/config.yaml` với `schema: brainstorm-root`.
- Tiếp tục generate commands/skills theo profile.

### 4.4 Luồng `update`

- Đọc profile hiện tại.
- Nếu profile là `brainstorm`, normalize project config về `schema: brainstorm-root`.
- Sau đó đồng bộ commands/skills theo profile workflows.

### 4.5 Luồng `migration`

- Sau khi xác định profile đích, nếu profile là `brainstorm`, normalize project config sang `schema: brainstorm-root`.
- Ghi log migration rõ ràng để truy vết.

### 4.6 Tài liệu

- Cập nhật `docs/opsx.md` và mô tả lệnh liên quan `config profile`.
- Nêu rõ hành vi tự đồng bộ schema khi profile `brainstorm` được áp dụng qua `init/update/migration`.

## 5) Luồng dữ liệu và xử lý lỗi

## 5.1 Luồng dữ liệu

- Input: profile hiệu lực từ CLI/global config.
- Rule:
  - Nếu `profile !== brainstorm`: không ép schema.
  - Nếu `profile === brainstorm`: ép `openspec/config.yaml.schema = brainstorm-root`.
- Output:
  - Project config nhất quán với profile.
  - Workflow files được sync theo profile.

### 5.2 Xử lý lỗi

- YAML không hợp lệ trong `openspec/config.yaml`:
  - Báo lỗi parse rõ vị trí và dừng thao tác ghi.
- Không tồn tại file config:
  - Tạo file mới tối thiểu hợp lệ với `schema: brainstorm-root`.
- Không có quyền ghi:
  - Fail-fast, trả thông điệp hướng dẫn hành động tiếp theo.
- Không resolve được schema `brainstorm-root`:
  - Báo lỗi có gợi ý kiểm tra bằng lệnh schema liên quan.

## 6) Kế hoạch kiểm thử

- `test/core/profiles.test.ts`
  - `getProfileWorkflows('brainstorm')` trả đúng tập workflow.
  - `customWorkflows` không ảnh hưởng khi profile là `brainstorm`.

- `test/core/init.test.ts`
  - `--profile brainstorm` -> project config có `schema: brainstorm-root`.
  - Có config cũ khác schema -> bị normalize đúng.
  - Runtime precedence của `--schema` vẫn giữ nguyên.

- `test/core/update.test.ts`
  - Profile `brainstorm` -> normalize schema đúng.
  - Thiếu config -> tạo mới đúng.
  - Profile không phải brainstorm -> không đổi schema hiện có.

- `test/core/migration.test.ts`
  - Migration sang `brainstorm` -> đồng bộ schema đúng.
  - Migration giữ `core/custom` -> không chạm schema.

- `test/core/global-config.test.ts`
  - Validation chấp nhận `brainstorm`.
  - Load/save round-trip không mất profile.

- `test/core/profile-sync-drift.test.ts`
  - Không báo drift sai cho profile `brainstorm` khi trạng thái thực tế hợp lệ.

## 7) Rủi ro và giảm thiểu

- Rủi ro override schema ngoài ý muốn:
  - Chỉ override khi profile hiệu lực là `brainstorm`.
  - Có test bao phủ nhánh không phải brainstorm.

- Rủi ro phá hành vi cũ:
  - Bổ sung regression test cho `core/custom`.
  - Không thay đổi precedence runtime của `--schema`.

## 8) Tiêu chí hoàn thành

- Có profile `brainstorm` hoạt động xuyên suốt `config profile`, `init`, `update`, `migration`.
- `openspec/config.yaml` được đồng bộ `schema: brainstorm-root` đúng điều kiện.
- Tất cả test liên quan pass.
- Tài liệu người dùng phản ánh đúng hành vi mới.
