# Đường đua chữ — game luyện đọc tiếng Việt cho bé 5–8 tuổi

Chỉ sửa mã nguồn trong thư mục này. Sau khi sửa, chạy `python3 build.py`: lệnh này gộp mọi thứ thành `../Đường đua chữ.html`, là file người dùng mở hoặc chép sang TV. **Không sửa trực tiếp file đã gộp.**

## Bản đồ file
Đọc đúng file cần sửa, không cần đọc hết. Dòng đầu mỗi file JS liệt kê các hàm có trong file đó.

| File | Nội dung |
|---|---|
| `index.html` | Chỉ có markup: 6 màn hình `section.screen` (home, pick, play, editor, garage, parent) và lớp phủ `#over` (kết quả), `#gate` (cổng bố mẹ), `#toast` |
| `css/base.css` | Biến màu sáng/tối, reset, thanh trên, nhân vật dẫn đường, trang chủ, chọn bài |
| `css/play.css` | Cảnh đua (xe, đường, sao) và màn chơi (chữ lớn, câu, bóng bay, thanh thời gian, nút micro) |
| `css/pages.css` | Soạn bài, gara, góc bố mẹ, lớp phủ, media query |
| `js/data.js` | Bài mẫu `BUILTIN`, `MODES` (8 trò, nhóm `MODE_GROUPS`; thứ tự = trang chủ = phím số), `PICS` (từ → emoji), `ONSETS`, `TONES`, `CARS`, chuỗi SVG |
| `js/util.js` | `store`, khớp chữ `norm/fold/same`, `parse`, `choicesFor`, cài đặt `S`, bài học và sao (`users`, `prog`) |
| `js/viet.js` | Âm tiết tiếng Việt: `syl()` tách âm đầu, vần, dấu; `withTone()` đặt dấu đúng chỗ; `onsetChoices`, `rhymeChoices`, `picOf` |
| `js/weak.js` | Từ khó: `noteWord(w,ok)` (mọi trò gọi), `weakWords`, `weakLesson` (bài động id `"weak"`), `renderWeak` |
| `js/sound.js` | Âm hiệu ứng dùng Web Audio |
| `js/screens.js` | Điều hướng `show/back`, trang chủ, chọn bài, soạn bài, gara, góc bố mẹ |
| `js/game.js` | Trạng thái `G`, tiến độ, `heard()` (khớp lời bé đọc), `finish()` (chấm sao) |
| `js/modes.js` | `IMPL.race/sentence/quick/balloon/fill`. Mỗi trò có `init`, `onRead`, `ok`, `sample` |
| `js/letters.js` | 3 trò Học chữ: `IMPL.picture/spell/tone`; chọn đáp án qua `pick(i,btn)`; dùng chung `choiceRight/choiceWrong` |
| `js/speech.js` | Micro: claude dictation → SpeechRecognition vi-VN → chế độ bố mẹ chấm |
| `js/voice.js` | Đọc mẫu: `prov()` chọn nguồn theo `S.ttsProv`: Gemini TTS (key AI Studio miễn phí, lấy danh sách model qua API) hoặc Google Cloud TTS. Hai nguồn dùng chung cache `aiAudio`. Dự phòng: giọng Claude → speechSynthesis. Góc bố mẹ: `renderAI` |
| `js/main.js` | Gắn sự kiện, điều khiển remote/bàn phím, khởi động |

Thêm một trò mới:
1. Thêm một mục vào `MODES` (`data.js`), gồm `grp`, và `selfSay`/`noWeak` nếu cần.
2. Thêm `IMPL.<id>` (`modes.js` hoặc `letters.js`). Nút đáp án dùng `data-c="i"` và hàm `pick(i,btn)`; `main.js` tự chuyển cú bấm tới `pick`.
3. Gọi `noteWord(w, đúng/sai)` để từ bé sai được đưa vào "Từ khó".

## Quy tắc bắt buộc
- **Script thường, không dùng ES modules.** Chrome chặn modules khi mở `file://`, và TV cũ không hỗ trợ modules. Mọi `const/let/function` ở cấp cao nhất là biến toàn cục dùng chung giữa các file.
- **Thứ tự nạp** (theo `index.html`): data → util → viet → weak → sound → screens → game → modes → letters → speech → voice → main. Chỉ `util`, `weak`, `sound`, `speech`, `voice` và `main` có code chạy ngay khi nạp. Code đó chỉ được dùng biến của các file nạp *trước* nó.
- **Tương thích trình duyệt TV đời cũ**, gồm Chrome cũ và Safari:
  - JS: không dùng `?.`, `??`, regex lookbehind. Không viết thẳng `\p{…}` trong regex, mà tạo bằng `new RegExp` kèm phương án dự phòng (xem `NONWORD` trong `util.js`).
  - CSS: không dùng `light-dark()`, `inset`, `aspect-ratio`, `color-mix()`, mã màu hex 4 hoặc 8 ký tự. Màu luôn qua biến CSS khai báo trong `base.css`, có bộ màu tối riêng (cả trong `@media` lẫn `[data-theme=dark]`).
  - Viền focus `:focus` và `:focus-visible` phải viết thành hai rule riêng.
- Âm thanh phát qua `actx` (đã mở khoá ở cú chạm đầu tiên) vì Safari chặn phát âm thanh khi không có cú bấm.
- Khi bật micro, phải dừng mọi giọng đọc đang phát (`startListen`). Nếu không, micro nghe nhầm giọng máy thành bé đọc.
- Dùng `esc()` cho mọi chữ do người dùng nhập trước khi đưa vào `innerHTML`.
- localStorage dùng tiền tố `ddc_`: `settings`, `lessons`, `prog`, `car`, `gkey` (Google Cloud), `gmkey` (Gemini), `gmout` (model Gemini đang hết lượt), `weak` (từ khó). IndexedDB `ddc_audio` lưu âm thanh Google.

## Kiểm tra
Mở `index.html` trực tiếp trong trình duyệt. Muốn chạy không cần giao diện: `"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" --headless=new --virtual-time-budget=… --dump-dom file://…`. Trong chế độ headless không có micro, nên game tự chuyển sang chế độ bố mẹ chấm (nút `#ok`). Đừng thêm `#home`, `#play`… vào URL khi test: chúng trùng `id` của màn hình và làm trang tự cuộn.
