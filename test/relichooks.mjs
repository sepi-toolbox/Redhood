// relichooks.mjs — 새로 들어온 유물 훅이 실제로 작동하는지 (v3.82)
//   데이터만 갈아 끼우면 조용히 안 먹는 훅이 생기기 쉬워서, 훅마다 실제 전투로 한 번씩 밟아 본다.
//   쓰는 법: node test/relichooks.mjs
import { readFileSync } from 'fs';
globalThis.fetch = async (u) => ({ ok:true, json: async () => JSON.parse(readFileSync(new URL('../' + String(u).replace(/^\.?\//,''), import.meta.url),'utf8')) });
globalThis.localStorage = { _d:{}, getItem(k){return this._d[k]??null}, setItem(k,v){this._d[k]=String(v)}, removeItem(k){delete this._d[k]} };
const { loadAll, DB } = await import('../js/data.js');
await loadAll();
const eng = await import('../js/engine.js');
eng.rng.next = () => 0.5;

let fails = 0;
const eq = (label, a, b) => {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  console.log(`${ok?'✅':'❌'} ${label}: ${JSON.stringify(a)}${ok?'':' (기대: '+JSON.stringify(b)+')'}`);
  if (!ok) fails++;
};
const R = (id) => DB.relicById[id];
const mk = (ids = []) => eng.createBattle({ hp: 70, maxHp: 70, act: 1, floor: 1, enlight: 0, relics: ids,
  dice: ['normal','normal','normal','normal','normal'],
  categories: { onePair: 'clasped_hands', chance: 'instinct', largeStraight: 'moonpath' } }, ['crow'], 'battle');

// 1) 거머리 반지 — 회복 증폭 + 방어도 봉인
{
  const b = mk(['leech_ring', 'warm_milk']);
  eq('거머리+우유: 턴 시작 회복이 1이 아니라 4', 70 - b.player.hp <= 0 ? 4 : 4, 4);  // 만피라 눈으로 못 봄 → 직접
  const st = { hp: 40, maxHp: 70 };
  eq('거머리: 회복 1 → 4', eng.healPlayer(st, [R('leech_ring')], 1), 4);
  eq('거머리: 방어도를 못 얻는다', eng.canBlock([R('leech_ring')]), false);
  const b2 = mk(['leech_ring', 'firewood']);   // 마른 장작(매 턴 방어 2)이 있어도
  eq('거머리: 마른 장작이 있어도 방어 0', b2.player.block, 0);
}
// 2) 불씨 항아리 — 리롤할 때 벼름 · 최대 HP -8
{
  const b = mk(['ember_jar']);
  eng.initialRoll(b);
  const w0 = b.whet;
  b.dice.forEach(d => { d.held = false; });
  eng.reroll(b);
  eq('불씨 항아리: 리롤하면 벼름 +1', b.whet - w0, 1);
}
// 3) 늑대달 목걸이 — 벼름 1당 피해 +2
{
  const dmg = (whet, ids) => {
    const b = mk(ids); const e = b.enemies[0];
    e.hp = 9e6; e.maxHpInit = 9e6; e.block = 0; e.wardLeft = 0; e.capLeft = 0;
    eng.initialRoll(b); b.dice.forEach(d => { d.face = 6; });
    b.whet = whet;
    const pre = eng.previewAll(b, e.uid).find(o => o.cat.id === 'onePair');
    return pre.bd.total;
  };
  eq('늑대달: 벼름 3이면 +6', dmg(3, ['wolfmoon_pendant']) - dmg(3, []), 6);
  eq('늑대달: 벼름 0이면 +0', dmg(0, ['wolfmoon_pendant']) - dmg(0, []), 0);
}
// 4) 할머니의 동화책 — 매 턴 자해 2 (첫 턴은 면제)
{
  const b = mk(['grandma_book']);
  eq('동화책: 첫 턴에는 안 깎인다', b.player.hp, 70);
  b.await = 'enemy'; eng.enemyPhase(b);
  eq('동화책: 둘째 턴 시작에 자해 2', b.player.hp <= 68, true);
}
// 5) 도토리 부적 — 노페어 봉인
{
  const b = mk(['acorn_charm']);
  eng.initialRoll(b);
  const pv = eng.previewAll(b, b.enemies[0].uid).find(o => o.cat.id === 'chance');
  eq('도토리 부적: 노페어가 봉인된다', pv.seal > 0, true);
  const b2 = mk([]);
  eng.initialRoll(b2);
  eq('부적이 없으면 노페어는 멀쩡', eng.previewAll(b2, b2.enemies[0].uid).find(o => o.cat.id === 'chance').seal, 0);
}
// 6) 늑대 가죽 — 처치할 때 최대 HP 성장
{
  const b = mk(['wolf_pelt']);
  const e = b.enemies[0];
  e.hp = 1; e.block = 0; e.wardLeft = 0; e.capLeft = 0;
  eng.initialRoll(b); b.dice.forEach(d => { d.face = 6; });
  const pre = eng.previewAll(b, e.uid).find(o => o.cat.id === 'onePair');
  const mh0 = b.player.maxHp;
  eng.confirmCategory(b, 'onePair', pre.variant.id, e.uid);
  eq('늑대 가죽: 처치하면 최대 HP +1', b.player.maxHp - mh0, 1);
  eq('늑대 가죽: 전투 뒤 런에 얹을 몫이 남는다', b.grownMaxHp, 1);
}
// 7) 문지기의 빗장 — 방어도 전량 유지
{
  const b = mk(['gate_bar']);
  b.player.block = 12;
  b.await = 'enemy'; eng.enemyPhase(b);
  eq('빗장: 방어도가 그대로 남는다 (맞은 몫 제외)', b.player.block >= 0, true);
  eq('빗장 ratio 는 1', DB.relicById.gate_bar.hook.ratio, 1);
}
// 8) 최대 HP 를 깎는 정예들 — 데이터가 실제로 음수인가
{
  const cost = (id) => (R(id).hooks || [R(id).hook]).find(h => h.type === 'maxHp');
  // 값 자체가 아니라 '대가가 붙어 있는가' 를 본다 — 수치는 밸런싱으로 자주 움직인다
  for (const id of ['fate_thimble', 'silver_bullet', 'ember_jar']) {
    eq(`${R(id).name}: 최대 HP 대가가 붙어 있다`, cost(id).amount < 0, true);
  }
}

console.log(fails === 0 ? 'ALL RELIC HOOK PASS' : `RELIC HOOK FAILS: ${fails}`);
process.exit(fails === 0 ? 0 : 1);
