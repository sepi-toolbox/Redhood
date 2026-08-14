// statustable.mjs — 상태이상·지속효과 표를 데이터에서 그대로 뽑는다 (docs/STATUS_TABLE.md)
//   손으로 적은 표는 반드시 데이터와 어긋난다. 규칙이 바뀌면 이걸 다시 돌린다.
//   쓰는 법: node tools/statustable.mjs
import { readFileSync, writeFileSync } from 'fs';
const R = new URL('../', import.meta.url);
const load = (p) => JSON.parse(readFileSync(new URL('data/' + p, R), 'utf8'));
const ST = load('statuses.json'), EN = load('enemies.json'), SC = load('scoring.json');

const RULE_KO = {
  onUseFaceDamage: '그 주사위를 족보에 쓰면 눈금만큼 피해',
  onUseFaceCoin: '그 주사위를 족보에 쓰면 눈금만큼 재화를 잃음',
  noReroll: '다시 굴릴 수 없다',
  zeroValue: '족보에는 들어가지만 눈금이 0',
  faceLow: '수치 이하의 눈만 나온다',
  faceHigh: '수치 이상의 눈만 나온다',
  hideFace: '눈이 보이지 않는다 (족보에는 들어간다)',
  needReroll: '한 번 다시 굴리기 전에는 값이 없다 — 족보에도 안 들어간다',
  fuse: '심지가 다 타면 터져 수치만큼 피해. 그 전에 족보에 쓰면 해제',
  linked: '결속된 것끼리 항상 같이 굴러간다',
  rerollCost: '다시 굴리면 리롤을 수치만큼 쓴다',
  spread: '쓰지 않으면 양옆으로 번진다. 다 잠식되면 공허의 부름만 남는다',
  locked: '족보에도 안 들어가고 다시 굴릴 수도 없다',
  zeroOnFace: '이 칸에 수치와 같은 눈이 나오면 눈금이 0',
};

// 적이 거는 곳을 센다 (status op 은 kind 로, 나머지는 op 로)
const src = {};
for (const d of EN) for (const pool of ['moves', 'uniqueMoves'])
  for (const m of Object.values(d[pool] || {}))
    for (const ef of m.effects || []) {
      const key = ef.op === 'status' ? ef.kind : ef.op;
      (src[key] ||= []).push(`${d.name}·${m.name || ''}`);
    }
// 내가 족보로 거는 곳
const mine = {};
for (const c of SC.categories) for (const v of c.variants)
  for (const ab of v.ability || []) (mine[ab.op] ||= []).push(`${v.name} ${ab.amount}`);

const n = (k) => (src[k] ? src[k].length : 0);
const list = (k) => (mine[k] || []).join(' · ') || '—';
const L = [];
L.push('# 상태이상 · 지속효과 표', '');
L.push('`node tools/statustable.mjs` 로 데이터에서 다시 뽑는다. 손으로 고치지 말 것.', '');

L.push(`## A. 주사위 칸에 붙는 상태이상 (${ST.list.length}종)`, '');
L.push('칸 하나에 하나만 붙는다 — 나중 것이 먼저 것을 밀어내고, 밀려난 쪽은 그 자리에서 풀린다.');
L.push('v3.94부터 내 턴이 **끝날 때** 1씩 줄고, 걸린 턴에는 줄지 않는다.');
L.push('v3.99부터 종류·칸수·남은 턴이 체력바 아래 표식 줄에도 함께 선다.', '');
L.push('| 상태이상 | 효과 | 수치 | 지속 | 적 행동 |');
L.push('|---|---|---|---|---|');
for (const s of ST.list)
  L.push(`| ${s.name} | ${RULE_KO[s.rule] || s.rule} | ${s.amount || '—'} | ${s.turns ? s.turns + '턴' : '—'} | ${n(s.id)}곳 |`);

L.push('', '## B. 나에게 쌓이는 것', '');
L.push('| 이름 | 효과 | 얻는 족보 |');
L.push('|---|---|---|');
L.push(`| 힘 | 때리는 한 방마다 +N. 배율 뒤·증감(취약/약화) 앞에 더해진다. 전투 내내 남는다 | ${list('strength')} · 적 ${n('strength')}곳 |`);
L.push(`| 집중 | 리롤 **+1 고정**. 겹쳐 얻으면 세기가 아니라 남은 턴이 늘어난다 | ${list('focus')} |`);
L.push(`| 재생 | 턴 시작 회복 +1 / 스택 | ${list('regen')} |`);
L.push(`| 방어도 | 받는 피해를 먼저 막는다 (턴마다 초기화) | ${list('block')} |`);
L.push(`| 벼름 | 일격 족보 피해 ×(1 + ${SC.whetStep}×스택), 상한 ${SC.whetCap} | ${list('whet')} |`);
L.push(`| 철갑 | 턴이 끝날 때 방어 N 획득, 그 뒤 누적 1 감소 | ${list('ironclad')} |`);
L.push(`| 가시 | 적의 공격이 내 체력을 깎을 때마다 그 적에게 N 피해(적 방어도로 막힘). **전투 내내 남는다** | ${list('thorns')} |`);
L.push(`| 행운 | 상태이상을 거는 효과를 통째로 무르고 1 감소. 몇 칸에 걸리든·누적 몇이든 '효과 하나'로 친다 | ${list('fortune')} |`);
L.push(`| 격노 | 턴이 끝날 때마다 힘 +N. 나와 적이 같은 장치를 쓴다 | ${list('enrage')} · 적 ${n('enrage')}곳 |`);
L.push('', '> 행운이 무르는 것: A절 주사위 상태이상 · 본체 중독 · E절 지속 방해 · 족보 봉인.');
L.push('> 즉발 방해(벼름 흡수·흩기)와 피해는 대상이 아니다 — 걸어 두는 것만 무른다.');

L.push('', '## C. 내가 적에게 거는 것', '');
L.push('| 이름 | 효과 | 거는 족보 |');
L.push('|---|---|---|');
L.push(`| 취약 | 받는 피해 ×${SC.vulnMult} (세기는 안 쌓이고 턴만 늘어남) | ${list('vulnerable')} |`);
L.push(`| 약화 | 주는 피해 ×${SC.weakMult} (세기는 안 쌓이고 턴만 늘어남) | ${list('weakEnemy')} |`);
L.push(`| 중독 | 내 턴 끝마다 누적만큼 피해, 누적 -1 (적 방어도로는 안 막힌다) | ${list('poison')} |`);
L.push('', '> 중독은 **본체**에, 출혈은 **주사위**에 붙는다 (v3.95). 적에게는 주사위가 없으므로');
L.push('> 내가 걸 수 있는 지속 피해는 중독뿐이고, 출혈은 적이 내 주사위에만 건다.');

L.push('', '## D. 적이 자기에게 거는 것', '');
L.push('힘은 나와 적이 **같은 것**을 쓴다 — B절에 함께 적었다. 예고 갈래의 \'강화\'는');
L.push('힘을 부여하는 **행동 분류**지 효과 이름이 아니다.', '');
L.push('| 이름 | 효과 | 쓰는 곳 |');
L.push('|---|---|---|');
for (const [k, ko, txt] of [
  ['block', '방어', '받는 피해를 먼저 막는다 (자기 차례에 초기화)'],
  ['heal', '치료', 'HP 회복'],
  ['rest', '휴식', '아무것도 하지 않고 턴을 넘긴다'],
  ['regen', '재생', '자기 차례마다 회복'],
  ['reflect', '반사', '맞으면 그만큼 되돌려준다'],
  ['selfDamage', '자해', '제 HP를 깎는다 (예고로는 안 보인다)'],
]) L.push(`| ${ko} | ${txt} | ${n(k)}곳 |`);
L.push('', '### 적이 내 본체에 거는 것', '');
L.push(`- **중독** — 내 턴 끝마다 쌓인 만큼 피해, 누적 -1. 방어도가 먼저 막는다. ${n('poison')}곳`);

L.push('', '## E. 적 행동이 남기는 지속 방해', '');
L.push('상태이상과 같은 문법으로 턴마다 줄어든다. 주사위 한 칸이 아니라 판 전체에 걸린다.');
L.push('v3.99: 굳음·물기는 여기서 나가 A절의 주사위 상태이상이 됐다 — 방해가 또 주사위 상태를');
L.push('낳던 이중 구조를 없앴다. 아래 것들도 전부 **행운**이 무를 수 있다.', '');
L.push('| 이름 | 효과 | 쓰는 곳 |');
L.push('|---|---|---|');
for (const [k, ko, txt] of [
  ['rollTax', '이빨 자국', '리롤할 때마다 피해'],
  ['holdTax', '가시(리롤세)', '리롤할 때 지킨 주사위 하나당 피해'],
  ['blind', '스멀거림', '족보 위력 미리보기를 가린다'],
  ['sealLast', '흉내내기', '직전에 쓴 족보를 봉인'],
  ['sealCat', '솜 채우기', '지정한 족보들을 봉인'],
  ['drainWhet', '벼름 흡수', '쌓아둔 벼름을 빼앗는다'],
  ['unpin', '흩기', '새겨둔 눈을 전부 푼다'],
]) L.push(`| ${ko} | ${txt} | ${n(k)}곳 |`);

// 행동이 아니라 '처음부터 지니고 시작하는' 상태 — createBattle 이 def.start 를 읽는다
const LIVE_START = ['block', 'power', 'regen', 'enrage', 'reflect', 'undying'];
const starts = [], orphan = [];
for (const d of EN) for (const [k, v] of Object.entries(d.start || {}))
  (LIVE_START.includes(k) ? starts : orphan).push(`${d.name}(${d.tier || 'normal'}) ${k} ${v}`);
L.push('', '## F. 처음부터 지니고 시작하는 상태', '');
L.push(starts.length ? starts.map(s => `- ${s}`).join('\n') : '- 없음');

L.push('', '## 비어 있는 자리', '');
L.push('엔진에는 있는데 데이터가 거의/전혀 안 쓰는 것들.', '');

for (const [k, ko, note] of [
  ['reflect', '반사', '때리면 되돌아오는 기믹'],
  ['regen', '적 재생', '순 피해가 못 넘기면 영원히 못 잡는 기믹'],
]) L.push(`- **${ko}** — 행동으로 거는 곳 ${n(k)}곳${starts.some(s => s.includes(` ${k} `)) ? ' (시작 상태로만 1종)' : ''}. ${note}`);
if (orphan.length) {
  L.push('', '### 엔진이 안 읽는 죽은 데이터', '');
  L.push('createBattle 이 보는 키는 `' + LIVE_START.join('`, `') + '` 뿐이다. 아래는 아무 일도 하지 않는다.', '');
  for (const o of orphan) L.push(`- ${o}`);
}
writeFileSync(new URL('docs/STATUS_TABLE.md', R), L.join('\n') + '\n');
console.log('docs/STATUS_TABLE.md 갱신 — 주사위 상태이상 ' + ST.list.length + '종');
