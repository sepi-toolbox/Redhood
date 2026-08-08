# 상태이상 그림이 주사위 눈을 가리는지 숫자로 검사한다.
# 사용: python3 tools/check_status_art.py <그림.png> [...]
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

R = '/home/claude/redhood/'
def pips():
    out = {}
    for f in range(1, 7):
        a = np.array(Image.open(f'{R}assets/dice/pip{f}.png').convert('RGBA').resize((46,46), Image.LANCZOS))
        dark = (a[...,3] > 120) & (a[...,:3].mean(axis=2) < 90)
        lab, n = ndi.label(dark)
        sizes = ndi.sum(dark, lab, range(1, n+1))
        keep = [i+1 for i, s in enumerate(sizes) if s >= 6]
        out[f] = [(lab == k) for k in keep]
    return out
PIP = pips()

def check(path):
    im = Image.open(path).convert('RGBA').resize((46,46), Image.LANCZOS)
    m = np.array(im)[..., 3] > 110
    worst, dead, tot, per = 0, [], 0, []
    for f, discs in PIP.items():
        v = []
        for i, d in enumerate(discs):
            r = float((m & d).sum() / d.sum()); v.append(r); tot += 1
            worst = max(worst, r)
            if r > 0.75: dead.append(f'{f}면 {i+1}번째 눈 {r*100:.0f}%')
        per.append(round(sum(v)/len(v)*100))
    ok = not dead
    print(f'{path.split("/")[-1]:28s} 면별 가림 {per} 평균 {round(sum(per)/6)}% · '
          f'{"✅ 통과" if ok else "❌ 불통 " + str(len(dead)) + "/" + str(tot)}')
    for d in dead[:8]: print('    ', d)
    return ok

if __name__ == '__main__':
    print('기준: 75% 넘게 덮이는 눈이 하나도 없어야 통과\n')
    all(check(p) for p in sys.argv[1:]) if sys.argv[1:] else print('그림 경로를 주세요')
