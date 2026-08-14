// run.js — 런 상태, 맵 생성, 보상, 세이브 (v2: 주사위/유물)
import { DB } from './data.js';
import { healPlayer } from './engine.js';
// v3.79: 런 밖(휴식·만남)의 회복도 같은 통로를 쓴다 — 거머리 반지가 빠짐없이 걸리게
const healRun = (run, amt) => healPlayer(run, (run.relics || []).map(id => DB.relicById[id]).filter(Boolean), amt);
import { rng } from './engine.js';

const SAVE_KEY = 'redhood_run_v9';
const META_KEY = 'redhood_meta_v1';

// ---------- 메타 진행 (런 간 유지): 계몽 ----------
export function loadMeta() {
  try {
    const m = JSON.parse(localStorage.getItem(META_KEY)) || {};
    return { enlight: Math.max(0, Math.min(20, m.enlight | 0)) };
  } catch (e) { return { enlight: 0 }; }
}
export function saveMeta(meta) {
  try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) {}
}
// 치트 포함 — 계몽 수치 직접 설정 (0~20)
export function setEnlight(n) {
  const meta = loadMeta();
  meta.enlight = Math.max(0, Math.min(20, n | 0));
  saveMeta(meta);
  return meta.enlight;
}
// 3막 보스 처치 = 클리어 → 계몽 +1
export function gainEnlight() {
  const meta = loadMeta();
  meta.enlight = Math.min(20, meta.enlight + 1);
  saveMeta(meta);
  return meta.enlight;
}

// ---------- 막/테마 ----------
export function pickTheme(act) {
  const themes = DB.acts.acts[act - 1].themes;
  return themes[Math.floor(rng.next() * themes.length)].id;
}
export function themeOf(run) {
  const act = Math.min(run.act || 1, 3);
  return DB.acts.acts[act - 1].themes.find(t => t.id === run.theme) || DB.acts.acts[act - 1].themes[0];
}

// v0.10: 시작 족보는 무기 선택으로 결정 — newRun 시점엔 빈 상태
// v0.14: 계몽(enlight) 스냅샷이 런에 박힌다 — 6: 시작 HP -30% / 10: 저주 주사위 / 14: 최대 HP -10%
export function newRun() {
  const enlight = loadMeta().enlight;
  let maxHp = DB.act1.player.maxHp;
  if (enlight >= 14) maxHp = Math.floor(maxHp * 0.9);
  let hp = maxHp;
  if (enlight >= 6) hp = Math.max(1, Math.floor(maxHp * 0.7));
  const dice = DB.act1.player.startDice.slice();
  if (enlight >= 10) dice[dice.length - 1] = 'cursed';
  return {
    hp, maxHp,
    dice,
    cards: DB.cards.starterDeck.slice(),  // v2.0 감정 카드 덱 — 전투의 손패가 여기서 나온다
    relics: [],
    weapon: null,        // 무기 id (인트로에서 선택)
    categories: {},      // v1.34 족보 id -> 그 자리에 끼운 변형 id (null = 기본 족보)
    seenEvents: [],      // 이번 런에서 만난 대화 이벤트 id
    coins: 0,            // 🪙 상점 화폐 — 전투 승리로 획득 (v0.13)
    enlight,             // 계몽 스냅샷 (런 시작 시점 고정)
    act: 1,              // 1~3막, 4 = 최종전
    theme: pickTheme(1), // 이번 막의 테마 id
    floor: 0,
    pos: -1,             // 현재 층에서 선 노드 인덱스 (0층이면 -1)
    path: [],            // 지나온 노드 인덱스 기록 (지도에 발자취 표시용)
    map: generateMap(enlight),
  };
}

// 보스 처치 → 다음 막 (최대 체력 50% 회복 — 계몽 5+: 15%)
export function advanceAct(run) {
  const ratio = run.enlight >= 5 ? 0.15 : DB.acts.bossHealRatio;
  const healed = Math.min(run.maxHp - run.hp, Math.floor(run.maxHp * ratio));
  run.hp += healed;
  run.act += 1;
  run.theme = pickTheme(run.act);
  run.floor = 0;
  run.pos = -1;
  run.path = [];
  run.map = generateMap(run.enlight);
  return healed;
}

// 무기 선택 → 시작 족보 3종 지급
export function chooseWeapon(run, weaponId) {
  const w = DB.weaponById[weaponId];
  if (!w) return false;
  run.weapon = weaponId;
  // v3.1 족보 수집제 복원 — 가진 족보(run.categories 에 키가 있는 것)만 쓸 수 있다.
  // 무기가 시작 족보 3종을 준다. 나머지는 보상·이벤트로 하나씩 모은다.
  run.categories = {};
  for (const [cid, vid] of Object.entries(w.start)) run.categories[cid] = vid;
  return true;
}

// 인트로에서 제안할 무기 n종 무작위 추출
export function offerWeapons(n) {
  const pool = DB.events.weapons.slice();
  const out = [];
  while (out.length < n && pool.length > 0) {
    out.push(pool.splice(Math.floor(rng.next() * pool.length), 1)[0]);
  }
  return out;
}

// ---------- 대화 이벤트 (v0.14: 테마 풀) ----------
// 현재 테마의 이벤트 중 아직 안 본 것 우선 (모두 봤으면 테마 내 아무거나)
export function pickEvent(run) {
  const theme = themeOf(run);
  const all = DB.events.events.filter(ev => (ev.themes || []).includes(theme.id));
  const pool0 = all.length > 0 ? all : DB.events.events;
  const fresh = pool0.filter(ev => !run.seenEvents.includes(ev.id));
  const pool = fresh.length > 0 ? fresh : pool0;
  const ev = pool[Math.floor(rng.next() * pool.length)];
  if (!run.seenEvents.includes(ev.id)) run.seenEvents.push(ev.id);
  return ev;
}

// 선택지 효과 적용. 반환: { messages: [], pendingDie: 주사위정의|null }
// (pendingDie가 있으면 UI에서 교체 모달을 띄운다)
export function applyEventEffects(run, effects) {
  const messages = [];
  let pendingDie = null;
  // 계몽 15: 이벤트의 대가가 더 가혹해진다 (부정 효과 ×1.5)
  const grim = run.enlight >= 15 ? 1.5 : 1;
  for (const ef of (effects || [])) {
    switch (ef.op) {
      case 'heal': {
        const healed = Math.min(run.maxHp - run.hp, ef.amount);
        run.hp += healed;
        messages.push(`HP +${healed}`);
        break;
      }
      case 'loseHp': {
        const amt = Math.ceil(ef.amount * grim);
        run.hp = Math.max(1, run.hp - amt); // 이벤트로는 죽지 않는다
        messages.push(`HP -${amt}`);
        break;
      }
      case 'maxHp':
        run.maxHp += ef.amount;
        run.hp += ef.amount;
        messages.push(`최대 HP +${ef.amount}`);
        break;
      case 'maxHpLoss': {
        const amt = Math.ceil(ef.amount * grim);
        run.maxHp = Math.max(10, run.maxHp - amt);
        run.hp = Math.min(run.hp, run.maxHp);
        messages.push(`최대 HP -${amt}`);
        break;
      }
      case 'gainCoins':
        run.coins += ef.amount;
        messages.push(`🪙 +${ef.amount}`);
        break;
      case 'loseCoins': {
        const amt = Math.min(run.coins, Math.ceil(ef.amount * grim));
        run.coins -= amt;
        messages.push(`🪙 -${amt}`);
        break;
      }
      case 'gainRelicElite': {
        let pool = DB.relics.filter(r => r.tier === 'elite' && !run.relics.includes(r.id));
        if (pool.length === 0) pool = DB.relics.filter(r => !run.relics.includes(r.id));
        if (pool.length === 0) { messages.push('더 얻을 유물이 없다'); break; }
        const r = pool[Math.floor(rng.next() * pool.length)];
        applyRelicPickup(run, r);
        messages.push(`${r.icon} ${r.name} 획득`);
        break;
      }
      case 'gainRelic': {
        const pool = DB.relics.filter(r => !run.relics.includes(r.id));
        if (pool.length === 0) { healRun(run, 5); messages.push('줄 것이 없어 HP +5'); break; }
        const r = pool[Math.floor(rng.next() * pool.length)];
        applyRelicPickup(run, r);
        messages.push(`${r.icon} ${r.name} 획득`);
        break;
      }
      case 'gainVariant': {
        const pool = [];
        for (const c of DB.scoring.categories) {
          for (const v of (c.variants || [])) if (run.categories[c.id] !== v.id) pool.push({ c, v });
        }
        if (pool.length === 0) { messages.push('더 얻을 족보가 없다'); break; }
        const { c, v } = pool[Math.floor(rng.next() * pool.length)];
        const had = c.id in run.categories;
        const before = had ? run.categories[c.id] : null;
        run.categories[c.id] = v.id;
        messages.push(had ? `${c.name} 자리에 ${v.name}${before ? ' (앞의 것을 대신한다)' : ''}` : `새 족보 — ${c.name}: ${v.name}`);
        break;
      }
      case 'gainDie': {
        const pool = DB.dice.filter(d => d.id !== 'normal');
        pendingDie = pool[Math.floor(rng.next() * pool.length)];
        messages.push(`🎲 ${pendingDie.name} 발견`);
        break;
      }
    }
  }
  return { messages, pendingDie };
}

// ---------- 맵 (v0.26: 슬더스식 분기 그래프) ----------
// 무작위 행보(walk) 여러 개를 아래→위로 그어 골격을 만들고, 겹치는 칸은 합친다.
// floors[f] = [{type, lane}...] (lane 오름차순), edges[f][i] = 다음 층에서 갈 수 있는 노드 인덱스들
// v0.70: 열은 최대 4개로 고정. 좌표는 찍지 않고 표(그리드)로 배치하므로
//        여기서는 "몇 층의 몇 번 열에 무엇이 있는가"와 연결만 정한다.
export const MAP_LANES = 4;
export function generateMap(enlight = 0) {
  const cfg = DB.act1.map;
  const F = cfg.floors;                       // 마지막 층 = 보스 (단일)
  const laneSet = Array.from({ length: F - 1 }, () => new Set());
  const edgePairs = new Set();                // "f:laneA>laneB" (f = 층 인덱스)
  // 갈래 수를 3~4로 흔들고 시작 열도 매번 새로 뽑는다 (겹치면 그만큼 1층이 좁아진다)
  const walkCount = 3 + Math.floor(rng.next() * 2);
  const starts = [];
  for (let k = 0; k < walkCount; k++) starts.push(Math.floor(rng.next() * MAP_LANES));
  // v3.26: 길이 서로 엇갈리면 안 된다 (성권). 같은 층에 이미 그어 둔 줄과 교차하는 이동은 막는다.
  //   같은 층의 두 줄 (a→b), (a'→b') 는 a<a' 인데 b>b' 이면 (또는 그 반대면) 반드시 교차한다.
  //   세로줄(a→a)도 (a-1→a+1) 같은 대각선과는 교차하므로 똑같이 검사한다.
  const drawn = Array.from({ length: F }, () => []);   // drawn[f] = [[a,b], ...]
  const crosses = (f, a, b) => drawn[f].some(([x, y]) =>
    (x < a && y > b) || (x > a && y < b));
  const already = (f, a, b) => drawn[f].some(([x, y]) => x === a && y === b);
  for (const s of starts) {
    let lane = s;
    for (let f = 0; f < F - 1; f++) {
      laneSet[f].add(lane);
      if (f === F - 2) break;                 // 보스 직전 층까지
      const all = [lane - 1, lane, lane + 1].filter(l => l >= 0 && l < MAP_LANES);
      // ① 이미 있는 줄을 그대로 타면 새 교차가 생길 수 없다 — 가장 안전
      const reuse = all.filter(l => already(f, lane, l));
      // ② 없으면 교차하지 않는 것 중에서 고른다
      const free = all.filter(l => !crosses(f, lane, l));
      const pool = free.length ? free : (reuse.length ? reuse : [lane]);
      const next = pool[Math.floor(rng.next() * pool.length)];
      if (!already(f, lane, next)) drawn[f].push([lane, next]);
      edgePairs.add(`${f}:${lane}>${next}`);
      lane = next;
    }
  }
  // 층별 노드 배열 (lane 오름차순) — 유형은 간선을 만든 뒤에 규칙을 지키며 배정한다
  const floors = [];
  for (let f = 0; f < F - 1; f++) {
    floors.push([...laneSet[f]].sort((a, b) => a - b).map(lane => ({ type: null, lane })));
  }
  floors.push([{ type: cfg.fixed[String(F)] || 'boss', lane: 1 }]); // 보스 층 (표에서는 전체 폭 가운데)

  // 간선 인덱스화
  const idxOf = (f, lane) => floors[f].findIndex(nd => nd.lane === lane);
  const edges = floors.map(fl => fl.map(() => []));
  for (const key of edgePairs) {
    const [fPart, lanes] = key.split(':');
    const f = parseInt(fPart, 10);
    const [a, b] = lanes.split('>').map(Number);
    const ia = idxOf(f, a), ib = idxOf(f + 1, b);
    if (ia >= 0 && ib >= 0 && !edges[f][ia].includes(ib)) edges[f][ia].push(ib);
  }
  for (const nd of floors[F - 2].map((_, i) => i)) edges[F - 2][nd] = [0]; // 마지막 휴식 → 보스
  edges[F - 1] = [[]];
  for (const fl of edges) for (const list of fl) list.sort((a, b) => a - b);
  assignNodeTypes(cfg, floors, edges, enlight);
  return { floors, edges };
}

// v0.85: 노드 유형 배정 — 층별로 뽑은 뒤 아래 규칙을 어기면 그 자리만 다시 뽑는다.
//  1) 휴식 다음에 휴식만 있으면 안 된다 (휴식+다른 것 중 고르는 건 허용)
//  2) 보스 직전 층은 항상 휴식 → 그 앞 층에서는 휴식이 나오지 않게 막아 (1)과 충돌을 없앤다
//  3) 갈림길의 두 갈래는 서로 다른 유형이어야 한다
function assignNodeTypes(cfg, floors, edges, enlight = 0) {
  const F = floors.length;
  for (let f = 0; f < F - 1; f++) {
    const floorNo = f + 1;
    const fixed = cfg.fixed[String(floorNo)];
    // 다음 층이 '휴식 고정'이면 이 층에는 휴식을 두지 않는다 (규칙 2 → 규칙 1 보호)
    const banRest = cfg.fixed[String(floorNo + 1)] === 'rest';
    const roll = (exclude) => {
      if (fixed) return fixed;
      const ban = new Set(exclude || []);
      if (banRest) ban.add('rest');
      return rollNodeType(cfg, floorNo, floors[f], enlight, ban);
    };
    for (const nd of floors[f]) nd.type = roll();
    if (fixed) continue;

    // 규칙 3: 한 노드에서 갈라지는 갈래끼리 유형이 겹치면 다시 뽑는다
    for (let guard = 0; guard < 40; guard++) {
      let fixedAny = false;
      if (f > 0) {
        for (let i = 0; i < floors[f - 1].length; i++) {
          const kids = edges[f - 1][i] || [];
          if (kids.length < 2) continue;
          const seen = new Map();
          for (const j of kids) {
            const t = floors[f][j].type;
            if (seen.has(t)) {
              floors[f][j].type = roll(kids.map(k => floors[f][k].type));
              fixedAny = true;
            } else seen.set(t, j);
          }
        }
      }
      // 규칙 1: 휴식 노드에서 갈 수 있는 곳이 전부 휴식이면 하나를 바꾼다
      if (f > 0) {
        for (let i = 0; i < floors[f - 1].length; i++) {
          if (floors[f - 1][i].type !== 'rest') continue;
          const kids = edges[f - 1][i] || [];
          if (kids.length === 0) continue;
          if (kids.every(j => floors[f][j].type === 'rest')) {
            floors[f][kids[0]].type = roll(['rest']);
            fixedAny = true;
          }
        }
      }
      if (!fixedAny) break;
    }
  }
}

export function reachableNodes(run) {
  if (run.floor === 0) return run.map.floors[0].map((_, i) => i);
  if (run.floor >= run.map.floors.length) return [];
  return run.map.edges[run.floor - 1][run.pos] || [];
}

function rollNodeType(cfg, floor, existing, enlight = 0, ban = null) {
  const w = { ...cfg.nodeWeights };
  if (enlight >= 1 && w.elite) w.elite *= 2; // 계몽 1: 엘리트가 더 자주 나온다
  if (!cfg.eliteFloors.includes(floor)) delete w.elite;
  // v3.92: 상점이 너무 이르면 살 돈이 없어 그냥 지나치는 칸이 된다 — 최소 층을 둔다 (성권)
  if (floor < (cfg.shopMinFloor || 4)) delete w.shop;
  if (existing.some(nd => nd.type === 'elite')) delete w.elite;
  if (ban) for (const t of ban) delete w[t];
  if (Object.keys(w).length === 0) return 'battle'; // 다 막히면 전투로
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (const [type, weight] of Object.entries(w)) { roll -= weight; if (roll <= 0) return type; }
  return 'battle';
}

// ---------- 조우 (v0.14: 테마 풀 기반) ----------
export function rollEncounter(run, nodeType) {
  const theme = themeOf(run);
  if (nodeType === 'boss') return [theme.boss];
  if (nodeType === 'elite') return [pick(theme.elites)];
  // 일반: 쉬운 층은 1마리, 이후 55% 1마리 / 45% 2마리
  if (DB.act1.encounters.easyFloors.includes(run.floor)) return [pick(theme.normals)];
  if (rng.next() < 0.55) return [pick(theme.normals)];
  return [pick(theme.normals), pick(theme.normals)];
}
function pick(arr) { return arr[Math.floor(rng.next() * arr.length)]; }

// 최종전 조우: 무한 체력 보스 (계몽 20: 두 마리)
export function finalEncounter(run) {
  const id = DB.acts.finalBoss;
  return run.enlight >= 20 ? [id, id] : [id];
}

// ---------- 보상 경제 (v0.13, 성권 지시) ----------
// 일반 전투 = 커먼~언커먼 족보·주사위 / 엘리트 = 언커먼~레어 족보·주사위 + 일반 유물
// 보스 = 정예 유물 + 전설(에픽) 족보/주사위 / 이벤트 = 무엇이든 (대가 지불) / 상점 = 커먼~레어 주사위 + 일반 유물
// 족보 풀 = (족보, 변형) 쌍. 이미 보유한 변형만 제외 — 획득은 추가(v0.9).
function rewardPoolOf(run, kind, allowedTiers = null) {
  if (kind === 'dice') {
    let pool = DB.dice.filter(d => d.id !== 'normal');
    if (allowedTiers) pool = pool.filter(d => allowedTiers.has(d.tier));
    return pool;
  }
  if (kind === 'relic') {
    // 전투 보상 유물은 '일반' 등급만 — 정예 유물은 보스 전리품 전용
    return DB.relics.filter(r => r.tier === 'normal' && !run.relics.includes(r.id));
  }
  const pool = [];
  for (const c of DB.scoring.categories) {
    const has = c.id in run.categories;                  // v3.1 족보 소유 여부
    const cur = has ? (run.categories[c.id] || null) : null;
    for (const v of (c.variants || [])) {
      if (cur === v.id) continue;
      if (allowedTiers && !allowedTiers.has(v.tier)) continue;
      pool.push({ id: `${c.id}:${v.id}`, tier: v.tier, cat: c, variant: v, owned: !!cur, newCat: !has,
                  replaces: cur ? (c.variants || []).find(x => x.id === cur) || null : null });
    }
  }
  return pool;
}

// 보유 변형 수 (족보 누적 → 주사위 확률 보정용)
function ownedVariantCount(run) {
  return Object.values(run.categories).filter(Boolean).length;   // 채워진 자리 수
}

export function rollRewards(run, nodeType) {
  const cfg = DB.act1.rewards[nodeType];
  if (!cfg || cfg.choices === 0) return [];
  const allowed = new Set(Object.keys(cfg.tierWeights));
  // 범주 가중 보정: 족보(변형)가 많아질수록 주사위 확률↑ (족보만 쌓이면 복잡해지는 것 방지)
  const poolW = { ...cfg.pool };
  const ds = DB.act1.diceShift;
  if (ds && poolW.category && poolW.dice) {
    const extra = Math.max(0, ownedVariantCount(run) - ds.freeVariants);
    const shift = Math.min(poolW.category * ds.maxRatio, extra * ds.perVariant);
    poolW.category -= shift;
    poolW.dice += shift;
  }
  // 1) 범주 추첨 (빈 풀이면 다른 범주로) — 단, 첫 전투(1층) 보상은 무조건 족보
  let kind = null, pool = [];
  if (nodeType === 'battle' && run.floor === 1) {
    kind = 'category';
    pool = rewardPoolOf(run, 'category', allowed);
  }
  for (let g = 0; g < 30 && pool.length === 0; g++) {
    kind = rollWeight(poolW);
    pool = rewardPoolOf(run, kind, allowed);
  }
  if (pool.length === 0) return [];
  // 2) 범주 안에서 등급 가중으로 3개 추첨 (허용 등급 밖으로는 절대 나가지 않음)
  // 네잎클로버(luck): 상위 등급 가중 배가 / 유물은 등급 가중 없음(일반 균등)
  let tierWeights = { ...cfg.tierWeights };
  const luckMult = run.relics.flatMap(id => (DB.relicById[id].hooks || [DB.relicById[id].hook]))
    .filter(h => h.type === 'luck').reduce((m, h) => m * (h.mult || 2), 1);
  if (luckMult > 1) {
    for (const t of ['rare', 'epic']) if (tierWeights[t]) tierWeights[t] *= luckMult;
  }
  // 계몽 12: 상위 등급 확률 절반 (일반 전투의 언커먼, 엘리트의 레어)
  if ((run.enlight || 0) >= 12) {
    if (nodeType === 'battle' && tierWeights.uncommon) tierWeights.uncommon *= 0.5;
    if (nodeType === 'elite' && tierWeights.rare) tierWeights.rare *= 0.5;
  }
  const picks = [];
  const usedIds = new Set();
  let guard = 0;
  while (picks.length < cfg.choices && guard++ < 200) {
    let cand;
    if (kind === 'relic') {
      cand = pool.filter(x => !usedIds.has(x.id));
    } else {
      const tier = rollWeight(tierWeights);
      cand = pool.filter(x => x.tier === tier && !usedIds.has(x.id));
      if (cand.length === 0) cand = pool.filter(x => !usedIds.has(x.id));
    }
    if (cand.length === 0) break;
    const item = cand[Math.floor(rng.next() * cand.length)];
    usedIds.add(item.id);
    picks.push({ kind: kind === 'dice' ? 'die' : kind === 'relic' ? 'relic' : 'category', item });
  }
  return picks;
}

// ---------- 보스 전리품: 정예 유물 → 전설(에픽) 족보/주사위 ----------
function pickN(pool, n) {
  const p = pool.slice(); const out = [];
  while (out.length < n && p.length > 0) out.push(p.splice(Math.floor(rng.next() * p.length), 1)[0]);
  return out;
}

// v0.72: 정예는 유물을 반드시 떨어뜨린다. 기본은 일반 유물, 10%로 정예 유물.
// (일반 유물이 동나면 정예 유물로, 그마저 없으면 빈 배열 → 전리품 목록에서 그 줄이 사라진다)
export const ELITE_RELIC_UPGRADE = 0.10;
export function eliteRelicChoices(run) {
  const normals = DB.relics.filter(r => r.tier === 'normal' && !run.relics.includes(r.id));
  const elites = DB.relics.filter(r => r.tier === 'elite' && !run.relics.includes(r.id));
  let pool = rng.next() < ELITE_RELIC_UPGRADE ? elites : normals;
  if (pool.length === 0) pool = pool === normals ? elites : normals;
  if (pool.length === 0) return [];
  return pickN(pool, 3).map(r => ({ kind: 'relic', item: r }));
}

export function bossRelicChoices(run) {
  return pickN(DB.relics.filter(r => r.tier === 'elite' && !run.relics.includes(r.id)), 3)
    .map(r => ({ kind: 'relic', item: r }));
}

export function bossLegendaryChoices(run) {
  const pool = [];
  for (const c of DB.scoring.categories) {
    const has = c.id in run.categories;
    const cur = has ? (run.categories[c.id] || null) : null;
    for (const v of (c.variants || [])) {
      if (v.tier !== 'epic' || cur === v.id) continue;
      pool.push({ kind: 'category', item: { id: `${c.id}:${v.id}`, tier: 'epic', cat: c, variant: v, owned: !!cur, newCat: !has,
                  replaces: cur ? (c.variants || []).find(x => x.id === cur) || null : null } });
    }
  }
  for (const d of DB.dice) if (d.tier === 'epic') pool.push({ kind: 'die', item: d });
  return pickN(pool, 3);
}

// ---------- 상점: 커먼~레어 주사위 + 일반 유물 (전설 없음) ----------
export function rollShopStock(run) {
  const cfg = DB.act1.shop;
  let priceMult = (run.enlight || 0) >= 16 ? 1.3 : 1; // 계몽 16: 상점 가격 증가
  // 가계부: 상점 가격 -20%
  priceMult *= run.relics.flatMap(id => (DB.relicById[id].hooks || [DB.relicById[id].hook]))
    .filter(h => h.type === 'shopDiscount').reduce((m, h) => m * (h.mult || 1), 1);
  const stock = [];
  const usedDie = new Set();
  for (let i = 0; i < cfg.stockDice; i++) {
    const tier = rollWeight(cfg.dieTierWeights);
    let cand = DB.dice.filter(d => d.id !== 'normal' && d.tier === tier && !usedDie.has(d.id));
    if (cand.length === 0) cand = DB.dice.filter(d => d.id !== 'normal' && d.tier !== 'epic' && !usedDie.has(d.id));
    if (cand.length === 0) break;
    const d = cand[Math.floor(rng.next() * cand.length)];
    usedDie.add(d.id);
    stock.push({ kind: 'die', item: d, price: Math.round(cfg.prices.diceByTier[d.tier] * priceMult) });
  }
  for (const r of pickN(DB.relics.filter(r => r.tier === 'normal' && !run.relics.includes(r.id)), cfg.stockRelics)) {
    stock.push({ kind: 'relic', item: r, price: Math.round(cfg.prices.relic * priceMult) });
  }
  return stock;
}

// ---------- v2.0 감정 카드 보상: 전투 승리 → 3장 중 1장을 덱에 추가 ----------
export function rollCardRewards(run, nodeType) {
  const pool = DB.cards.list.map(c => ({ c, w: (c.weight || 1) * (nodeType === 'elite' && (c.weight || 1) <= 1 ? 3 : 1) }));
  const out = [];
  const used = new Set();
  let guard = 0;
  while (out.length < 3 && guard++ < 50) {
    const cand = pool.filter(p => !used.has(p.c.id));
    if (cand.length === 0) break;
    const total = cand.reduce((s, p) => s + p.w, 0);
    let roll = rng.next() * total;
    for (const p of cand) {
      roll -= p.w;
      if (roll <= 0) { used.add(p.c.id); out.push({ kind: 'card', item: p.c }); break; }
    }
  }
  return out;
}

// 전투 승리 코인 (계몽 13: -25%)
export function coinReward(run, nodeType) {
  const cr = DB.act1.coins[nodeType === 'elite' ? 'elite' : 'battle'];
  let got = cr[0] + Math.floor(rng.next() * (cr[1] - cr[0] + 1));
  // 은저울: 코인 +25%
  const cm = run.relics.flatMap(id => (DB.relicById[id].hooks || [DB.relicById[id].hook]))
    .filter(h => h.type === 'coinBonus').reduce((m, h) => m * (h.mult || 1), 1);
  got = Math.round(got * cm);
  if ((run.enlight || 0) >= 13) got = Math.floor(got * 0.75);
  run.coins += got;
  return got;
}

function rollWeight(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (const [key, w] of Object.entries(weights)) { roll -= w; if (roll <= 0) return key; }
  return Object.keys(weights)[0];
}

// ---------- 유물 획득 (즉발 훅 적용: 유리병 최대 HP 등) ----------
export function applyRelicPickup(run, relic) {
  run.relics.push(relic.id);
  const mh = (relic.hooks || [relic.hook]).find(h => h && h.type === 'maxHp');
  if (mh) {
    run.maxHp += mh.amount;
    run.hp = Math.max(1, Math.min(run.maxHp, run.hp + mh.amount));
  }
}

// ---------- 휴식 (계몽 11: 회복량 -50%) ----------
export function restHealAmount(run) {
  const ratio = DB.act1.rest.healRatio * ((run.enlight || 0) >= 11 ? 0.5 : 1);
  return Math.floor(run.maxHp * ratio);
}
export function applyRest(run) {
  const heal = restHealAmount(run);
  healRun(run, heal);
  return heal;
}

// ---------- 세이브 ----------
export function saveRun(run) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...run, _v: 10 })); } catch (e) {}
}

export function loadRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s._v !== 10) { clearSave(); return null; } // v0.26: 분기 지도로 세이브 구조 변경
    if (!s.map || !Array.isArray(s.map.floors) || !Array.isArray(s.map.edges)) { clearSave(); return null; }
    if (typeof s.pos !== 'number') s.pos = -1;
    if (!Array.isArray(s.path)) s.path = [];
    if (!s.dice.every(id => DB.diceById[id])) { clearSave(); return null; }
    if (!s.relics.every(id => DB.relicById[id])) { clearSave(); return null; }
    if (!s.weapon || !DB.weaponById[s.weapon]) { clearSave(); return null; }
    if (!s.categories || typeof s.categories !== 'object') { clearSave(); return null; }
    // v1.34 이전 저장본: 변형 배열 -> 첫 칸을 끼운 것으로 옮긴다
    for (const [cid, v] of Object.entries(s.categories)) if (Array.isArray(v)) s.categories[cid] = v[0] || null;
    // v3.1: 없는 키는 채우지 않는다 — 키가 있는 족보만 소유한 것이다
    // v2.0: 감정 카드 덱 — 없거나 깨진 저장본은 시작 덱으로
    if (!Array.isArray(s.cards) || s.cards.length === 0 || !s.cards.every(id => DB.cardById[id])) {
      s.cards = DB.cards.starterDeck.slice();
    }
    if (!Array.isArray(s.seenEvents)) s.seenEvents = [];
    if (typeof s.coins !== 'number') s.coins = 0;
    if (typeof s.enlight !== 'number') s.enlight = 0;
    if (![1, 2, 3].includes(s.act)) { clearSave(); return null; } // 최종전(4) 중 세이브는 없음
    const actDef = DB.acts.acts[s.act - 1];
    if (!actDef || !actDef.themes.some(t => t.id === s.theme)) { clearSave(); return null; }
    const byId = {};
    for (const c of DB.scoring.categories) byId[c.id] = c;
    for (const [cid, vid] of Object.entries(s.categories)) {
      const c = byId[cid];
      if (!c) { delete s.categories[cid]; continue; }        // 없어진 족보 자리는 버린다 (스몰 스트레이트 등)
      if (vid && !(c.variants || []).some(v => v.id === vid)) s.categories[cid] = null;
    }
    return s;
  } catch (e) { return null; }
}

export function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
export function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
