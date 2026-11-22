# GameTV

Các game HTML cho trẻ em, chạy được trên trình duyệt máy tính và TV (cả trình duyệt đời cũ, điều khiển bằng remote).

- `html/duong-dua-chu/` là **mã nguồn** game "Đường đua chữ". Bản đồ file và quy tắc nằm trong `html/duong-dua-chu/CLAUDE.md`.
- `html/Đường đua chữ.html` là **file gộp, tự động tạo** từ mã nguồn bằng `python3 html/duong-dua-chu/build.py`, dùng để chép đi hoặc chạy offline. Không đọc hay sửa file này: nó dài, tốn token, và sẽ bị ghi đè ở lần gộp sau.
- **Bản chạy trên web** (GitHub Pages, nhánh `main`, thư mục gốc): https://datle2508.github.io/GameTV/. Trang `index.html` ở thư mục gốc chuyển thẳng tới `html/duong-dua-chu/`, tức bản nhiều file. Vì vậy chỉ cần push mã nguồn là web được cập nhật. `.nojekyll` giữ cho Pages phục vụ file nguyên trạng.
- Repo công khai: không commit key hay thông tin bí mật. API key của người dùng chỉ lưu trong localStorage trên từng thiết bị.
