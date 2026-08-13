// assetcheck.mjs — 화면이 부를 그림이 실제로 다 있는지, 서비스워커 목록이 성립하는지 본다 (v3.62)
//
//   왜 있나: v3.61 에서 sw.js 의 ASSETS 에 이미 지운 intent_heal.png 가 남아 있었다.
//   addAll 은 목록 중 하나만 404 여도 통째로 실패하는데, 그러면 새 캐시가 안 만들어지고
//   activate 도 안 돌아서 낡은 캐시가 계속 화면을 차지한다 — 판을 올려도 아무것도 안 바뀐다.
//   설치를 한 장씩으로 바꿔 두긴 했지만, 애초에 없는 파일이 목록에 남는 걸 여기서 잡는다.
//
//   쓰는 법: node test/assetcheck.mjs
import { readFileSync, existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
let fails = 0;
const bad = (msg, list) => {
  if (!list.length) { console.log(`✅ ${msg}: 없음`); return; }
  fails += list.length;
  console.log(`❌ ${msg}: ${list.length}개`);
  for (const x of list) console.log(`     ${x}`);
};

// 1) sw.js 가 미리 받아 두겠다고 적은 것이 전부 실재하는가
const sw = read('sw.js');
const assets = [...sw.matchAll(/'\.\/([^']+)'/g)].map(m => m[1]).filter(Boolean);
bad('sw.js ASSETS 중 없는 파일', assets.filter(p => !existsSync(join(ROOT, p))));

// 2) 코드가 ico('...') / 파일 이름으로 부르는 아이콘이 전부 실재하는가
//    assets/ui 에 사는 것(버튼 텍스쳐·튀는 조각 스프라이트)은 여기 대상이 아니다.
const src = ['js/main.js', 'js/engine.js', 'js/run.js'].map(read).join('\n');
const have = new Set(readdirSync(join(ROOT, 'assets/icons')).map(f => f.replace(/\.png$/, '')));
const inUi = new Set(readdirSync(join(ROOT, 'assets/ui')).map(f => f.replace(/\.(png|jpg)$/, '')));
const names = new Set();
for (const re of [/ico\('([a-z0-9_]+)'/g, /'(intent_[a-z0-9_]+)'/g, /'(status_[a-z0-9_]+)'/g, /'(fx_[a-z0-9_]+)'/g, /'(ui_[a-z0-9_]+)'/g]) {
  for (const m of src.matchAll(re)) {
    const n = m[1];
    if (n.endsWith('_')) continue;      // 'status_' + kind 처럼 이어 붙이는 앞머리
    if (inUi.has(n)) continue;          // assets/ui 쪽 그림
    names.add(n);
  }
}
// 'status_' + ef.kind 처럼 이어 붙이는 자리는 데이터에서 종류를 끌어와 확인한다
const statuses = JSON.parse(read('data/statuses.json')).list.map(s => `status_${s.id}`);
for (const n of statuses) names.add(n);
bad('코드가 부르는데 없는 아이콘', [...names].filter(n => !have.has(n)));

// 3) 예고 조합 표식은 그림이 있어야만 READY 에 오른다
const main = read('js/main.js');
const ready = [...(main.match(/const INTENT_COMBO_READY = new Set\(\[([\s\S]*?)\]\)/)?.[1] || '')
  .matchAll(/'([a-z0-9_]+)'/g)].map(m => m[1]);
bad('READY 에 올랐는데 그림이 없는 조합', ready.filter(n => !have.has(n)));

// 4) 유물 그림도 마찬가지 — READY 에 오른 것은 파일이 있어야 하고, 실재하는 유물이어야 한다
const relicFiles = existsSync(join(ROOT, 'assets/relics'))
  ? new Set(readdirSync(join(ROOT, 'assets/relics')).map(f => f.replace(/\.png$/, ''))) : new Set();
const relicIds = new Set(JSON.parse(read('data/relics.json')).map(r => r.id));
const relicReady = [...(main.match(/const RELIC_ART_READY = new Set\(\[([\s\S]*?)\]\)/)?.[1] || '')
  .matchAll(/'([a-z0-9_]+)'/g)].map(m => m[1]);
bad('READY 에 올랐는데 그림이 없는 유물', relicReady.filter(n => !relicFiles.has(n)));
bad('READY 에 올랐는데 데이터에 없는 유물', relicReady.filter(n => !relicIds.has(n)));

console.log(fails === 0 ? 'ALL ASSET PASS' : `ASSET FAILS: ${fails}`);
process.exit(fails === 0 ? 0 : 1);
