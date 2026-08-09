// 자동 플레이 시뮬레이터 — 브라우저 없이 엔진 모듈만 직접 구동해 대량 통계 산출
import { readFileSync } from 'fs';
globalThis.localStorage = { _d: {}, getItem(k){return this._d[k]??null;}, setItem(k,v){this._d[k]=String(v);}, removeItem(k){delete this._d[k];} };

const load = p => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), 'utf8'));
const { DB } = await import('../js/data.js');
Object.assign(DB, {
  dice: load('dice.json'), relics: load('relics.json'), scoring: load('scoring.json'),
  enemies: load('enemies.json'), act1: load('act1.json'), events: load('events.json'), acts: load('acts.json'),
});
DB.diceById = Object.fromEntries(DB.dice.map(d => [d.id, d]));
DB.relicById = Object.fromEntries(DB.relics.map(r => [r.id, r]));
DB.enemyById = Object.fromEntries(DB.enemies.map(e => [e.id, e]));
DB.weaponById = Object.fromEntries(DB.events.weapons.map(w => [w.id, w]));
DB.eventById = Object.fromEntries(DB.events.events.map(e => [e.id, e]));

const eng = await import('../js/engine.js');
const run_ = await import('../js/run.js');
const { previewAll, createBattle, initialRoll, reroll, confirmCategory, enemyPhase, aliveEnemies, toggleHold } = eng;

const RUNS = parseInt(process.argv[2] || '500', 10);
const stats = { bossFights: 0, bossWins: 0, deathFloor: [], relicsGained: 0, diceGained: 0, catsGained: 0, runs: 0, wins: 0, deaths: {}, floorReached: [], acts: [], turns: [], dmg: [], catUse: {}, killedBy: {}, enlight: 0 };


// 보상 카드 한 장 수령
function takeReward(run, card) {
  if (!card) return;
  const kind = card.kind, item = card.item || card;
  if (kind === 'relic') { run_.applyRelicPickup(run, item); stats.relicsGained++; }
  else if (kind === 'die') { run.dice[Math.floor(Math.random() * run.dice.length)] = item.id; stats.diceGained++; }
  else if (kind === 'category' && item.cat && item.variant) {
    const list = (run.categories[item.cat.id] = run.categories[item.cat.id] || []);
    if (!list.includes(item.variant.id)) { list.push(item.variant.id); stats.catsGained++; }
  }
}


// 사람처럼 판단: 피해 + 방어가치 + 버프가치. 위험할수록 방어 가중치가 커진다

// 기믹을 읽는 플레이 — 요구를 지키고, 문턱 아래로는 헛방을 안 치고, 상한 위는 낭비로 친다
function gimAdjust(battle, p, v) {
  for (const e of aliveEnemies(battle)) {
    if (e.demand) {
      const ok = e.demand.category ? p.cat.id === e.demand.category : p.cat.kind === e.demand.kind;
      if (ok) v += e.demand.damage * 1.5;
    }
    if (e.wardLeft > 0 && p.bd.total > 0 && p.bd.total <= e.ward) v -= p.bd.total;
    if (e.capLeft > 0 && p.bd.total > e.cap) v -= (p.bd.total - e.cap);
  }
  return v;
}
function scoreChoice(battle, p) {
  const ab = p.variant.ability;
  const ops = ab ? (Array.isArray(ab) ? ab : [ab]) : [];
  const p_ = battle.player;
  const danger = 1 - p_.hp / p_.maxHp;                        // 0(만피) ~ 1(빈사)
  const incoming = aliveEnemies(battle).reduce((s, e) =>
    s + (e.nextMove?.effects || []).filter(f => f.op === 'damage')
        .reduce((t, f) => t + Math.round(f.amount * (e.atkScale || 1)) + (e.power || 0), 0), 0);
  const turnsLeft = Math.max(1, 12 - battle.turn);            // 장기전이면 버프 가치↑
  let v = p.bd.total;
  for (const o of ops) {
    const amt = o.amount || 0;
    if (o.op === 'block') v += Math.min(amt, incoming) * (1 + danger * 2);
    else if (o.op === 'strength') v += amt * turnsLeft * 0.8;
    else if (o.op === 'focus') v += amt * turnsLeft * 1.2;
    else if (o.op === 'regen') v += amt * turnsLeft * (0.6 + danger);
    else if (o.op === 'weakEnemy') v += amt * turnsLeft * 0.7;
    else if (o.op === 'bleed') v += amt * 2.2;
    else if (o.op === 'vulnerable') v += amt * turnsLeft * 0.5;
    // v1.29 벼름: 다음 한 방이 amt*0.5 배만큼 커진다
    else if (o.op === 'whet') v += (battle.whet >= 6 ? 0 : amt * 0.5 * Math.max(12, p.bd.total)) * (turnsLeft > 1 ? 1 : 0);
  }
  return gimAdjust(battle, p, v);
}

function playBattle(run, nodeType) {
  const ids = run_.rollEncounter(run, nodeType);
  const battle = createBattle(run, ids, nodeType);
  let guard = 0;
  while (!battle.over && guard++ < 200) {
    initialRoll(battle);
    // 간단 AI: 최고 피해 족보 확정, 리롤 여유 있으면 1회 리롤
    for (let rr = 0; rr < 2 && battle.rollsLeft > 0; rr++) {
      const pv = previewAll(battle).filter(p => !p.locked && p.bd.total > 0);
      const best = pv.sort((a, b) => scoreChoice(battle, b) - scoreChoice(battle, a))[0];
      if (best && scoreChoice(battle, best) >= 32) break;      // 충분하면 확정
      const keep = new Set((best?.bd.contributing) || []);
      battle.dice.forEach((d, i) => { if (keep.has(i) !== d.held) toggleHold(battle, i); });
      if (!reroll(battle)) break;
    }
    const pv = previewAll(battle).filter(p => !p.locked && p.bd.total > 0);
    if (pv.length === 0) { battle.over = true; battle.result = 'defeat'; break; }
    const best = pv.sort((a, b) => scoreChoice(battle, b) - scoreChoice(battle, a))[0];
    stats.catUse[best.variant.id] = (stats.catUse[best.variant.id] || 0) + 1;
    stats.dmg.push(best.bd.total);
    const alive = aliveEnemies(battle);
    confirmCategory(battle, best.cat.id, best.variant.id, alive[0]?.uid);
    if (battle.over) break;
    enemyPhase(battle);
  }
  stats.turns.push(battle.turn);
  if (battle.over && battle.result === 'defeat') {
    const names = battle.enemies.map(e => e.name);
    stats.killedBy[names[0]] = (stats.killedBy[names[0]] || 0) + 1;
  }
  run.hp = battle.player.hp;
  return battle.result === 'victory';
}

for (let i = 0; i < RUNS; i++) {
  const run = run_.newRun();
  run_.chooseWeapon(run, DB.events.weapons[i % DB.events.weapons.length].id);
  let alive = true, guard = 0;
  while (alive && guard++ < 60) {
    const reach = run_.reachableNodes(run);
    if (reach.length === 0) break;
    const idx = reach[Math.floor(Math.random() * reach.length)];
    const f = run.floor;
    const node = run.map.floors[f][idx];
    run.floor = f + 1; run.pos = idx; run.path[f] = idx;
    if (node.type === 'battle' || node.type === 'elite' || node.type === 'boss') {
      if (node.type === 'boss') stats.bossFights++;
      if (!playBattle(run, node.type)) { alive = false; stats.deathFloor.push({ f: run.floor, act: run.act, t: node.type }); break; }
      // 보상 획득 (실제 플레이와 동일하게)
      if (node.type === 'boss') {
        stats.bossWins++;
        const relics = run_.bossRelicChoices(run);
        if (relics[0]) run_.applyRelicPickup(run, relics[0].item || relics[0]);
        const legend = run_.bossLegendaryChoices(run);
        takeReward(run, legend[0]);
        if (run.act >= 3) { stats.wins++; break; }
        run_.advanceAct(run);
      } else {
        run.coins += run_.coinReward(run, node.type);
        const cards = run_.rollRewards(run, node.type);
        takeReward(run, cards[Math.floor(Math.random() * cards.length)]);
        // v0.72: 정예는 유물 확정 드랍
        if (node.type === 'elite') {
          const er = run_.eliteRelicChoices(run);
          if (er.length) takeReward(run, er[Math.floor(Math.random() * er.length)]);
        }
      }
    } else if (node.type === 'shop') {
      const stock = run_.rollShopStock(run);
      for (const it of stock) {
        if (run.coins >= (it.price || 999)) { run.coins -= it.price; takeReward(run, it); break; }
      }
    } else if (node.type === 'rest') {
      run_.applyRest(run);
    } else if (node.type === 'event') {
      const ev = run_.pickEvent(run);
      const ch = ev.choices[Math.floor(Math.random() * ev.choices.length)];
      run_.applyEventEffects(run, ch.effects);
    }
    if (run.hp <= 0) { alive = false; }
  }
  stats.runs++;
  stats.floorReached.push(run.floor);
  stats.acts.push(run.act);
}

const avg = a => a.length ? (a.reduce((x, y) => x + y, 0) / a.length) : 0;
const med = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)] || 0; };
console.log(`\n=== ${stats.runs}판 자동 플레이 결과 ===`);
console.log(`클리어(3막 보스 처치): ${stats.wins}판 (${(stats.wins / stats.runs * 100).toFixed(1)}%)`);
console.log(`도달 막 분포: ${[1,2,3].map(a => `${a}막 ${stats.acts.filter(x=>x===a).length}`).join(' / ')}`);
console.log(`평균 도달 층: ${avg(stats.floorReached).toFixed(1)} (중앙값 ${med(stats.floorReached)})`);
console.log(`전투당 평균 턴: ${avg(stats.turns).toFixed(1)}`);
{
  const h = {};
  for (const t of stats.turns) { const k = t >= 10 ? '10+' : String(t); h[k] = (h[k] || 0) + 1; }
  const tot = stats.turns.length;
  const keys = Object.keys(h).sort((a, b) => (a === '10+' ? 99 : +a) - (b === '10+' ? 99 : +b));
  console.log('전투 길이 분포: ' + keys.map(k => `${k}턴 ${(h[k] / tot * 100).toFixed(1)}%`).join(' / '));
  console.log(`장기전(6턴 이상) 비율: ${(stats.turns.filter(t => t >= 6).length / tot * 100).toFixed(1)}%`);
}
console.log(`족보 1회 평균 피해: ${avg(stats.dmg).toFixed(1)} (중앙값 ${med(stats.dmg)})`);
const top = o => Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,8);
console.log(`\n가장 많이 쓰인 족보 Top8:`);
for (const [k, v] of top(stats.catUse)) {
  const name = DB.scoring.categories.flatMap(c => c.variants).find(x => x.id === k)?.name || k;
  console.log(`  ${name}: ${v}회 (${(v / stats.dmg.length * 100).toFixed(1)}%)`);
}
const df = stats.deathFloor;
const byType = {}; df.forEach(d => byType[d.t] = (byType[d.t]||0)+1);
console.log(`\n보스전: ${stats.bossFights}회 도전 / ${stats.bossWins}회 승리 (${stats.bossFights?(stats.bossWins/stats.bossFights*100).toFixed(1):0}%)`);
console.log(`사망 노드 유형: ${Object.entries(byType).map(([k,v])=>`${k} ${v}`).join(' / ')}`);
const fl = {}; df.forEach(d => { const b = Math.ceil(d.f/2)*2; fl[b] = (fl[b]||0)+1; });
console.log(`사망 층 분포: ${Object.entries(fl).sort((a,b)=>a[0]-b[0]).map(([k,v])=>`~${k}층 ${v}`).join(' / ')}`);
console.log(`\n평균 획득: 족보 ${(stats.catsGained/stats.runs).toFixed(1)}개 / 주사위 ${(stats.diceGained/stats.runs).toFixed(1)}개 / 유물 ${(stats.relicsGained/stats.runs).toFixed(1)}개`);
console.log(`\n사망 원인 Top8:`);
for (const [k, v] of top(stats.killedBy)) console.log(`  ${k}: ${v}판`);
