# Custom profile + brainstorm — đồng bộ `schema` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khi workflows hiệu lực có `brainstorm` (kể cả profile `custom`), project `openspec/config.yaml` phải dùng `schema: brainstorm-root`; khi gỡ `brainstorm` thì hạ `brainstorm-root` về `spec-driven`; trong `openspec config profile` (checkbox), chọn `brainstorm` mà thiếu `writing-plans` thì tự thêm `writing-plans`.

**Architecture:** Thay điều kiện normalizer từ `profile === 'brainstorm'` sang **workflows hiệu lực** (cùng nguồn với `getProfileWorkflows` trong `init`/`update`). Thêm helper nhỏ ở `profiles.ts` để bổ sung `writing-plans` khi có `brainstorm`, gọi sau checkbox rồi `stableWorkflowOrder`. Cập nhật test normalizer và thêm test unit cho helper.

**Tech Stack:** TypeScript, Vitest, `yaml` parse/stringify như hiện tại.

---

### Task 1: Helper `brainstorm` + `writing-plans`

**Files:**
- Modify: `src/core/profiles.ts`
- Test (new): `test/core/profiles-brainstorm-workflows.test.ts`

- [ ] **Step 1: Viết test thất bại cho helper**

Tạo `test/core/profiles-brainstorm-workflows.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { ensureWritingPlansWhenBrainstormSelected } from '../../src/core/profiles.js';

describe('ensureWritingPlansWhenBrainstormSelected', () => {
  it('returns same list when brainstorm is absent', () => {
    expect(ensureWritingPlansWhenBrainstormSelected(['new', 'apply'])).toEqual(['new', 'apply']);
  });

  it('appends writing-plans when brainstorm is present and writing-plans missing', () => {
    expect(ensureWritingPlansWhenBrainstormSelected(['brainstorm', 'new']).sort()).toEqual(
      ['brainstorm', 'new', 'writing-plans'].sort()
    );
  });

  it('does not duplicate writing-plans', () => {
    expect(ensureWritingPlansWhenBrainstormSelected(['brainstorm', 'writing-plans'])).toEqual([
      'brainstorm',
      'writing-plans',
    ]);
  });
});
```

- [ ] **Step 2: Chạy test — kỳ vọng FAIL**

Run: `npx vitest run test/core/profiles-brainstorm-workflows.test.ts`
Expected: FAIL (export/hàm chưa tồn tại hoặc import lỗi).

- [ ] **Step 3: Thêm hàm export trong `profiles.ts`**

Ngay sau `getProfileWorkflows` (hoặc cuối file, cùng phong cách export hiện có):

```typescript
/**
 * Khi user bật brainstorm mà chưa chọn writing-plans, bổ sung writing-plans
 * (preset brainstorm đã có sẵn cả hai — không cần gọi helper đó).
 */
export function ensureWritingPlansWhenBrainstormSelected(workflows: readonly string[]): string[] {
  if (!workflows.includes('brainstorm')) {
    return [...workflows];
  }
  if (workflows.includes('writing-plans')) {
    return [...workflows];
  }
  return [...workflows, 'writing-plans'];
}
```

- [ ] **Step 4: Chạy test — kỳ vọng PASS**

Run: `npx vitest run test/core/profiles-brainstorm-workflows.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/profiles.ts test/core/profiles-brainstorm-workflows.test.ts
git commit -m "feat: helper bổ sung writing-plans khi chọn brainstorm"
```

---

### Task 2: Normalizer theo workflows (async + sync)

**Files:**
- Modify: `src/core/project-config-normalizer.ts`
- Modify: `test/core/project-config-normalizer.test.ts`
- Modify: `src/core/init.ts` (call site chỉ trong bước Task 3 nếu bạn muốn tách — hoặc sửa cùng diff Task 3)

Định nghĩa hằng:

```typescript
const BRAINSTORM_SCHEMA = 'brainstorm-root';
const DEFAULT_WORKFLOW_SCHEMA = 'spec-driven';
```

Thay logic:

```typescript
function needsBrainstormRootSchema(workflows: readonly string[]): boolean {
  return workflows.includes('brainstorm');
}

export async function ensureProjectSchemaForWorkflows(
  projectPath: string,
  effectiveWorkflows: readonly string[]
): Promise<void> {
  const openspecDir = path.join(projectPath, 'openspec');
  const configYamlPath = path.join(openspecDir, 'config.yaml');
  const configYmlPath = path.join(openspecDir, 'config.yml');

  const wantBrainstorm = needsBrainstormRootSchema(effectiveWorkflows);

  await fs.mkdir(openspecDir, { recursive: true });

  const existingPath = await fileExists(configYamlPath)
    ? configYamlPath
    : (await fileExists(configYmlPath) ? configYmlPath : configYamlPath);

  if (!(await fileExists(existingPath))) {
    if (!wantBrainstorm) {
      return;
    }
    await fs.writeFile(configYamlPath, serializeConfig({ schema: BRAINSTORM_SCHEMA }), 'utf-8');
    return;
  }

  const raw = await fs.readFile(existingPath, 'utf-8');
  const parsed = parseYaml(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid YAML object in ${existingPath}`);
  }
  const record = parsed as Record<string, unknown>;
  const currentSchema = record.schema;

  let nextSchema: string | undefined;
  if (wantBrainstorm) {
    nextSchema = BRAINSTORM_SCHEMA;
  } else if (currentSchema === BRAINSTORM_SCHEMA) {
    nextSchema = DEFAULT_WORKFLOW_SCHEMA;
  }

  if (nextSchema === undefined) {
    return;
  }

  const next = { ...record, schema: nextSchema };
  await fs.writeFile(existingPath, stringifyYaml(next), 'utf-8');
}
```

- [ ] Sao chép tương tự cho `ensureProjectSchemaForWorkflowsSync`.

- [ ] Giữ **`ensureProjectSchemaForProfile`** tạm thời là wrapper deprecated hoặc xóa và cập nhật mọi import — **khuyến nghị:** xóa và đổi tất cả call site sang `ensureProjectSchemaForWorkflows(projectPath, getProfileWorkflows(...))` để không hai API.

Test mở rộng `test/core/project-config-normalizer.test.ts`:

- Import `ensureProjectSchemaForWorkflows`.
- `'custom'` không cần là tham số — truyền mảng `['brainstorm', 'writing-plans']` → file mới có `brainstorm-root`.
- Mảng không có brainstorm, file đang `brainstorm-root` → về `spec-driven`.
- Hồi quy: profile cũ tương đương `BRAINSTORM_WORKFLOWS` — truyền đúng mảng đó.

- [ ] **Run:** `npx vitest run test/core/project-config-normalizer.test.ts`
Expected: PASS

```bash
git add src/core/project-config-normalizer.ts test/core/project-config-normalizer.test.ts
git commit -m "feat: đồng bộ schema project theo brainstorm trong workflows"
```

---

### Task 3: Wire `init` + `update` + `migration`

**Files:**
- Modify: `src/core/init.ts`
- Modify: `src/core/update.ts`
- Modify: `src/core/migration.ts`

#### `init.ts`

Trong `generateSkillsAndCommands`, sau khi có:

```typescript
const globalConfig = getGlobalConfig();
const profile: Profile = this.resolveProfileOverride() ?? globalConfig.profile ?? 'core';
const workflows = getProfileWorkflows(profile, globalConfig.workflows);
```

Gọi:

```typescript
await ensureProjectSchemaForWorkflows(projectPath, workflows);
```

Xóa import/cũ `ensureProjectSchemaForProfile`.

Trong **`createConfig`**, khi serialize file mới (không tồn tại và không skip), đọc `getGlobalConfig()` + `resolveProfileOverride()` + `getProfileWorkflows` giống trên và:

```typescript
const schema = workflows.includes('brainstorm') ? 'brainstorm-root' : DEFAULT_SCHEMA;
const yamlContent = serializeConfig({ schema });
```

(Có thể tái dùng hằng `'brainstorm-root'` hoặc import từ normalizer nếu export `BRAINSTORM_SCHEMA` — tùy chọn; tránh duplicate bằng export const từ normalizer.)

Cập nhật `displaySuccessMessage` nếu vẫn in `DEFAULT_SCHEMA` cố định khi `configStatus === 'created'` — in **schema thực tế** vừa ghi.

#### `update.ts`

Di chuyển / thêm sau khi có `desiredWorkflows`:

```typescript
const profileWorkflows = getProfileWorkflows(profile, globalConfig.workflows);
const desiredWorkflows = profileWorkflows.filter((workflow): workflow is (typeof ALL_WORKFLOWS)[number] =>
  (ALL_WORKFLOWS as readonly string[]).includes(workflow)
);

await ensureProjectSchemaForWorkflows(resolvedProjectPath, desiredWorkflows);
```

**Xóa** lời gọi `ensureProjectSchemaForProfile` cũ ở đầu (trước khi có `desiredWorkflows`).

Lý do dùng `desiredWorkflows`: khớp với skill/command thực tế được cài (`ALL_WORKFLOWS`-filter giống bước generate).

#### `migration.ts`

- Nhánh `rawConfig.profile === 'brainstorm'`:  
  `ensureProjectSchemaForWorkflowsSync(projectPath, [...BRAINSTORM_WORKFLOWS])`

- Sau `saveGlobalConfig` khi migrate sang custom + `config.workflows = installedWorkflows`:  
  `ensureProjectSchemaForWorkflowsSync(projectPath, installedWorkflows)`

Import `BRAINSTORM_WORKFLOWS` và hàm sync mới.

- [ ] **Run:** `npx vitest run test/core/project-config-normalizer.test.ts test/core/profiles-brainstorm-workflows.test.ts`
- [ ] **Run (rộng hơn nếu CI có):** `npm test` hoặc `npx vitest run` theo script repo

```bash
git add src/core/init.ts src/core/update.ts src/core/migration.ts
git commit -m "feat: init/update/migration gọi đồng bộ schema theo workflows"
```

---

### Task 4: Checkbox `openspec config profile`

**Files:**
- Modify: `src/commands/config.ts`

Sau khi nhận `selectedWorkflows` từ `checkbox`, trước khi gán `nextState.workflows`:

```typescript
import { ensureWritingPlansWhenBrainstormSelected } from '../core/profiles.js';

// ...
const withPlans = ensureWritingPlansWhenBrainstormSelected(selectedWorkflows);
nextState.workflows = stableWorkflowOrder(withPlans);
```

Preset `core` / `brainstorm` shortcut không đi qua checkbox — không đổi.

- [ ] **Run:** `npx vitest run` (hoặc subset) để đảm bảo không vỡ import.

```bash
git add src/commands/config.ts
git commit -m "feat: tự thêm writing-plans khi chọn brainstorm trong config profile"
```

---

### Task 5: Self-review so với spec

- [ ] Đọc lại `docs/superpowers/specs/2026-05-03-custom-brainstorm-project-schema-design.md` — mỗi RF có ít nhất một task ở trên.
- [ ] Grep toàn repo `ensureProjectSchemaForProfile` — không còn reference (trừ doc lịch sử nếu có).

```bash
rg "ensureProjectSchemaForProfile" --glob "*.ts"
```

---

## Spec coverage (checklist nội bộ)

| Yêu cầu spec | Task |
|--------------|------|
| RF1 brainstorm → brainstorm-root | Task 2, 3 |
| RF2 gỡ brainstorm → spec-driven | Task 2 |
| RF3 init tạo file mới đúng schema | Task 3 (`createConfig`) |
| RF4 checkbox + writing-plans | Task 1, 4 |
| RF5 migration | Task 3 |

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-03-custom-brainstorm-project-schema.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — một subagent mỗi task, review giữa các task.

**2. Inline Execution** — làm tuần tự trong session với checkpoint.

**Which approach?**
