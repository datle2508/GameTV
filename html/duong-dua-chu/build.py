#!/usr/bin/env python3
"""Gộp mã nguồn thành MỘT file HTML để chạy/chép sang TV: ../Đường đua chữ.html

Cách dùng:  python3 build.py
Chỉ sửa file trong thư mục này (index.html, css/, js/), không sửa file đã gộp.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT.parent / "Đường đua chữ.html"
BANNER = ("<!-- FILE TỰ ĐỘNG TẠO bằng html/duong-dua-chu/build.py — ĐỪNG SỬA TRỰC TIẾP.\n"
          "     Sửa mã nguồn trong html/duong-dua-chu/ rồi chạy: python3 build.py -->\n")

html = (ROOT / "index.html").read_text(encoding="utf-8")

css_links = re.findall(r'<link rel="stylesheet" href="(css/[^"]+)">\n', html)
css = "\n".join((ROOT / p).read_text(encoding="utf-8").rstrip() for p in css_links)
for i, p in enumerate(css_links):
    tag = f'<link rel="stylesheet" href="{p}">\n'
    html = html.replace(tag, f"<style>\n{css}\n</style>\n" if i == 0 else "", 1)

js_files = re.findall(r'<script src="(js/[^"]+)"></script>\n', html)
parts = []
for p in js_files:
    code = (ROOT / p).read_text(encoding="utf-8").rstrip()
    if "</script" in code.lower():
        sys.exit(f"{p} chứa chuỗi </script — sẽ làm hỏng file gộp")
    parts.append(f"/* ==== {p} ==== */\n{code}")
for i, p in enumerate(js_files):
    tag = f'<script src="{p}"></script>\n'
    # một <script> thường (không bọc khối) để phạm vi biến giống hệt khi nạp nhiều file
    html = html.replace(tag, "<script>\n" + "\n\n".join(parts) + "\n</script>\n" if i == 0 else "", 1)

if 'src="js/' in html or 'href="css/' in html:
    sys.exit("Còn sót thẻ <script src> / <link> chưa gộp")

html = html.replace("<!DOCTYPE html>\n", "<!DOCTYPE html>\n" + BANNER, 1)
OUT.write_text(html, encoding="utf-8")
print(f"Đã tạo {OUT.relative_to(ROOT.parent.parent)} ({len(html.splitlines())} dòng, {len(js_files)} JS, {len(css_links)} CSS)")
