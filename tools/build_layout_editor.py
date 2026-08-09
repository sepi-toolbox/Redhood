#!/usr/bin/env python3
# 배치 편집기 생성 — css/style.css + data/layout.json 을 읽어 docs/layout_editor.html 을 굽는다.
# 실행: python3 tools/build_layout_editor.py
# 그림은 배포된 사이트(github.io)에서 불러오므로, 파일 하나만 있으면 어디서든 열린다.
import json, datetime, re

ROOT = '/home/claude/redhood'
SITE = 'https://sepi-toolbox.github.io/Redhood'
VERSION = 'v2.10'

css = open(f'{ROOT}/css/style.css').read()
css = css.replace("url('../assets/", f"url('{SITE}/assets/")
layout = json.load(open(f'{ROOT}/data/layout.json'))['battle']
today = datetime.date.today().isoformat()

TPL = open(f'{ROOT}/tools/layout_editor.tpl.html').read()
out = (TPL.replace('%%GAMECSS%%', css)
          .replace('%%LAYOUT%%', json.dumps(layout, ensure_ascii=False))
          .replace('%%VERSION%%', VERSION)
          .replace('%%DATE%%', today)
          .replace('%%SITE%%', SITE))
open(f'{ROOT}/docs/layout_editor.html', 'w').write(out)
print(f'docs/layout_editor.html 생성 ({len(out)//1024}KB)')
