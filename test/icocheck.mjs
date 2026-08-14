// icocheck.mjs — 화면에 뜨는 '걸리는 것'이 전부 제 그림을 가졌는지 본다 (v4.1)
//
//   왜 있나: 상태이상이 계속 늘고 옮겨 다닌다. 지속 방해였던 것이 주사위 상태이상이 되고(v3.99),
//   버프가 새로 생기고(v3.97 철갑·가시·행운), 본체로 나간 것도 있다(v3.95 중독).
//   그때마다 "일단 비슷한 그림을 빌려 두자"가 쌓이는데, 빌린 그림은 조용하다 —
//   404 도 안 나고 테스트도 안 깨지고, 화면에서 두 상태가 같은 얼굴로 서 있을 뿐이다.
//   assetcheck 는 '파일이 있느냐'만 본다. 여기서는 '제 얼굴이냐'를 본다.
//
//   쓰는 법: node test/icocheck.mjs
import { readFileSync, existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const main = read('js/main.js');
const ST = JSON.parse(read('data/statuses.json'));

// main.js 가 실제로 쓰는 별칭표를 그대로 읽어 온다 — 손으로 베끼면 반드시 어긋난다
const pick = (re) => Object.fromEntries([...(main.match(re)?.[1] || '')
  .matchAll(/(\w+):\s*\[?'([a-z0-9_]+)'/g)].map(m => [m[1], m[2]]));
const ST_ICO_FILE = pick(/const ST_ICO_FILE = \{([^}]*)\}/);
const DIE_ALIAS = pick(/const DIE_ART_ALIAS = \{([^}]*)\}/);
const BUFF_ICO = pick(/const BUFF_ICO = \{([\s\S]*?)\};/);
// 그림이 없을 때 대신 세우는 얼굴 — [원하는 것, 대신 세울 것] 의 둘째 칸
const BUFF_ICO_FALLBACK = Object.fromEntries([...(main.match(/const BUFF_ICO = \{([\s\S]*?)\};/)?.[1] || '')
  .matchAll(/(\w+):\s*\['[a-z0-9_]+',\s*'([a-z0-9_]+)'\]/g)].map(m => [m[1], m[2]]));
const BUFF_READY = new Set([...(main.match(/const BUFF_ART_READY = new Set\(\[([\s\S]*?)\]\)/)?.[1] || '')
  .matchAll(/'([a-z0-9_]+)'/g)].map(m => m[1]));

const hasIco = (n) => existsSync(join(ROOT, `assets/icons/${n}.png`));
const hasDie = (n) => existsSync(join(ROOT, `assets/ui/status_die_${n}.png`));

// ---- 화면에 표식으로 서는 것 전부 ----
const rows = [];
for (const s of ST.list) rows.push({ ko: s.name, id: s.id, where: '주사위', ico: ST_ICO_FILE[s.id] || `status_${s.id}` });
rows.push({ ko: '중독', id: 'poison', where: '본체', ico: 'status_poison' });
for (const [ko, key] of [['힘', 'strength'], ['집중', 'focus'], ['재생', 'regen']])
  rows.push({ ko, id: key, where: '본체', ico: `status_${key}` });
for (const [ko, key] of [['철갑', 'ironclad'], ['가시', 'thorns'], ['행운', 'fortune']]) {
  const want = BUFF_ICO[key];                       // [원하는 것, 대신 세운 것] 중 첫 번째만 잡힌다
  rows.push({ ko, id: key, where: '본체', ico: BUFF_READY.has(want) ? want : null, want });
}
rows.push({ ko: '격노', id: 'enrage', where: '본체', ico: 'fx_enrage' });
rows.push({ ko: '방어도', id: 'block', where: '본체', ico: 'status_block' });
rows.push({ ko: '벼름', id: 'whet', where: '본체', ico: 'ui_whet' });
for (const [ko, key] of [['약화', 'weak'], ['취약', 'vulnerable']])
  rows.push({ ko, id: key, where: '적', ico: `status_${key}` });
for (const [ko, key] of [['이빨 자국', 'rolltax'], ['가시(리롤세)', 'holdtax'], ['스멀거림', 'blind']])
  rows.push({ ko, id: key, where: '판', ico: `fx_${key}` });
rows.push({ ko: '족보 봉인', id: 'sealCat', where: '판', ico: 'fx_seal_cat' });

let fails = 0;
const say = (msg, list, hard = true) => {
  if (!list.length) { console.log(`✅ ${msg}: 없음`); return; }
  if (hard) fails += list.length;
  console.log(`${hard ? '❌' : 'ℹ️ '} ${msg}: ${list.length}개`);
  for (const x of list) console.log(`     ${x}`);
};

// 1) 그림이 아예 없는 것
say('제 그림이 없는 상태이상 (남의 것을 빌려 쓰는 중)',
  rows.filter(r => !r.ico).map(r => `${r.ko}(${r.where}) — ${r.want}.png 를 그려야 한다`), false);

// 2) 파일이 실재하는가
say('그림 파일이 없는 것', rows.filter(r => r.ico && !hasIco(r.ico)).map(r => `${r.ko} → ${r.ico}.png`));

/* 3) 두 상태가 같은 얼굴로 서 있는가 — 화면에서 구분이 안 된다.
      그림이 없어 빌려 쓰는 것도 '지금 화면에 뜨는 얼굴'로 세어야 진짜가 보인다. */
const shown = (r) => r.ico || BUFF_ICO_FALLBACK[r.id] || null;
const byIco = {};
for (const r of rows) { const f = shown(r); if (f) (byIco[f] ||= []).push(r.ko); }
say('한 그림을 여럿이 나눠 쓰는 것 (화면에서 구분 불가)',
  Object.entries(byIco).filter(([, v]) => v.length > 1).map(([k, v]) => `${k}.png ← ${v.join(' / ')}`), false);

// 4) 주사위 판 그림 — 주사위에 붙는 것만 필요하다
say('주사위 판 그림이 없는 상태이상',
  ST.list.filter(s => !hasDie(DIE_ALIAS[s.id] || s.id)).map(s => `${s.name} → status_die_${s.id}.png`));
say('남의 주사위 판을 빌려 쓰는 것',
  ST.list.filter(s => DIE_ALIAS[s.id]).map(s => `${s.name} → status_die_${DIE_ALIAS[s.id]}.png 를 빌림`), false);

// 5) 아무도 안 쓰는 그림 (상태이상이 옮겨 다니면 남는다)
const used = new Set(rows.map(r => r.ico).filter(Boolean));
const orphanDie = readdirSync(join(ROOT, 'assets/ui'))
  .filter(f => f.startsWith('status_die_'))
  .map(f => f.replace('status_die_', '').replace('.png', ''))
  .filter(id => !ST.list.some(s => s.id === id || DIE_ALIAS[s.id] === id));
say('쓰는 데가 없어진 주사위 판 그림', orphanDie.map(id => `status_die_${id}.png`), false);

const pending = rows.filter(r => !r.ico).length;
console.log(fails ? `ICON FAILS: ${fails}`
  : pending ? `ALL ICON PASS (그려야 할 표식 ${pending}장 남음)` : 'ALL ICON PASS');
process.exit(fails ? 1 : 0);
