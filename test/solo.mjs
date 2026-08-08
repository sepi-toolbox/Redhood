// 진짜 주사위 게임을 돌려서 한 적만 붙여본다 (sim500 의 AI 를 그대로 씀)
import { readFileSync } from 'fs';
globalThis.localStorage={_d:{},getItem(k){return this._d[k]??null},setItem(k,v){this._d[k]=String(v)},removeItem(k){delete this._d[k]}};
const load = p => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), 'utf8'));
const { DB } = await import('../js/data.js');
Object.assign(DB,{dice:load('dice.json'),relics:load('relics.json'),scoring:load('scoring.json'),
  enemies:load('enemies.json'),act1:load('act1.json'),events:load('events.json'),acts:load('acts.json'),statuses:load('statuses.json')});
DB.diceById=Object.fromEntries(DB.dice.map(d=>[d.id,d]));
DB.relicById=Object.fromEntries(DB.relics.map(r=>[r.id,r]));
DB.enemyById=Object.fromEntries(DB.enemies.map(e=>[e.id,e]));
DB.statusById=Object.fromEntries(DB.statuses.list.map(s=>[s.id,s]));
const eng=await import('../js/engine.js');
const {previewAll,createBattle,initialRoll,reroll,confirmCategory,enemyPhase,aliveEnemies,toggleHold}=eng;

function scoreChoice(battle,p){
  const ab=p.variant.ability, ops=ab?(Array.isArray(ab)?ab:[ab]):[]; const p_=battle.player;
  const danger=1-p_.hp/p_.maxHp;
  const incoming=aliveEnemies(battle).reduce((s,e)=>s+(e.nextMove?.effects||[]).filter(f=>f.op==='damage')
    .reduce((t,f)=>t+Math.round(f.amount*(e.atkScale||1))+(e.power||0),0),0);
  const turnsLeft=Math.max(1,12-battle.turn); let v=p.bd.total;
  for(const o of ops){ const amt=o.amount||0;
    if(o.op==='block') v+=Math.min(amt,incoming)*(1+danger*2);
    else if(o.op==='strength') v+=amt*turnsLeft*0.8; else if(o.op==='focus') v+=amt*turnsLeft*1.2;
    else if(o.op==='regen') v+=amt*turnsLeft*(0.6+danger); else if(o.op==='weakEnemy') v+=amt*turnsLeft*0.7;
    else if(o.op==='bleed') v+=amt*2.2; else if(o.op==='vulnerable') v+=amt*turnsLeft*0.5; }
  return v;
}
// 진행도: 유물(평타 +N)과 족보 수로 흉내낸다
const CATS = {chance:['instinct'],onePair:['clasped_hands'],twoPair:['twin_sisters'],
  threeKind:['triple_axe'],fullHouse:['cottage'],smallStraight:['windpath'],
  largeStraight:['moonpath'],fourKind:['four_fangs'],yahtzee:['judgment_night']};
function deckAt(level){
  const keys=Object.keys(CATS).slice(0, Math.min(Object.keys(CATS).length, 2+level));
  const c={}; for(const k of keys) c[k]=CATS[k]; return c;
}
function fight(id,level,floor,log){
  const run={hp:60,maxHp:60,act:1,floor,enlight:0,
    relics:Array.from({length:level},()=>'wolf_fang'),
    dice:['normal','normal','normal','normal','normal'],categories:deckAt(level)};
  const b=createBattle(run,[id],'battle'); let g=0; const dmgBy={}; const stSeen={}; const dealt=[]; let maxPow=0, brk=0;
  while(!b.over&&g++<60){
    initialRoll(b);
    for(let rr=0;rr<2&&b.rollsLeft>0;rr++){
      const pv=previewAll(b).filter(p=>!p.locked&&p.bd.total>0);
      const best=pv.sort((a,c)=>scoreChoice(b,c)-scoreChoice(b,a))[0];
      if(best&&scoreChoice(b,best)>=32) break;
      const keep=new Set((best?.bd.contributing)||[]);
      b.dice.forEach((d,i)=>{ if(keep.has(i)!==d.held) toggleHold(b,i); });
      if(!reroll(b)) break;
    }
    for(const d of b.dice) if(d.st) stSeen[DB.statusById[d.st.kind].name]=(stSeen[DB.statusById[d.st.kind].name]||0)+1;
    const pv=previewAll(b).filter(p=>!p.locked&&p.bd.total>0);
    if(!pv.length){ b.over=true; b.result='defeat'; break; }
    const best=pv.sort((a,c)=>scoreChoice(b,c)-scoreChoice(b,a))[0];
    dealt.push(best.bd.total);
    const e=aliveEnemies(b)[0], nm=e&&e.nextMove&&e.nextMove.name, hp1=b.player.hp;
    const _r=confirmCategory(b,best.cat.id,best.variant.id,e&&e.uid); if(log&&_r==null) console.log('CONFIRM NULL', best.cat.id, best.variant.id, 'await',JSON.stringify(b.await),'rolled',b.rolled,'owned',JSON.stringify(b.categories[best.cat.id]));
    if(b.over) break;
    if(e&&e.nextMove&&e.nextMove.broken) brk++;
    enemyPhase(b);
    if(nm) dmgBy[nm]=(dmgBy[nm]||0)+(hp1-b.player.hp);
    maxPow=Math.max(maxPow,e.power||0);
    if(log) console.log(`${String(b.turn-1).padStart(2)}턴 ${(nm||'?').padEnd(12)} 내 족보 ${String(best.bd.total).padStart(2)} (${best.variant.name}) · 맞음 ${String(hp1-b.player.hp).padStart(3)} · 내HP ${String(Math.max(0,b.player.hp)).padStart(2)} · 적HP ${String(Math.max(0,e.hp)).padStart(3)} · 적힘 ${e.power||0}`);
  }
  return {win:b.result!=='defeat',turns:b.turn,lost:Math.min(60,60-b.player.hp),dmgBy,stSeen,maxPow,brk,
          avg:dealt.reduce((a,c)=>a+c,0)/Math.max(1,dealt.length)};
}
const id=process.argv[2], fl=Number(process.argv[3]||5);
if(process.argv[4]==='log'){ fight(id,3,fl,true); console.log(''); }
console.log(`=== ${DB.enemyById[id].name} · ${fl}층 · 진행도별 (진행도 = 유물 수, 족보 폭도 같이 늘어남)`);
for(const lv of [0,1,2,3,4,5,6]){
  const N=600; let w=0,l=0,t=0,av=0,mp=0,bk=0; const dg={}, ss={};
  for(let k=0;k<N;k++){const r=fight(id,lv,fl); if(r.win)w++; l+=r.lost; t+=r.turns; av+=r.avg; mp+=r.maxPow; bk+=r.brk;
    for(const[a,v]of Object.entries(r.dmgBy)) dg[a]=(dg[a]||0)+v;
    for(const[a,v]of Object.entries(r.stSeen)) ss[a]=(ss[a]||0)+v;}
  const top=Object.entries(dg).sort((a,c)=>c[1]-a[1]).slice(0,3).map(([a,v])=>`${a} ${(v/N).toFixed(0)}`).join(' · ');
  const st=Object.entries(ss).sort((a,c)=>c[1]-a[1]).slice(0,3).map(([a,v])=>`${a} ${(v/N).toFixed(1)}`).join(' · ');
  console.log(`진행도 ${lv} · 족보 평균 ${(av/N).toFixed(1)} → 승률 ${(w/N*100).toFixed(0).padStart(3)}% · 잃는 HP ${(l/N).toFixed(1).padStart(4)} · ${(t/N).toFixed(1)}턴 · 최대 적힘 ${(mp/N).toFixed(1)} · 파쇄 ${(bk/N).toFixed(1)}회 · 피해원천 ${top}${st?' | 걸린 상태 '+st:''}`);
}
