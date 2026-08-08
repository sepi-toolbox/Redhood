# REDHOOD 데이터 편집기 생성기
# 실행: python3 tools/build_editor.py
#   data/*.json 을 tools/data_editor.shell.html 의 __DB__ 자리에 박아
#   docs/data_editor.html (단일 파일, 외부 의존 없음) 을 만든다.
# 데이터가 바뀌면 다시 돌려야 편집기가 최신값을 보여준다.
import json, io, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ['scoring', 'dice', 'relics', 'enemies', 'events', 'acts', 'act1', 'statuses']
db = {f: json.load(open(os.path.join(ROOT, 'data', f + '.json'))) for f in FILES}
shell = io.open(os.path.join(ROOT, 'tools/data_editor.shell.html'), encoding='utf-8').read()
assert '__DB__' in shell, 'shell 에 __DB__ 자리가 없습니다'
out = shell.replace('__DB__', json.dumps(db, ensure_ascii=False, separators=(',', ':')))
p = os.path.join(ROOT, 'docs/data_editor.html')
io.open(p, 'w', encoding='utf-8').write(out)
print(f'{p} · {len(out)/1024:.0f}KB · 파일 {len(FILES)}개 내장')
