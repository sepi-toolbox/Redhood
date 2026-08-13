// emojicheck.mjs — 예고 줄에 그림 대신 이모지로 남은 자리를 찾는다 (v3.57)
//   iconifyIntent 가 바꿔 주는 목록과 대조해, 안 바뀌는 글자가 어느 적의 어느 행동에서 나오는지 센다.
//   쓰는 법: node test/emojicheck.mjs
import { readFileSync } from 'fs';
globalThis.localStorage={_d:{},getItem(k){return this._d[k]??null},setItem(k,v){this._d[k]=String(v)},removeItem(k){delete this._d[k]}};
const load=p=>JSON.parse(readFileSync(new URL(`../data/${p}`,import.meta.url),'utf8'));
const {DB}=await import('../js/data.js');
Object.assign(DB,{dice:load('dice.json'),relics:load('relics.json'),scoring:load('scoring.json'),enemies:load('enemies.json'),
 act1:load('act1.json'),events:load('events.json'),acts:load('acts.json'),statuses:load('statuses.json'),cards:load('cards.json'),layout:load('layout.json')});
DB.statusById=Object.fromEntries(DB.statuses.list.map(x=>[x.id,x]));
DB.enemyById=Object.fromEntries(DB.enemies.map(e=>[e.id,e]));
const E=await import('../js/engine.js');

// main.js 의 iconifyIntent 가 그림으로 바꿔 주는 목록
const MAPPED = new Set(['⚔️','🛡','🌀','💪','❓','💫','💤']);  // v3.60: 예고가 낼 수 있는 글자는 이게 전부
// ⚔️ 처럼 변이 선택자(FE0F)가 붙는 것은 한 글자로 묶어 센다 — 쪼개면 안 바뀐 것처럼 보인다
const RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]\u{FE0F}?/gu;

const found = {};
for (const def of DB.enemies) {
  for (const pool of ['moves','uniqueMoves']) for (const [k,m] of Object.entries(def[pool]||{})) {
    const fake = { nextMove: { ...m, id:k }, atkScale:1, power:0, debuffs:{weak:0,bleed:0,vulnerable:0}, stunned:false };
    let s = '';
    try { s = E.intentOf(fake); } catch (e) { continue; }
    for (const ch of (s.match(RE)||[])) {
      if (MAPPED.has(ch)) continue;
      (found[ch] ||= new Set()).add(`${def.name}·${m.name||k}`);
    }
  }
}
console.log('=== 예고 줄에서 그림으로 안 바뀌는 이모지 ===');
const ks = Object.keys(found);
if (!ks.length) console.log('(없음)');
for (const ch of ks) {
  const list = [...found[ch]];
  console.log(`  ${ch}  ${list.length}곳 — ${list.slice(0,4).join(', ')}${list.length>4?` 외 ${list.length-4}`:''}`);
}

process.exitCode = ks.length ? 1 : 0;
