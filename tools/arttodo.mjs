// arttodo.mjs — 아직 안 그린 리소스를 코드·데이터에서 뽑아 '붙여 넣을 수 있는' 프롬프트로 쓴다
//
//   형식은 docs/STATUS_ART_PROMPTS.md 가 정한 것을 그대로 따른다 — 머리 블록도 거기서 읽어 온다.
//   (베껴 두면 그쪽을 고쳤을 때 여기가 낡는다)
//   프롬프트는 표 칸에 넣지 않는다. 한 항목이 통째로 하나의 코드 블록이어야 복사가 된다.
//
//   쓰는 법: node tools/arttodo.mjs   →   docs/ART_TODO_NOW.md
import { readFileSync, writeFileSync, existsSync } from 'fs';
const R = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, R), 'utf8');
const has = (p) => existsSync(new URL(p, R));
const main = read('js/main.js');
const SAP = read('docs/STATUS_ART_PROMPTS.md');
const ST = JSON.parse(read('data/statuses.json'));
const SC = JSON.parse(read('data/scoring.json'));
const DICE = JSON.parse(read('data/dice.json'));
const RELICS = JSON.parse(read('data/relics.json'));

// 머리 블록 두 개를 원본 문서에서 그대로 가져온다
const blocks = [...SAP.matchAll(/```\n(Stylized dark fairytale [\s\S]*?)```/g)].map(m => m[1].trim());
const HEAD_DIE = blocks.find(b => b.includes('overlay effect'));
const HEAD_ICO = blocks.find(b => b.includes('UI icon'));
if (!HEAD_DIE || !HEAD_ICO) throw new Error('STATUS_ART_PROMPTS.md 에서 머리 블록을 못 찾았다');

const setOf = (n) => new Set([...(main.match(new RegExp(`const ${n} = new Set\\(\\[([\\s\\S]*?)\\]\\)`))?.[1] || '')
  .matchAll(/'([a-z0-9_]+)'/g)].map(m => m[1]));
const pairOf = (n) => Object.fromEntries([...(main.match(new RegExp(`const ${n} = \\{([\\s\\S]*?)\\};`))?.[1] || '')
  .matchAll(/(\w+):\s*\['([a-z0-9_]+)',\s*'([a-z0-9_]+)'\]/g)].map(m => [m[1], { want: m[2], now: m[3] }]));
const strOf = (n) => Object.fromEntries([...(main.match(new RegExp(`const ${n} = \\{([\\s\\S]*?)\\};`))?.[1] || '')
  .matchAll(/(\w+):\s*'([#\w]+)'/g)].map(m => [m[1], m[2]]));

const ready = setOf('BUFF_ART_READY'), BUFF_ICO = pairOf('BUFF_ICO'), TONE = strOf('BUFF_TONE');
const dieAlias = strOf('DIE_ART_ALIAS');
const stById = Object.fromEntries(ST.list.map(s => [s.id, s]));

// ── 그려야 하는 것 ─────────────────────────────────────────────────────────
const KO = { ironclad: '철갑', thorns: '가시', fortune: '행운' };
const SYMBOL = {
  ironclad: 'one broad iron shoulder plate of three overlapping bands, thick rivets along each band, seen head-on',
  thorns: 'one closed ring of thick bramble thorns, sharp points turned outward, two heavy stems crossing behind',
  fortune: 'one four-leaf clover with thick rounded leaves and one bright spark at its centre',
  petrify: 'one single die pip swollen into a lump of grey stone, blunt fracture lines spreading from it, no die drawn around it',
};
const EFFECT = {
  petrify: 'heavy grey-brown stone lumps swelling out of the left and bottom edges, thick blunt shapes with blunt fracture lines, the middle still open',
};
const items = [];
for (const [key, { want, now }] of Object.entries(BUFF_ICO)) {
  if (ready.has(want)) continue;
  items.push({ 갈래: '아이콘', ko: KO[key] || key, file: `assets/icons/${want}.png`, now: `${now}.png 를 빌려 쓰는 중`,
    tone: TONE[key] || '#c9a86a', head: HEAD_ICO, slot: 'The symbol:', body: SYMBOL[key] || '' });
}
for (const [id, borrow] of Object.entries(dieAlias)) {
  const s = stById[id]; if (!s) continue;
  items.push({ 갈래: '덮개', ko: s.name, file: `assets/ui/status_die_${id}.png`, now: `status_die_${borrow}.png 를 빌려 쓰는 중`,
    tone: s.color, head: HEAD_DIE, slot: 'The effect:', body: EFFECT[id] || '' });
  // 덮개를 새로 그리는 김에 짝이 되는 아이콘도 같이 뽑는다 (0부 규칙: 한 상태는 한 번에 한 쌍)
  items.push({ 갈래: '아이콘', ko: s.name, file: `assets/icons/status_${id}.png`, now: 'fx_petrify.png 를 쓰는 중 — 기절과 형태가 겹친다',
    tone: s.color, head: HEAD_ICO, slot: 'The symbol:', body: SYMBOL[id] || '' });
}
const build = (it) => it.head.replace('{색코드}', it.tone).replace(`${it.slot} {묘사}`, `${it.slot} ${it.body}`);

const L = [];
L.push('# 지금 그려야 하는 리소스', '');
L.push('`node tools/arttodo.mjs` 로 코드·데이터에서 다시 뽑는다. 손으로 고치지 말 것.');
L.push('머리 블록은 `docs/STATUS_ART_PROMPTS.md` 에서 그대로 읽어 온다 — 규격을 바꾸려면 그쪽을 고친다.', '');
L.push('| 종류 | 파일 | 규격 |', '|---|---|---|');
L.push('| **덮개** | `assets/ui/status_die_*.png` | 256×256, 알파, 가장자리에 붙고 **가운데는 비운다** |');
L.push('| **아이콘** | `assets/icons/status_*.png` | 96×96, 심볼 하나, 메달 테는 게임이 씌운다 |', '');
L.push('**첨부**: `docs/keyart/keyart_stilllife.jpg` — 머리 블록의 `the attached key art` 가 이걸 가리킨다.');
L.push('**배경**: 중간 회색으로 뽑는다. 받은 뒤 아래 한 줄로 붙인다.', '');
L.push('```', 'python3 tools/make_icon.py <원본.png> status_ironclad          # 아이콘',
  'python3 -c "import sys;sys.path.insert(0,\'tools\');import make_icon;make_icon.build_die(\'<원본.png>\',\'petrify\')"   # 덮개', '```', '');

if (!items.length) L.push('- 없음', '');
for (const it of items) {
  L.push(`## ${it.ko} — ${it.갈래}`, '');
  L.push(`- 파일: \`${it.file}\``);
  L.push(`- 색: \`${it.tone}\``);
  L.push(`- 지금: ${it.now}`, '');
  L.push('```');
  L.push(build(it));
  L.push('```', '');
}

L.push('## 넣는 법', '');
L.push('- 아이콘 — 파일을 넣고 `js/main.js` 의 `BUFF_ART_READY` 에 이름을 적는다.');
L.push('- 덮개 — 파일을 넣고 `DIE_ART_ALIAS` 에서 그 줄을 지운다.');
L.push('- 넣은 뒤 `node test/icocheck.mjs` 로 확인한다.', '');

// 급하지 않은 것 — 프롬프트 없이 목록만
const plateReady = setOf('COMBO_PLATE_READY');
const relicReady = setOf('RELIC_ART_READY');
const skins = setOf('DIE_SKINS');
const noPlate = [];
for (const c of SC.categories) for (const v of c.variants) if (!plateReady.has(v.id) && !v.base) noPlate.push(v.name);
L.push('## 급하지 않은 것', '');
L.push('- **개명분 족보 판 2장** — 파일 이름은 맞는데 그림이 옛것이다. 같은 이름으로 덮어쓰면 끝.');
L.push('  - `assets/ui/paper_deathcap.png` (독버섯) — 지금 네 송곳니 그림');
L.push('  - `assets/ui/paper_plague_moon.png` (역병의 달) — 지금 핏빛 만월 그림');
L.push(`- 판 없는 족보 변형 ${noPlate.length}종 — 기본 종이로 나간다: ${noPlate.join(', ') || '없음'}`);
L.push(`- 껍데기 없는 주사위 ${DICE.filter(d => !skins.has(d.id)).length}종 — 기본 눈 그림을 쓴다: ${DICE.filter(d => !skins.has(d.id)).map(d => d.name).join(', ') || '없음'}`);
L.push(`- 그림 없는 유물 ${RELICS.filter(r => !relicReady.has(r.id)).length}종`);

writeFileSync(new URL('docs/ART_TODO_NOW.md', R), L.join('\n') + '\n');
console.log(`docs/ART_TODO_NOW.md 갱신 — 프롬프트 ${items.length}개`);
