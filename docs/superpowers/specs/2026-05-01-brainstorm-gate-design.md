# Thiết kế: Brainstorm Gate cho propose/new-change (brainstorm-root)

## Bối cảnh

Hiện tại workflow `openspec-propose` và `openspec-new-change` chưa ép buộc đi qua bước brainstorming trước khi tạo tiếp các artifact ở schema `brainstorm-root`.

Mục tiêu của thay đổi này là:

- Bắt buộc hoàn tất brainstorming trước khi sinh artifact tiếp theo.
- Tự động chuyển vào flow brainstorm trong cùng phiên (không bắt user chạy lệnh khác).
- Chỉ tiếp tục khi brainstorm đã được xác nhận.
- Khi user xác nhận trong chat, tự động ghi marker approved vào `brainstorm.md`.

## Phạm vi

Áp dụng cho cả:

- Skill templates (nhánh `brainstorm-root`):
  - `getBrainstormRootProposeSkillTemplate()`
  - `getBrainstormRootNewChangeSkillTemplate()`
- Command templates (nhánh `brainstorm-root`):
  - `getOpsxBrainstormRootProposeCommandTemplate()`
  - `getOpsxBrainstormRootNewCommandTemplate()`

Trong các file:

- `src/core/templates/workflows/brainstorm-root/propose.ts`
- `src/core/templates/workflows/brainstorm-root/new-change.ts`

Ngoài phạm vi trực tiếp của thay đổi này:

- `src/core/templates/workflows/spec-driven/propose.ts`
- `src/core/templates/workflows/spec-driven/new-change.ts`

## Yêu cầu chức năng

### 1) Gate bắt buộc cho schema `brainstorm-root`

Khi schema của change là `brainstorm-root`, workflow phải kiểm tra trạng thái brainstorming trước khi cho phép tạo artifact kế tiếp.

### 2) Auto-redirect sang brainstorming

Nếu chưa đạt điều kiện approved:

- Không tiếp tục tạo artifact khác.
- Tự động chuyển sang flow brainstorming trong cùng phiên.
- Tạo hoặc cập nhật `openspec/changes/<change-name>/brainstorm.md`.

### 3) Điều kiện đạt gate (OR)

Brainstorm được xem là đã duyệt nếu thỏa **một trong hai** điều kiện:

- `brainstorm.md` đã có marker approved.
- User đã xác nhận đồng thuận trong chat theo nhận diện ngữ nghĩa (không chỉ keyword cứng), có guardrail để tránh false-positive.

Guardrail cho chat-confirm:

- Có tín hiệu đồng thuận tích cực trong ngữ cảnh quyết định brainstorm hiện tại.
- Không có tín hiệu phủ định/trì hoãn/muốn sửa thêm trong cùng ngữ cảnh.
- Nếu tín hiệu mâu thuẫn hoặc không đủ rõ: không pass gate tự động, phải hỏi lại một câu xác nhận rõ.

### 4) Auto-write marker khi user confirm trong chat

Nếu user confirm trong chat nhưng file chưa có marker, workflow phải tự cập nhật `brainstorm.md` để thêm trạng thái approved trước khi tiếp tục.

## Thiết kế kỹ thuật

### A. Policy block dùng chung

Tạo một policy block (helper text) để tái sử dụng cho cả `propose` và `new-change`, tránh lệch logic giữa các template.

Policy block phải mô tả rõ:

- Phạm vi áp dụng: chỉ `brainstorm-root`.
- Trình tự bắt buộc:
  1. Kiểm tra marker/file.
  2. Nếu chưa approved thì chuyển brainstorm.
  3. Chờ xác nhận user.
  4. Ghi marker approved nếu xác nhận đến từ chat.
  5. Sau đó mới tiếp tục artifact flow.

### B. Marker format

Dùng frontmatter marker trong `brainstorm.md`:

```yaml
---
brainstorm_status: approved
approved_at: <ISO-8601 timestamp>
---
```

Nguyên tắc cập nhật:

- Nếu file chưa có frontmatter: thêm frontmatter ở đầu file.
- Nếu đã có frontmatter: cập nhật/merge field, không phá nội dung chính.
- Nếu đã approved từ trước: không hỏi lại và không ghi đè không cần thiết.
- Nếu parse frontmatter lỗi: block flow, yêu cầu normalize `brainstorm.md` trước khi kiểm tra lại gate.

### C. Hành vi riêng từng workflow

#### `openspec-new-change` (nhánh `brainstorm-root`)

- Sau khi tạo change và xác định schema/profile:
  - Nếu không phải `brainstorm-root`: giữ flow hiện tại.
  - Nếu là `brainstorm-root`: artifact đầu tiên phải đi qua brainstorm gate trước.
- Không hiển thị hướng dẫn tạo artifact tiếp theo khi gate chưa pass.

#### `openspec-propose` (nhánh `brainstorm-root`)

- Trước vòng lặp tạo artifact theo dependency:
  - Chèn pre-check brainstorm gate cho `brainstorm-root`.
- Khi gate chưa pass:
  - Tạm dừng artifact loop.
  - Chuyển brainstorm flow.
  - Chỉ resume loop sau khi approved.

## Error handling

- Nếu `brainstorm.md` chưa tồn tại: tạo file trong flow brainstorming.
- Nếu user đã confirm nhưng ghi marker thất bại:
  - Báo lỗi rõ ràng.
  - Không được tiếp tục artifact flow.
  - Yêu cầu retry thao tác cập nhật file.
- Nếu parse frontmatter lỗi:
  - Không coi là approved.
  - Yêu cầu normalize file rồi kiểm tra lại.
  - Không auto-fix và không bypass gate chỉ vì có chat confirm.

## Test strategy

Mục tiêu test ở vòng này: đảm bảo nội dung template phản ánh đúng policy mới.

1. Cập nhật test assertions cho:
   - `openspec-propose` skill + command
   - `openspec-new-change` skill + command
2. Assert các ý bắt buộc xuất hiện trong instructions:
   - Gate theo `brainstorm-root`
   - Auto-redirect sang brainstorming khi chưa approved
   - Điều kiện OR (marker hoặc chat confirm)
   - Auto-write marker khi confirm trong chat
   - Guardrail cho chat confirm linh hoạt theo ngữ nghĩa
   - Parse frontmatter lỗi thì block và yêu cầu normalize
3. Cập nhật parity/hash tests nếu có thay đổi checksum template.
4. Assert regression boundary:
   - `spec-driven/propose` và `spec-driven/new-change` không bị thêm brainstorm gate policy.

Không mở rộng sang integration runtime mới trong thay đổi này để giữ scope tập trung.

## Tác động và tương thích

- Backward-compatible với schema khác `brainstorm-root` (không đổi hành vi).
- Giữ nguyên hành vi ở nhánh `spec-driven` cho `propose/new-change`.
- Tăng tính nhất quán cho profile brainstorm và giảm khả năng tạo artifact khi chưa chốt thiết kế.
- Có thể cần cập nhật các test snapshot/hash liên quan template generation.

## Ngoài phạm vi

- Không thay đổi engine runtime ngoài phần câu chữ template/workflow instructions.
- Không thay đổi command khác ngoài `propose` và `new-change`.
- Không chỉnh luồng `apply` trong thay đổi này.

## Tiêu chí hoàn tất

- Cả 4 template mục tiêu đều có policy gate mới.
- Nội dung hướng dẫn thể hiện rõ auto-redirect và điều kiện approved OR.
- Có chỉ dẫn auto-write marker khi chat confirm cho cả `propose` và `new-change`.
- Có guardrail cho chat confirm linh hoạt theo ngữ nghĩa.
- Frontmatter lỗi bị block và yêu cầu normalize trước khi tiếp tục.
- Test template liên quan pass sau khi cập nhật.
