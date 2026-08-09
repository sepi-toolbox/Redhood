// 원형(빌드)별 실측 — 짜둔 덱으로 한 적을 붙여보고 최대 한 방까지 잰다
//   node test/build.mjs [적id] [층]
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


// 기믹을 읽는 플레이 — 요구를 지키고, 문턱 아래로는 안 때리고, 상한 위는 낭비로 친다
function gimAdjust(battle,p,v){
  for(const e of aliveEnemies(battle)){
    if(e.demand){
      const ok = e.demand.category ? p.cat.id===e.demand.category : p.cat.kind===e.demand.kind;
      if(ok) v += e.demand.damage*1.5;                       // 지키면 그만큼 안 맞는다
    }
    if(e.wardLeft>0 && p.bd.total>0 && p.bd.total<=e.ward) v -= p.bd.total;         // 헛방 — 피해가 없는 셈
    if(e.capLeft>0 && p.bd.total>e.cap) v -= (p.bd.total-e.cap);                    // 넘긴 만큼 버려진다
  }
  return v;
}

function scoreChoice(battle,p,smart){
  const ab=p.variant.ability, ops=ab?(Array.isArray(ab)?ab:[ab]):[]; const p_=battle.player;
  const danger=1-p_.hp/p_.maxHp;
  const incoming=aliveEnemies(battle).reduce((s,e)=>s+(e.nextMove?.effects||[]).filter(f=>f.op==='damage')
    .reduce((t,f)=>t+Math.round(f.amount*(e.atkScale||1))+(e.power||0),0),0);
  const turnsLeft=Math.max(1,12-battle.turn); let v=p.bd.total;
  for(const o of ops){ const amt=o.amount||0;
    if(o.op==='block') v+=Math.min(amt,incoming)*(1+danger*2);
    else if(o.op==='strength') v+=amt*turnsLeft*0.8; else if(o.op==='focus') v+=amt*turnsLeft*1.2;
    else if(o.op==='regen') v+=amt*turnsLeft*(0.6+danger); else if(o.op==='weakEnemy') v+=amt*turnsLeft*0.7;
    else if(o.op==='bleed') v+=amt*2.2; else if(o.op==='vulnerable') v+=amt*turnsLeft*0.5;
    else if(o.op==='whet') v+=amt*0.5*Math.max(12,p.bd.total)*(turnsLeft>1?1:0); }
  return smart ? gimAdjust(battle,p,v) : v;
}

// 원형별 덱 — 유물·주사위·족보를 다 갖췄을 때를 본다
const BUILDS = {
  '시작': { dice:['normal','normal','normal','normal','normal'], relics:[],
    cats:{chance:['instinct'],onePair:['clasped_hands'],threeKind:['triple_axe']} },
  '지금 만렙(예전 방식)': { dice:['gold','lead','high','lead','high'],
    relics:['wolf_fang','wolfmoon_pendant','old_bone','poison_apple','red_cloak'],
    cats:{chance:['instinct'],onePair:['red_shoes'],twoPair:['twin_sisters'],threeKind:['triple_axe'],
      fourKind:['heavy_blow'],fullHouse:['cottage'],smallStraight:['hunt_drive']} },
  '🩸 사냥': { dice:['nail','nail','mirror','twin','gold'],
    relics:['hunters_eye','whetstone','old_bone','silver_bullet','grandma_book'],
    cats:{chance:['catch_breath'],onePair:['clasped_hands'],threeKind:['chopping'],
      fourKind:['hunger'],yahtzee:['blood_moon']} },
  '🌾 길': { dice:['chainlink','guide','moonlit','normal','gold'],
    relics:['waymark','silver_knife','moss_compass','red_cloak','fate_thimble'],
    cats:{chance:['catch_breath'],onePair:['clasped_hands'],smallStraight:['windpath'],
      largeStraight:['moonpath'],threeKind:['chopping']} },
  '🔥 피': { dice:['cursed','cursed','fang','spark','gold'],
    relics:['leech_ring','dried_heart','poison_apple','whetstone','wolf_pelt'],
    cats:{chance:['catch_breath'],onePair:['clasped_hands'],threeKind:['chopping'],
      fourKind:['hunger'],twoPair:['two_moons']} },
  '🛡 둥지': { dice:['straw','bramble','straw','normal','gold'],
    relics:['bears_back','gate_bar','firewood','whetstone','hunters_charm'],
    cats:{chance:['catch_breath'],onePair:['clasped_hands'],twoPair:['twin_sisters'],
      fullHouse:['cottage'],smallStraight:['hunt_drive']} },
};

function fight(b0, id, floor, log, smart){
  const run={hp:60,maxHp:60,act:1,floor,enlight:0,relics:[...b0.relics],
    dice:[...b0.dice],categories:JSON.parse(JSON.stringify(b0.cats))};
  const b=createBattle(run,[id],'battle'); let g=0; let peak=0, peakWhet=0, sum=0, n=0;
  while(!b.over&&g++<60){
    initialRoll(b);
    for(let rr=0;rr<3&&b.rollsLeft>0;rr++){
      const pv=previewAll(b).filter(p=>!p.locked&&p.bd.total>0);
      const best=pv.sort((a,c)=>scoreChoice(b,c,smart)-scoreChoice(b,a,smart))[0];
      if(best&&scoreChoice(b,best,smart)>=40) break;
      const keep=new Set((best?.bd.contributing)||[]);
      b.dice.forEach((d,i)=>{ if(keep.has(i)!==d.held) toggleHold(b,i); });
      if(!reroll(b)) break;
    }
    const pv=previewAll(b).filter(p=>!p.locked&&p.bd.total>0);
    if(!pv.length){ b.over=true; b.result='defeat'; break; }
    const best=pv.sort((a,c)=>scoreChoice(b,c,smart)-scoreChoice(b,a,smart))[0];
    peakWhet=Math.max(peakWhet,b.whet);
    const e=aliveEnemies(b)[0], nm=e&&e.nextMove&&e.nextMove.name;
    const whetNow=b.whet;
    confirmCategory(b,best.cat.id,best.variant.id,e&&e.uid);
    peak=Math.max(peak,best.bd.total); sum+=best.bd.total; n++;
    if(log) console.log(`${String(b.turn).padStart(2)}턴 ${best.variant.name.padEnd(10)} ${String(best.bd.total).padStart(3)} 피해 (벼름 ${whetNow} · ×${(1+Math.min(whetNow,10)*0.5).toFixed(1)}) · 적HP ${Math.max(0,e.hp)} · 적:${nm||'?'}`);
    if(b.over) break;
    enemyPhase(b);
  }
  return {win:b.result!=='defeat',turns:b.turn,lost:Math.min(60,60-b.player.hp),peak,peakWhet,avg:sum/Math.max(1,n)};
}

const id=process.argv[2]||'wolf', fl=Number(process.argv[3]||8);
console.log(`=== ${DB.enemyById[id].name} · ${fl}층 · 원형별 실측 (1200판)\n`);
console.log('빌드'.padEnd(22)+' 기믹무시  기믹읽음   차이 | 잃는HP  턴   족보평균  최대한방  최대벼름');
const base={};
for(const [name,b0] of Object.entries(BUILDS)){
  const N=1200; const run=(smart)=>{ let w=0,l=0,t=0,pk=0,pw=0,av=0;
    for(let k=0;k<N;k++){const r=fight(b0,id,fl,false,smart); if(r.win)w++; l+=r.lost; t+=r.turns; pk+=r.peak; pw+=r.peakWhet; av+=r.avg;}
    return {w:w/N,l:l/N,t:t/N,pk:pk/N,pw:pw/N,av:av/N}; };
  const dumb=run(false), sm=run(true);
  if(!base.peak) base.peak=sm.pk;
  console.log(name.padEnd(22)
    +`${(dumb.w*100).toFixed(0).padStart(6)}% ${(sm.w*100).toFixed(0).padStart(8)}% ${((sm.w-dumb.w)*100).toFixed(0).padStart(6)}%p | `
    +`${sm.l.toFixed(1).padStart(5)} ${sm.t.toFixed(1).padStart(5)} `
    +`${sm.av.toFixed(1).padStart(8)} ${sm.pk.toFixed(1).padStart(9)} ${sm.pw.toFixed(1).padStart(9)}`
    +`  (시작 대비 ${(sm.pk/base.peak).toFixed(1)}배)`);
}
if(process.argv[4]==='log'){
  const pick=process.argv[5]||'🩸 사냥';
  console.log(`\n[한 판 예시 · ${pick}]`);
  fight(BUILDS[pick],id,fl,true,true);
}
