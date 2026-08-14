// chipcheck.mjs — 나에게 걸리는 것이 전부 체력바 아래 표식으로 서는지 본다 (v4.2)
//
//   왜 있나: 상태이상이 계속 늘고 자리를 옮긴다. 새로 넣은 것이 화면에 안 서 있어도
//   조용하다 — 에러도 안 나고 테스트도 안 깨진다. 걸린 줄 모르는 채로 판이 진행될 뿐이다.
//   그래서 걸릴 수 있는 것을 하나씩 켜 보고 표식이 실제로 늘어나는지 센다.
//   (서버를 8777 에 띄운 뒤) node test/chipcheck.mjs
import pw from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await br.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, serviceWorkers:'block' });
const pg = await ctx.newPage();
const errs=[]; pg.on('pageerror',e=>errs.push(String(e).slice(0,160)));
await pg.goto('http://127.0.0.1:8777/index.html'); await pg.waitForTimeout(2200);
await pg.evaluate(()=>window.__dev.fight('battle')); await pg.waitForTimeout(600);

// 걸릴 수 있는 것을 하나씩만 켜고, 체력바 아래에 표식이 하나 늘어나는지 본다
const cases = await pg.evaluate(() => {
  const D = window.__dev, out = [];
  const strip = () => document.querySelectorAll('.buff-strip .tg').length;
  const reset = () => { const b = D.battle;
    b.buffs = { strength:0, focus:0, regen:0, ironclad:0, thorns:0, fortune:0, enrage:0 };
    b.whet = 0; b.player.dot = 0; b.sealed = {}; b.relicSealed = {}; b.mods = {};
    b.pendingConfuse = 0; b.voidLocked = false;
    b.dice.forEach(d => { d.st = null; d.confused = false; });
    D.redraw(); };
  const test = (label, fn) => { reset(); const before = strip(); fn(D.battle); D.redraw();
    out.push([label, strip() - before]); };

  for (const k of ['strength','focus','regen','ironclad','thorns','fortune','enrage'])
    test(`버프 ${k}`, b => { b.buffs[k] = 2; });
  test('벼름', b => { b.whet = 2; });
  test('중독(본체)', b => { b.player.dot = 3; });
  for (const s of D.DB.statuses.list)
    test(`주사위 ${s.name}`, b => { b.dice[0].st = { kind:s.id, power:s.amount||0, left:s.turns||1, fuse:s.rule==='fuse'?2:0, opened:false, fresh:false }; });
  test('족보 봉인(적)', b => { b.sealed = { onePair: 2 }; });
  test('족보 봉인(유물)', b => { b.relicSealed = { chance: 1 }; });
  for (const k of ['rollTax','holdTax','blind'])
    test(`지속 방해 ${k}`, b => { b.mods[k] = { amount:2, per:0.5, left:2, name:'시험' }; });
  test('예약된 혼란(pendingConfuse)', b => { b.pendingConfuse = 2; });
  reset();
  return out;
});
const miss = cases.filter(([,n]) => n < 1);
console.log(`검사 ${cases.length}가지 — 체력바 아래에 안 뜨는 것 ${miss.length}개`);
for (const [k,n] of cases) console.log(`  ${n>0?'✅':'❌'} ${k}`);
console.log('errs', errs.slice(0,3));
await br.close();
if (errs.length) { console.log('JS 에러가 있다'); process.exit(1); }
console.log(miss.length ? 'CHIP FAILS' : 'ALL CHIP PASS');
process.exit(miss.length ? 1 : 0);
