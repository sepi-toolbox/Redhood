// e2e.js — v2.0 카드 전투 자동 플레이 검증 (배정·카드·전리품·런 순회)
const { chromium } = require('playwright');
const fs = require('fs');
const SHOT = '/tmp/shots3';
fs.mkdirSync(SHOT, { recursive: true });

// v0.10: 시작 시 무기 선택 인트로 통과
async function passIntro(page) {
  await page.waitForSelector('.weapon-choice', { timeout: 8000 });
  await page.locator('.weapon-choice').first().click();
  await page.waitForSelector('#event-done');
  await page.locator('#event-done').click();
  await page.waitForSelector('.map-screen');
}

// 카드 전투 한 턴: 대결 두어 번 → (가끔) 카드 발동 → 턴 종료
async function playCardTurn(page) {
  for (let k = 0; k < 2; k++) {
    const my = page.locator('.cdie:not(.dead)').first();
    const foe = page.locator('.fdie:not(.dead)').first();
    if (await my.count() && await foe.count()) {
      await my.click({ force: true });
      await page.waitForTimeout(70);
      await foe.click({ force: true }).catch(() => {});
      await page.waitForTimeout(120);
    } else break;
  }
  const end = page.locator('#cb-end');
  if (!await end.count()) return false;
  await end.click({ force: true });
  await page.waitForTimeout(3400); // 공격·반격 연출
  return true;
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const errors = [];
  const page = await (await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
    serviceWorkers: 'block',
  })).newPage();
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto('http://localhost:8777/index.html');
  await page.waitForSelector('#start-btn', { timeout: 8000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('#start-btn');

  // ---------- 첫 전투: 화면 요소 확인 ----------
  await page.locator('#start-btn').click();
  await passIntro(page);
  await page.locator('.map-node2.reachable').first().click({ force: true });
  await page.waitForSelector('.card-battle');
  const myDice = await page.locator('.cdie').count();
  const foeDice = await page.locator('.fdie').count();
  const cards = await page.locator('.cb-card').count();
  const gaugeText = await page.locator('.cb-hud .hp-text').innerText();
  console.log(`battle start: my dice=${myDice}/5, foe dice=${foeDice}, hand=${cards}/5, hp="${gaugeText.trim()}"`);
  await page.screenshot({ path: `${SHOT}/01-battle.png` });

  // 대결 한 번: 값이 실제로 깎이는지
  const foeValBefore = await page.locator('.fdie:not(.dead)').first().innerText();
  await page.locator('.cdie:not(.dead)').first().click({ force: true });
  await page.waitForTimeout(80);
  await page.locator('.fdie:not(.dead)').first().click({ force: true });
  await page.waitForTimeout(200);
  const foeCntAfter = await page.locator('.fdie:not(.dead)').count();
  console.log(`clash: foe die "${foeValBefore}" → alive foe dice now ${foeCntAfter}/${foeDice}`);
  await page.screenshot({ path: `${SHOT}/02-clash.png` });

  // ---------- 풀런 자동 플레이 ----------
  let guard = 0, ended = null, sawMulti = false, sawLoot = false, sawCardReward = false;
  while (guard++ < 900) {
    if (await page.locator('.map-screen').count()) {
      const nodes = page.locator('.map-node2.reachable');
      if (await nodes.count() === 0) break;
      await nodes.first().click({ force: true }); await page.waitForTimeout(80); continue;
    }
    if (await page.locator('.shop-screen').count()) {
      await page.locator('#shop-leave').click();
      await page.waitForTimeout(150);
      continue;
    }
    if (await page.locator('.event-screen').count()) {
      const done = page.locator('#event-done');
      if (await done.count()) { await done.click(); }
      else {
        const ch = page.locator('.choice-row');
        if (await ch.count()) await ch.first().click();
      }
      await page.waitForTimeout(180);
      const rep = page.locator('.replace-btn');
      if (await rep.count()) { await rep.first().click(); await page.waitForTimeout(120); }
      continue;
    }
    // 전리품: 재화 → 묶음(모달에서 하나) → 나가기
    if (await page.locator('.loot-list').count()) {
      sawLoot = true;
      const coin = page.locator('.loot-row[data-act="coins"]');
      if (await coin.count()) { await coin.click(); await page.waitForTimeout(120); continue; }
      const group = page.locator('.loot-row[data-act="group"]');
      if (await group.count()) {
        await group.first().click(); await page.waitForTimeout(200);
        const pick = page.locator('.loot-choice');
        if (await pick.count()) {
          const label = await pick.first().innerText().catch(() => '');
          if (label.includes('자원')) sawCardReward = true;
          await pick.first().click(); await page.waitForTimeout(150);
          const rep = page.locator('#replace-modal .replace-btn');
          if (await rep.count()) { await rep.first().click(); await page.waitForTimeout(150); }
        } else await page.locator('#loot-modal-close').click();
        continue;
      }
      await page.locator('.loot-row[data-act="exit"]').click();
      await page.waitForTimeout(120);
      continue;
    }
    if (await page.locator('.card-battle').count()) {
      const enemyN = await page.locator('.enemy').count();
      if (enemyN > 1 && !sawMulti) {
        sawMulti = true;
        console.log(`multi-enemy battle: ${enemyN} enemies`);
        await page.screenshot({ path: `${SHOT}/03-multi.png` });
      }
      if (!await playCardTurn(page)) { await page.waitForTimeout(250); }
      continue;
    }
    if (await page.locator('.rest-screen').count()) {
      await page.locator('.rest-screen .btn').first().click(); await page.waitForTimeout(80); continue;
    }
    if (await page.locator('.end-screen').count()) {
      if (await page.locator('#next-act-btn').count()) { await page.locator('#next-act-btn').click(); await page.waitForTimeout(150); continue; }
      if (await page.locator('#final-btn').count()) { await page.locator('#final-btn').click(); await page.waitForTimeout(150); continue; }
      ended = await page.locator('.end-screen h2').innerText();
      await page.screenshot({ path: `${SHOT}/05-end.png` });
      break;
    }
    await page.waitForTimeout(120);
  }
  console.log(`run ended: ${ended || '(guard limit ' + guard + ')'} | multi:${sawMulti ? 'Y' : 'N'} loot:${sawLoot ? 'Y' : 'N'} cardReward:${sawCardReward ? 'Y' : 'N'}`);

  // ---------- 표적 전환 확인 (다중 적 조우를 찾을 때까지 새 런) ----------
  let targetChecked = false;
  for (let attempt = 0; attempt < 6 && !targetChecked; attempt++) {
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:8777/index.html');
    await page.waitForSelector('#start-btn');
    await page.locator('#start-btn').click();
    await passIntro(page);
    await page.locator('.map-node2.reachable').first().click({ force: true });
    await page.waitForSelector('.card-battle');
    if (await page.locator('.enemy').count() < 2) continue;
    const firstTargeted = (await page.locator('.enemy').first().getAttribute('class')).includes('targeted');
    console.log('default target is leftmost:', firstTargeted ? 'YES' : 'NO');
    await page.locator('.enemy').nth(1).click({ force: true, position: { x: 20, y: 100 } });
    await page.waitForTimeout(120);
    const secondTargeted = (await page.locator('.enemy').nth(1).getAttribute('class')).includes('targeted');
    console.log('tap switches target:', secondTargeted ? 'YES' : 'NO');
    await page.screenshot({ path: `${SHOT}/06-targeting.png` });
    targetChecked = true;
  }
  if (!targetChecked) console.log('targeting: no multi-enemy first battle in attempts (확률상 미조우)');

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console/page errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });
