#!/usr/bin/env python3
"""Tạo giọng thu sẵn cho game bằng Google Cloud Text-to-Speech (chạy một lần, rồi commit thư mục audio/).

  Key (KHÔNG commit): biến môi trường GOOGLE_TTS_KEY, hoặc file ~/.config/gametv/google_tts_key
  Tên riêng của các bé (KHÔNG commit, tuỳ chọn): ~/.config/gametv/names, mỗi dòng một tên — tạo thêm câu chào/khen có tên.
  Khoá trong js/packdata.js là mã băm nên tên không hiện dạng chữ trong repo.
  python3 tools/make_audio.py --voices                 liệt kê giọng tiếng Việt
  python3 tools/make_audio.py --samples A,B,C OUTDIR   tạo câu thử cho vài giọng để nghe so sánh
  python3 tools/make_audio.py --voice NAME [--rate 0.9] tạo/cập nhật cả bộ: audio/*.mp3 + js/packdata.js

Danh sách câu lấy từ packPhrases() (js/pack.js) qua tools/phrases.html chạy bằng Edge/Chrome không giao diện.
File đã có thì bỏ qua (tên file = băm của giọng + tốc độ + chữ), file không còn dùng thì xoá.
"""
import base64, hashlib, html, json, os, pathlib, re, subprocess, sys, tempfile, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO = ROOT / "audio"
API = "https://texttospeech.googleapis.com/v1/"
BROWSERS = ["/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "google-chrome", "chromium"]

def key():
    k = os.environ.get("GOOGLE_TTS_KEY", "").strip()
    f = pathlib.Path.home() / ".config/gametv/google_tts_key"
    if not k and f.exists():
        k = f.read_text().strip()
    if not k:
        sys.exit("Chưa có key: đặt GOOGLE_TTS_KEY hoặc lưu key vào ~/.config/gametv/google_tts_key")
    if not re.fullmatch(r"AIza[0-9A-Za-z_-]{30,}", k):
        sys.exit("Key không đúng dạng (phải bắt đầu bằng AIza…). Lưu lại key Google Cloud vào ~/.config/gametv/google_tts_key")
    return k

def call(path, body=None):
    req = urllib.request.Request(API + path + ("&" if "?" in path else "?") + "key=" + key(),
                                 data=json.dumps(body).encode() if body else None,
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode()[:300]}")

def synth(text, voice, rate):
    cfg = {"audioEncoding": "MP3"}
    if rate != 1:
        cfg["speakingRate"] = rate
    body = {"input": {"text": text}, "voice": {"languageCode": "vi-VN", "name": voice}, "audioConfig": cfg}
    for attempt in range(5):
        try:
            return base64.b64decode(call("text:synthesize", body)["audioContent"])
        except RuntimeError as e:
            if "speakingRate" in str(e) or "rate" in str(e).lower() and "400" in str(e):
                cfg.pop("speakingRate", None); continue      # vài giọng không nhận tốc độ
            if re.search(r"API key|API_KEY|PERMISSION_DENIED|UNAUTHENTICATED", str(e)):
                print("Key Google không dùng được (hết hạn, bị xoá hoặc sai). Lưu key mới:  pbpaste > ~/.config/gametv/google_tts_key")
                os._exit(2)   # dừng hẳn, không ghi packdata.js
            if "429" in str(e) or "500" in str(e) or "503" in str(e):
                time.sleep(2 * (attempt + 1)); continue
            raise
    raise RuntimeError("thử lại quá nhiều lần: " + text)

def phrases():
    import urllib.parse
    page = (ROOT / "tools/phrases.html").as_uri() + "?names=" + urllib.parse.quote(",".join(names()))
    for b in BROWSERS:
        try:
            with tempfile.TemporaryDirectory() as prof:
                out = subprocess.run([b, "--headless=new", "--disable-gpu", "--virtual-time-budget=3000",
                                      f"--user-data-dir={prof}", "--dump-dom", page],
                                     capture_output=True, text=True, timeout=90).stdout
            m = re.search(r'<pre id="out">(.*?)</pre>', out, re.S)
            if m and m.group(1).strip():
                r = json.loads(html.unescape(m.group(1)))
                if isinstance(r, dict):
                    sys.exit("Tự kiểm tra trong tools/phrases.html bị lỗi: " + r["error"])
                return r
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
    sys.exit("Không chạy được Edge/Chrome để lấy danh sách câu")

def cyrb53(s):   # giống cyrb53 trong js/pack.js (theo đơn vị UTF-16 như charCodeAt)
    M = 0xFFFFFFFF
    imul = lambda a, b: (a * b) & M
    h1, h2 = 0xDEADBEEF, 0x41C6CE57
    b = s.encode("utf-16-le")
    for i in range(0, len(b), 2):
        ch = b[i] | (b[i + 1] << 8)
        h1 = imul(h1 ^ ch, 2654435761); h2 = imul(h2 ^ ch, 1597334677)
    h1 = imul(h1 ^ (h1 >> 16), 2246822507); h1 ^= imul(h2 ^ (h2 >> 13), 3266489909)
    h2 = imul(h2 ^ (h2 >> 16), 2246822507); h2 ^= imul(h1 ^ (h1 >> 13), 3266489909)
    n, out = 4294967296 * (2097151 & h2) + h1, ""
    while True:
        n, r = divmod(n, 36); out = "0123456789abcdefghijklmnopqrstuvwxyz"[r] + out
        if not n: return out

def pack_key(t):   # giống packKey trong js/pack.js
    import unicodedata
    return cyrb53(re.sub(r"\s+", " ", unicodedata.normalize("NFC", t).lower()).strip())

def names():   # tên riêng của các bé: chỉ lưu trên máy, không commit
    f = pathlib.Path.home() / ".config/gametv/names"
    return [n.strip() for n in re.split(r"[,\n]", f.read_text(encoding="utf-8")) if n.strip()] if f.exists() else []

def main():
    a = sys.argv[1:]
    if "--voices" in a:
        vs = call("voices?languageCode=vi-VN")["voices"]
        for v in sorted(vs, key=lambda v: v["name"]):
            print(v["name"], v.get("ssmlGender", ""))
        return
    if "--samples" in a:
        i = a.index("--samples"); names, outdir = a[i + 1].split(","), pathlib.Path(a[i + 2])
        outdir.mkdir(parents=True, exist_ok=True)
        text = "Chào bé! Mình cùng đọc nhé. Mẹ đưa bé đi chợ. Chợ có cá, có cà, có rau. cá, cà, cả, cã, cạ."
        for n in names:
            (outdir / f"{n}.mp3").write_bytes(synth(text, n, 0.9))
            print("đã tạo", outdir / f"{n}.mp3")
        return
    voice = a[a.index("--voice") + 1] if "--voice" in a else sys.exit("Thiếu --voice NAME")
    rate = float(a[a.index("--rate") + 1]) if "--rate" in a else 0.9
    ps = phrases()
    AUDIO.mkdir(exist_ok=True)
    pack, todo = {}, []
    for t in ps:
        fid = hashlib.md5(f"{voice}|{rate}|{t}".encode()).hexdigest()[:12]
        pack[pack_key(t)] = fid
        if not (AUDIO / f"{fid}.mp3").exists():
            todo.append((t, fid))
    print(f"{len(ps)} câu, cần tạo {len(todo)} ({sum(len(t) for t, _ in todo)} ký tự) bằng {voice}")
    failed = []
    def work(item):
        t, fid = item
        try:
            tmp = AUDIO / f"{fid}.tmp"   # ghi file tạm rồi đổi tên: bị dừng giữa chừng cũng không để lại mp3 cụt
            tmp.write_bytes(synth(t, voice, rate))
            tmp.replace(AUDIO / f"{fid}.mp3")
        except Exception as e:   # câu lỗi: bỏ khỏi PACK (game sẽ đọc bằng giọng dự phòng), báo ra để sửa
            failed.append((t, str(e)[:160]))
    done = 0
    with ThreadPoolExecutor(4) as ex:
        for _ in ex.map(work, todo):
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{len(todo)}")
    for t, e in failed:
        print("  LỖI:", repr(t), e)
        pack.pop(pack_key(t), None)
    keep = set(pack.values())
    for f in AUDIO.glob("*.tmp"):   # file tạm của lần chạy bị dừng giữa chừng
        f.unlink()
    for f in AUDIO.glob("*.mp3"):
        if f.stem not in keep:
            f.unlink()
    js = ("/* packdata.js — TỰ ĐỘNG TẠO bởi tools/make_audio.py, đừng sửa tay. PACK: chữ (packKey) → tên file mp3 trong audio/. */\n"
          f"const PACK_VOICE={json.dumps(voice)};\n"
          f"const PACK={json.dumps(pack, ensure_ascii=False, separators=(',', ':'))};\n")
    (ROOT / "js/packdata.js").write_text(js, encoding="utf-8")
    size = sum(f.stat().st_size for f in AUDIO.glob("*.mp3"))
    print(f"Xong: {len(keep)} file, {size / 1e6:.1f} MB trong audio/. Chạy lại python3 build.py")

if __name__ == "__main__":
    main()
