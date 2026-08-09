// 벼름 한 스택이 실제로 얼마짜리인가 — 계수를 바꿔가며 이긴 비율로 되짚는다
//   node test/whetvalue.mjs [적id] [층]
import { readFileSync } from 'fs';
globalThis.localStorage={_d:{},getItem:()=>null,setItem(){},removeItem(){}};
const load = p => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), 'utf8'));
const { DB } = await import('../js/data.js');
Object.assign(DB,{dice:load('dice.json'),relics:load('relics.json'),scoring:load('scoring.json'),
  enemies:load('enemies.json'),act1:load('act1.json'),events:load('events.json'),acts:load('acts.json'),statuses:load('statuses.json')});
DB.diceById=Object.fromEntries(DB.dice.map(d=>[d.id,d]));
DB.relicById=Object.fromEntries(DB.relics.map(r=>[r.id,r]));
DB.enemyById=Object.fromEntries(DB.enemies.map(e=>[e.id,e]));
DB.statusById=Object.fromEntries(DB.statuses.list.map(s=>[s.id,s]));
const Y=await import('../js/yahtzee.js');
const eng=await import('../js/engine.js');
const {previewAll,createBattle,initialRoll,reroll,confirmCategory,enemyPhase,aliveEnemies,toggleHold}=eng;

const BUILDS={
 '시작': { dice:['normal','normal','normal','normal','normal'], relics:[],
   cats:{chance:'catch_breath',onePair:'clash'} },
 '🩸 사냥': { dice:['nail','nail','mirror','twin','gold'],
   relics:['hunters_eye','whetstone','old_bone','silver_bullet','grandma_book'],
   cats:{chance:'catch_breath',onePair:'clasped_hands',threeKind:'chopping',
     fourKind:'heavy_blow',yahtzee:'judgment_night'} },
 '🌾 길': { dice:['chainlink','guide','moonlit','normal','gold'],
   relics:['waymark','silver_knife','moss_compass','red_cloak','fate_thimble'],
   cats:{chance:'catch_breath',onePair:'clasped_hands',largeStraight:'snare',
     largeStraight:'storm_run',threeKind:'chopping'} },
 '🛡 둥지': { dice:['straw','bramble','straw','normal','gold'],
   relics:['bears_back','gate_bar','firewood','whetstone','hunters_charm'],
   cats:{chance:'catch_breath',onePair:'clash',twoPair:'twin_sisters',
     fullHouse:'wedge',largeStraight:'hunt_drive'} },
};
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
    else if(o.op==='bleed') v+=amt*2.2; else if(o.op==='vulnerable') v+=amt*turnsLeft*0.5;
    // 벼름 한 스택의 값 = 내가 나중에 터뜨릴 일격의 기본값 × STEP. 그 기본값을 EXPECT 로 본다.
    else if(o.op==='whet') v+=(battle.whet>=DB.scoring.whetCap?0:amt*DB.scoring.whetStep*EXPECT)*(turnsLeft>1?1:0); }
  for(const e of aliveEnemies(battle)){
    if(e.demand){ const ok=e.demand.category?p.cat.id===e.demand.category:p.cat.kind===e.demand.kind;
      if(ok) v+=e.demand.damage*1.5; }
    if(e.wardLeft>0 && p.bd.total>0 && p.bd.total<=e.ward) v-=p.bd.total;
    if(e.capLeft>0 && p.bd.total>e.cap) v-=(p.bd.total-e.cap);
  }
  return v;
}
let EXPECT=40;   // 일격 기본값 기대치 — 아래에서 빌드마다 실측해 넣는다
function fight(b0,id,floor,collect){
  const run={hp:60,maxHp:60,act:1,floor,enlight:0,relics:[...b0.relics],
    dice:[...b0.dice],categories:JSON.parse(JSON.stringify(b0.cats))};
  const b=createBattle(run,[id],'battle'); let g=0;
  while(!b.over&&g++<60){
    initialRoll(b);
    for(let rr=0;rr<3&&b.rollsLeft>0;rr++){
      const pv=previewAll(b).filter(p=>!p.locked&&p.bd.total>0);
      const best=pv.sort((a,c)=>scoreChoice(b,c)-scoreChoice(b,a))[0];
      if(best&&scoreChoice(b,best)>=40) break;
      const keep=new Set((best?.bd.contributing)||[]);
      b.dice.forEach((d,i)=>{ if(keep.has(i)!==d.held) toggleHold(b,i); });
      if(!reroll(b)) break;
    }
    const pv=previewAll(b).filter(p=>!p.locked&&p.bd.total>0);
    if(!pv.length){ b.over=true; b.result='defeat'; break; }
    const best=pv.sort((a,c)=>scoreChoice(b,c)-scoreChoice(b,a))[0];
    if(collect && best.variant.burst){
      // 벼름을 뺀 순수 기본값 = 지금 총합 / 지금 배수
      collect.push(best.bd.total / Y.whetMultOf(b.whet));
    }
    const e=aliveEnemies(b)[0];
    confirmCategory(b,best.cat.id,best.variant.id,e&&e.uid);
    if(b.over) break;
    enemyPhase(b);
  }
  return b.result!=='defeat';
}
const id=process.argv[2]||'wolf', fl=Number(process.argv[3]||12);
console.log(`=== ${DB.enemyById[id].name} · ${fl}층 — 벼름 한 스택의 값\n`);
console.log('빌드'.padEnd(12)+'일격 기본값  1스택 값  힘 1스택 값  배율 | 계수별 승률 (0.25 / 0.5 / 0.75 / 1.0)');
for(const [name,b0] of Object.entries(BUILDS)){
  // 1) 일격의 순수 기본값을 먼저 잰다
  const acc=[]; EXPECT=40;
  for(let k=0;k<400;k++) fight(b0,id,fl,acc);
  const baseHit = acc.length ? acc.reduce((a,c)=>a+c,0)/acc.length : 0;
  EXPECT = Math.max(12, baseHit);
  // 2) 계수를 바꿔가며 승률
  const rates=[];
  for(const step of [0.25,0.5,0.75,1.0]){
    const old=DB.scoring.whetStep; DB.scoring.whetStep=step;
    let w=0; const N=800; for(let k=0;k<N;k++) if(fight(b0,id,fl)) w++;
    rates.push((w/N*100).toFixed(0)+'%');
    DB.scoring.whetStep=old;
  }
  const perStack = baseHit*0.5;                    // 지금 계수(0.5)에서 1스택이 더해주는 피해
  console.log(name.padEnd(12)
    +String(baseHit.toFixed(0)).padStart(9)+String(perStack.toFixed(0)).padStart(10)
    +String(1).padStart(12)+String((perStack/1).toFixed(0)+'배').padStart(7)
    +' | '+rates.join(' / '));
}
