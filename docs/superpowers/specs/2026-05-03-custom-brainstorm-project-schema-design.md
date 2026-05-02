# Thiết kế: Đồng bộ `schema` trong `openspec/config.yaml` khi profile có brainstorm

## Bối cảnh

- Project config (`openspec/config.yaml` hoặc `openspec/config.yml`) dùng trường `schema` để chọn artifact graph (ví dụ `spec-driven`, `brainstorm-root`).
- Hiện tại chỉ có profile global **`brainstorm`** mới kích hoạt normalizer và ép `schema: brainstorm-root`. Profile **`custom`** có thể bật workflow `brainstorm` nhưng project config vẫn có thể giữ `spec-driven` hoặc ngược lại — không đồng bộ với thực tế toolchain.
- `openspec init` khi tạo file config **mới** đang luôn ghi `schema: spec-driven`, bất kể workflows hiệu lực có brainstorm hay không.

## Mục tiêu

1. **Một luật duy nhất theo workflows hiệu lực:** nếu danh sách workflow hiệu lực của user **có** `brainstorm` thì project config phải có **`schema: brainstorm-root`** sau các thao tác `init` / `update` (và các đường tương đương đã gọi normalizer hiện tại).
2. **Đồng bộ hai chiều:** nếu **không còn** `brainstorm` trong workflows hiệu lực mà project config đang là `brainstorm-root` thì đưa **`schema` về `spec-driven`** để tránh chạy sai graph artifact.
3. **`openspec config profile` (interactive, checkbox workflows):** nếu user chọn `brainstorm` mà chưa chọn `writing-plans` thì **tự thêm** `writing-plans` vào danh sách lưu (giữ preset `brainstorm` / `core` không đổi — preset brainstorm đã bao gồm đủ cặp).

## Phạm vi

### Trong phạm vi

- `src/core/project-config-normalizer.ts` — logic ép / hạ cấp `schema` dựa trên workflows hiệu lực (thay cho việc chỉ nhánh theo `profile === 'brainstorm'`).
- `src/core/init.ts` — đảm bảo luồng tạo / phát hiện config không mâu thuẫn với luật mới (`createConfig` phối hợp `ensure`).
- `src/core/update.ts` — truyền workflows hiệu lực vào normalizer.
- `src/core/migration.ts` — sau khi migrate sang `profile: custom` và gán `workflows`, gọi lại đồng bộ schema project cho phù hợp (nếu danh sách có `brainstorm`).
- `src/commands/config.ts` — sau bước checkbox chọn workflows, áp quy tắc auto-thêm `writing-plans` khi có `brainstorm`; chuẩn hóa thứ tự workflow (reuse `stableWorkflowOrder` hoặc tương đương).

### Ngoài phạm vi

- Thay đổi hành vi gate `brainstorm-root` trong template skill/command (artifact `brainstorm.md`, v.v.).
- Thêm schema project mới ngoài `spec-driven` / `brainstorm-root`.

## Thuật ngữ

- **Workflows hiệu lực:** kết quả `getProfileWorkflows(profileGlobal, workflowsGlobal)` — cùng cách `init` / `update` đang dùng để sinh skill/command.

## Yêu cầu chức năng

### RF1 — Ánh xạ brainstorm → brainstorm-root

Khi workflows hiệu lực **chứa** `'brainstorm'`:

- Project phải có `openspec/config.yaml` hoặc `openspec/config.yml` với `schema: brainstorm-root`.
- Nếu file chưa tồn tại: tạo như hiện tại (prefer `config.yaml`).
- Nếu file đã tồn tại: cập nhật trường `schema`; **giữ nguyên** các khóa khác (`context`, `rules`, khóa tương lai không biết trước) bằng merge object giống hành vi hiện tại.

### RF2 — Gỡ brainstorm → hạ cấp schema

Khi workflows hiệu lực **không** chứa `'brainstorm'`:

- Nếu giá trị `schema` hiện tại là `brainstorm-root`: ghi lại **`spec-driven`**.
- Nếu `schema` khác: không đổi (tránh đoán chỉnh sử tay của user cho schema lạ).

### RF3 — `init`: tạo config mới

Khi không có config trước đó và bước tạo file config được thực thi:

- Nếu workflows hiệu lực có `brainstorm`: nội dung mặc định phải dùng `brainstorm-root` (nhất quán với RF1; không tạo rồi lệch với một lần ghi sau).

### RF4 — Checkbox profile: đồng hành `writing-plans`

Trong luồng interactive chọn workflows, sau khi user xác nhận danh sách:

- Nếu có `'brainstorm'` và chưa có `'writing-plans'`: **thêm** `'writing-plans'`.
- Sắp xếp lại theo thứ tự ổn định đã dùng trong CLI (ảo hóa từ `ALL_WORKFLOWS` hoặc helper hiện có).

### RF5 — Migration

Sau migrate sang `profile: custom` và gán `workflows` từ artifact đã phát hiện: gọi đồng bộ schema theo workflows đó để RF1/R2 áp dụng cho project hiện tại.

## Ràng buộc và đồng bộ đặc biệt

- **Định danh preset:** không thêm workflow mới bằng tay ngoài `ALL_WORKFLOWS` trong auto-thêm — chỉ `'writing-plans'` (đã là workflow hợp lệ trong hệ thống).

## Kiểm thử (mong đợi)

1. **`project-config-normalizer`:** custom + workflows có brainstorm → ép `brainstorm-root`; bỏ brainstorm → `brainstorm-root` về `spec-driven`.
2. **Preset:** `brainstorm` profile vẫn cho `brainstorm-root` (hồi quy).
3. **`config profile` (unit hoặc helper thuần):** chỉ brainstorm → sau bước normalize có brainstorm + writing-plans; thứ tự không lộn xộn.
4. **Migration có brainstorm trong detected workflows:** project config được chỉnh tương ứng (nếu có thể mô phỏng trong test).

## Tiêu chí hoàn thành

- Với profile `custom` và `workflows` gồm `brainstorm`, sau `openspec init` hoặc `openspec update` file project config phản ánh **`schema: brainstorm-root`**.
- Gỡ `brainstorm` khỏi workflows hiệu lực không để project kẹt ở `brainstorm-root`.
- Checkbox chọn brainstorm luôn dẫn đến cấu hình có `writing-plans` khi lưu (trừ khi user chỉ brainstorm và hệ thống auto-bổ sung — kết quả cuối vẫn có cả hai).
