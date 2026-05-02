# Thiết kế: Hướng dẫn skill/orchestration trong apply cho `brainstorm-root`

## Bối cảnh

- Template `brainstorm-root` cho `openspec-apply-change` và lệnh `OPSX: Apply` dùng chung khối bước 6 **Gate on execution plan** (`APPLY_EXECUTION_PLAN_GATE_STEP` trong `src/core/templates/workflows/brainstorm-root/apply-change.ts`).
- Khối đó đã phân biệt `execution-plan.md` và `tasks.md`, và có một câu ngắn gợi ý inline so với `subagent-driven-development` / `executing-plans` khi việc lớn hoặc song song.
- Chưa nêu rõ **khi nào ưu tiên subagent** so với **làm tuần tự theo plan**, và chưa loại trừ rõ ràng việc mặc định dùng `using-git-worktrees` trong luồng apply.

## Mục tiêu

1. **Phong cách C (gợi ý theo quy mô):** giữ tinh thần “việc nhỏ → inline; việc lớn / tách được → dùng skill phù hợp”, không nâng lên mức bắt buộc kiểu banner `REQUIRED SUB-SKILL` trong `execution-plan.md`.
2. **Phân nhánh subagent:** nếu môi trường hỗ trợ Task/subagent thì **đọc và làm theo** `superpowers:subagent-driven-development` cho khối công việc rộng hoặc song song; **nếu không** thì **làm theo** `superpowers:executing-plans` bám `execution-plan.md`.
3. **Worktree:** **không** lấy `using-git-worktrees` làm mặc định cho luồng apply; chỉ xem xét khi người dùng yêu cầu rõ ràng.

## Phạm vi

### Trong phạm vi

- `src/core/templates/workflows/brainstorm-root/apply-change.ts` — mở rộng nội dung chuỗi `APPLY_EXECUTION_PLAN_GATE_STEP` (skill và command cùng hưởng).
- `test/core/templates/skill-templates-parity.test.ts` — bổ sung assert về các chuỗi bắt buộc (xem dưới).

### Ngoài phạm vi

- `spec-driven/apply-change.ts` và mọi template workflow khác.
- Thay đổi CLI `openspec instructions apply` hoặc semantics gate file (vẫn chỉ kiểm tra tồn tại `execution-plan.md` như hiện tại).
- Cập nhật skill `writing-plans` (trừ ghi chú chính sách: kế hoạch triển khai **không** yêu cầu worktree riêng cho user này).

## Chuẩn câu chữ (tiếng Anh, nhúng vào template)

Sau khối “Clarify execution mode” trong bước 6, thay / bổ sung đoạn hướng dẫn triển khai bằng văn bản tương đương ý sau (có thể chỉnh liên từ nhẹ khi implement, giữ nguyên ý):

- Small, narrowly scoped work: continue **inline** in the current session.
- Broader work, multi-step execution plans, or work that splits cleanly across **parallel** lanes: **if** Task/subagent capabilities are available, follow **`superpowers:subagent-driven-development`**; **otherwise** follow **`superpowers:executing-plans`** using `execution-plan.md` as the step source.
- **Do not** default to **`using-git-worktrees`** for OpenSpec apply unless the user **explicitly** asks for isolated git worktrees.

## Kiểm thử

- Giữ các assert hiện có về `execution-plan.md` và `writing-plans`.
- Thêm assert tích cực: template skill và command **có** chuỗi `subagent-driven-development` và `executing-plans`.
- Thêm assert tích cực về điều kiện môi trường (ví dụ ghép `Task` hoặc `subagent` với từ nối kiểu `if` / `available` — khớp đúng câu chữ cuối trong patch).
- **Không** dùng assert `not.toContain('using-git-worktrees')` vì có thể cần nêu đúng tên skill trong câu cấm; đủ kiểm tra bằng self-review nội dung câu cấm + mục tiêu sản phẩm.

## Rủi ro và giảm thiểu

- **Rủi ro:** bước 6 dài hơn → agent lướt nhanh. **Giảm thiểu:** giữ bullet ngắn, một ý một dòng.
- **Rủi ro:** agent hiểu nhầm “available” → bỏ qua subagent. **Giảm thiểu:** câu `if` rõ ràng và fallback `executing-plans`.

## Tiêu chí hoàn thành

- Skill và command `brainstorm-root` apply phản ánh đủ ba mục tiêu ở trên.
- Test parity cập nhật và pass.
- Không thay đổi hành vi schema `spec-driven`.
