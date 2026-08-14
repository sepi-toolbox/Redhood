// balance.mjs — 밸런스 전수조사 (v3.38)
//   sim500 의 '아무거나 고르는' 봇 대신 '생각하는 보통 플레이어'로 한 판을 끝까지 돌린다.
//   달라진 점: 보상은 값어치 순으로 고르고, 다치면 쉼터로 가고, 성할 때만 정예를 치고,
//              상점은 비싼 것부터 살 수 있는 만큼 사고, 사건은 체력이 낮으면 안전한 쪽을 고른다.
//   내는 것: 노드 유형별 승률·소모 / 적별 승률·소모 / 층별 체력 곡선.
//   쓰는 법: node test/balance.mjs [판수]
import { readFileSync } from 'fs';
import * as require$fs from 'fs';
globalThis.localStorage = { _d:{}, getItem(k){return this._d[k]??null;}, setItem(k,v){this._d[k]=String(v);}, removeItem(k){delete this._d[k];} };
const load = p => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), 'utf8'));
const { DB } = await import('../js/data.js');
Object.assign(DB, { dice:load('dice.json'), relics:load('relics.json'), scoring:load('scoring.json'),
  enemies:load('enemies.json'), act1:load('act1.json'), events:load('events.json'), acts:load('acts.json'),
  statuses:load('statuses.json'), cards:load('cards.json'), layout:load('layout.json') });
DB.statusById=Object.fromEntries(DB.statuses.list.map(x=>[x.id,x]));
DB.cardById=Object.fromEntries(DB.cards.list.map(c=>[c.id,c]));
DB.diceById=Object.fromEntries(DB.dice.map(d=>[d.id,d]));
DB.relicById=Object.fromEntries(DB.relics.map(r=>[r.id,r]));
DB.enemyById=Object.fromEntries(DB.enemies.map(e=>[e.id,e]));
DB.weaponById=Object.fromEntries(DB.events.weapons.map(w=>[w.id,w]));
DB.eventById=Object.fromEntries(DB.events.events.map(e=>[e.id,e]));
// 실험용 덮어쓰기 — PATCH=<json파일> 로 넘기면 DB 위에 얹는다 (데이터 파일은 그대로 둔 채 값만 바꿔 재본다)
if (process.env.PATCH) {
  const deepMerge = (a, b) => { for (const k of Object.keys(b)) {
    if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') deepMerge(a[k], b[k]);
    else a[k] = b[k]; } return a; };
  const pt = JSON.parse(readFileSync(process.env.PATCH, 'utf8'));
  if (pt.act1) deepMerge(DB.act1, pt.act1);
  if (pt.acts) deepMerge(DB.acts, pt.acts);
  if (pt.enemies) for (const [id, v] of Object.entries(pt.enemies)) { if (DB.enemyById[id]) deepMerge(DB.enemyById[id], v); }
  if (pt.statuses) deepMerge(DB.statuses, pt.statuses);
}
const eng = await import('../js/engine.js');
const run_ = await import('../js/run.js');
const { previewAll, createBattle, initialRoll, reroll, confirmCategory, enemyPhase, aliveEnemies, toggleHold, confirmVoidCall } = eng;

function gimAdjust(b,p,v){ for(const e of aliveEnemies(b)){ if(e.demand){const ok=e.demand.category?p.cat.id===e.demand.category:p.cat.kind===e.demand.kind; if(ok)v+=e.demand.damage*1.5;} if(e.wardLeft>0&&p.bd.total>0&&p.bd.total<=e.ward)v-=p.bd.total; if(e.capLeft>0&&p.bd.total>e.cap)v-=(p.bd.total-e.cap);} return v; }
function scoreChoice(b,p){ const ab=p.variant.ability; const ops=ab?(Array.isArray(ab)?ab:[ab]):[]; const p_=b.player;
  const danger=1-p_.hp/p_.maxHp;
  const incoming=aliveEnemies(b).reduce((s,e)=>s+(e.nextMove?.effects||[]).filter(f=>f.op==='damage').reduce((t,f)=>t+Math.round(f.amount*(e.atkScale||1))+(e.strength||0),0),0);
  const turnsLeft=Math.max(1,12-b.turn); let v=p.bd.total;
  for(const o of ops){ const amt=o.amount||0;
    if(o.op==='block')v+=Math.min(amt,incoming)*(1+danger*2);
    else if(o.op==='strength')v+=amt*turnsLeft*0.8; else if(o.op==='focus')v+=amt*turnsLeft*1.2;
    else if(o.op==='regen')v+=amt*turnsLeft*(0.6+danger); else if(o.op==='weakEnemy')v+=amt*turnsLeft*0.7;
    else if(o.op==='bleed')v+=amt*2.2; else if(o.op==='vulnerable')v+=amt*turnsLeft*0.5;
    else if(o.op==='whet')v+=(b.whet>=6?0:amt*0.5*Math.max(12,p.bd.total))*(turnsLeft>1?1:0); }
  return gimAdjust(b,p,v); }


const TIERV = { common:1, uncommon:2, rare:3, epic:4, legendary:5 };
const tv = x => TIERV[(x && x.tier) || 'common'] || 1;
function cardValue(run, c) {
  if (!c) return -1;
  const it = c.item || c;
  if (c.kind === 'relic') return 100 + tv(it) * 5;
  if (c.kind === 'category' && it.cat) {
    const cur = run.categories[it.cat.id];
    if (!cur) return 90 + tv(it.variant) * 6;                       // 빈 자리를 먼저 채운다
    const curV = (DB.scoring.categories.find(x=>x.id===it.cat.id)?.variants||[]).find(v=>v.id===cur);
    return tv(it.variant) > tv(curV) ? 55 + tv(it.variant) * 6 : 8; // 더 좋은 변형이면 갈아끼운다
  }
  if (c.kind === 'die') return 30 + tv(it) * 10;
  return 5;
}
function takeBest(run, cards) {
  const c = (cards||[]).map(x=>({x,v:cardValue(run,x)})).sort((a,b)=>b.v-a.v)[0];
  if (!c || !c.x) return;
  const it = c.x.item || c.x;
  if (c.x.kind === 'relic') run_.applyRelicPickup(run, it);
  else if (c.x.kind === 'die') {
    const worst = run.dice.map((d,i)=>({i,v:tv(DB.diceById[d])})).sort((a,b)=>a.v-b.v)[0];
    if (tv(it) >= worst.v) run.dice[worst.i] = it.id;               // 제일 약한 주사위를 바꾼다
  }
  else if (c.x.kind === 'category' && it.cat) run.categories[it.cat.id] = it.variant.id;
}
// 어디로 갈까 — 다치면 쉼터, 성하면 정예
function pickNode(run, reach) {
  const r = run.hp / run.maxHp;
  const score = (t) => {
    if (t === 'rest')  return r < 0.85 ? 100 * (1 - r) + 20 : 5;
    if (t === 'elite') return r > 0.75 ? 55 : r > 0.55 ? 20 : -40;
    if (t === 'shop')  return run.coins >= 60 ? 50 : 25;
    if (t === 'event') return 35;
    return 30;                                                       // 일반 전투
  };
  return reach.map(i => ({ i, s: score(run.map.floors[run.floor][i].type) + Math.random() * 6 }))
              .sort((a,b)=>b.s-a.s)[0].i;
}

const S = { node:{}, foe:{}, dmg:{}, pool:{} };
function rec(t, win, hpBefore, hpAfter, maxHp){
  const k=S.node[t]||(S.node[t]={n:0,w:0,lost:0,hpin:0});
  k.n++; if(win){k.w++; k.lost+=hpBefore-hpAfter;} k.hpin+=hpBefore/maxHp;
}
function playBattle(run,type){
  const ids=run_.rollEncounter(run,type); const b=createBattle(run,ids,type); let g=0;
  const hp0=run.hp;
  while(!b.over&&g++<200){ initialRoll(b);
    for(let rr=0;rr<6&&b.rollsLeft>0;rr++){ const pv=previewAll(b).filter(p=>!p.locked&&p.bd.total>0);
      const best=pv.sort((x,y)=>scoreChoice(b,y)-scoreChoice(b,x))[0];
      if(best&&scoreChoice(b,best)>=32)break;
      const keep=new Set(best?.bd.contributing||[]);
      b.dice.forEach((d,i)=>{ if(keep.has(i)!==d.held)toggleHold(b,i); });
      if(!reroll(b))break; }
    const pv=previewAll(b).filter(p=>!p.locked&&p.bd.total>0);
    if(pv.length===0){ if(b.voidLocked&&confirmVoidCall(b)){ if(b.over)break; enemyPhase(b); continue; } eng.endTurnStatus(b); if(b.over)break; b.await='enemy'; enemyPhase(b); continue; }
    const best=pv.sort((x,y)=>scoreChoice(b,y)-scoreChoice(b,x))[0];
    (S.dmg[run.act] ||= []).push(best.bd.total);
    const alive=[...aliveEnemies(b)].sort((x,y)=>x.hp-y.hp);
    confirmCategory(b,best.cat.id,best.variant.id,alive[0]?.uid);
    if(b.over)break; enemyPhase(b); }
  run.hp=b.player.hp;
  for (const e of b.enemies) (S.pool[`${run.act}막-${e.tier}`] ||= []).push(e.maxHpInit);
  const win=b.result==='victory';
  rec(`${run.act}막-${type}`, win, hp0, b.player.hp, run.maxHp);
  for (const id of new Set(ids)) {
    const e = DB.enemyById[id]; if (!e) continue;
    const k = S.foe[id] || (S.foe[id] = { name:e.name, tier:e.tier, n:0, w:0, lost:0, turns:0, solo:0 });
    k.n++; k.turns += b.turn; if (ids.length===1) k.solo++;
    if (win) { k.w++; k.lost += (hp0 - b.player.hp) / run.maxHp; }
  }
  return win;
}
const N=Number(process.argv[2]||2000);
const hpCurve={};
const reached=[]; let clears=0;
for(let i=0;i<N;i++){
  const run=run_.newRun(); run_.chooseWeapon(run,DB.events.weapons[i%DB.events.weapons.length].id);
  let alive=true,g=0;
  while(alive&&g++<60){ const reach=run_.reachableNodes(run); if(!reach.length)break;
    const idx=pickNode(run,reach); const f=run.floor; const node=run.map.floors[f][idx];
    run.floor=f+1; run.pos=idx; run.path[f]=idx;
    (hpCurve[`${run.act}-${run.floor}`] ||= []).push(run.hp/run.maxHp);
    if(['battle','elite','boss'].includes(node.type)){
      if(!playBattle(run,node.type)){alive=false;break;}
      if(node.type==='boss'){ const r=run_.bossRelicChoices(run); if(r[0])run_.applyRelicPickup(run,r[0].item||r[0]);
        takeBest(run, run_.bossLegendaryChoices(run));
        if(run.act>=3){clears++;break;} run_.advanceAct(run); }
      else { run.coins+=run_.coinReward(run,node.type);
        takeBest(run, run_.rollRewards(run,node.type));
        if(node.type==='elite'){const er=run_.eliteRelicChoices(run); if(er.length)takeBest(run, er.map(x=>x.kind?x:{kind:'relic',item:x.item||x}));} }
    } else if(node.type==='shop'){ const st=[...run_.rollShopStock(run)].sort((a,b)=>cardValue(run,b)-cardValue(run,a));
      for(const it of st){ if(run.coins>=(it.price||999)){ run.coins-=it.price; takeBest(run,[it]); } } }
    else if(node.type==='rest'){ run_.applyRest(run); }
    else if(node.type==='event'){ const ev=run_.pickEvent(run);
      const cost=c=>(c.effects||[]).filter(e=>e.op==='hp'&&e.amount<0).reduce((s,e)=>s-e.amount,0);
      const cs=[...ev.choices].sort((a,b)=>cost(a)-cost(b));
      const ch=(run.hp/run.maxHp<0.6?cs[0]:ev.choices[Math.floor(Math.random()*ev.choices.length)]);
      run_.applyEventEffects(run,ch.effects); }
    if(run.hp<=0)alive=false; }
  reached.push(run.act);
}
if (process.env.JSONOUT) {
  const out = { runs:N, clears, reached, node:S.node, foe:S.foe,
    dmg:Object.fromEntries(Object.entries(S.dmg).map(([k,v])=>[k, v.reduce((a,b)=>a+b,0)/v.length])) };
  require$fs.writeFileSync(process.env.JSONOUT, JSON.stringify(out));
}
console.log(`=== ${N}판 · 생각하는 보통 플레이어 ===`);
console.log(`클리어율 ${(clears/N*100).toFixed(1)}%  ·  도달 막  1막 ${reached.filter(a=>a===1).length} / 2막 ${reached.filter(a=>a===2).length} / 3막 ${reached.filter(a=>a===3).length}\n`);
console.log('노드 유형별 (판수 / 승률 / 이겼을 때 잃은 체력 / 진입 시 체력%)');
for(const [k,v] of Object.entries(S.node).sort())
  console.log(`${k.padEnd(10)} ${String(v.n).padStart(5)}판  승률 ${(v.w/v.n*100).toFixed(1).padStart(5)}%  잃음 ${v.w?(v.lost/v.w).toFixed(1).padStart(4):'   -'}  진입체력 ${(v.hpin/v.n*100).toFixed(0)}%`);
console.log('\n막별 힘겨루기 — 내 족보 한 방 평균 vs 적 체력 평균 (몇 방에 죽나)');
for (const a of [1,2,3]) {
  const d = S.dmg[a]; if (!d || !d.length) continue;
  const m = d.reduce((x,y)=>x+y,0)/d.length;
  const line = ['normal','elite','boss'].map(t=>{ const p=S.pool[`${a}막-${t}`]; if(!p||!p.length) return null;
    const h=p.reduce((x,y)=>x+y,0)/p.length; return `${t} ${h.toFixed(0)}(${(h/m).toFixed(1)}방)`; }).filter(Boolean).join('  ');
  console.log(`${a}막  한 방 ${m.toFixed(1)}  |  ${line}`);
}
console.log('\n적별 (30판 이상만) — 판수 / 승률 / 이겼을 때 잃은 체력% / 평균 턴');
const rows=Object.entries(S.foe).map(([id,v])=>({id,...v})).filter(v=>v.n>=30);
const T={normal:0,elite:1,boss:2};
rows.sort((a,b)=>T[a.tier]-T[b.tier]||a.w/a.n-b.w/b.n);
for(const v of rows) console.log(`${v.tier.padEnd(6)} ${v.name.padEnd(12)} ${String(v.n).padStart(5)}판  승률 ${(v.w/v.n*100).toFixed(1).padStart(5)}%  잃음 ${v.w?(v.lost/v.w*100).toFixed(0).padStart(3):'  -'}%  턴 ${(v.turns/v.n).toFixed(1)}`);
console.log('\n층별 진입 시 평균 체력%');
console.log(Object.entries(hpCurve).sort((a,b)=>a[0].localeCompare(b[0],undefined,{numeric:true})).map(([k,v])=>`${k}:${(v.reduce((a,b)=>a+b,0)/v.length*100).toFixed(0)}%(${v.length})`).join(' '));
