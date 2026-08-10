#!/usr/bin/env python3
# 아이콘 붙이기 — 회색 배경 키잉 → 여백 트림 → 메달 안쪽에 맞춰 정규화 → 96px 저장
# 사용: python3 tools/make_icon.py <원본.png> <출력이름>   예) ... status_poison
import sys, os
from PIL import Image, ImageDraw, ImageFilter, ImageChops

S = 96
import json
STATUS_COLOR = {x['id']: x['color'] for x in json.load(open('data/statuses.json'))['list']}
# 아이콘·덮개를 잇는 첫째 단서는 색이다 (성권). 메달 안판을 그 상태의 색으로 물들여
# 13px 배지에서 형태가 안 보여도 색만으로 구분되게 한다.
def _hex(c):
    c = c.lstrip('#')
    return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))

def medallion(tint=None, mix=0.42):
    im = Image.new('RGBA', (S*4, S*4), (0,0,0,0)); d = ImageDraw.Draw(im)
    plate = (34, 25, 19)
    rim = (122, 90, 58)
    if tint:
        t = _hex(tint) if isinstance(tint, str) else tint
        plate = tuple(int(plate[i] * (1 - mix) + t[i] * mix * 0.55) for i in range(3))
        rim = tuple(int(rim[i] * (1 - mix * .7) + t[i] * mix * .7) for i in range(3))
    d.ellipse([6,6,S*4-6,S*4-6], fill=(58,42,30,255), outline=rim + (255,), width=14)
    d.ellipse([34,34,S*4-34,S*4-34], fill=plate + (255,), outline=(78,57,38,255), width=6)
    hi = Image.new('RGBA', (S*4,S*4), (0,0,0,0))
    ImageDraw.Draw(hi).ellipse([40,34,S*4-40,S*4-120], fill=(255,236,200,26))
    im.alpha_composite(hi.filter(ImageFilter.GaussianBlur(26)))
    return im.resize((S,S), Image.LANCZOS)

def key_out(im, tol=34):
    """평평한 회색 배경을 지운다. 귀퉁이 색을 배경으로 보고 거리 기준으로 알파를 깎는다."""
    im = im.convert('RGBA'); w,h = im.size; px = im.load()
    cs = [px[2,2], px[w-3,2], px[2,h-3], px[w-3,h-3]]
    bg = tuple(sum(c[i] for c in cs)//4 for i in range(3))
    out = im.copy(); o = out.load()
    for y in range(h):
        for x in range(w):
            r,g,b,a = px[x,y]
            d = abs(r-bg[0]) + abs(g-bg[1]) + abs(b-bg[2])
            if d < tol: o[x,y] = (r,g,b,0)
            elif d < tol*2.2:                      # 경계 반투명 — 계단 방지
                o[x,y] = (r,g,b,int(a * (d-tol)/(tol*1.2)))
    return out

def build(src, name, fill=0.66, tint=None):
    im = key_out(Image.open(src))
    bb = im.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()
    if bb: im = im.crop(bb)
    # 메달 안쪽 원에 맞춘다 (지름의 fill 비율)
    target = S * fill
    w,h = im.size; sc = min(target/w, target/h)
    im = im.resize((max(1,round(w*sc)), max(1,round(h*sc))), Image.LANCZOS)
    if tint is None and name.startswith('status_'):
        tint = STATUS_COLOR.get(name[len('status_'):])
    out = medallion(tint)
    out.alpha_composite(im, ((S-im.size[0])//2, (S-im.size[1])//2))
    p = f'assets/icons/{name}.png'
    out.save(p)
    print(f'{p} · {out.size} · {os.path.getsize(p)}B')
    return out

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else 0.66)

# ---------- 주사위 덮개 ----------
def build_die(src, name, keep_center=True):
    """회색 배경을 키잉해 주사위 덮개(256px, 알파)로 저장. 중앙 가림률을 재서 경고한다."""
    im = key_out(Image.open(src)).resize((256, 256), Image.LANCZOS)
    a = im.getchannel('A')
    c = a.crop((56, 56, 200, 200))
    center = sum(c.getdata()) / (c.size[0] * c.size[1] * 255) * 100
    p = f'assets/ui/status_die_{name}.png'
    im.save(p)
    flag = '' if (center < 25 or not keep_center) else '  ⚠ 중앙을 덮어 눈이 안 보인다'
    print(f'{p} · 중앙 가림 {center:.0f}%{flag}')
    return im
