# Thiết kế thêm `propose` mặc định cho profile `brainstorm-root`

## 1) Mục tiêu

Bổ sung command/skill `propose` vào bộ mặc định khi dùng profile `brainstorm-root`, để người dùng có thể bắt đầu nhanh bằng luồng đề xuất thay đổi mà không cần cấu hình thủ công thêm workflow.

Mục tiêu chính:

- Tăng tính hoàn chỉnh của profile `brainstorm-root` cho giai đoạn khởi tạo thay đổi.
- Giữ nguyên kiến trúc schema artifact hiện có, không mở rộng đồ thị artifact.
- Hạn chế phạm vi thay đổi vào lớp profile/template generation để giảm rủi ro hồi quy.

## 2) Phạm vi

### Trong phạm vi

- Thêm `propose` vào danh sách command/skill mặc định được generate khi profile là `brainstorm-root`.
- Đảm bảo output có:
  - skill `openspec-propose`
  - command `OPSX: Propose`
- Bổ sung kiểm thử để xác nhận profile mục tiêu có `propose` và profile khác không bị ảnh hưởng.

### Ngoài phạm vi

- Không thay đổi `schemas/brainstorm-root/schema.yaml`.
- Không thêm artifact ID mới vào schema (không có artifact `propose` trong dependency graph).
- Không refactor tổng quát cơ chế profile sang hệ cấu hình mới trong đợt này.

## 3) Quyết định thiết kế

### Quyết định 1: Chỉ thêm default command/skill, không đổi schema artifact

`propose` trong ngữ cảnh này là workflow command/skill hỗ trợ tạo nhanh bộ artifact, không phải một artifact độc lập trong schema `brainstorm-root`.

Lý do:

- Phù hợp trực tiếp yêu cầu nghiệp vụ hiện tại.
- Tránh phát sinh thay đổi dây chuyền ở validation/dependency/apply requirements.
- Giữ tương thích ngược với mọi change đang dùng `brainstorm-root`.

### Quyết định 2: Áp dụng theo profile cụ thể

Chỉ profile `brainstorm-root` được thêm mặc định `propose`. Các profile khác giữ nguyên danh sách workflow mặc định hiện có.

Lý do:

- Tránh thay đổi hành vi ngoài phạm vi.
- Dễ kiểm soát hồi quy và rollback.

## 4) Thiết kế thành phần

### 4.1 Lớp profile/workflow resolution

- Cập nhật mapping profile `brainstorm-root` để danh sách workflow mặc định bao gồm `propose`.
- Không thay đổi API public hiện hữu nếu không cần thiết; ưu tiên thay đổi dữ liệu mapping hơn là đổi contract.

### 4.2 Lớp template generation cho command/skill

- Đảm bảo `propose` được resolve tới:
  - template skill `openspec-propose`
  - template command `OPSX: Propose`
- Nếu thiếu template `propose`, fail rõ ràng thay vì bỏ qua im lặng.

### 4.3 Tài liệu/help text (nếu có phần mô tả profile defaults)

- Đồng bộ mô tả profile `brainstorm-root` để phản ánh có `propose` mặc định.
- Chỉ cập nhật nơi thực sự hiển thị danh sách mặc định để tránh drift tài liệu.

## 5) Luồng dữ liệu và xử lý lỗi

### 5.1 Luồng dữ liệu

- Input: profile hiệu lực trong lệnh init/update/sync workflow.
- Rule:
  - Nếu profile là `brainstorm-root` -> append/include `propose` trong default workflow set.
  - Nếu profile khác -> giữ nguyên default workflow set hiện có.
- Output:
  - File command/skill được generate có thêm `propose` đúng điều kiện profile.

### 5.2 Xử lý lỗi

- Thiếu template `propose`: trả lỗi rõ ràng kèm workflow ID gây lỗi.
- Trùng workflow ID do merge danh sách: chuẩn hóa danh sách theo unique ID để tránh sinh file lặp.
- Profile không hợp lệ: đi theo luồng validate hiện có, không thêm hành vi đặc biệt mới.

## 6) Kế hoạch kiểm thử

- Kiểm thử profile defaults:
  - Profile `brainstorm-root` resolve ra tập workflow có `propose`.
  - Profile đối chứng không có `propose` nếu không được cấu hình.

- Kiểm thử generate output:
  - Với profile `brainstorm-root`, output có `openspec-propose` và `OPSX: Propose`.
  - Không có file/entry duplicate cho `propose`.

- Kiểm thử hồi quy:
  - Các test hiện có cho profile khác tiếp tục pass.
  - Không ảnh hưởng luồng schema artifact (`brainstorm -> specs -> tasks`) vì không sửa `schema.yaml`.

## 7) Rủi ro và giảm thiểu

- Rủi ro lan thay đổi sang profile khác:
  - Giảm thiểu bằng điều kiện profile tường minh + test đối chứng.

- Rủi ro drift giữa config profile và output template:
  - Giảm thiểu bằng test e2e kiểm tra trực tiếp artifact đầu ra của lệnh init/generate.

- Rủi ro hiểu nhầm `propose` là artifact schema:
  - Giảm thiểu bằng tài liệu nêu rõ đây là workflow command/skill.

## 8) Tiêu chí hoàn thành

- Profile `brainstorm-root` tạo mặc định `propose` command/skill.
- Không có thay đổi hành vi ngoài profile mục tiêu.
- Bộ test liên quan pass.
- Không cần migration schema hoặc chỉnh sửa artifact graph hiện hành.
