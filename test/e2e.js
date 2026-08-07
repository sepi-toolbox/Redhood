// e2e.js — v0.5 자동 플레이 검증 (굴림 버튼·타겟팅·연출 대응)
const { chromium } = require('playwright');
const fs = require('fs');
const SHOT = '/tmp/shots3';
fs.mkdirSync(SHOT, { recursive: true });

async function settle(page) {
  // 연출(busy) 종료 대기: 굴림/베기 연출 최대치보다 넉넉히
  await page.waitForTimeout(3800);
}

// v0.10: 시작 시 무기 선택 인트로 통과
async function passIntro(page) {
  await page.waitForSelector('.weapon-choice', { timeout: 8000 });
  await page.locator('.weapon-choice').first().click();
  await page.waitForSelector('#event-done');
  await page.locator('#event-done').click();
  await page.waitForSelector('.map-screen');
}

async function playTurn(page) {
  // 1) 굴림 버튼이 있으면 굴린다
  const rollBtn = page.locator('#roll-btn');
  if (await rollBtn.count()) {
    await rollBtn.click();
    await settle(page);
  }
  // 2) 가끔 리롤 — 다시 굴릴 주사위를 먼저 마킹 (v0.6 조작)
  if (Math.random() < 0.35) {
    await page.locator('.die').first().click({ force: true });
    await page.waitForTimeout(60);
    const rerollBtn = page.locator('#reroll-btn:not([disabled])');
    if (await rerollBtn.count()) { await rerollBtn.click(); await settle(page); }
    else { await page.locator('.die').first().click({ force: true }); await page.waitForTimeout(60); }
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
    serviceWorkers: 'block', // v0.63: SW 자동 갱신 리로드가 테스트 중간에 페이지를 되돌리는 것을 막는다
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
  await passIntro(page);
  await page.locator('.map-node2.reachable').first().click({ force: true });
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
  const facesShown = await page.locator('.die:not(.blank) img.pip-art').evaluateAll(els => els.map(e => e.alt));
  console.log(`after roll faces: [${facesShown.join(' ')}]`);
  await page.screenshot({ path: `${SHOT}/03-rolled.png` });

  // ---------- 풀런 자동 플레이 ----------
  let guard = 0, ended = null, sawMulti = false, sawSlash = false;
  while (guard++ < 700) {
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
    // v0.65: 전리품 목록 — 재화 → 묶음(모달에서 하나 선택) → 나가기
    if (await page.locator('.loot-overlay').count()) {
      const coin = page.locator('.loot-row[data-act="coins"]');
      if (await coin.count()) { await coin.click(); await page.waitForTimeout(120); continue; }
      const group = page.locator('.loot-row[data-act="group"]');
      if (await group.count()) {
        await group.first().click(); await page.waitForTimeout(200);
        const pick = page.locator('.loot-choice');
        if (await pick.count()) {
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
    if (await page.locator('.battle-screen:not(.event-screen)').count()) {
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
    if (await page.locator('.rest-screen').count()) {
      await page.locator('.rest-screen .btn').first().click(); await page.waitForTimeout(80); continue;
    }
    if (await page.locator('.end-screen').count()) {
      // 막 전환·최종전 진입 화면은 계속 진행
      if (await page.locator('#next-act-btn').count()) { await page.locator('#next-act-btn').click(); await page.waitForTimeout(150); continue; }
      if (await page.locator('#final-btn').count()) { await page.locator('#final-btn').click(); await page.waitForTimeout(150); continue; }
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
    await passIntro(page);
    await page.locator('.map-node2.reachable').first().click({ force: true });
    await page.waitForSelector('.battle-screen');
    if (await page.locator('.enemy').count() < 2) continue;
    // 기본 표적 = 맨 왼쪽 확인
    const defaultTarget = await page.locator('.enemy').first().getAttribute('class');
    console.log('default target is leftmost:', defaultTarget.includes('targeted') ? 'YES' : 'NO');
    await page.locator('#roll-btn').click(); await settle(page);
    // 두 번째 적 탭 → 표적 이동 확인 → 찬스 확정 → 그 적이 맞았는지
    const second = page.locator('.enemy').nth(1);
    await second.click(); await page.waitForTimeout(80);
    const secondTargeted = (await page.locator('.enemy').nth(1).getAttribute('class')).includes('targeted');
    console.log('tap switches target:', secondTargeted ? 'YES' : 'NO');
    const hpBefore = await page.locator('.enemy').nth(1).locator('.enemy-hp').innerText();
    const chance = page.locator('.sheet-row').filter({ hasText: '찬스' }).first();
    await chance.click(); await page.waitForTimeout(60);
    const sel2 = page.locator('.sheet-row.selected');
    if (await sel2.count()) await sel2.click();
    await page.waitForTimeout(300);
    const slashOnSecond = await page.locator('.enemy').nth(1).locator('.slash').count().catch(() => 0);
    console.log(`targeting: second hp before="${hpBefore.trim()}", slash on target: ${slashOnSecond ? 'YES' : 'n/a'}`);
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
