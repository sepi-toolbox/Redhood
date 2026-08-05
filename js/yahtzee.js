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
    case 'chance':
      return { valid: true, base: faces.reduce((a, b) => a + b, 0), contributing: all };
    default:
      return { valid: false, base: 0, contributing: [] };
  }
}

// 최종 피해 = (기본 + 금박 기여) × Π(categoryMult) + Σ(categoryBonus) + Σ(flatDamage)
// 기본+금박이 0이면 "칸 버리기" — 배수·가산 없이 0 (healOnZero 대상)
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
    if (h.type === 'flatDamage') flat += h.amount;
  }
  const total = Math.floor(core * mult) + bonus + flat;
  return { valid: true, base: ev.base, gold, mult, bonus, flat, total, isZero: false };
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
