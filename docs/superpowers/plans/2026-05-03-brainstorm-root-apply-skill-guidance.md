# Brainstorm-root apply orchestration guidance — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Worktree:** Chính sách chủ của user: không dùng skill `using-git-worktrees`; triển khai plan trong workspace hiện tại — bỏ qua gợi ý dedicated worktree trong skill `writing-plans` global.

**Goal:** Mở rộng bước gate `execution-plan` trong template apply của `brainstorm-root` để làm rõ inline vs subagent vs `executing-plans`, và cấm mặc định `using-git-worktrees`, đúng spec `docs/superpowers/specs/2026-05-03-brainstorm-root-apply-skill-guidance-design.md`.

**Architecture:** Sửa một hằng chuỗi dùng chung (`APPLY_EXECUTION_PLAN_GATE_STEP`) trong `apply-change.ts` để skill và OPSX Apply đồng bộ; cập nhật test parity (assert ngữ nghĩa + hash payload hàm template brainstorm-root).

**Tech Stack:** TypeScript (template strings), Vitest (`vitest`), `vitest run`/`pnpm test` tùy cách repo chạy test.

---

## File map

| Path | Role |
|------|------|
| `src/core/templates/workflows/brainstorm-root/apply-change.ts` | Hằng `APPLY_EXECUTION_PLAN_GATE_STEP`: thay một dòng guidance bằng khối bullet mới |
| `test/core/templates/skill-templates-parity.test.ts` | Assert skill/command; cập nhật `EXPECTED_BRAINSTORM_ROOT_FUNCTION_HASHES` cho hai factory apply |
| `test/core/templates/workflows/apply-change.plan-gate.test.ts` | (Khuyến nghị) Mở rộng checker bước 6 để không regress nội dung orchestration |

---

### Task 1: Failing assertions (semantic parity)

**Files:**
- Modify: `test/core/templates/skill-templates-parity.test.ts` (inside `requires brainstorm-root apply templates to mention execution-plan gate and planning handoff`)

- [ ] **Step 1: Thêm các expect sau** (skill và command như nhau sau khi lấy `instructions`/`content`)

Yêu cầu substring (skill template):

```ts
expect(applySkill.instructions).toContain('superpowers:subagent-driven-development');
expect(applySkill.instructions).toContain('superpowers:executing-plans');
expect(applySkill.instructions).toContain('if Task/subagent capabilities are **available**');
expect(applySkill.instructions).toContain('using-git-worktrees');

expect(applyCommand.content).toContain('superpowers:subagent-driven-development');
expect(applyCommand.content).toContain('superpowers:executing-plans');
expect(applyCommand.content).toContain('if Task/subagent capabilities are **available**');
expect(applyCommand.content).toContain('using-git-worktrees');
```

- [ ] **Step 2: Chạy test — kỳ vọng một phần FAIL**

```bash
cd /home/welcome/User/Development/github.com/Downloads/OpenSpec && pnpm exec vitest run test/core/templates/skill-templates-parity.test.ts -t "requires brainstorm-root apply"
```

Kỳ vọng: FAIL với thông báo thiếu chuỗi `superpowers:` hoặc câu `if Task/subagent…` cho đến khi Task 2 hoàn tất.

- [ ] **Step 3: Commit (tùy chọn)**

```bash
git add test/core/templates/skill-templates-parity.test.ts
git commit -m "test(workflows): assert brainstorm-root apply orchestration guidance"
```

---

### Task 2: Cập nhật template gate

**Files:**
- Modify: `src/core/templates/workflows/brainstorm-root/apply-change.ts`

- [ ] **Step 1: Thay toàn bộ thân của `APPLY_EXECUTION_PLAN_GATE_STEP`**

Giữ nguyên phần đầu (tiêu đề bước 6, check file, nhắc `writing-plans`, khối *Clarify execution mode*).

**Xóa** dòng cuối cùng trong template (bắt đầu bằng `Mention implementation guidance:`).

**Thay** bằng khối sau (paste nguyên, giữ indentation 3 space trước mỗi dòng của nội dung bước 6):

```typescript
const APPLY_EXECUTION_PLAN_GATE_STEP = (
  rerunInstruction: string
): string => `6. **Gate on execution plan before implementation loop**

   Before implementation starts, check for:
   - \`openspec/changes/<name>/execution-plan.md\`

   If missing, pause and ask the user to run \`writing-plans\` and save \`execution-plan.md\` at that path, then rerun ${rerunInstruction}.

   Clarify execution mode:
   - \`execution-plan.md\` guides the micro-step implementation order
   - \`tasks.md\` remains the checkbox progress tracker (\`- [ ]\` -> \`- [x]\`)

   Implementation guidance:
   - **Small, narrowly scoped work:** continue inline in this session.
   - **Broader work, multi-step plans, or work that splits cleanly across parallel lanes:** if Task/subagent capabilities are **available**, read and follow \`superpowers:subagent-driven-development\`; **otherwise** read and follow \`superpowers:executing-plans\`, treating \`execution-plan.md\` as the authoritative step ordering.
   - **Do not** default to \`using-git-worktrees\` for OpenSpec apply flows unless the user **explicitly** asks for isolated git worktrees.`;
```

- [ ] **Step 2: Chạy lại test semantic**

```bash
pnpm exec vitest run test/core/templates/skill-templates-parity.test.ts -t "requires brainstorm-root apply"
```

Kỳ vọng: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/core/templates/workflows/brainstorm-root/apply-change.ts
git commit -m "feat(workflows): expand brainstorm-root apply orchestration guidance"
```

---

### Task 3: Cập nhật hash brainstorm-root parity

**Files:**
- Modify: `test/core/templates/skill-templates-parity.test.ts` (`EXPECTED_BRAINSTORM_ROOT_FUNCTION_HASHES`)

- [ ] **Step 1: Chạy toàn test file parity — ghép snapshot diff**

```bash
pnpm exec vitest run test/core/templates/skill-templates-parity.test.ts -t "preserves brainstorm-root template function payloads exactly"
```

- [ ] **Step 2: Sửa map `EXPECTED_BRAINSTORM_ROOT_FUNCTION_HASHES` chỉ hai key**

Giữ các key khác nguyên. Cập nhật giá trị SHA-256 hai key sau theo stdout Vitest (`expected … to deeply equal`): 

- `getBrainstormRootApplyChangeSkillTemplate`
- `getOpsxBrainstormRootApplyCommandTemplate`

Không chỉnh key apply nào khác.

- [ ] **Step 3: Chạy lại parity brainstorm-root**

Kỳ vọng: PASS.

- [ ] **Step 4: Commit**

```bash
git add test/core/templates/skill-templates-parity.test.ts
git commit -m "test(workflows): refresh brainstorm-root apply template hashes"
```

---

### Task 4: Kiểm tra plan gate slice (tuỳ chọn, khuyến nghị)

**Files:**
- Modify: `test/core/templates/workflows/apply-change.plan-gate.test.ts`

- [ ] **Step 1: Trong regex slice giữa bước 6 và 7, assert thêm**

Sau các expect hiện có trên `step6To7?.[1]`, thêm:

```ts
expect(step6To7?.[1]).toContain('superpowers:subagent-driven-development');
expect(step6To7?.[1]).toContain('using-git-worktrees');
```

Áp cho cả hai template brainstorm-root trong test đầu file (đã có `expectPlanGatePrecedesImplementationLoop`).

- [ ] **Step 2: Chạy**

```bash
pnpm exec vitest run test/core/templates/workflows/apply-change.plan-gate.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add test/core/templates/workflows/apply-change.plan-gate.test.ts
git commit -m "test(workflows): extend apply plan gate assertions for brainstorm-root"
```

---

### Task 5: Xác nhận cuối

- [ ] **Step 1: Chạy toàn parity + plan gate**

```bash
pnpm exec vitest run test/core/templates/skill-templates-parity.test.ts test/core/templates/workflows/apply-change.plan-gate.test.ts
```

- [ ] **Step 2: (Nếu CI dùng script khác)** chạy `pnpm test` hoặc `./scripts/test-with-nvm-node.sh` theo `package.json` / AGENTS.

- [ ] **Step 3:** Nếu mọi thứ xanh, không còn commit rời — hoặc gộp fix nhỏ một commit `chore: …` nếu cần.

---

## Self-review (plan vs spec)

| Yêu cầu spec | Task |
|--------------|------|
| Phong cách C, bullet ngắn | Task 2 |
| Phân nhánh Task/subagent vs `executing-plans` | Task 2 + assert `if Task/subagent…` |
| Không mặc định worktree; chỉ khi user explicit | Task 2 + assert `using-git-worktrees` |
| Chỉ brainstorm-root apply | Chỉ `brainstorm-root/apply-change.ts` |
| Test: hai skill name + điều kiện | Task 1 |
| Hash parity | Task 3 |
| Không assert `not.toContain` worktrees | Không thêm assert loại đó |

---

## Execution handoff

Plan đã lưu tại `docs/superpowers/plans/2026-05-03-brainstorm-root-apply-skill-guidance.md`.

**1. Subagent-driven (khuyến nghị)** — mỗi task một subagent, review giữa các task.

**2. Inline** — chạy tuần tự task trong phiên này với skill `executing-plans`.

Bạn muốn triển khai theo hướng nào?
