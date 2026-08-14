// runsmoke.mjs — 진짜 브라우저로 런 하나를 끝까지 돌며 화면을 훑는다 (v3.91)
//
//   왜 있나: 지금까지 화면 검증이 '전투 한 장면 스크린샷'뿐이었다. 그래서 체력바가 턴마다 튀거나,
//   봉인 이펙트가 턴 끝에 나오거나, 헤더 유물이 이모지로 남은 것들이 전부 테스트를 통과해 버렸다.
//   로직은 unit/balance 가 보고, 여기서는 **사람이 볼 화면**만 본다.
//
//   보는 것: JS 에러 · 404 · 화면에 남은 이모지 · 화면 밖으로 나간 요소 · 겹친 하단 UI
//   쓰는 법: (서버를 8777 에 띄운 뒤) node test/runsmoke.mjs [노드수]
import pw from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const MAX_NODES = Number(process.argv[2] || 14);
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]\u{FE0F}?/u;

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
// 서비스워커를 막는다 — 안 막으면 캐시된 옛 데이터를 보고 방금 고친 것이 안 잡힌다
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
const pg = await ctx.newPage();
const errs = [], missing = [];
pg.on('pageerror', e => errs.push(String(e).slice(0, 160)));
pg.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push('console: ' + m.text().slice(0, 120)); });
pg.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) missing.push(r.url().split('/').slice(-2).join('/')); });

const seen = new Set();
async function inspect(tag) {
  const bad = await pg.evaluate(({ E }) => {
    const out = { emoji: [], overflow: [] };
    const re = new RegExp(E, 'u');
    const W = innerWidth, H = innerHeight;
    for (const el of document.querySelectorAll('.screen:not(.hidden) *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (!el.children.length) {
        const t = (el.textContent || '').trim();
        if (t && re.test(t)) out.emoji.push(t.slice(0, 24));
      }
      const cn = (el.className || '') + '';
      if (/fx-sprite|slash|ring|float|veil|dying|spark/.test(cn)) continue;   // 연출은 일부러 밖으로 튄다
      if (r.right > W + 2 || r.left < -2) out.overflow.push(cn || el.tagName);
    }
    return out;
  }, { E: EMOJI.source });
  for (const e of bad.emoji) seen.add(`${tag}: 이모지 "${e}"`);
  for (const o of [...new Set(bad.overflow)].slice(0, 3)) seen.add(`${tag}: 화면 밖 <${o}>`);
}
const tap = async (sel) => {
  const el = await pg.$(sel); if (!el) return false;
  const b = await el.boundingBox(); if (!b) return false;
  await pg.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await pg.mouse.down(); await pg.waitForTimeout(50); await pg.mouse.up();
  await pg.waitForTimeout(320); return true;
};
const screenOf = () => pg.evaluate(() => {
  const s = document.querySelector('.screen:not(.hidden)');
  return s ? (s.className.match(/(\w+)-screen/) || [,'?'])[1] : '?';
});

await pg.goto('http://127.0.0.1:8777/index.html');
await pg.waitForTimeout(2500);
await tap('#btn-new') || await tap('.btn.primary');           // 새 판
await pg.waitForTimeout(600);
await tap('.weapon-card') || await tap('.choice-row');        // 무기 고르기
await pg.waitForTimeout(600);

let node = 0, turns = 0;
const t0 = Date.now();
const visited = {};
while (node < MAX_NODES && turns < 300 && Date.now() - t0 < 70000) {
  turns++;
  const sc = await screenOf();
  visited[sc] = (visited[sc] || 0) + 1;
  if (turns % 3 === 1) await inspect(sc);
  if (sc === 'battle') {
    // 굴리고 → 바로 족보를 확정한다 (리롤을 다 태우면 한 전투에 수십 턴이 걸린다)
    if (!(await tap('#roll-btn'))) {
      const rows = await pg.$$('.sheet-row.combo-row:not(.used):not([disabled])');
      let done = false;
      for (const row of rows.slice(0, 3)) {
        const b = await row.boundingBox(); if (!b) continue;
        for (let i = 0; i < 2; i++) { await pg.mouse.move(b.x+b.width/2, b.y+b.height/2); await pg.mouse.down(); await pg.mouse.up(); await pg.waitForTimeout(380); }
        if (await pg.$('#roll-btn')) { done = true; break; }
      }
      if (!done) { if (!(await tap('#reroll-btn'))) await tap('.btn.primary'); }
    }
  } else if (sc === 'map') {
    const before = node;
    const nodes = await pg.$$('.map-node2:not([disabled]):not(.done)');
    if (nodes.length) { const b = await nodes[nodes.length-1].boundingBox();
      if (b) { await pg.mouse.move(b.x+b.width/2,b.y+b.height/2); await pg.mouse.down(); await pg.mouse.up(); await pg.waitForTimeout(500); node++; } }
    if (node === before) await tap('.btn.primary');
  } else {
    // 보상·상점·쉼터·만남·전리품 — 주요 버튼을 누른다
    if (!(await tap('.btn.primary'))) if (!(await tap('.choice-row'))) await tap('.btn');
  }
}
await pg.screenshot({ path: '/tmp/runsmoke_last.png' });
await browser.close();

console.log('=== 런 스모크 ===');
console.log('들른 화면:', Object.entries(visited).map(([k,v]) => `${k} ${v}`).join(' · '));
const fails = [...seen];
console.log(`JS 에러 ${errs.length} · 404 ${new Set(missing).size} · 화면 문제 ${fails.length}`);
for (const e of [...new Set(errs)].slice(0, 5)) console.log('  ✗ ' + e);
for (const m of [...new Set(missing)].slice(0, 5)) console.log('  ✗ 404 ' + m);
for (const f of fails.slice(0, 10)) console.log('  ✗ ' + f);
const ok = errs.length === 0 && missing.length === 0 && fails.length === 0;
console.log(ok ? 'ALL RUN SMOKE PASS' : 'RUN SMOKE FAILS');
process.exit(ok ? 0 : 1);
