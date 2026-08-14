// runsmoke.mjs — 진짜 브라우저로 런 하나를 끝까지 돌며 화면을 훑는다 (v3.93)
//
//   왜 있나: 지금까지 화면 검증이 '전투 한 장면 스크린샷'뿐이었다. 그래서 체력바가 턴마다 튀거나,
//   봉인 이펙트가 턴 끝에 나오거나, 헤더 유물이 이모지로 남은 것들이 전부 테스트를 통과해 버렸다.
//   로직은 unit/balance 가 보고, 여기서는 **사람이 볼 화면**만 본다.
//
//   v3.93 봇 개선 — 예전 봇은 두 가지 이유로 전투 밖을 못 나갔다.
//     1) 연출이 재생되는 동안(busy) 눌러서 입력이 통째로 씹혔다. 이제 __dev.busy 가 풀릴 때까지 기다린다.
//     2) 화면 이름을 `/(\w+)-screen/` 로 뽑아서 상점·만남·전리품이 전부 'battle' 로 뭉개졌다.
//        전리품은 전투 프레임 위에 그려지고 상점은 event-screen 에 클래스가 덧붙는 구조라 그렇다.
//   보는 것: JS 에러 · 404 · 화면에 남은 이모지 · 화면 밖으로 나간 요소
//   쓰는 법: (서버를 8777 에 띄운 뒤) node test/runsmoke.mjs [노드수]
import pw from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const MAX_NODES = Number(process.argv[2] || 14);
const BUDGET_MS = Number(process.env.SMOKE_MS || 150000);
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
    const W = innerWidth;
    const roots = [...document.querySelectorAll('.screen:not(.hidden), .modal-back')];
    // v3.93: 예전엔 '자식 없는 요소'의 textContent 만 봤다. 그래서 <p>🔥<b>벼름</b></p> 처럼
    //   글자와 태그가 섞인 자리는 통째로 건너뛰었고, 설명문에 남은 이모지를 한 번도 못 잡았다.
    //   이제 글자 마디(text node)를 직접 훑는다.
    for (const root of roots) {
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        const t = (n.nodeValue || '').trim();
        if (!t || !re.test(t)) continue;
        const host = n.parentElement;
        if (!host) continue;
        const hr = host.getBoundingClientRect();
        if (hr.width === 0 || hr.height === 0) continue;       // 안 보이는 자리는 셈에서 뺀다
        out.emoji.push(`${host.className || host.tagName} :: ${t.slice(0, 22)}`);
      }
    }
    for (const root of roots) for (const el of root.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cn = (el.className || '') + '';
      if (/fx-sprite|slash|ring|float|veil|dying|spark/.test(cn)) continue;   // 연출은 일부러 밖으로 튄다
      if (r.right <= W + 2 && r.left >= -2) continue;
      // 잘라내는 상자 안이면 실제로는 안 삐져나온다 — NPC 아트처럼 일부러 꽉 채워 흔드는 것들
      let clipped = false;
      for (let p = el.parentElement; p && p !== root.parentElement; p = p.parentElement) {
        if (getComputedStyle(p).overflowX !== 'visible') { clipped = true; break; }
      }
      if (!clipped) out.overflow.push(cn || el.tagName);
    }
    return out;
  }, { E: EMOJI.source });
  for (const e of bad.emoji) seen.add(`${tag}: 이모지 "${e}"`);
  for (const o of [...new Set(bad.overflow)].slice(0, 3)) seen.add(`${tag}: 화면 밖 <${o}>`);
}

// 연출이 끝날 때까지 기다린다 — 이걸 안 하면 누른 게 전부 무시된다
async function idle(ms = 9000) {
  try { await pg.waitForFunction(() => !(window.__dev && window.__dev.busy), null, { timeout: ms, polling: 100 }); }
  catch { seen.add('연출이 안 끝남 (busy 고착)'); }
  await pg.waitForTimeout(120);
}
async function tapEl(el, wait = 260) {
  if (!el) return false;
  try { await el.scrollIntoViewIfNeeded({ timeout: 1500 }); } catch { /* 이미 보이거나 사라졌다 */ }
  const b = await el.boundingBox(); if (!b) return false;
  await pg.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await pg.mouse.down(); await pg.waitForTimeout(45); await pg.mouse.up();
  await pg.waitForTimeout(wait); return true;
}
const tap = async (sel, wait) => tapEl(await pg.$(sel), wait);

// 상점은 event-screen 에 클래스가 덧붙고, 전리품은 전투 프레임을 그대로 쓴다.
// 그래서 클래스 하나만 보고 이름을 뽑으면 전부 'battle'·'event' 로 뭉개진다.
const screenOf = () => pg.evaluate(() => {
  if (document.querySelector('#replace-modal')) return 'replace';
  if (document.querySelector('#loot-modal')) return 'lootpick';
  if (document.querySelector('.modal-back')) return 'modal';
  const s = document.querySelector('.screen:not(.hidden)');
  if (!s) return '?';
  const c = ' ' + s.className + ' ';
  for (const k of ['loot-mode', 'shop-screen', 'event-screen', 'rest-screen', 'map-screen', 'end-screen', 'card-battle', 'battle-screen', 'title-screen'])
    if (c.includes(k)) return k.replace(/-(mode|screen)$/, '');
  return '?';
});

await pg.goto('http://127.0.0.1:8777/index.html');
await pg.waitForTimeout(2200);
await tap('#start-btn') || await tap('.btn.primary');         // 새 판
await pg.waitForTimeout(500);
await tap('.weapon-choice') || await tap('.choice-row');      // 무기 고르기
await pg.waitForTimeout(500);

let node = 0, turns = 0, pick = 0, stuck = 0, ended = false, rerolled = 0;
const t0 = Date.now();
const visited = {};
let lastSig = '';

while (node < MAX_NODES && turns < 900 && Date.now() - t0 < BUDGET_MS) {
  turns++;
  const sc = await screenOf();
  visited[sc] = (visited[sc] || 0) + 1;
  if (turns % 4 === 1) await inspect(sc);

  // 같은 그림이 계속 반복되면 봇이 갇힌 것 — 몇 번 참았다가 아무거나 눌러 본다
  const sig = sc + '|' + node;
  if (sig === lastSig) stuck++; else { stuck = 0; lastSig = sig; }
  if (stuck > 40) { seen.add(`${sc} 화면에서 봇이 갇힘`); break; }

  if (sc === 'battle') {
    await idle();
    if (await tap('#roll-btn', 420)) { rerolled = 0; continue; }   // 아직 안 굴렸다

    // 지금 판에서 제일 센 줄과 그 예상 피해를 읽는다 — 아무 줄이나 찍으면 4번째 노드에서 죽는다
    const board = await pg.evaluate(() => {
      const rows = [...document.querySelectorAll('.sheet-zone .combo-row[data-locked="0"]')].map((el, i) => ({
        i, v: parseInt(((el.querySelector('.sheet-preview') || {}).textContent || '').replace(/[^0-9]/g, ''), 10) || 0,
      }));
      rows.sort((a, b) => b.v - a.v);
      const bt = window.__dev && window.__dev.battle;
      return { rows, best: rows[0] || null, faces: bt ? bt.dice.map(d => d.v) : [], rollsLeft: bt ? bt.rollsLeft : 0 };
    });
    if (!board.rows.length) {
      if (!(await tap('#reroll-btn', 500))) { seen.add('전투: 누를 수 있는 게 아무것도 없다'); await tap('.btn.primary'); }
      continue;
    }

    // 약한 판이면 제일 많이 나온 눈만 남기고 다시 굴린다 (한 턴에 두 번까지)
    if (board.best.v < 12 && board.rollsLeft > 0 && rerolled < 2) {
      const keep = await pg.evaluate(() => {
        const bt = window.__dev.battle;
        const cnt = {}; bt.dice.forEach(d => { cnt[d.v] = (cnt[d.v] || 0) + 1; });
        const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
        return bt.dice.map((d, i) => (String(d.v) === top[0] ? i : -1)).filter(i => i >= 0);
      });
      for (const i of keep) await tap(`.die[data-idx="${i}"]`, 90);
      if (await tap('#reroll-btn', 500)) { rerolled++; await idle(); continue; }
    }

    // 족보 확정 — 첫 탭이 선택, 둘째 탭이 확정. 잠긴 줄(data-locked=1)은 눌러도 무시된다.
    const rows = await pg.$$('.sheet-zone .combo-row[data-locked="0"]');
    const row = rows[board.best.i] || rows[pick++ % rows.length];
    await tapEl(row, 160);
    if (!(await pg.evaluate(() => !!(window.__dev && window.__dev.selected)))) continue;  // 선택이 안 잡혔다
    await tapEl(row, 160);
    rerolled = 0;
    await idle();
    continue;
  }

  if (sc === 'loot') {
    // 재화 → 그룹 → 나가기 순서. 그룹을 누르면 고르기 모달이 뜬다.
    const next = await pg.$('.loot-row[data-act="coins"]') || await pg.$('.loot-row[data-act="group"]');
    if (next) { await tapEl(next, 420); continue; }
    if (await tap('.loot-row[data-act="exit"]', 520)) { node++; }
    continue;
  }
  if (sc === 'lootpick') { await tap('#loot-modal .loot-choice', 480); continue; }
  if (sc === 'replace')  { await tap('#replace-modal .replace-btn', 480) || await tap('#replace-cancel', 420); continue; }

  if (sc === 'shop') {
    // 살 수 있는 게 있으면 하나 사고, 없으면 떠난다
    if (await tap('.shop-item:not(.used):not([disabled])', 480)) continue;
    if (await tap('#shop-leave', 520)) node++;
    continue;
  }
  if (sc === 'rest') {
    if (await tap('#rest-btn', 520)) continue;
    if (await tap('#rest-done', 520)) node++;
    continue;
  }
  if (sc === 'event') {
    if (await tap('#event-done', 520)) { node++; continue; }
    if (await tap('.choice-row:not(.used):not([disabled])', 520)) continue;
    await tap('.btn.primary', 500);
    continue;
  }
  if (sc === 'map') {
    const nodes = await pg.$$('.map-node2:not([disabled]):not(.done)');
    if (nodes.length) { await tapEl(nodes[nodes.length - 1], 620); node++; continue; }
    await tap('.btn.primary', 520);
    continue;
  }
  if (sc === 'end') {
    if (await tap('#next-act-btn', 700)) continue;             // 다음 막
    if (await tap('#final-btn', 700)) continue;
    ended = true;                                              // 죽었거나 클리어 — 여기서 멈춘다
    break;
  }
  if (sc === 'modal') { await tap('.modal .btn.primary', 400) || await tap('.modal .btn', 400); continue; }

  // 모르는 화면 — 눈에 띄는 버튼을 눌러 본다
  if (!(await tap('.btn.primary', 420))) if (!(await tap('.choice-row', 420))) await tap('.btn', 420);
}

await pg.screenshot({ path: '/tmp/runsmoke_last.png' });
await browser.close();

console.log('=== 런 스모크 ===');
console.log(`노드 ${node} · 조작 ${turns}회 · ${Math.round((Date.now() - t0) / 1000)}초${ended ? ' · 런 종료 화면까지' : ''}`);
console.log('들른 화면:', Object.entries(visited).map(([k, v]) => `${k} ${v}`).join(' · '));
const fails = [...seen];
console.log(`JS 에러 ${errs.length} · 404 ${new Set(missing).size} · 화면 문제 ${fails.length}`);
for (const e of [...new Set(errs)].slice(0, 6)) console.log('  ✗ ' + e);
for (const m of [...new Set(missing)].slice(0, 6)) console.log('  ✗ 404 ' + m);
for (const f of fails.slice(0, 12)) console.log('  ✗ ' + f);
// 전투만 도는 봇은 아무것도 검증하지 못한다 — 지도 밖 화면을 하나도 못 봤으면 실패로 친다
const reached = Object.keys(visited);
const outside = reached.filter(k => !['battle', 'map', '?'].includes(k));
if (outside.length === 0) console.log('  ✗ 전투·지도 밖 화면(전리품/상점/쉼터/만남)에 한 번도 못 갔다');
const ok = errs.length === 0 && missing.length === 0 && fails.length === 0 && outside.length > 0;
console.log(ok ? 'ALL RUN SMOKE PASS' : 'RUN SMOKE FAILS');
process.exit(ok ? 0 : 1);
