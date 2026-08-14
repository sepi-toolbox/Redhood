import { readFileSync } from 'fs';
const R='/home/claude/redhood/';
globalThis.fetch=async(u)=>({ok:true,json:async()=>JSON.parse(readFileSync(new URL(R+String(u).replace(/^\.?\//,''),import.meta.url),'utf8'))});
globalThis.localStorage={_d:{},getItem(k){return this._d[k]??null},setItem(k,v){this._d[k]=String(v)},removeItem(k){delete this._d[k]}};
const {loadAll,DB}=await import(R+'js/data.js'); await loadAll();
const eng=await import(R+'js/engine.js'); eng.rng.next=()=>0.5;
const mk=(foe='stray_dog')=>eng.createBattle({hp:70,maxHp:70,act:1,floor:1,enlight:0,relics:[],
  dice:['normal','normal','normal','normal','normal'],categories:{onePair:'clasped_hands'}},[foe],'battle');
const end=b=>{eng.endTurnStatus(b); if(b.over)return; b.await='enemy'; eng.enemyPhase(b);};
let fail=0;
const eq=(l,a,e)=>{const ok=JSON.stringify(a)===JSON.stringify(e);console.log(`${ok?'✅':'❌'} ${l}: ${JSON.stringify(a)}${ok?'':' (기대 '+JSON.stringify(e)+')'}`);if(!ok)fail++;};

// ── 철갑 ──
{ const b=mk(); b.buffs.ironclad=3; b.player.block=0;
  eng.endTurnStatus(b);
  eq('철갑 3 → 방어 3 획득, 누적 2', [b.player.block, b.buffs.ironclad], [3,2]);
  b.await='enemy'; eng.enemyPhase(b);
  eq('턴 시작에 방어는 초기화된다', b.player.block, 0);
  eng.endTurnStatus(b);
  eq('다음 턴 끝엔 2 획득, 누적 1', [b.player.block, b.buffs.ironclad], [2,1]);
}
{ const b=mk(); b.buffs.ironclad=2; b.player.dot=5; b.player.block=0;
  const hp0=b.player.hp; eng.endTurnStatus(b);
  eq('중독이 먼저 아프고 그 뒤에 갑옷을 두른다', [hp0-b.player.hp, b.player.block], [5,2]);
}
// ── 가시 ──
{ DB.enemyById.__hitter={id:'__hitter',name:'때리는놈',tier:'normal',art:'x',hp:[40,40],
    moves:{hit:{name:'치기',effects:[{op:'damage',amount:6}]}},pattern:{mode:'weighted',weights:{hit:1}}};
  const b=mk('__hitter'); b.buffs.thorns=4; b.player.block=0;
  const ehp=b.enemies[0].hp, hp0=b.player.hp;
  end(b);
  eq('맞으면 때린 적이 가시만큼 아프다', [hp0-b.player.hp, ehp-b.enemies[0].hp], [6,4]);
  eq('가시는 턴이 지나도 안 깎인다', b.buffs.thorns, 4);
}
{ const b=mk('__hitter'); b.buffs.thorns=4; b.player.block=99;
  const ehp=b.enemies[0].hp; end(b);
  eq('다 막아내면 되돌려줄 것도 없다', ehp-b.enemies[0].hp, 0);
}
{ const b=mk(); b.buffs.thorns=5; b.player.dot=4; b.player.block=0;
  const ehp=b.enemies[0].hp; eng.endTurnStatus(b);
  eq('중독처럼 주체 없는 피해는 반사하지 않는다', ehp-b.enemies[0].hp, 0);
}
// ── 행운 ──
{ DB.enemyById.__stat={id:'__stat',name:'거는놈',tier:'normal',art:'x',hp:[40,40],
    moves:{cast:{name:'걸기',effects:[{op:'status',kind:'confuse',amount:3}]}},pattern:{mode:'weighted',weights:{cast:1}}};
  const b=mk('__stat'); b.buffs.fortune=1;
  end(b);
  eq('주사위 세 칸에 거는 효과도 행운 하나로 통째로 막힌다', [b.dice.filter(d=>d.st).length, b.buffs.fortune], [0,0]);
  end(b);
  eq('행운이 떨어지면 그대로 걸린다', b.dice.filter(d=>d.st).length>=3, true);
}
{ DB.enemyById.__pois={id:'__pois',name:'독놈',tier:'normal',art:'x',hp:[40,40],
    moves:{sp:{name:'뱉기',effects:[{op:'poison',amount:4}]}},pattern:{mode:'weighted',weights:{sp:1}}};
  const b=mk('__pois'); b.buffs.fortune=1;
  end(b);
  eq('중독 4를 한꺼번에 얹는 것도 하나로 친다', [b.player.dot, b.buffs.fortune], [0,0]);
}

// ── v3.99: 행운이 지속 방해와 족보 봉인도 무른다 ──
{
  const CASES = [
    ['봉인(흉내내기)', [{op:'sealLast', turns:2}], b => Object.keys(b.sealed).length],
    ['봉인(솜 채우기)', [{op:'sealCat', cats:['onePair'], turns:2}], b => Object.keys(b.sealed).length],
    ['이빨 자국',      [{op:'rollTax', amount:2, turns:2}], b => (b.mods.rollTax ? 1 : 0)],
    ['가시(리롤세)',   [{op:'holdTax', per:0.5, turns:2}], b => (b.mods.holdTax ? 1 : 0)],
    ['스멀거림',       [{op:'blind', turns:2}], b => (b.mods.blind ? 1 : 0)],
  ];
  for (const [name, effects, probe] of CASES) {
    DB.enemyById.__dis = { id:'__dis', name:'방해', tier:'normal', art:'x', hp:[40,40],
      moves:{ m:{ name:'방해', effects } }, pattern:{ mode:'weighted', weights:{ m:1 } } };
    const b1 = mk('__dis'); b1.lastSealableCat = 'onePair'; b1.buffs.fortune = 1; end(b1);
    const b2 = mk('__dis'); b2.lastSealableCat = 'onePair'; end(b2);
    eq(`행운이 ${name}을 무른다`, [probe(b1), b1.buffs.fortune, probe(b2) > 0], [0, 0, true]);
  }
}
console.log(fail ? `NEW BUFF FAILS: ${fail}` : 'ALL NEW BUFF PASS');
process.exit(fail ? 1 : 0);
