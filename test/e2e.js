// e2e.js — 주사위판 자동 플레이 검증 (node test/e2e.js) · 서버: python3 -m http.server 8777
const { chromium } = require('playwright');
const fs = require('fs');
const SHOT = '/tmp/shots2';
fs.mkdirSync(SHOT, { recursive: true });

async function bestCategoryPlay(page) {
  // 미사용 족보 중 미리보기 피해 최대를 두 번 탭해 확정
  const rows = page.locator('.sheet-row:not(.used)');
  const n = await rows.count();
  if (n === 0) return false;
  let bestIdx = 0, bestVal = -1;
  for (let i = 0; i < n; i++) {
    const t = await rows.nth(i).locator('.sheet-preview').innerText();
    const v = parseInt(t, 10) || 0;
    if (v > bestVal) { bestVal = v; bestIdx = i; }
  }
  await rows.nth(bestIdx).click();
  await page.waitForTimeout(30);
  const sel = page.locator('.sheet-row.selected');
  if (await sel.count()) await sel.click();
  await page.waitForTimeout(40);
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
  await page.screenshot({ path: `${SHOT}/01-title.png` });

  await page.locator('#start-btn').click();
  await page.waitForSelector('.map-screen');
  await page.screenshot({ path: `${SHOT}/02-map.png` });

  let guard = 0, battles = 0, rewards = 0;
  let shotBattle = false, shotReward = false, ended = null;
  while (guard++ < 600) {
    if (await page.locator('.map-screen').count()) {
      const nodes = page.locator('.map-row.next .map-node');
      if (await nodes.count() === 0) break;
      await nodes.first().click(); await page.waitForTimeout(60); continue;
    }
    if (await page.locator('.battle-screen').count()) {
      if (!shotBattle) { await page.screenshot({ path: `${SHOT}/03-battle.png` }); shotBattle = true; battles++; }
      // 리롤 1회 정도 섞기 (있으면), 이후 최고 족보 확정
      const rerollBtn = page.locator('#reroll-btn:not([disabled])');
      if (await rerollBtn.count() && Math.random() < 0.4) {
        await rerollBtn.click(); await page.waitForTimeout(30);
      }
      if (!await bestCategoryPlay(page)) { errors.push('no playable category'); break; }
      continue;
    }
    if (await page.locator('.reward-screen').count()) {
      if (!shotReward) { await page.screenshot({ path: `${SHOT}/04-reward.png` }); shotReward = true; }
      rewards++;
      const cards = page.locator('.reward-cards .card');
      if (await cards.count() > 0) {
        await cards.first().click(); await page.waitForTimeout(60);
        // 주사위였다면 교체 모달 → 첫 슬롯과 교체
        const rep = page.locator('.replace-btn');
        if (await rep.count()) { await rep.first().click(); await page.waitForTimeout(60); }
      } else {
        await page.locator('#skip-btn').click();
      }
      continue;
    }
    if (await page.locator('.rest-screen').count()) {
      await page.locator('.rest-screen .btn').first().click(); await page.waitForTimeout(60); continue;
    }
    if (await page.locator('.end-screen').count()) {
      await page.screenshot({ path: `${SHOT}/05-end.png` });
      ended = await page.locator('.end-screen h2').innerText();
      break;
    }
    await page.waitForTimeout(80);
  }
  console.log(`run ended: ${ended || '(guard limit)'} | battles≥${battles}, rewards: ${rewards}, guard: ${guard}`);

  // 홀드/리롤 동작 확인
  await page.locator('.end-screen .btn').first().click().catch(() => {});
  await page.waitForSelector('#start-btn');
  await page.locator('#start-btn').click();
  await page.waitForSelector('.map-screen');
  await page.locator('.map-row.next .map-node').first().click();
  await page.waitForSelector('.battle-screen');
  const facesBefore = await page.locator('.die .pip').allInnerTexts();
  await page.locator('.die').first().click(); // 0번 홀드
  await page.waitForTimeout(30);
  const heldCount = await page.locator('.die.held').count();
  await page.locator('#reroll-btn').click();
  await page.waitForTimeout(40);
  const facesAfter = await page.locator('.die .pip').allInnerTexts();
  console.log(`hold works: ${heldCount === 1 ? 'YES' : 'NO'} | held die kept: ${facesBefore[0] === facesAfter[0] ? 'YES' : 'NO'}`);
  const rerollLabel = await page.locator('#reroll-btn').innerText();
  console.log(`reroll counter: "${rerollLabel.trim()}"`);
  await page.screenshot({ path: `${SHOT}/06-hold.png` });

  // 세이브 이어하기
  await page.reload();
  await page.waitForSelector('.title-screen');
  const hasContinue = await page.locator('#continue-btn').count();
  console.log('continue after reload:', hasContinue ? 'YES' : 'NO');

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console/page errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });
