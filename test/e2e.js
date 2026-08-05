// e2e.js — 프로토타입 자동 플레이 검증 (저장소 커밋 대상 아님이어도 무방)
const { chromium } = require('playwright');

const BASE = 'http://localhost:8777/index.html';
const SHOT = '/tmp/shots';
const fs = require('fs');
fs.mkdirSync(SHOT, { recursive: true });

async function run() {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const errors = [];
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true, hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  // ---------- 1) 타이틀 ----------
  await page.goto(BASE);
  await page.waitForSelector('.weapon-card', { timeout: 8000 });
  await page.screenshot({ path: `${SHOT}/01-title.png` });
  const weaponCount = await page.locator('.weapon-card').count();
  console.log('weapons on title:', weaponCount);

  // ---------- 2) 총으로 런 시작 → 맵 ----------
  await page.locator('.weapon-card[data-weapon="gun"]').click();
  await page.waitForSelector('.map-screen');
  await page.screenshot({ path: `${SHOT}/02-map.png` });

  // ---------- 3) 전투 자동 플레이 루프 (런 종료까지) ----------
  let battles = 0, guard = 0;
  let firstBattleShot = false, rewardShot = false;
  while (guard++ < 400) {
    if (await page.locator('.map-screen').count()) {
      const nodes = page.locator('.map-row.next .map-node');
      if (await nodes.count() === 0) break;
      await nodes.first().click();
      await page.waitForTimeout(60);
      continue;
    }
    if (await page.locator('.battle-screen').count()) {
      if (!firstBattleShot) { await page.screenshot({ path: `${SHOT}/03-battle-gun.png` }); firstBattleShot = true; battles++; }
      // 낼 수 있는 카드를 낸다 (더블 탭). 없으면 턴 종료.
      const playable = page.locator('.hand-zone .card:not(.unplayable)');
      if (await playable.count() > 0) {
        await playable.first().click();
        await page.waitForTimeout(40);
        const sel = page.locator('.hand-zone .card.selected');
        if (await sel.count() > 0) await sel.first().click();
      } else {
        await page.locator('#end-turn').click();
      }
      await page.waitForTimeout(40);
      continue;
    }
    if (await page.locator('.reward-screen').count()) {
      if (!rewardShot) { await page.screenshot({ path: `${SHOT}/04-reward.png` }); rewardShot = true; }
      const cards = page.locator('.reward-cards .card');
      if (await cards.count() > 0) await cards.first().click();
      else await page.locator('#skip-btn').click();
      await page.waitForTimeout(60);
      battles++;
      continue;
    }
    if (await page.locator('.rest-screen').count()) {
      const btn = page.locator('.rest-screen .btn');
      await btn.first().click();
      await page.waitForTimeout(60);
      continue;
    }
    if (await page.locator('.end-screen').count()) {
      await page.screenshot({ path: `${SHOT}/05-end.png` });
      const endText = await page.locator('.end-screen h2').innerText();
      console.log('run ended:', endText, '| battles fought:', battles);
      break;
    }
    await page.waitForTimeout(80);
  }
  if (guard >= 400) console.log('WARN: guard limit reached');

  // ---------- 4) 낫 열광 확인 ----------
  await page.locator('.end-screen .btn, #restart-btn').first().click().catch(() => {});
  await page.waitForSelector('.weapon-card');
  await page.locator('.weapon-card[data-weapon="scythe"]').click();
  await page.waitForSelector('.map-screen');
  await page.locator('.map-row.next .map-node').first().click();
  await page.waitForSelector('.battle-screen');
  // 공격 카드만 연속 사용해 열광 상승 확인
  for (let i = 0; i < 4; i++) {
    const atk = page.locator('.hand-zone .card:not(.unplayable)').first();
    if (await atk.count() === 0) break;
    await atk.click(); await page.waitForTimeout(30);
    const sel = page.locator('.hand-zone .card.selected');
    if (await sel.count()) await sel.click();
    await page.waitForTimeout(30);
    if (await page.locator('.battle-screen').count() === 0) break;
  }
  if (await page.locator('.battle-screen').count()) {
    const frenzyLabel = await page.locator('.frenzy-wrap .res-label').innerText().catch(() => 'N/A');
    console.log('scythe frenzy label after attacks:', frenzyLabel.replace('\n', ' '));
    await page.screenshot({ path: `${SHOT}/06-battle-scythe.png` });
  }

  // ---------- 5) 세이브 이어하기 확인 ----------
  await page.reload();
  await page.waitForSelector('.title-screen');
  const hasContinue = await page.locator('#continue-btn').count();
  console.log('continue button after reload:', hasContinue ? 'YES' : 'NO');
  if (hasContinue) {
    await page.locator('#continue-btn').click();
    await page.waitForSelector('.map-screen');
    console.log('resume to map: OK');
  }

  // ---------- 6) 랜턴 기름 확인 ----------
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('.weapon-card');
  await page.locator('.weapon-card[data-weapon="lantern"]').click();
  await page.waitForSelector('.map-screen');
  await page.locator('.map-row.next .map-node').first().click();
  await page.waitForSelector('.battle-screen');
  const oil1 = await page.locator('.res-wrap .res-label').innerText();
  await page.locator('#end-turn').click();
  await page.waitForTimeout(60);
  const oil2 = await page.locator('.res-wrap .res-label').innerText().catch(() => 'battle over');
  console.log('lantern oil turn1:', oil1.trim(), '| turn2:', oil2.trim());
  await page.screenshot({ path: `${SHOT}/07-battle-lantern.png` });

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console/page errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
}

run().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });
