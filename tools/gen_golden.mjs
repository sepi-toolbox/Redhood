// 고도 포팅 검증용 골든 벡터 — JS 판정 결과를 진실로 삼는다
import { readFileSync, writeFileSync } from 'fs';
globalThis.localStorage = { _d:{}, getItem(k){return this._d[k]??null;}, setItem(k,v){this._d[k]=String(v);}, removeItem(k){delete this._d[k];} };
const load = p => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), 'utf8'));
const { DB } = await import('../js/data.js');
DB.scoring = load('scoring.json'); DB.dice = load('dice.json'); DB.relics = load('relics.json');
const { evalCategory, computeDamage } = await import('../js/yahtzee.js');

let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const ri = (a,b) => a + Math.floor(rnd()*(b-a+1));

const cats = DB.scoring.categories;
const NORMAL = DB.dice.find(d=>d.id==='normal');
const GOLD = DB.dice.find(d=>d.gold) || NORMAL;
const cases = [];
for (let k=0;k<300;k++) {
  const faces = Array.from({length:5},()=>ri(0,6));            // 0 = 봉인 슬롯 포함
  const cat = cats[k % cats.length];
  const zeroed = rnd()<0.3 ? [ri(0,4)] : [];
  const ev = evalCategory(cat, faces, new Set(zeroed));
  cases.push({ cat: cat.id, faces, zeroed, valid: ev.valid, base: ev.base,
    contributing: [...ev.contributing].sort((a,b)=>a-b) });
}
const dmg = [];
for (let k=0;k<150;k++) {
  const faces = Array.from({length:5},()=>ri(1,6));
  const cat = cats[k % cats.length];
  const defs = Array.from({length:5},()=>rnd()<0.3?GOLD:NORMAL);
  const relics = rnd()<0.4 ? [DB.relics[ri(0,DB.relics.length-1)]] : [];
  const whet = rnd()<0.4 ? ri(0,6) : 0;
  const bd = computeDamage(cat, faces, defs, relics, null, { whet, hpRatio: rnd()<0.2?0.3:1 });
  dmg.push({ cat: cat.id, faces, gold: defs.map(d=>!!d.gold), relics: relics.map(r=>r.id),
    whet, hpRatio: dmg.length%5===0?0.3:1, total: bd.total, valid: bd.valid });
}
// hpRatio 불일치 방지 — 위에서 쓴 값 그대로 기록해야 한다. 다시 계산.
seed = 12345; for (let k=0;k<300*8;k++) rnd();   // (근사 무의미 — 아래에서 정확 재생성)
const dmg2 = [];
{ let s2 = 777; const r2 = () => { s2 = (s2*1103515245+12345)%2147483648; return s2/2147483648; };
  const i2 = (a,b)=>a+Math.floor(r2()*(b-a+1));
  for (let k=0;k<150;k++) {
    const faces = Array.from({length:5},()=>i2(1,6));
    const cat = cats[k % cats.length];
    const goldMask = Array.from({length:5},()=>r2()<0.3);
    const defs = goldMask.map(g=>g?GOLD:NORMAL);
    const relics = r2()<0.4 ? [DB.relics[i2(0,DB.relics.length-1)]] : [];
    const whet = r2()<0.4 ? i2(0,6) : 0;
    const hpRatio = r2()<0.2 ? 0.3 : 1;
    const bd = computeDamage(cat, faces, defs, relics, null, { whet, hpRatio });
    dmg2.push({ cat: cat.id, faces, gold: goldMask, relics: relics.map(r=>r.id), whet, hpRatio,
      total: bd.total, valid: bd.valid });
  }
}
writeFileSync(new URL('../godot/tests/golden_yahtzee.json', import.meta.url),
  JSON.stringify({ eval: cases, damage: dmg2 }));
console.log(`golden: eval ${cases.length} · damage ${dmg2.length}`);
