# 상태이상 13종 — 받은 그림 + 물듦 + 파티클 + 이름표 네 겹, 각자 다른 움직임
import base64, io
from PIL import Image
R = '/home/claude/redhood/'
def enc(p, size, jpg=False, q=60):
    im = Image.open(R+p).resize(size, Image.LANCZOS)
    buf = io.BytesIO()
    if jpg: im.convert('RGB').save(buf,'JPEG',quality=q); return "data:image/jpeg;base64,"+base64.b64encode(buf.getvalue()).decode()
    im.save(buf,'PNG',optimize=True); return "data:image/png;base64,"+base64.b64encode(buf.getvalue()).decode()

PAD = enc('assets/ui/die_pad.png',(192,203))
PIPS = [enc(f'assets/dice/pip{f}.png',(150,150)) for f in (5,3,2,6,1,4)]
BG  = enc('assets/bg/bg_forest.jpg',(390,520), jpg=True)

# id, 이름, 글자색, 물듦, 안쪽발광, (파티클색,모양,움직임,개수), 그림움직임, 기준점
S = [
 ("bleed","출혈","#ff5a4a","radial-gradient(ellipse at 50% -15%,rgba(176,20,18,.72) 0%,rgba(120,14,12,.42) 55%,rgba(70,8,8,.16) 100%)",
  "inset 0 8px 10px -5px rgba(255,45,36,.7)",("linear-gradient(#ff4436,#8d1310)","drop","fall",3),"ooze","top center"),
 ("poison","독","#b8e04a","radial-gradient(ellipse at 50% 118%,rgba(96,150,20,.7) 0%,rgba(66,110,16,.42) 55%,rgba(34,58,10,.16) 100%)",
  "inset 0 -9px 11px -5px rgba(180,230,60,.7)",("radial-gradient(circle at 35% 30%,#e6ff9a,#7fbf1e)","bub","rise",4),"boil","bottom center"),
 ("bind","포박","#7fbf8a","radial-gradient(ellipse at 50% 50%,rgba(24,52,30,.24) 0%,rgba(28,58,32,.5) 62%,rgba(14,32,18,.7) 100%)",
  "inset 0 0 11px 3px rgba(20,44,24,.8)",(None,None,None,0),"squeeze","center"),
 ("stun","기절","#dfe6ee","radial-gradient(ellipse at 50% 50%,rgba(120,130,145,.3) 0%,rgba(78,86,100,.44) 60%,rgba(46,52,62,.56) 100%)",
  "inset 0 0 10px 2px rgba(215,232,255,.5)",("#eef6ff","shard","spark",3),"jitter","center"),
 ("curse","저주","#c78cff","radial-gradient(ellipse at 45% 118%,rgba(46,14,72,.86) 0%,rgba(34,10,54,.5) 52%,rgba(18,6,28,.2) 100%)",
  "inset 0 -8px 13px -3px rgba(150,70,220,.65)",("#b489e0","ash","rise",4),"creep","bottom center"),
 ("blessing","축복","#f3ecdd","radial-gradient(ellipse at 50% 12%,rgba(240,236,225,.4) 0%,rgba(190,188,182,.28) 55%,rgba(120,120,118,.2) 100%)",
  "inset 0 8px 13px -4px rgba(255,253,245,.85)",("#fffdf2","mote","rise",3),"hover","top center"),
 ("confuse","혼란","#c68cff","","",(None,None,None,0),"mist","center"),
 ("seal","봉인","#8fa8e0","","",(None,None,None,0),"wax","center"),
 ("rot","부패","#d98cc0","radial-gradient(ellipse at 50% 112%,rgba(120,30,86,.6) 0%,rgba(78,26,60,.42) 52%,rgba(44,20,34,.2) 100%)",
  "inset 0 -8px 11px -4px rgba(230,120,190,.6)",("#e7a3cf","spore","swell",3),"bulge","bottom center"),
 ("chain","결속","#a8c2d8","radial-gradient(ellipse at 50% 50%,rgba(40,54,68,.26) 0%,rgba(30,42,56,.46) 60%,rgba(18,26,36,.6) 100%)",
  "inset 0 0 10px 2px rgba(170,205,235,.45)",(None,None,None,0),"taut","center"),
 ("numb","마비","#8fd4ff","radial-gradient(ellipse at 50% 50%,rgba(60,120,190,.5) 0%,rgba(30,70,130,.4) 60%,rgba(14,34,70,.26) 100%)",
  "inset 0 0 9px 1px rgba(150,220,255,.7)",("#dff2ff","spark","spark",3),"zap","center"),
 ("plunder","약탈","#d9a05a","radial-gradient(ellipse at 55% 112%,rgba(120,74,26,.64) 0%,rgba(84,54,22,.44) 52%,rgba(46,32,16,.2) 100%)",
  "inset 0 -8px 10px -4px rgba(215,150,70,.6)",("radial-gradient(circle at 35% 30%,#e8bd72,#8a5f22)","coin","fall",2),"grab","bottom center"),
 ("devour","잠식","#9fd8f0","radial-gradient(ellipse at 50% 115%,rgba(2,6,12,.92) 0%,rgba(6,14,24,.6) 48%,rgba(10,20,32,.2) 100%)",
  "inset 0 -9px 13px -4px rgba(140,215,250,.7)",("#bfe6f7","frag","suck",4),"rise","bottom center"),
]
POS = [(15,18),(31,26),(23,34),(38,14)]
css, dies = [], []
for i,(sid,name,col,tint,rim,(pc,psh,pan,pn),mot,org) in enumerate(S):
    art = enc(f'assets/ui/status_die_{sid}.png',(184,184))
    if tint: css.append(f".t-{sid} .tint{{background:{tint}}}")
    if rim:  css.append(f".t-{sid} .tint2{{box-shadow:{rim}}}")
    css.append(f".t-{sid} .nm{{color:{col}}}")
    css.append(f".t-{sid} .ov{{animation:{mot} 2.4s ease-in-out infinite;transform-origin:{org}}}")
    parts = ""
    for j in range(pn):
        x,y = POS[j]
        css.append(f".t-{sid} .p{j}{{left:{x}px;top:{y}px;background:{pc};animation:{pan} 2.4s ease-in-out infinite {j*0.7:.2f}s}}")
        parts += f'<span class="pt {psh} p{j}"></span>'
    # 혼란만 두 겹 — 안쪽 안개는 돌지만 바깥 사각 윤곽은 고정이다
    if sid == "confuse":
        layer = (f'<span class="swirlbox"><img class="swirl" src="{art}"></span>'
                 f'<img class="ov" src="{art}">')
    else:
        layer = f'<img class="ov" src="{art}">'
    dies.append(f'<div class="holder"><div class="die t-{sid}"><img class="pip" src="{PIPS[i%6]}">'
                f'<span class="tint"></span>{layer}<span class="tint2"></span>'
                f'{parts}<span class="nm">{name}</span></div></div>')

TPL = open(R+'tools/states_shell.html', encoding='utf-8').read()
out = (TPL.replace('/*__CSS__*/', "\n".join(css)).replace('<!--__DIES__-->', "\n".join(dies))
          .replace('__BG__', BG).replace('__PAD__', PAD))
open(R+'tools/allstates.html','w',encoding='utf-8').write(out)
print('생성 완료', round(len(out)/1024), 'KB · 주사위', out.count('class="die t-'), '개')
