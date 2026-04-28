# Thiết kế đổi mặc định apply của `brainstorm-root`: inline thay cho subagent-driven

## Bối cảnh

Schema `brainstorm-root` (phiên bản hiện tại trong repo) định nghĩa phase `apply` với `apply.instruction` trong `schemas/brainstorm-root/schema.yaml` như sau:

- **Preflight** yêu cầu `superpowers:subagent-driven-development` (và transitive TDD, code review).
- **Mặc định:** gọi `superpowers:subagent-driven-development` để chạy micro-task trong `plan.md`.
- **Inline** trong phiên chính chỉ khi người dùng **nói rõ** (ví dụ `apply inline`, `inline mode`).
- Slash command và skill `openspec-apply-change` cho profile brainstorm nhân đôi gate qua `APPLY_EXECUTION_PLAN_GATE_STEP` trong `src/core/templates/workflows/brainstorm-root/apply-change.ts`, tham chiếu cùng policy.

Người dùng muốn **đảo mặc định**: thực thi chính **inline** trong phiên hiện tại; preflight theo **phương án B** (không còn bắt buộc `subagent-driven-development`); **subagent** chỉ trong phạm vi **review** hoặc **research**.

## Mục tiêu

- Mặc định: agent chính triển khai `plan.md`, cập nhật `tasks.md`, giữ kỷ luật TDD + review + verification.
- Preflight fail-closed nếu thiếu bộ skill phù hợp đường inline (danh sách canonical bên dưới).
- Cho phép dùng subagent hoặc `Task` tool chỉ cho **review** (ví dụ vòng theo `requesting-code-review`) và **research** (thăm dò codebase, explore, read-only); **không** dùng subagent để chạy toàn bộ vòng implement kiểu orchestration per-task như `subagent-driven-development`.
- Giữ policy hiện có: không `git commit` mặc định; không mặc định `using-git-worktrees`; không dùng `superpowers:executing-plans` làm lối tắt thay chuỗi kỷ luật (câu chữ được cập nhật cho bối cảnh inline).

## Phi mục tiêu

- **Không** đổi chuỗi artifact `brainstorm` → `tasks` → `plan` → `apply`.
- **Không** đổi schema `spec-driven` hay các schema khác.
- **Không** thêm lại `subagent-driven-development` làm executor mặc định; **không** thiết kế ngoại lệ “user opt-in chạy full plan bằng subagent-driven” trong phạm vi tài liệu này (có thể mở rộng sau nếu có yêu cầu riêng).
- **Giữ** `version: 2` trong `schemas/brainstorm-root/schema.yaml` trừ khi team quyết định bump có chủ đích để báo breaking — mặc định triển khai giữ `2` để giảm churn test tên “v2”.

## Quyết định kỹ thuật

### 1 — Canonical policy vẫn nằm trong `schemas/brainstorm-root/schema.yaml`

Toàn bộ mô tả preflight, đường inline mặc định, phạm vi subagent review/research, và cấm `executing-plans` được viết lại rõ lớp trong `apply.instruction`. Đây vẫn là nguồn đọc khi agent gọi `openspec instructions apply --json`.

### 2 — Preflight bắt buộc (fail-closed)

Trước khi implement, agent xác nhận có trong danh sách skill (tên đầy đủ như convention hiện tại):

- `superpowers:test-driven-development`
- `superpowers:requesting-code-review`
- `superpowers:verification-before-completion`

**Không** yêu cầu `superpowers:subagent-driven-development` cho preflight.

### 3 — Đồng bộ template gate

`APPLY_EXECUTION_PLAN_GATE_STEP` trong `apply-change.ts` (skill và command brainstorm-root) cập nhật checklist preflight và câu “Follow CLI `instruction`” cho khớp: default inline, giới hạn subagent, không fallback `executing-plans`, giữ marker `git commit`, `using-git-worktrees`, `plan.md`, `schemas/brainstorm-root/schema.yaml`, `writing-plans` theo nhu cầu test hiện có (điều chỉnh assertion nếu marker đổi tên nhưng vẫn giữ ý).

### 4 — Gợi ý chỉnh `plan.instruction`

Một hoặc hai câu trong phase `plan`: `/opsx:apply` sở hữu chính sách thực thi; **mặc định inline**; subagent chỉ trong phạm vi review/research (không chọn chế độ chi tiết tại bước plan).

## Phạm vi tệp và kiểm thử (implement sau khi spec được chấp nhận trong repo)

| Tệp | Thay đổi dự kiến |
|-----|------------------|
| `schemas/brainstorm-root/schema.yaml` | Viết lại `apply.instruction` theo các quyết định trên. |
| `schemas/brainstorm-root/schema.yaml` (`plan.instruction`) | Cập nhật câu giao policy cho apply. |
| `src/core/templates/workflows/brainstorm-root/apply-change.ts` | `APPLY_EXECUTION_PLAN_GATE_STEP` khớp schema. |
| `test/schemas/brainstorm-root.instruction.test.ts` | Marker mới: `verification-before-completion`, chính sách inline mặc định, review/research; bỏ hoặc thay assertion bắt buộc một dòng cố định cho `subagent-driven-development` nếu không còn trong schema. |
| `test/integration/brainstorm-root-flow.test.ts` | Assertion `generateApplyInstructions` khớp nội dung `apply.instruction` mới. |
| `test/core/templates/workflows/apply-change.plan-gate.test.ts` | Marker trong step 6 khớp gate mới (có thể thay `superpowers:subagent-driven-development` bằng tập skill preflight mới). |
| `test/core/templates/skill-templates-parity.test.ts` | Marker brainstorm-root apply + cập nhật hash parity sau khi đổi template. |

## Rủi ro và giảm thiểu

- **Agent quen flow cũ:** làm rõ trong schema cụm từ kiểu “primary session”, “default”, “do not delegate full implementation to subagents”.
- **Drift schema ↔ TS:** mọi thay đổi policy apply phải sửa song song YAML và `APPLY_EXECUTION_PLAN_GATE_STEP`, rồi chạy bộ test liên quan.

## Kiểm chứng sau implement

Chạy ít nhất:

`pnpm test -- test/schemas/brainstorm-root.instruction.test.ts test/integration/brainstorm-root-flow.test.ts test/core/templates/workflows/apply-change.plan-gate.test.ts test/core/templates/skill-templates-parity.test.ts`

và sửa cho đến khi xanh.

## Bước tiếp theo trong quy trình

Sau khi tài liệu này được merge hoặc được người dùng xác nhận đọc xong trong nhánh làm việc, dùng skill **writing-plans** để sinh `plan.md` triển khai chi tiết (từng bước chỉnh sửa + cập nhật test + hash parity).
