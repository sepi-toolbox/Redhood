// e2e.js — v0.5 자동 플레이 검증 (굴림 버튼·타겟팅·연출 대응)
const { chromium } = require('playwright');
const fs = require('fs');
const SHOT = '/tmp/shots3';
fs.mkdirSync(SHOT, { recursive: true });

async function settle(page) {
  // 연출(busy) 종료 대기: 굴림/베기 연출 최대치보다 넉넉히
  await page.waitForTimeout(1800);
}

async function playTurn(page) {
  // 1) 굴림 버튼이 있으면 굴린다
  const rollBtn = page.locator('#roll-btn');
  if (await rollBtn.count()) {
    await rollBtn.click();
    await settle(page);
  }
  // 2) 가끔 리롤
  const rerollBtn = page.locator('#reroll-btn:not([disabled])');
  if (await rerollBtn.count() && Math.random() < 0.35) {
    await rerollBtn.click();
    await settle(page);
  }
  // 3) 최고 피해 족보 확정 (선택 → 재탭)
  const rows = page.locator('.sheet-row[data-locked="0"]');
  const n = await rows.count();
  if (n === 0) return false;
  let bestIdx = 0, bestVal = -1;
  for (let i = 0; i < n; i++) {
    const t = await rows.nth(i).locator('.sheet-preview').innerText();
    const v = parseInt(t, 10) || 0;
    if (v > bestVal) { bestVal = v; bestIdx = i; }
  }
  await rows.nth(bestIdx).click();
  await page.waitForTimeout(60);
  const sel = page.locator('.sheet-row.selected');
  if (await sel.count()) await sel.click();
  await settle(page);
  return true;
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const errors = [];
  const page = await (await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
  })).newPage();
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto('http://localhost:8777/index.html');
  await page.waitForSelector('#start-btn', { timeout: 8000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('#start-btn');

  // ---------- 굴림 연출·게이지 확인 ----------
  await page.locator('#start-btn').click();
  await page.waitForSelector('.map-screen');
  await page.locator('.map-row.next .map-node').first().click();
  await page.waitForSelector('.battle-screen');
  const blankCount = await page.locator('.die.blank').count();
  const gaugeText = await page.locator('.hp-text').innerText();
  console.log(`turn start: blank dice=${blankCount}/5, hp gauge="${gaugeText.trim()}"`);
  await page.screenshot({ path: `${SHOT}/01-preroll.png` });
  await page.locator('#roll-btn').click();
  await page.waitForTimeout(500); // 연출 중간
  const spinning = await page.locator('.die.spinning, .die.landed').count();
  console.log(`rolling animation active on ${spinning} dice`);
  await page.screenshot({ path: `${SHOT}/02-rolling.png` });
  await settle(page);
  const facesShown = await page.locator('.die:not(.blank) .pip').allInnerTexts();
  console.log(`after roll faces: [${facesShown.join(' ')}]`);
  await page.screenshot({ path: `${SHOT}/03-rolled.png` });

  // ---------- 풀런 자동 플레이 ----------
  let guard = 0, ended = null, sawMulti = false, sawSlash = false;
  while (guard++ < 250) {
    if (await page.locator('.map-screen').count()) {
      const nodes = page.locator('.map-row.next .map-node');
      if (await nodes.count() === 0) break;
      await nodes.first().click(); await page.waitForTimeout(80); continue;
    }
    if (await page.locator('.battle-screen').count()) {
      const enemyN = await page.locator('.enemy').count();
      if (enemyN > 1 && !sawMulti) {
        sawMulti = true;
        console.log(`multi-enemy battle found: ${enemyN} enemies`);
        await page.screenshot({ path: `${SHOT}/04-multi.png` });
      }
      if (!await playTurn(page)) { await page.waitForTimeout(200); }
      if (!sawSlash && await page.locator('.slash, .dmg-float').count()) sawSlash = true;
      continue;
    }
    if (await page.locator('.reward-screen').count()) {
      const chest = page.locator('#chest');
      if (await chest.count()) { await chest.click(); await page.waitForTimeout(700); }
      const cards = page.locator('.reward-cards .card');
      if (await cards.count() > 0) {
        await cards.first().click(); await page.waitForTimeout(80);
        const rep = page.locator('.replace-btn');
        if (await rep.count()) { await rep.first().click(); await page.waitForTimeout(80); }
      } else await page.locator('#skip-btn').click();
      continue;
    }
    if (await page.locator('.rest-screen').count()) {
      await page.locator('.rest-screen .btn').first().click(); await page.waitForTimeout(80); continue;
    }
    if (await page.locator('.end-screen').count()) {
      ended = await page.locator('.end-screen h2').innerText();
      await page.screenshot({ path: `${SHOT}/05-end.png` });
      break;
    }
    await page.waitForTimeout(120);
  }
  console.log(`run ended: ${ended || '(guard limit ' + guard + ')'}  | multi-enemy seen: ${sawMulti ? 'YES' : 'NO'}`);

  // ---------- 타겟팅 확인 (다중 적 조우를 찾을 때까지 새 런) ----------
  let targetChecked = false;
  for (let attempt = 0; attempt < 6 && !targetChecked; attempt++) {
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:8777/index.html');
    await page.waitForSelector('#start-btn');
    await page.locator('#start-btn').click();
    await page.waitForSelector('.map-screen');
    await page.locator('.map-row.next .map-node').first().click();
    await page.waitForSelector('.battle-screen');
    if (await page.locator('.enemy').count() < 2) continue;
    await page.locator('#roll-btn').click(); await settle(page);
    // 단일 공격 족보(찬스) 선택 → 두 번째 적 탭 → 그 적이 맞았는지
    const chance = page.locator('.sheet-row').filter({ hasText: '찬스' }).first();
    await chance.click(); await page.waitForTimeout(80);
    const targetable = await page.locator('.enemy.targetable').count();
    const second = page.locator('.enemy').nth(1);
    const hpBefore = await second.locator('.enemy-hp').innerText();
    await second.click();
    await page.waitForTimeout(300);
    const slashOnSecond = await second.locator('.slash').count().catch(() => 0);
    console.log(`targeting: targetable=${targetable}, second enemy hp before="${hpBefore.trim()}", slash on it: ${slashOnSecond ? 'YES' : 'n/a'}`);
    await page.screenshot({ path: `${SHOT}/06-targeting.png` });
    targetChecked = true;
    await settle(page);
  }
  if (!targetChecked) console.log('targeting: no multi-enemy first battle in attempts (확률상 미조우)');

  console.log(`slash effect observed during run: ${sawSlash ? 'YES' : 'NO'}`);
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console/page errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });
