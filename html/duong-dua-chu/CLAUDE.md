# Đường đua chữ — game luyện đọc tiếng Việt cho bé 5–8 tuổi

Chỉ sửa mã nguồn trong thư mục này. Sau khi sửa, chạy `python3 build.py`: lệnh này gộp mọi thứ thành `../Đường đua chữ.html`, là file người dùng mở hoặc chép sang TV. **Không sửa trực tiếp file đã gộp.**

## Bản đồ file
Đọc đúng file cần sửa, không cần đọc hết. Dòng đầu mỗi file JS liệt kê các hàm có trong file đó.

| File | Nội dung |
|---|---|
| `index.html` | Chỉ có markup: 10 màn hình `section.screen` (home, group, pick, play, path, kids, editor, album, garage, parent) và lớp phủ `#over` (kết quả), `#gate` (cổng bố mẹ), `#limitOv` (hết giờ chơi), `#toast` |
| `css/base.css` | Biến màu sáng/tối, reset, thanh trên, nhân vật dẫn đường, trang chủ, chọn bài |
| `css/play.css` | Cảnh đua (xe, đường, sao) và màn chơi (chữ lớn, câu, bóng bay, thanh thời gian, nút micro) |
| `css/pages.css` | Soạn bài, gara, góc bố mẹ, lớp phủ, media query |
| `js/data.js` | Bài mẫu `BUILTIN`, `MODES` (27 trò: 18 Tiếng Việt + 9 Toán `sub:"math"`; `MODE_GROUPS` = [id, tên, môn, màu], 4 nhóm mỗi môn; `SUBJECTS`; `src` = nguồn bài), `STATEMENTS` (Đúng hay sai), `STORIES` (Truyện tranh, `lv` 1 dễ / 2 vừa), `PICS` (từ → emoji), `ONSETS`, `TONES`, `CARS`, chuỗi SVG. Cuối file: `LEVELS`, `PATHS` (lộ trình theo cấp), `NAMES_B/G`, `AVATARS`, `LETTERS`, `CONFUSE`, `ONSET_SAY`, `TOPICS`, `RIDDLES`, `DECOS`, `PET`, `FACE_GIRL`; Toán: `PATHS_MATH`, `COUNTABLES`, `SHAPES`, `WORDPROBS` |
| `js/util.js` | Hồ sơ `KIDS`/`KID`/`LEVEL()`, `DUO`/`CUP`; `curP()` (bé đang tới lượt), `kid()` (tên), `praise()` (lời khen, thỉnh thoảng gọi tên, dùng thay `rnd(PRAISE)`); `store` tách dữ liệu từng bé, `findLesson` (gồm bài đặc biệt `weak`, `bank`, truyện `st…`), `store`, khớp chữ `norm/fold/same`, `parse`, `choicesFor`, cài đặt `S`, bài học và sao (`users`, `prog`) |
| `js/viet.js` | Âm tiết tiếng Việt: `syl()` tách âm đầu, vần, dấu; `withTone()` đặt dấu đúng chỗ; `onsetChoices`, `rhymeChoices`, `picOf` |
| `js/weak.js` | Từ khó: `noteWord(w,ok)` (mọi trò gọi), `weakWords`, `weakLesson` (bài động id `"weak"`), `renderWeak` |
| `js/rewards.js` | Sticker, nhiệm vụ mỗi ngày, chuỗi ngày, bộ đếm huy hiệu (`rw`), nhật ký chơi (`plog`); `rewardFinish` gọi từ `finish()`; `renderMission` (có thú cưng `petNow`), `renderAlbum`, `renderReport` |
| `js/sound.js` | Âm hiệu ứng dùng Web Audio |
| `js/screens.js` | Điều hướng `show/back`; trang chủ gọn: tab môn `curSub`/`setSub` → nút Học tiếp → ô nhóm trò → `openGroup` (màn nhóm) → `openPick`; soạn bài, gara, góc bố mẹ |
| `js/game.js` | Trạng thái `G`, `startGame(lid,mid,from)` (`from`: `path`/`cup`/`duo`), tiến độ, `heard()` (khớp lời bé đọc), `finish()` (chấm sao; lượt 2 khi chơi đôi ghi sao qua `creditKid`) |
| `js/modes.js` | `IMPL.race/sentence/quick/balloon/fill`. Mỗi trò có `init`, `onRead`, `ok`, `sample`. Trò Đua có xe bóng ma (`ghost_<idBài>`, `ghostFinish`) |
| `js/letters.js` | 4 trò Học chữ: `IMPL.picture/spell/tone/hunt`; chọn đáp án qua `pick(i,btn)`; dùng chung `choiceRight/choiceWrong` |
| `js/meaning.js` | 3 trò Hiểu nghĩa: `IMPL.truefalse/order/story` |
| `js/arcade.js` | 2 trò Vui nhộn: `IMPL.rain/memory`. Thẻ Lật thẻ dùng lớp `.mcard` (không dùng `.card`) |
| `js/math.js` | 9 trò Toán: `IMPL.count/numrec/add/sub/mathrace/compare/seq/shape/word`; độ khó `mathMax` theo cấp; `numVi` đọc số; câu nói dạng mảng đoạn để ghép giọng thu sẵn |
| `js/more.js` | `IMPL.letter` (Chữ cái), `blend` (Đánh vần, `spellOut`), `topic` (Đố vui), `echo` (Nghe giọng mình: MediaRecorder; trò có `stop()` được `endGame` gọi để tắt micro) |
| `js/journey.js` | Lộ trình theo môn đang chọn (`pathList`, `pathNextIdx`, `renderPath`, `startPath`), Giải đua (`startCup`), huy hiệu (`BADGES`, `newBadges`), trang trí xe (`applyDeco`), `flowFinish`/`flowNext` (màn kết quả khi chơi đôi / giải đua / lộ trình) |
| `js/kids.js` | Màn các bé + form hồ sơ (đổi bé = `switchKid` → tải lại trang), chọn bạn chơi đôi, `creditKid`, giới hạn giờ (`overLimit`, `limitBlock`), nhạc nền (`musicSync`), chia sẻ báo cáo (`reportText`), tạo bài từ ảnh (`aiPhoto`, Gemini) |
| `js/packdata.js` | **Tự động tạo** bởi `tools/make_audio.py`: `PACK` (chữ → tên file mp3 trong `audio/`), `PACK_VOICE` |
| `js/pack.js` | Giọng thu sẵn: `packParts`/`packSpeak` (phát qua `actx`, lỗi thì dùng nguồn giọng cũ), `packPhrases()` = mọi câu cố định cần thu |
| `js/speech.js` | Micro: claude dictation → SpeechRecognition vi-VN → chế độ bố mẹ chấm |
| `js/voice.js` | Đọc mẫu: `prov()` chọn nguồn theo `S.ttsProv`: Gemini TTS (key AI Studio miễn phí, lấy danh sách model qua API) hoặc Google Cloud TTS. Hai nguồn dùng chung cache `aiAudio`. Dự phòng: giọng Claude → speechSynthesis. Góc bố mẹ: `renderAI` |
| `js/main.js` | Gắn sự kiện, điều khiển remote/bàn phím, khởi động |

Thêm một trò mới:
1. Thêm một mục vào `MODES` (`data.js`), gồm `grp`, và `selfSay`/`noWeak`/`src` nếu cần.
2. Thêm `IMPL.<id>` vào file của nhóm (`letters.js`, `meaning.js`, `arcade.js`…). Nút đáp án dùng `data-c="i"` và hàm `pick(i,btn)`; nút `data-next` gọi `next()`. `main.js` tự chuyển cú bấm.
3. Gọi `noteWord(w, đúng/sai)` để từ bé sai được đưa vào "Từ khó".

## Quy tắc bắt buộc
- **Script thường, không dùng ES modules.** Chrome chặn modules khi mở `file://`, và TV cũ không hỗ trợ modules. Mọi `const/let/function` ở cấp cao nhất là biến toàn cục dùng chung giữa các file.
- **Thứ tự nạp** (theo `index.html`): data → util → viet → weak → rewards → sound → screens → game → modes → letters → meaning → arcade → math → more → journey → kids → speech → packdata → pack → voice → main. Chỉ `util`, `weak`, `rewards`, `sound`, `journey`, `kids`, `speech`, `voice` và `main` có code chạy ngay khi nạp (`journey`, `kids` tự gắn sự kiện cho nút của mình). Code đó chỉ được dùng biến của các file nạp *trước* nó.
- **Tương thích trình duyệt TV đời cũ**, gồm Chrome cũ và Safari:
  - JS: không dùng `?.`, `??`, regex lookbehind. Không viết thẳng `\p{…}` trong regex, mà tạo bằng `new RegExp` kèm phương án dự phòng (xem `NONWORD` trong `util.js`).
  - CSS: không dùng `light-dark()`, `inset`, `aspect-ratio`, `color-mix()`, mã màu hex 4 hoặc 8 ký tự. Màu luôn qua biến CSS khai báo trong `base.css`, có bộ màu tối riêng (cả trong `@media` lẫn `[data-theme=dark]`).
  - Viền focus `:focus` và `:focus-visible` phải viết thành hai rule riêng.
- Âm thanh phát qua `actx` (đã mở khoá ở cú chạm đầu tiên) vì Safari chặn phát âm thanh khi không có cú bấm.
- Khi bật micro, phải dừng mọi giọng đọc đang phát (`startListen`). Nếu không, micro nghe nhầm giọng máy thành bé đọc.
- Dùng `esc()` cho mọi chữ do người dùng nhập trước khi đưa vào `innerHTML`.
- localStorage dùng tiền tố `ddc_`. Chung cho cả nhà: `settings`, `lessons`, `kids` (hồ sơ), `kid` (bé đang chơi), `gkey` (Google Cloud), `gmkey` (Gemini), `gmout` (model Gemini đang hết lượt). Riêng từng bé (khớp `PERKID` trong `util.js`; bé `k1` giữ khoá cũ, bé khác thành `ddc_<id>.<khoá>`): `prog`, `weak` (từ khó), `rw` (sticker, nhiệm vụ, huy hiệu, cúp), `log` (nhật ký chơi), `ghost_<idBài>` (xe bóng ma), `car`, `deco`, `time` (phút đã chơi hôm nay). Thêm khoá riêng từng bé thì phải thêm vào `PERKID`. IndexedDB `ddc_audio` lưu âm thanh Google.

## Giọng thu sẵn (audio/)
`speakVi` phát file thu sẵn nếu cả câu, hoặc mọi câu nhỏ (tách theo `. ! ?`), có trong `PACK`; không thì dùng Gemini/Google/giọng máy. Khi thêm hoặc sửa câu cố định (lời hướng dẫn `MODES.say`, bài mẫu, truyện, câu đố…), cần tạo lại bộ âm thanh:
`GOOGLE_TTS_KEY=… python3 tools/make_audio.py --voice <tên giọng>` (hoặc lưu key ở `~/.config/gametv/google_tts_key`), rồi `python3 build.py`. Script chỉ tạo file cho câu mới và xoá file không còn dùng. Câu có tên bé chỉ có sẵn cho các tên gợi ý `NAMES_B/NAMES_G`. **Không bao giờ commit key.**

Thêm bài người dùng gửi (đoạn chép từ nút “📋 Chép các bài tự tạo” ở Góc bố mẹ, dạng `## <icon> <tên bài>` + đoạn văn): thêm vào cuối `BUILTIN` trong `data.js` với id mới `b9`, `b10`… (không dùng lại id cũ vì sao lưu theo id), rồi chạy `make_audio.py` và `build.py`. Bài tự tạo cũ trên máy vẫn còn; bố mẹ có thể tự xoá để khỏi trùng.

## Kiểm tra
Mở `index.html` trực tiếp trong trình duyệt. Muốn chạy không cần giao diện: `"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" --headless=new --virtual-time-budget=… --dump-dom file://…`. Trong chế độ headless không có micro, nên game tự chuyển sang chế độ bố mẹ chấm (nút `#ok`). Đừng thêm `#home`, `#play`… vào URL khi test: chúng trùng `id` của màn hình và làm trang tự cuộn.
