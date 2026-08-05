// yahtzee.js — 족보 판정·점수 계산 (순수 함수, DOM/fetch 무관 → node 단독 테스트 가능)

// faces: 현재 눈 배열(5), diceDefs: 각 슬롯의 주사위 정의(dice.json 항목)
// 반환: { valid, base, contributing(인덱스 배열) }
export function evalCategory(cat, faces) {
  const n = faces.length;
  const all = [...Array(n).keys()];
  const counts = {};
  for (const f of faces) counts[f] = (counts[f] || 0) + 1;

  switch (cat.kind) {
    case 'upper': {
      const idx = all.filter(i => faces[i] === cat.face);
      return { valid: true, base: idx.length * cat.face, contributing: idx };
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
        return { valid: true, base: Math.floor(face * idx.length * mult), contributing: idx };
      }
      const base = cat.score === 'sumAll' ? faces.reduce((a, b) => a + b, 0) : cat.score;
      return { valid: true, base, contributing: all };
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
export function computeDamage(cat, faces, diceDefs, relics) {
  const ev = evalCategory(cat, faces);
  let gold = 0;
  for (const i of ev.contributing) {
    if (diceDefs[i] && diceDefs[i].gold) gold += faces[i];
  }
  const core = ev.base + gold;
  if (!ev.valid || core === 0) {
    return { valid: ev.valid, base: ev.base, gold: 0, mult: 1, bonus: 0, flat: 0, total: 0, isZero: true };
  }
  let mult = 1, bonus = 0, flat = 0;
  for (const r of relics) {
    const h = r.hook;
    if (h.type === 'categoryMult' && h.category === cat.id) mult *= h.mult;
    if (h.type === 'categoryBonus' && h.category === cat.id) bonus += h.bonus;
    if (h.type === 'kindBonus' && h.kind === cat.kind) bonus += h.bonus;      // 족보군 보너스
    if (h.type === 'aoeBonus' && cat.target === 'allEnemies') bonus += h.bonus; // 전체 공격 보너스
    if (h.type === 'flatDamage') flat += h.amount;
  }
  const total = Math.floor(core * mult) + bonus + flat;
  return { valid: true, base: ev.base, gold, mult, bonus, flat, total, isZero: false, contributing: ev.contributing };
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
