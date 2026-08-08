# 상태이상 13종 시안 생성기 — 그림 파일 0장, 전부 CSS/SVG
import json, base64, io
from PIL import Image

def enc(p, size):
    im = Image.open(p).resize(size, Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
def encj(p, size, q=60):
    im = Image.open(p).resize(size, Image.LANCZOS).convert('RGB')
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=q)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

R = '/home/claude/redhood/'
PAD = enc(R+'assets/ui/die_pad.png', (192,203))
PIP = enc(R+'assets/dice/pip5.png', (160,160))
BG  = encj(R+'assets/bg/bg_forest.jpg', (390,520))

def drip(x,y0,y1,w):
    return f'M{x-w},{y0} C{x-w},{y1-w*2.1} {x-w*1.3},{y1} {x},{y1} C{x+w*1.3},{y1} {x+w},{y1-w*2.1} {x+w},{y0} Z'

BLEED = ('<defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">'
 '<stop offset="0" stop-color="#ff5a48"/><stop offset="38%" stop-color="#c4150f"/><stop offset="100%" stop-color="#6d0b09"/></linearGradient></defs>'
 '<g fill="url(#gb)"><path d="M-1,-1 L47,-1 L47,8 C44,13 41,6 38,10 C36,13.5 34,7.5 31,9 C28,10.5 26,15 23,13.5 '
 'C20,12 18,6.5 15,9 C12,11.5 10,5.5 7,10 C4,14 1,7 -1,10 Z"/>'
 f'<path d="{drip(8.5,7,23,2.3)}"/><path d="{drip(22.5,10,34,2.9)}"/><path d="{drip(34,8,18,1.9)}"/><path d="{drip(16,8,14,1.4)}"/></g>'
 '<g fill="#ff8a76" opacity=".6"><path d="M6.8,3 C6.4,9 6.6,15 7.5,19 L8.8,19 C8.1,14 8.2,8 8.6,3 Z"/>'
 '<path d="M20.8,6 C20.3,13 20.6,22 21.6,28 L23,28 C22.2,21 22.1,13 22.6,6 Z"/></g>')

POISON = ('<defs><linearGradient id="gp" x1="0" y1="1" x2="0" y2="0">'
 '<stop offset="0" stop-color="#3f6d0e"/><stop offset="55%" stop-color="#78b81c"/><stop offset="100%" stop-color="#c2ec4e"/></linearGradient></defs>'
 '<g fill="url(#gp)"><path d="M-1,47 L47,47 L47,34 C43,29 41,37 37,33 C33.5,29.5 31,36 27,34 '
 'C23.5,32 21,38.5 17,35 C13.5,32 11,37.5 7,34 C3.5,31 1,37 -1,34 Z"/>'
 '<circle cx="12" cy="27" r="3.4"/><circle cx="30" cy="24" r="4.2"/><circle cx="21" cy="30" r="2.4"/></g>'
 '<g fill="#e8ffa8" opacity=".7"><circle cx="10.8" cy="25.8" r="1.1"/><circle cx="28.6" cy="22.4" r="1.4"/></g>')

CURSE = ('<g fill="#150525"><path d="M-1,47 L-1,26 C5,29 8,22 13,26 C18,30 20,24 24,29 C27,33 24,40 18,42 C12,44 6,47 -1,47 Z"/>'
 '<path d="M47,-1 L47,17 C41,14 38,21 33,17 C29,14 30,7 34,3 C37,0 42,-1 47,-1 Z"/>'
 '<path d="M25,4 C27,9 26,13 23,16 C24,11 24,8 22,4 Z"/><path d="M33,6 C32,11 33,15 36,18 C34,13 34,10 36,6 Z"/></g>'
 '<g fill="none" stroke="#a862f0" stroke-width=".9" opacity=".85">'
 '<path d="M-1,26 C5,29 8,22 13,26 C18,30 20,24 24,29"/><path d="M47,17 C41,14 38,21 33,17 C29,14 30,7 34,3"/></g>')

ROT = ('<defs><radialGradient id="gr" cx="38%" cy="30%"><stop offset="0" stop-color="#e07ab4"/>'
 '<stop offset="55%" stop-color="#8e2560"/><stop offset="100%" stop-color="#4a1436"/></radialGradient></defs>'
 '<ellipse cx="23" cy="21" rx="13" ry="11.5" fill="url(#gr)"/><ellipse cx="11" cy="33" rx="5" ry="4.4" fill="url(#gr)"/>'
 '<ellipse cx="35" cy="33" rx="4.2" ry="3.7" fill="url(#gr)"/>'
 '<g fill="none" stroke="#ffcf6a" stroke-width=".9" opacity=".9"><path d="M17,15 C20,19 19,24 22,28"/>'
 '<path d="M27,14 C25,19 28,23 26,29"/><path d="M14,23 H31"/></g>'
 '<ellipse cx="19" cy="16" rx="3.4" ry="2.4" fill="#f0a8cf" opacity=".5"/>')

PLUNDER = ('<g fill="none" stroke="#6b4a2a" stroke-width="4.2" stroke-linecap="round">'
 '<path d="M45,41 C36,39 30,33 26,25"/><path d="M45,41 C37,42 29,38 23,31"/><path d="M45,41 C38,45 30,44 24,38"/></g>'
 '<g fill="none" stroke="#c99552" stroke-width="1.1" stroke-linecap="round" opacity=".8"><path d="M44,39 C36,37 30,32 27,25"/></g>'
 '<g fill="none" stroke="#3a2614" stroke-width="2" stroke-linecap="round"><path d="M26,25 C24,23 22,23 21,25"/>'
 '<path d="M23,31 C21,30 19,30 18,32"/><path d="M24,38 C22,38 20,39 19,41"/></g>'
 '<circle cx="12" cy="14" r="4.4" fill="#b8873f"/><circle cx="12" cy="14" r="4.4" fill="none" stroke="#e0b569" stroke-width="1"/>'
 '<circle cx="21" cy="9" r="3.4" fill="#96702f"/><circle cx="21" cy="9" r="3.4" fill="none" stroke="#cfa459" stroke-width=".9"/>')

BIND = ('<path d="M-3,12 C10,17 18,7 26,14 C34,21 42,12 49,17" fill="none" stroke="#2f5a34" stroke-width="5.4" stroke-linecap="round"/>'
 '<path d="M-3,12 C10,17 18,7 26,14 C34,21 42,12 49,17" fill="none" stroke="#63996b" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>'
 '<path d="M-3,33 C8,28 16,38 25,31 C33,25 41,34 49,29" fill="none" stroke="#284d2c" stroke-width="4.6" stroke-linecap="round"/>'
 '<path d="M-3,33 C8,28 16,38 25,31 C33,25 41,34 49,29" fill="none" stroke="#5a8c60" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>')

STUN = ('<polyline points="2,4 13,15 7,20 19,29 13,35 24,44" fill="none" stroke="#f2f8ff" stroke-width="1.7" stroke-linejoin="round"/>'
 '<polyline points="19,29 30,24 38,31" fill="none" stroke="#dbe8f7" stroke-width="1.3" stroke-linejoin="round"/>'
 '<polyline points="13,15 24,9 33,13" fill="none" stroke="#dbe8f7" stroke-width="1.2" stroke-linejoin="round"/>')

BLESS = ('<ellipse cx="23" cy="15" rx="15" ry="5.4" fill="none" stroke="#fffaf0" stroke-width="1.9" opacity=".92"/>'
 '<ellipse cx="23" cy="15" rx="15" ry="5.4" fill="none" stroke="#cfc7b4" stroke-width=".7" opacity=".8"/>'
 '<g stroke="#fffaf0" stroke-width="1.1" opacity=".7"><path d="M8,9 L5,5"/><path d="M23,8 L23,3"/><path d="M38,9 L41,5"/></g>')

CHAIN = ('<g fill="none" stroke="#8fa9bf" stroke-width="2.6"><ellipse cx="1" cy="23" rx="5.4" ry="3.4"/>'
 '<ellipse cx="12" cy="23" rx="5.4" ry="3.4"/><ellipse cx="23" cy="23" rx="5.4" ry="3.4"/>'
 '<ellipse cx="34" cy="23" rx="5.4" ry="3.4"/><ellipse cx="45" cy="23" rx="5.4" ry="3.4"/></g>'
 '<g fill="none" stroke="#d5e6f2" stroke-width=".9" opacity=".85"><ellipse cx="12" cy="22" rx="5.4" ry="3.4"/>'
 '<ellipse cx="34" cy="22" rx="5.4" ry="3.4"/></g>')

ARC = ('<span class="arc a1"><svg viewBox="0 0 46 46"><polyline points="4,3 15,14 9,19 22,29 17,34 31,44" fill="none" stroke="#dff2ff" stroke-width="1.7" stroke-linejoin="round"/></svg></span>'
 '<span class="arc a2"><svg viewBox="0 0 46 46"><polyline points="40,4 30,13 36,19 24,26 29,33 16,43" fill="none" stroke="#dff2ff" stroke-width="1.5" stroke-linejoin="round"/></svg></span>'
 '<span class="arc a3"><svg viewBox="0 0 46 46"><polyline points="5,33 17,27 12,21 26,15 21,9 34,3" fill="none" stroke="#cfe9ff" stroke-width="1.3" stroke-linejoin="round"/></svg></span>')

# id, 이름, 글자색, 물듦, 안쪽 발광, (파티클색, 모양, 움직임, 개수), 도형, 도형 움직임
S = [
 ("bleed","출혈","#ff5a4a","radial-gradient(ellipse at 50% -10%,rgba(176,20,18,.9) 0%,rgba(120,14,12,.58) 50%,rgba(70,8,8,.26) 100%)",
  "inset 0 8px 10px -4px rgba(255,45,36,.85)",("linear-gradient(#ff4436,#8d1310)","drop","fall",3),BLEED,"ooze"),
 ("poison","독","#b8e04a","radial-gradient(ellipse at 50% 115%,rgba(96,150,20,.88) 0%,rgba(66,110,16,.58) 50%,rgba(34,58,10,.28) 100%)",
  "inset 0 -9px 11px -4px rgba(180,230,60,.85)",("radial-gradient(circle at 35% 30%,#e6ff9a,#7fbf1e)","bub","rise",4),POISON,"boil"),
 ("bind","포박","#7fbf8a","radial-gradient(ellipse at 50% 50%,rgba(24,52,30,.35) 0%,rgba(28,58,32,.7) 62%,rgba(14,32,18,.9) 100%)",
  "inset 0 0 12px 3px rgba(20,44,24,.95)",(None,None,None,0),BIND,"squeeze"),
 ("stun","기절","#dfe6ee","radial-gradient(ellipse at 50% 50%,rgba(120,130,145,.48) 0%,rgba(78,86,100,.66) 60%,rgba(46,52,62,.78) 100%)",
  "inset 0 0 10px 2px rgba(215,232,255,.55)",("#eef6ff","shard","spark",3),STUN,"none"),
 ("curse","저주","#c78cff","radial-gradient(ellipse at 20% 110%,rgba(28,8,44,.88) 0%,rgba(40,12,60,.6) 45%,rgba(18,6,28,.28) 100%),"
  "radial-gradient(ellipse at 85% -10%,rgba(30,8,46,.82) 0%,rgba(20,6,32,.26) 60%)",
  "inset 0 0 12px 3px rgba(150,70,220,.6)",("#b489e0","ash","rise",4),CURSE,"creep"),
 ("bless","축복","#f3ecdd","radial-gradient(ellipse at 50% 30%,rgba(240,236,225,.5) 0%,rgba(190,188,182,.36) 55%,rgba(120,120,118,.28) 100%)",
  "inset 0 0 14px 4px rgba(255,253,245,.95)",("#fffdf2","mote","rise",3),BLESS,"hover"),
 ("confuse","혼란","#c68cff","","",(None,None,None,0),"","none"),
 ("seal","봉인","#8fa8e0","","",(None,None,None,0),"","none"),
 ("rot","부패","#d98cc0","radial-gradient(ellipse at 50% 42%,rgba(120,30,86,.7) 0%,rgba(78,26,60,.58) 48%,rgba(44,20,34,.4) 100%)",
  "inset 0 0 11px 2px rgba(230,120,190,.55)",("#e7a3cf","spore","swell",3),ROT,"bulge"),
 ("chain","결속","#a8c2d8","radial-gradient(ellipse at 50% 50%,rgba(40,54,68,.4) 0%,rgba(30,42,56,.64) 60%,rgba(18,26,36,.8) 100%)",
  "inset 0 0 10px 2px rgba(170,205,235,.5)",(None,None,None,0),CHAIN,"taut"),
 ("numb","마비","#8fd4ff","radial-gradient(ellipse at 50% 50%,rgba(60,120,190,.7) 0%,rgba(30,70,130,.58) 60%,rgba(14,34,70,.4) 100%)",
  "inset 0 0 9px 1px rgba(150,220,255,.8)",("#dff2ff","spark","spark",3),"ARC","none"),
 ("plunder","약탈","#d9a05a","radial-gradient(ellipse at 70% 80%,rgba(120,74,26,.78) 0%,rgba(84,54,22,.58) 50%,rgba(46,32,16,.34) 100%)",
  "inset 0 0 10px 2px rgba(215,150,70,.6)",("radial-gradient(circle at 35% 30%,#e8bd72,#8a5f22)","coin","fall",2),PLUNDER,"grab"),
 ("devour","잠식","#9fd8f0","","",("#bfe6f7","frag","suck",4),"","none"),
]
POS=[(15,18),(31,26),(23,34),(38,14)]
css,dies=[],[]
for sid,name,col,tint,rim,(pc,psh,pan,pn),svg,mot in S:
    if tint: css.append(f".t-{sid} .tint{{background:{tint}}}")
    if rim:  css.append(f".t-{sid} .tint2{{box-shadow:{rim}}}")
    css.append(f".t-{sid} .nm{{color:{col}}}")
    if mot!="none": css.append(f".t-{sid} .fx{{animation:{mot} 2.4s ease-in-out infinite}}")
    parts=""
    for i in range(pn):
        x,y=POS[i]
        css.append(f".t-{sid} .p{i}{{left:{x}px;top:{y}px;background:{pc};animation:{pan} 2.4s ease-in-out infinite {i*0.7:.2f}s}}")
        parts+=f'<span class="pt {psh} p{i}"></span>'
    fx = ARC if svg=="ARC" else (f'<span class="fx"><svg viewBox="0 0 46 46">{svg}</svg></span>' if svg else "")
    extra = {'confuse':'<span class="mist"></span>',
             'seal':'<span class="sealbar b1"></span><span class="sealbar b2"></span><span class="wax"></span>',
             'devour':'<span class="rim"></span>'}.get(sid,"")
    dies.append(f'<div class="holder"><div class="die t-{sid}"><img src="{PIP}">'
                f'<span class="tint"></span>{fx}{extra}<span class="tint2"></span>{parts}<span class="nm">{name}</span></div></div>')

TPL = open(R+'tools/states_shell.html', encoding='utf-8').read()
out = TPL.replace('/*__CSS__*/', "\n".join(css)).replace('<!--__DIES__-->', "\n".join(dies))
out = out.replace('__BG__', BG).replace('__PAD__', PAD)
open(R+'tools/allstates.html','w',encoding='utf-8').write(out)
print('생성 완료', round(len(out)/1024), 'KB · 주사위', out.count('class="die t-'), '개')
