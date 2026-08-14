// arttodo.mjs — 아직 그리지 않은 리소스를 코드·데이터에서 직접 뽑는다 (docs/ART_TODO_NOW.md)
//   손으로 적은 목록은 반드시 낡는다. 이름을 바꾸거나 상태이상을 옮기면 여기 다시 돌린다.
//   쓰는 법: node tools/arttodo.mjs
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
const R = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, R), 'utf8');
const has = (p) => existsSync(new URL(p, R));
const main = read('js/main.js');
const ST = JSON.parse(read('data/statuses.json'));
const SC = JSON.parse(read('data/scoring.json'));
const DICE = JSON.parse(read('data/dice.json'));
const RELICS = JSON.parse(read('data/relics.json'));

const setOf = (name) => new Set([...(main.match(new RegExp(`const ${name} = new Set\\(\\[([\\s\\S]*?)\\]\\)`))?.[1] || '')
  .matchAll(/'([a-z0-9_]+)'/g)].map(m => m[1]));
const mapOf = (name) => Object.fromEntries([...(main.match(new RegExp(`const ${name} = \\{([\\s\\S]*?)\\};?`))?.[1] || '')
  .matchAll(/(\w+):\s*\[?'([a-z0-9_]+)'/g)].map(m => [m[1], m[2]]));

const out = [];
const push = (급, 이름, 파일, 지금, 프롬프트) => out.push({ 급, 이름, 파일, 지금, 프롬프트 });

// 1) 새 버프 표식 — BUFF_ART_READY 에 안 오른 것은 남의 얼굴로 나간다
const ready = setOf('BUFF_ART_READY');
const BUFF_WANT = [...(main.match(/const BUFF_ICO = \{([\s\S]*?)\};/)?.[1] || '')
  .matchAll(/(\w+):\s*\['([a-z0-9_]+)',\s*'([a-z0-9_]+)'\]/g)];
const BUFF_KO = { ironclad: '철갑', thorns: '가시', fortune: '행운' };
const BUFF_PROMPT = {
  ironclad: 'a layered iron plate pauldron, riveted bands, seen head-on',
  thorns: 'a ring of sharp bramble thorns curving outward',
  fortune: 'a four-leaf clover with a faint spark at its centre',
};
for (const [, key, want, fallback] of BUFF_WANT)
  if (!ready.has(want)) push('표식', BUFF_KO[key] || key, `assets/icons/${want}.png`, `${fallback}.png 를 빌림`, BUFF_PROMPT[key] || '');

// 2) 주사위 판 — 남의 판을 빌리는 상태이상
const dieAlias = mapOf('DIE_ART_ALIAS');
const DIE_PROMPT = { petrify: 'a die face crusted over with grey stone, cracks spreading from the centre' };
for (const [id, borrow] of Object.entries(dieAlias)) {
  const ko = (ST.list.find(s => s.id === id) || {}).name || id;
  push('주사위 판', ko, `assets/ui/status_die_${id}.png`, `status_die_${borrow}.png 를 빌림`, DIE_PROMPT[id] || '');
}
// 판이 아예 없는 상태이상 (별칭도 없이)
for (const s of ST.list)
  if (!dieAlias[s.id] && !has(`assets/ui/status_die_${s.id}.png`))
    push('주사위 판', s.name, `assets/ui/status_die_${s.id}.png`, '없음 — 판 없이 나간다', '');

// 3) 족보 판 — 이름이 바뀌었는데 그림이 옛 이름 그대로인 것 + 판이 없는 변형
const plateReady = setOf('COMBO_PLATE_READY');
const STALE = {   // v3.95 개명분: 파일만 옮겨 두고 그림은 아직 옛것
  deathcap: ['독버섯', 'four speckled death-cap mushrooms in a row, caps tilted', '네 송곳니 그림 그대로'],
  plague_moon: ['역병의 달', 'a full moon veined with sickly green rot, faint vapour rising', '핏빛 만월 그림 그대로'],
};
for (const [id, [ko, prompt, now]] of Object.entries(STALE))
  if (plateReady.has(id)) push('족보 판', ko, `assets/ui/paper_${id}.png`, now, prompt);
const noPlate = [];
for (const c of SC.categories) for (const v of c.variants)
  if (!plateReady.has(v.id) && !v.base) noPlate.push(`${v.name}(${v.id})`);

// 4) 유물 그림 — READY 에 안 오른 유물은 이모지로 나간다
const relicReady = setOf('RELIC_ART_READY');
for (const r of RELICS)
  if (!relicReady.has(r.id)) push('유물', r.name, `assets/relics/${r.id}.png`, `이모지 ${r.icon} 로 나간다`, '');

// 5) 주사위 껍데기 — DIE_SKINS 에 없는 주사위는 기본 눈 그림을 쓴다
const skins = setOf('DIE_SKINS');
const noSkin = DICE.filter(d => !skins.has(d.id)).map(d => `${d.name}(${d.id})`);

const L = ['# 지금 그려야 하는 리소스', '',
  '`node tools/arttodo.mjs` 로 코드·데이터에서 다시 뽑는다. 손으로 고치지 말 것.',
  '규격은 같은 갈래의 기존 그림을 따른다 — 배경 투명, 여백 최소, 단색 심볼.', ''];
if (out.length) {
  L.push('| 갈래 | 이름 | 넣을 곳 | 지금은 | 프롬프트 |', '|---|---|---|---|---|');
  for (const o of out) L.push(`| ${o.급} | ${o.이름} | \`${o.파일}\` | ${o.지금} | ${o.프롬프트 ? '`' + o.프롬프트 + '`' : '—'} |`);
} else L.push('- 없음');
L.push('', '## 넣는 법', '');
L.push('- 표식(`assets/icons/`) — 파일을 넣고 `js/main.js` 의 `BUFF_ART_READY` 에 이름을 적는다.');
L.push('- 주사위 판(`assets/ui/status_die_*.png`) — 파일을 넣고 `DIE_ART_ALIAS` 에서 그 줄을 지운다.');
L.push('- 족보 판(`assets/ui/paper_*.png`) — 같은 이름으로 덮어쓰면 끝. READY 는 이미 올라 있다.');
L.push('- 유물(`assets/relics/`) — 파일을 넣고 `RELIC_ART_READY` 에 id 를 적는다.');
L.push('', '넣은 뒤 `node test/icocheck.mjs` 로 확인한다.', '');
L.push('## 급하지 않은 것', '');
L.push(`- 판 없는 족보 변형 ${noPlate.length}종 — 기본 종이(paper_row)로 나간다: ${noPlate.join(', ') || '없음'}`);
L.push(`- 껍데기 없는 주사위 ${noSkin.length}종 — 기본 눈 그림을 쓴다: ${noSkin.join(', ') || '없음'}`);
writeFileSync(new URL('docs/ART_TODO_NOW.md', R), L.join('\n') + '\n');
console.log(`docs/ART_TODO_NOW.md 갱신 — 그려야 할 것 ${out.length}개`);
