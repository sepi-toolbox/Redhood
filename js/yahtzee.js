// yahtzee.js — 족보 판정·점수 계산 (순수 함수, DOM/fetch 무관 → node 단독 테스트 가능)

// faces: 현재 눈 배열(5), diceDefs: 각 슬롯의 주사위 정의(dice.json 항목)
// 반환: { valid, base, contributing(인덱스 배열) }
// zeroed: 눈이 0으로 계산되는 슬롯(기절). 족보 성립에는 그대로 들어가되 합산에서만 빠진다.
// faces[i] === 0 인 슬롯(봉인)은 아예 없는 것으로 친다.
export function evalCategory(cat, faces, zeroed = null) {
  const n = faces.length;
  const all = [...Array(n).keys()].filter(i => faces[i] > 0);
  const val = (i) => (zeroed && zeroed.has(i) ? 0 : faces[i]);
  const counts = {};
  for (const i of all) counts[faces[i]] = (counts[faces[i]] || 0) + 1;

  switch (cat.kind) {
    case 'upper': {
      const idx = all.filter(i => faces[i] === cat.face);
      return { valid: true, base: idx.reduce((a, i) => a + val(i), 0), contributing: idx };
    }
    case 'ofKind': {
      const ok = Object.values(counts).some(c => c >= cat.count);
      if (!ok) return { valid: false, base: 0, contributing: [] };
      if (cat.score === 'matchedSumX2' || cat.score === 'matchedSum') {
        // 조건을 만족한 같은 눈들의 합 ×배수(내림). 눈이 여럿이면 높은 쪽 (성립은 count 기준)
        const mult = cat.score === 'matchedSumX2' ? 2 : (cat.mult || 1);
        const face = Math.max(...Object.entries(counts)
          .filter(([, n]) => n >= cat.count).map(([f]) => +f));
        const idx = all.filter(i => faces[i] === face);
        return { valid: true, base: Math.floor(idx.reduce((a, i) => a + val(i), 0) * mult), contributing: idx };
      }
      const base = cat.score === 'sumAll' ? all.reduce((a, i) => a + val(i), 0) : cat.score;
      return { valid: true, base, contributing: all };
    }
    case 'twoPair': {
      // v0.17: 서로 다른 눈 2쌍 — 높은 두 쌍(각 2개)의 합 ×배수(내림)
      const pairFaces = Object.entries(counts)
        .filter(([, n]) => n >= 2).map(([f]) => +f)
        .sort((a, b) => b - a).slice(0, 2);
      if (pairFaces.length < 2) return { valid: false, base: 0, contributing: [] };
      const idx = [];
      for (const f of pairFaces) {
        let need = 2;
        for (const i of all) {
          if (faces[i] === f && need > 0) { idx.push(i); need--; }
        }
      }
      const mult = cat.mult || 1;
      return { valid: true, base: Math.floor(idx.reduce((a, i) => a + val(i), 0) * mult), contributing: idx };
    }
    case 'fullHouse': {
      const cs = Object.values(counts).sort((a, b) => a - b);
      const ok = (cs.length === 2 && cs[0] === 2 && cs[1] === 3) || cs[0] === 5;
      return ok ? { valid: true, base: cat.score, contributing: all }
                : { valid: false, base: 0, contributing: [] };
    }
    case 'straight': {
      const uniq = [...new Set(faces)].sort((a, b) => a - b);
      let run = 1, best = 1;
      for (let i = 1; i < uniq.length; i++) {
        run = uniq[i] === uniq[i - 1] + 1 ? run + 1 : 1;
        best = Math.max(best, run);
      }
      return best >= cat.length
        ? { valid: true, base: cat.score, contributing: all }
        : { valid: false, base: 0, contributing: [] };
    }
    case 'chance': {
      if (cat.score === 'highestDie') {
        // v0.16 노페어: 가장 높은 눈 하나 — 언제나 성립하는 순수 보험 (성권 지시)
        let best = 0;
        for (const i of all) if (faces[i] > faces[best]) best = i;
        return { valid: true, base: faces[best], contributing: [best] };
      }
      if (cat.score === 'sumTop3Distinct') {
        // v0.15: 서로 다른 눈 중 높은 3개의 합 — 같은 눈이 뭉칠수록 찬스가 약해진다 (보험 역할 고정)
        const seen = new Set();
        const pick = [];
        for (const i of all.slice().sort((a, b) => faces[b] - faces[a])) {
          if (seen.has(faces[i])) continue;
          seen.add(faces[i]);
          pick.push(i);
          if (pick.length === 3) break;
        }
        return { valid: true, base: pick.reduce((s, i) => s + faces[i], 0), contributing: pick };
      }
      if (cat.score === 'sumTop3') {
        // (구) 가장 높은 눈 3개의 합
        const idx = all.slice().sort((a, b) => faces[b] - faces[a]).slice(0, 3);
        return { valid: true, base: idx.reduce((s, i) => s + faces[i], 0), contributing: idx };
      }
      return { valid: true, base: faces.reduce((a, b) => a + b, 0), contributing: all };
    }
    default:
      return { valid: false, base: 0, contributing: [] };
  }
}

// 최종 피해 = (기본 + 금박 기여) × Π(categoryMult) + Σ(categoryBonus) + Σ(flatDamage)
// (v0.8: 족보 레벨 폐지 — 성장은 변형 교체·주사위·유물로)
// 기본+금박이 0이면 성립 실패 — total 0 (선택 불가 처리 대상)
// v1.29 벼름(whet) — 전투 중에 쌓았다가 족보로 터뜨리는 곱연산 자원.
//   배수 = 1 + 벼름 × WHET_STEP. 확정하면 0으로 돌아간다 (턴마다 깎이지 않는다).
export const WHET_STEP = 0.5;
export const WHET_CAP = 10;
export const whetMultOf = (whet) => 1 + Math.min(whet || 0, WHET_CAP) * WHET_STEP;

export function computeDamage(cat, faces, diceDefs, relics, zeroed = null, opts = {}) {
  const ev = evalCategory(cat, faces, zeroed);
  let gold = 0, split = 0;
  for (const i of ev.contributing) {
    const def = diceDefs[i];
    if (!def) continue;
    if (def.gold) gold += faces[i];
    // 쪼개기 — 같은 눈 족보에서만 자기 눈을 한 번 더 센다
    if (def.effect && def.effect.op === 'split' && cat.kind === 'ofKind') split += faces[i];
  }
  const core = ev.base + gold + split;
  if (!ev.valid || core === 0) {
    return { valid: ev.valid, base: ev.base, gold: 0, split: 0, mult: 1, whetMult: 1, bonus: 0, flat: 0, total: 0, isZero: true };
  }
  let mult = 1, bonus = 0, flat = 0;
  const hpRatio = opts.hpRatio != null ? opts.hpRatio : 1;
  for (const r of relics) {
    const h = r.hook;
    if (h.type === 'categoryMult' && h.category === cat.id) mult *= h.mult;
    if (h.type === 'categoryBonus' && h.category === cat.id) bonus += h.bonus;
    if (h.type === 'kindBonus' && h.kind === cat.kind) bonus += h.bonus;      // 족보군 보너스
    if (h.type === 'aoeBonus' && cat.target === 'allEnemies') bonus += h.bonus; // 전체 공격 보너스
    if (h.type === 'flatDamage') flat += h.amount;
    // 말라붙은 심장 — HP가 낮으면 통째로 배수
    if (h.type === 'lowHpMult' && hpRatio <= (h.ratio != null ? h.ratio : 0.34)) mult *= h.mult;
  }
  const whetMult = whetMultOf(opts.whet);
  const total = Math.floor(core * mult * whetMult) + bonus + flat;
  return { valid: true, base: ev.base, gold, split, mult, whetMult, bonus, flat, total, isZero: false, contributing: ev.contributing };
}

export function rollFace(dieDef, rngf) {
  const faces = dieDef.faces;
  return faces[Math.floor(rngf() * faces.length)];
}

export function relicValue(relics, type, dflt) {
  let v = dflt;
  for (const r of relics) if (r.hook.type === type) {
    if (type === 'extraReroll') v += r.hook.amount;
    else v = r.hook.value !== undefined ? r.hook.value : r.hook.amount;
  }
  return v;
}
