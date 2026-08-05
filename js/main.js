// main.js — 부트스트랩 + 화면(UI) 렌더링 (v0.5: 다중 적·타겟팅·연출)
import { loadAll, DB } from './data.js';
import { createBattle, initialRoll, reroll, toggleHold, confirmCategory, enemyPhase, previewAll, intentOf, aliveEnemies, isAoE } from './engine.js';
import { newRun, rollEncounter, rollRewards, applyRest, saveRun, loadRun, clearSave, hasSave, chooseWeapon, offerWeapons, pickEvent, applyEventEffects } from './run.js';

const app = document.getElementById('app');
let run = null;
let battle = null;
let currentNodeType = null;
let selectedCat = null;
let targetUid = null;   // 단일 공격 대상
let busy = false;       // 연출 중 입력 잠금

(async function boot() {
  try { await loadAll(); }
  catch (e) { app.innerHTML = `<div class="screen center"><p class="error">${e.message}</p></div>`; return; }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  showTitle();
})();

let deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferredInstall = e;
  const btn = document.getElementById('install-btn');
  if (btn) btn.classList.remove('hidden');
});

function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content; }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

const PIPS = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' };

// 길게 누르기(450ms) → onLong 실행. 발동 시 이어지는 click은 무시된다.
function addLongPress(el, onLong) {
  let timer = null, fired = false;
  const start = () => { fired = false; timer = setTimeout(() => { fired = true; onLong(); }, 450); };
  const cancel = () => clearTimeout(timer);
  el.addEventListener('touchstart', start, { passive: true });
  el.addEventListener('touchend', cancel);
  el.addEventListener('touchmove', cancel);
  el.addEventListener('mousedown', start);
  el.addEventListener('mouseup', cancel);
  el.addEventListener('mouseleave', cancel);
  el.addEventListener('click', (e) => {
    if (fired) { e.stopImmediatePropagation(); e.preventDefault(); fired = false; }
  }, true);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}

function showCategoryInfo(catId, variantId) {
  const cat = DB.scoring.categories.find(c => c.id === catId);
  if (!cat) return;
  const v = (cat.variants || []).find(x => x.id === variantId) || (cat.variants || [])[0] || {};
  app.append(h(`
    <div class="modal-back" id="cat-info">
      <div class="modal">
        <h3>${esc(v.name || cat.name)} <small class="cat-tag">${esc(cat.name)}</small>${isAoE(cat) ? ' <small class="aoe-tag">전체 공격</small>' : ''}</h3>
        <p class="info-rule">${esc(cat.ruleText || '')}</p>
        <p class="info-ability">✨ ${esc(v.abilityText || '부가 없음')}</p>
        <p class="modal-text">예시: ${(cat.example || []).map(f => PIPS[f]).join(' ')} · 등급: ${esc(v.tier || '')}</p>
        <p class="modal-text">성립하지 않으면 선택할 수 없다. 같은 족보의 다른 변형을 얻으면 나란히 추가된다.</p>
        <button class="btn primary" id="cat-info-close">닫기</button>
      </div>
    </div>`));
  const back = document.getElementById('cat-info');
  document.getElementById('cat-info-close').addEventListener('click', () => back.remove());
  back.addEventListener('click', (e) => { if (e.target === back) back.remove(); });
}

// ---------- 타이틀 ----------
function showTitle() {
  run = null; battle = null;
  app.innerHTML = '';
  app.append(h(`
    <div class="screen title-screen">
      <div class="title-art">🌲🎲🌲</div>
      <h1>REDHOOD</h1>
      <p class="subtitle">빨간망토의 모험 — 주사위판</p>
      ${hasSave() ? `<button class="btn primary" id="continue-btn">이어하기</button>` : ''}
      <button class="btn primary" id="start-btn">숲으로 들어간다</button>
      <p class="hint">야찌 족보로 점수를 내면, 그만큼 늑대가 아프다.</p>
      <button class="btn ghost hidden" id="install-btn">📲 홈 화면에 설치</button>
      <p class="hint">iOS는 공유 버튼 → "홈 화면에 추가"</p>
    </div>`));
  document.getElementById('start-btn').addEventListener('click', () => { run = newRun(); showIntro(); });
  const cont = document.getElementById('continue-btn');
  if (cont) cont.addEventListener('click', () => { const r = loadRun(); if (r) { run = r; showMap(); } });
  const install = document.getElementById('install-btn');
  if (install) {
    install.addEventListener('click', () => {
      if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; install.classList.add('hidden'); }
    });
    if (deferredInstall) install.classList.remove('hidden');
  }
}

// ---------- 대화 이벤트 화면 ----------
// 배틀 화면과 같은 골격: 적 위치=NPC, 주사위 위치=검은 그라데이션 대사판, 족보 위치=선택지
function eventFrame(npc, linesHtml, choicesHtml) {
  const hpPct = Math.max(0, run.hp / run.maxHp * 100);
  return `
    <div class="screen battle-screen event-screen">
      <header class="topbar">
        <span>💬 ${run.floor > 0 ? `${run.floor}층 · ` : ''}만남</span>
        <span class="relic-bar">${run.relics.map(id => DB.relicById[id].icon).join('')}</span>
        <span></span>
      </header>
      <div class="enemy-zone npc-zone">
        <div class="npc">
          <span class="npc-art">${npc.art}</span>
          <span class="npc-name">${esc(npc.name)}</span>
        </div>
      </div>
      <div class="dialogue-panel">${linesHtml}</div>
      <div class="sheet-zone choice-zone">${choicesHtml}</div>
      <div class="player-bar">
        <span class="pb-side"></span>
        <div class="hp-gauge">
          <div class="hp-fill" style="width:${hpPct}%"></div>
          <span class="hp-text">❤️ ${run.hp} / ${run.maxHp}</span>
        </div>
        <span class="pb-side"></span>
      </div>
    </div>`;
}

function variantName(cid, vid) {
  const c = DB.scoring.categories.find(x => x.id === cid);
  const v = c && (c.variants || []).find(x => x.id === vid);
  return v ? v.name : vid;
}

// 인트로: 첫 NPC — 무기 3종 무작위 제안, 선택 무기에 따라 시작 족보 결정
function showIntro() {
  const intro = DB.events.intro;
  const weapons = offerWeapons(intro.offerCount || 3);
  app.innerHTML = '';
  app.append(h(eventFrame(intro.npc,
    intro.lines.map(l => `<p class="npc-line">${esc(l)}</p>`).join(''),
    weapons.map((w, i) => `
      <button class="sheet-row choice-row weapon-choice" data-idx="${i}">
        <span class="choice-main">${w.icon} <b>${esc(w.name)}</b></span>
        <span class="choice-sub">${esc(w.desc)}</span>
        <span class="choice-cats">📜 ${Object.entries(w.start).map(([cid, vid]) => esc(variantName(cid, vid))).join(' · ')}</span>
      </button>`).join(''))));
  app.querySelectorAll('.weapon-choice').forEach(el => {
    el.addEventListener('click', () => {
      const w = weapons[parseInt(el.dataset.idx, 10)];
      chooseWeapon(run, w.id);
      saveRun(run);
      showEventResult(intro.npc,
        `<p class="npc-line">${esc(intro.resultLine || '')}</p>
         <p class="event-effect">${w.icon} ${esc(w.name)} — 📜 ${Object.entries(w.start).map(([cid, vid]) => esc(variantName(cid, vid))).join(' · ')}</p>`);
    });
  });
}

// 지도의 대화 이벤트 방
function showEvent(ev) {
  app.innerHTML = '';
  app.append(h(eventFrame(ev.npc,
    ev.lines.map(l => `<p class="npc-line">${esc(l)}</p>`).join(''),
    ev.choices.map((ch, i) => `
      <button class="sheet-row choice-row" data-idx="${i}">
        <span class="choice-main">${esc(ch.text)}</span>
        ${ch.sub ? `<span class="choice-sub">${esc(ch.sub)}</span>` : ''}
      </button>`).join(''))));
  app.querySelectorAll('.choice-row').forEach(el => {
    el.addEventListener('click', () => {
      const ch = ev.choices[parseInt(el.dataset.idx, 10)];
      const { messages, pendingDie } = applyEventEffects(run, ch.effects);
      saveRun(run);
      showEventResult(ev.npc,
        `<p class="npc-line">${esc(ch.result || '')}</p>
         ${messages.length ? `<p class="event-effect">${messages.map(esc).join(' · ')}</p>` : ''}`,
        pendingDie);
    });
  });
}

// 선택 결과 화면 — pendingDie가 있으면 '길을 나선다' 전에 교체 모달
function showEventResult(npc, linesHtml, pendingDie = null) {
  app.innerHTML = '';
  app.append(h(eventFrame(npc, linesHtml,
    `<button class="btn primary" id="event-done">길을 나선다</button>`)));
  document.getElementById('event-done').addEventListener('click', () => {
    if (pendingDie) showReplaceDie(pendingDie, () => { saveRun(run); showMap(); });
    else { saveRun(run); showMap(); }
  }, { once: true });
}

// ---------- 맵 ----------
const NODE_META = {
  battle: { icon: '⚔️', label: '전투' },
  elite: { icon: '💀', label: '엘리트' },
  rest: { icon: '🔥', label: '휴식' },
  event: { icon: '💬', label: '만남' },
  boss: { icon: '🐺', label: '보스' },
};

function showMap() {
  saveRun(run);
  const nextFloor = run.floor + 1;
  const rows = [];
  for (let f = run.map.length; f >= 1; f--) {
    const nodes = run.map[f - 1];
    const cls = f < nextFloor ? 'done' : f === nextFloor ? 'next' : 'future';
    rows.push(`
      <div class="map-row ${cls}">
        <span class="floor-num">${f}</span>
        ${f === run.floor ? '<span class="you-marker" title="현재 위치">🧣</span>' : ''}
        ${nodes.map((nd, i) => `
          <button class="map-node" data-floor="${f}" data-idx="${i}" ${f !== nextFloor ? 'disabled' : ''}>
            ${NODE_META[nd.type].icon}<small>${NODE_META[nd.type].label}</small>
          </button>`).join('')}
      </div>
      <div class="trail ${f <= run.floor ? 't-done' : f === nextFloor ? 't-drawing' : 't-future'}"></div>`);
  }
  rows.push(`
      <div class="map-row start-row">
        <span class="floor-num"></span>
        ${run.floor === 0 ? '<span class="you-marker">🧣</span>' : ''}
        <span class="start-label">🌲 숲의 입구</span>
      </div>`);
  app.innerHTML = '';
  app.append(h(`
    <div class="screen map-screen">
      <header class="topbar">
        <span>🌲 ${run.floor}/${run.map.length}층</span>
        <span class="relic-bar">${run.relics.map(id => DB.relicById[id].icon).join('')}</span>
        <span class="hp">❤️ ${run.hp}/${run.maxHp}</span>
      </header>
      <div class="map-scroll parchment">${rows.join('')}</div>
      <footer class="bottombar">
        <button class="btn ghost" id="bag-btn">🎲 가방</button>
        <button class="btn ghost" id="abandon-btn">런 포기</button>
      </footer>
    </div>`));
  app.querySelectorAll('.map-node:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      run.floor = parseInt(btn.dataset.floor, 10);
      enterNode(run.map[run.floor - 1][parseInt(btn.dataset.idx, 10)].type);
    });
  });
  document.getElementById('bag-btn').addEventListener('click', showBagModal);
  document.getElementById('abandon-btn').addEventListener('click', () => {
    if (confirm('런을 포기할까요?')) { clearSave(); showTitle(); }
  });
  const scroll = app.querySelector('.map-scroll');
  const nextRow = app.querySelector('.map-row.next');
  if (nextRow) scroll.scrollTop = nextRow.offsetTop - scroll.clientHeight / 2;
}

function showBagModal() {
  const diceItems = run.dice.map(id => {
    const d = DB.diceById[id];
    return `<li><b>${esc(d.name)}</b> <span class="modal-text">[${d.faces.join(',')}] ${esc(d.desc)}</span></li>`;
  }).join('');
  const catItems = DB.scoring.categories
    .filter(c => (run.categories[c.id] || []).length > 0)
    .map(c => (run.categories[c.id] || []).map(vid => {
      const v = (c.variants || []).find(x => x.id === vid) || {};
      return `<li><b>${esc(v.name || c.name)}</b> <small class="cat-tag">${esc(c.name)}</small>${isAoE(c) ? ' <small class="aoe-tag">전체</small>' : ''} <span class="modal-text">${esc(v.abilityText || '')}</span></li>`;
    }).join(''))
    .join('');
  const relicItems = run.relics.length
    ? run.relics.map(id => { const r = DB.relicById[id]; return `<li>${r.icon} <b>${esc(r.name)}</b> <span class="modal-text">${esc(r.desc)}</span></li>`; }).join('')
    : '<li class="modal-text">유물 없음</li>';
  app.append(h(`
    <div class="modal-back">
      <div class="modal">
        <h3>족보</h3><ul class="deck-list">${catItems}</ul>
        <h3>주사위 (5)</h3><ul class="deck-list">${diceItems}</ul>
        <h3>유물</h3><ul class="deck-list">${relicItems}</ul>
        <button class="btn primary" id="modal-close">닫기</button>
      </div>
    </div>`));
  document.getElementById('modal-close').addEventListener('click', () => app.querySelector('.modal-back').remove());
}

function enterNode(type) {
  currentNodeType = type;
  if (type === 'rest') { showRest(); return; }
  if (type === 'event') { showEvent(pickEvent(run)); return; }
  battle = createBattle(run, rollEncounter(run, type));
  selectedCat = null; busy = false;
  targetUid = aliveEnemies(battle)[0]?.uid || null; // 기본 표적: 맨 왼쪽
  renderBattle();
}

// 표적 유지: 죽었으면 다음(맨 왼쪽 생존)으로 자동 이동
function syncTarget() {
  const alive = aliveEnemies(battle);
  if (!alive.some(e => e.uid === targetUid)) targetUid = alive[0]?.uid || null;
}

// ---------- 휴식 ----------
function showRest() {
  app.innerHTML = '';
  app.append(h(`
    <div class="screen center rest-screen">
      <div class="rest-art">🔥</div>
      <h2>모닥불</h2>
      <button class="btn primary" id="rest-btn">휴식 (HP ${Math.floor(run.maxHp * DB.act1.rest.healRatio)} 회복)</button>
    </div>`));
  document.getElementById('rest-btn').addEventListener('click', () => {
    const healed = applyRest(run); saveRun(run);
    app.querySelector('.rest-screen').innerHTML =
      `<div class="rest-art">✨</div><h2>+${healed} HP</h2><p>❤️ ${run.hp}/${run.maxHp}</p>
       <button class="btn primary" id="rest-done">숲으로</button>`;
    document.getElementById('rest-done').addEventListener('click', showMap);
  });
}

// ---------- 전투 ----------
function upperThreshold() {
  let v = DB.scoring.upperBonus.threshold;
  for (const r of battle.relics) if (r.hook.type === 'upperBonusThreshold') v = r.hook.value;
  return v;
}

function breakdownText(bd) {
  if (bd.isZero) return '불발';
  const parts = [`기본 ${bd.base}`];
  if (bd.gold) parts.push(`+금박 ${bd.gold}`);
  if (bd.mult !== 1) parts.push(`×${bd.mult}`);
  if (bd.bonus) parts.push(`+${bd.bonus}`);
  if (bd.flat) parts.push(`+${bd.flat}`);
  return parts.join(' ');
}

function selectedCatDef() {
  return selectedCat ? DB.scoring.categories.find(c => c.id === selectedCat) : null;
}

function renderBattle(opts = {}) {
  const p = battle.player;
  const previews = previewAll(battle);
  const lastR = battle.lastResult;
  const multi = aliveEnemies(battle).length > 1;
  // 방어도는 LoL식: HP바 끝에 회백색 실드 구간으로 겹쳐 표시 (넘치면 바 전체가 재비율)
  const barTotal = Math.max(p.maxHp, p.hp + p.block);
  const hpPct = Math.max(0, p.hp / barTotal * 100);
  const shieldPct = Math.max(0, Math.min(p.block, barTotal - p.hp) / barTotal * 100);
  app.innerHTML = '';
  app.append(h(`
    <div class="screen battle-screen">
      <header class="topbar">
        <span>${NODE_META[currentNodeType].icon} ${run.floor}층 · ${battle.turn}턴</span>
        <span class="relic-bar">${battle.relics.map(r => r.icon).join('')}</span>
        <span class="upper-meter" title="상단 점수 누적 — 기준마다 추가 피해">☀ ${battle.upperTotal}/${upperThreshold()}</span>
      </header>
      <div class="enemy-zone">
        ${battle.enemies.filter(e => e.hp > 0 || (battle.lastHits || []).some(x => x.uid === e.uid && x.killed)).map(e => `
          <button class="enemy ${targetUid === e.uid && e.hp > 0 ? 'targeted' : ''}" data-uid="${e.uid}">
            ${targetUid === e.uid && e.hp > 0 ? '<span class="target-pin">▼</span>' : ''}
            <span class="intent">${intentOf(e)} <small>${esc(e.nextMove.name)}</small></span>
            <span class="enemy-art">${e.tier === 'boss' ? '🐺' : e.tier === 'elite' ? '💀' : '🌑'}</span>
            <span class="enemy-name">${esc(e.name)}</span>
            <span class="bar"><i style="width:${Math.max(0, e.hp / e.maxHpInit * 100)}%"></i></span>
            <span class="enemy-hp">${e.hp}/${e.maxHpInit}</span>
          </button>`).join('')}
      </div>
      <div class="mid-line">
        ${lastR ? `<span class="last-result">${esc(lastR.catName)}: ${breakdownText(lastR)} = <b>${lastR.total}</b> ${lastR.bonusHits.map(esc).join(' ')}</span>` : '<span class="last-result"></span>'}
      </div>
      <div class="dice-zone">
        ${battle.dice.map((d, i) => {
          const def = battle.diceDefs[i];
          const blank = !battle.rolled;
          const marked = battle.rolled && !d.held; // 다시 굴릴 주사위
          return `<button class="die ${blank ? 'blank' : ''} ${marked ? 'mark-reroll' : ''} ${def.gold ? 'gold' : ''} ${def.id !== 'normal' && !def.gold ? 'special' : ''}"
            data-idx="${i}" title="${esc(def.name)}" style="--tilt:${blank ? 0 : dieTilts[i] || 0}deg">
            <span class="pip">${blank ? '' : PIPS[d.face] || d.face}</span>
            <small>${marked ? '다시' : ''}</small>
          </button>`;
        }).join('')}
      </div>
      <div class="roll-bar">
        ${!battle.rolled
          ? `<button class="btn primary roll-btn" id="roll-btn">🎲 굴림</button>`
          : `<button class="btn primary roll-btn" id="reroll-btn" ${battle.rollsLeft <= 0 || battle.await || battle.dice.every(d => d.held) ? 'disabled' : ''}>🎲 리롤 (${battle.rollsLeft})</button>`}
      </div>
      <div class="hint-line">${
        !battle.rolled ? '굴려서 턴을 시작한다' :
        selectedCat ? '한 번 더 탭하면 확정' :
        multi ? '주사위 탭=다시 굴릴 것 선택 · 적 탭=표적 변경' : '주사위 탭=다시 굴릴 것 선택 · 족보 길게 눌러 설명'
      }</div>
      <div class="sheet-zone ${battle.rolled ? '' : 'dim'}">
        ${previews.map(({ cat, variant, seal, locked, bd }) => `
          <button class="sheet-row t-${variant.tier || 'common'} ${locked ? 'used' : ''} ${selectedCat === `${cat.id}:${variant.id}` ? 'selected' : ''}"
            data-cat="${cat.id}" data-variant="${variant.id}" data-locked="${locked ? 1 : 0}">
            <span class="sheet-name">${esc(variant.name)} <small class="cat-tag">${esc(cat.name)}</small>${isAoE(cat) ? ' <small class="aoe-tag">전체</small>' : ''}</span>
            <span class="sheet-ability">${esc(variant.abilityText || '')}</span>
            <span class="sheet-example">${(cat.example || []).map(f => PIPS[f]).join('')}</span>
            <span class="sheet-preview">${seal ? `🔒${seal}` : battle.rolled ? (bd.total > 0 ? bd.total : '—') : '—'}</span>
          </button>`).join('')}
      </div>
      <div class="player-bar ${opts.playerHit ? 'hurt' : ''}">
        <span class="pb-side"></span>
        <div class="hp-gauge">
          <div class="hp-fill" style="width:${hpPct}%"></div>
          ${p.block > 0 ? `<div class="hp-shield" style="left:${hpPct}%; width:${shieldPct}%"></div>` : ''}
          <span class="hp-text">❤️ ${p.hp} / ${p.maxHp}${p.block > 0 ? `<span class="shield-num">🛡${p.block}</span>` : ''}</span>
        </div>
        <span class="pb-side">${battle.pendingBuff > 0 ? `⚡+${battle.pendingBuff}` : ''}</span>
      </div>
    </div>`));

  // 주사위
  app.querySelectorAll('.die').forEach(el => {
    el.addEventListener('click', () => {
      if (busy || !battle.rolled) return;
      toggleHold(battle, parseInt(el.dataset.idx, 10));
      renderBattle();
    });
  });
  // 굴림 / 리롤
  const rollBtn = document.getElementById('roll-btn');
  if (rollBtn) rollBtn.addEventListener('click', () => {
    if (busy) return;
    if (initialRoll(battle)) animateRoll([0, 1, 2, 3, 4]);
  });
  const rerollBtn = document.getElementById('reroll-btn');
  if (rerollBtn) rerollBtn.addEventListener('click', () => {
    if (busy) return;
    selectedCat = null;
    const rerolled = battle.dice.map((d, i) => (d.held ? -1 : i)).filter(i => i >= 0);
    if (reroll(battle)) animateRoll(rerolled);
  });
  // 적 탭 = 표적 변경 (언제든, 확정과 무관)
  app.querySelectorAll('.enemy').forEach(el => {
    el.addEventListener('click', () => {
      if (busy) return;
      const uid = el.dataset.uid;
      const alive = aliveEnemies(battle);
      if (!alive.some(e => e.uid === uid)) return;
      targetUid = uid;
      renderBattle();
    });
  });
  // 족보 — 선택 키는 (족보:변형) 조합, 같은 족보의 다른 변형은 별개 버튼
  app.querySelectorAll('.sheet-row').forEach(el => {
    const catId = el.dataset.cat;
    const variantId = el.dataset.variant;
    const key = `${catId}:${variantId}`;
    addLongPress(el, () => showCategoryInfo(catId, variantId));
    el.addEventListener('click', () => {
      if (busy || el.dataset.locked === '1') return;
      if (selectedCat !== key) { selectedCat = key; renderBattle(); return; }
      tryConfirm(catId, variantId, targetUid);
    });
  });
}

// 굴림 연출: 낙하-텀블링-바운스 착지, 왼쪽부터 차례로 멈추며 값 공개
const dieTilts = [0, 0, 0, 0, 0]; // 착지 후 살짝 기울어진 각도 (물리감)
function animateRoll(indices) {
  busy = true;
  renderBattle();
  const dieEls = [...app.querySelectorAll('.die')];
  const glyphs = Object.values(PIPS);
  const stopped = new Set();

  indices.forEach((idx) => {
    const el = dieEls[idx];
    if (!el) return;
    dieTilts[idx] = 0;
    el.style.setProperty('--tilt', '0deg');
    el.classList.remove('blank', 'landed');
    // 시작 타이밍·텀블 속도에 개별 편차 (일제히 던져도 제각각 구르는 느낌)
    el.style.animationDelay = `${-Math.random() * 0.4}s`;
    el.style.animationDuration = `${0.34 + Math.random() * 0.14}s`;
    el.classList.add('spinning');
    const pip = el.querySelector('.pip');
    // 눈이 점점 느리게 바뀜 (구르다 멈추는 감속)
    let delay = 42;
    (function cycle() {
      if (stopped.has(idx)) return;
      pip.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      delay = Math.min(150, delay * 1.13);
      setTimeout(cycle, delay);
    })();
  });

  indices.forEach((idx, order) => {
    const landAt = 460 + order * 170 + Math.random() * 80;
    setTimeout(() => {
      const el = dieEls[idx];
      if (!el) return;
      stopped.add(idx);
      el.classList.remove('spinning');
      el.style.animationDelay = '';
      el.style.animationDuration = '';
      const tilt = (Math.random() * 7 - 3.5).toFixed(1);
      dieTilts[idx] = tilt;
      el.style.setProperty('--tilt', `${tilt}deg`);
      el.classList.add('landed');
      el.querySelector('.pip').textContent = PIPS[battle.dice[idx].face] || battle.dice[idx].face;
    }, landAt);
  });

  setTimeout(() => { busy = false; renderBattle(); }, 460 + indices.length * 170 + 80 + 260);
}

// 확정 → 베기 연출 → 적 페이즈 → 다음 턴
function tryConfirm(catId, variantId, uid) {
  if (busy) return;
  busy = true;
  selectedCat = null;
  const res = confirmCategory(battle, catId, variantId, uid);
  if (!res) { busy = false; renderBattle(); return; }
  syncTarget(); // 표적이 죽었으면 다음 적으로
  renderBattle();
  const fxTotal = playAttackSequence(); // 기여 주사위 발광 → 타격

  setTimeout(() => {
    if (battle.over) { finishBattle(); return; } // 승리 — 처치 연출이 재생된 뒤 전환

    // 적 공격 연출: 행동하는 적이 순서대로 윈드업 → 내려찍기 (준비 행동은 은은한 충전 발광)
    const ATK_MS = 780;
    const actors = aliveEnemies(battle)
      .filter(e => !e.stunned)
      .map(e => ({ uid: e.uid, isAtk: e.nextMove.effects.some(f => f.op === 'damage') }));
    actors.forEach((a, i) => setTimeout(() => {
      const el = app.querySelector(`.enemy[data-uid="${a.uid}"]`);
      if (!el) return;
      el.classList.add(a.isAtk ? 'attacking' : 'charging');
      setTimeout(() => el.classList.remove('attacking', 'charging'), 740);
    }, i * ATK_MS));
    const atkTotal = actors.length > 0 ? actors.length * ATK_MS + 200 : 300;

    setTimeout(() => {
      const hpBefore = battle.player.hp;
      enemyPhase(battle);
      if (battle.over) { playerDeathFx(); return; } // 사망 연출
      syncTarget();
      renderBattle();
      const dmgTaken = hpBefore - battle.player.hp;
      if (dmgTaken > 0) playPlayerHitFx(dmgTaken);
      busy = false;
    }, atkTotal);
  }, fxTotal);
}

// 공격 시퀀스: 합산에 기여한 주사위가 통째로 빛남(족보가 화려할수록 강하게) → 곧바로 타격
const FX_FLARE = {
  slash: 'flare', slash2: 'flare mid', smash: 'flare mid', ring: 'flare mid',
  wave: 'flare mid', bigwave: 'flare high', judgment: 'flare high',
};
function playAttackSequence() {
  const hits = battle.lastHits;
  const lastR = battle.lastResult;
  if (!lastR || hits.length === 0) return 250;
  const screen = app.querySelector('.battle-screen');
  const dieEls = [...app.querySelectorAll('.die')];
  const contributing = lastR.contributing || [];
  const fx = lastR.fx || 'slash';
  const flare = (FX_FLARE[fx] || 'flare').split(' ');

  // 1) 기여 주사위 전체 발광 (타격 이펙트의 예열)
  for (const i of contributing) dieEls[i]?.classList.add(...flare);
  const FLARE = flare.includes('high') ? 640 : flare.includes('mid') ? 540 : 460;
  const IMPACT = 900;

  // 2) 타격 — 족보별 이펙트
  setTimeout(() => {
    if (!screen.isConnected) return;
    if (lastR.aoe) {
      if (fx === 'wave' || fx === 'bigwave') {
        const ez = app.querySelector('.enemy-zone');
        if (ez) {
          const wave = document.createElement('div');
          wave.className = 'shockwave' + (fx === 'bigwave' ? ' big' : '');
          ez.appendChild(wave);
          setTimeout(() => wave.remove(), 560);
        }
        if (fx === 'bigwave') flashScreen(screen, 'gold');
      } else {
        const ez = app.querySelector('.enemy-zone');
        if (ez) {
          const sRect = screen.getBoundingClientRect();
          const r = ez.getBoundingClientRect();
          const boom = document.createElement('div');
          boom.className = 'explosion';
          boom.style.left = `${r.left + r.width / 2 - sRect.left}px`;
          boom.style.top = `${r.top + r.height * 0.6 - sRect.top}px`;
          screen.appendChild(boom);
          setTimeout(() => boom.remove(), 480);
        }
      }
      screen.classList.add('micro-shake');
      setTimeout(() => screen.classList.remove('micro-shake'), 320);
    } else if (fx === 'judgment') {
      flashScreen(screen, 'gold');
      screen.classList.add('screen-shake');
      setTimeout(() => screen.classList.remove('screen-shake'), 520);
    } else if (fx === 'smash') {
      screen.classList.add('micro-shake');
      setTimeout(() => screen.classList.remove('micro-shake'), 320);
    }
    playHitEffects(hits, fx);
    for (const i of contributing) dieEls[i]?.classList.remove('flare', 'mid', 'high');
  }, FLARE);

  return FLARE + IMPACT;
}

function flashScreen(screen, tone) {
  const f = document.createElement('div');
  f.className = 'flash-veil ' + (tone || '');
  screen.appendChild(f);
  setTimeout(() => f.remove(), 380);
}

// 피격 연출: 화면 흔들림 + 붉은 블러 비네트 + 체력바 위 피해 수치
function playPlayerHitFx(dmg) {
  const screen = app.querySelector('.battle-screen');
  if (!screen) return;
  screen.classList.add('screen-shake');
  const veil = document.createElement('div');
  veil.className = 'hurt-veil';
  screen.appendChild(veil);
  const bar = app.querySelector('.player-bar');
  if (bar) {
    bar.classList.add('hurt');
    const f = document.createElement('span');
    f.className = 'pdmg-float';
    f.textContent = `-${dmg}`;
    bar.appendChild(f);
    setTimeout(() => { f.remove(); bar.classList.remove('hurt'); }, 2100);
  }
  setTimeout(() => { screen.classList.remove('screen-shake'); veil.remove(); }, 700);
}

// 족보별 명중 이펙트 — 어려운 족보일수록 화려하게
function playHitEffects(hits, fx = 'slash') {
  for (const hit of hits) {
    const el = app.querySelector(`.enemy[data-uid="${hit.uid}"]`);
    if (!el) continue;
    el.classList.add('hit');
    const cleanup = [];
    const addSlash = (cls, delay = 0) => setTimeout(() => {
      if (!el.isConnected) return;
      const s = document.createElement('span');
      s.className = 'slash ' + cls;
      el.appendChild(s);
      cleanup.push(s);
    }, delay);
    const addRing = (cls) => {
      const r = document.createElement('span');
      r.className = 'impact-ring ' + cls;
      el.appendChild(r);
      cleanup.push(r);
    };
    switch (fx) {
      case 'slash2':   addSlash(''); addSlash('rev', 100); break;              // 트리플: X자 이중 베기
      case 'smash':    addRing('red'); addSlash('', 60); break;                // 포카드: 충격파 + 베기
      case 'ring':     addRing('gold'); addSlash(''); break;                   // 풀하우스: 금빛 파문
      case 'wave':     addSlash('wide'); break;                                // 스몰 스트레이트: 넓은 베기
      case 'bigwave':  addSlash('wide'); addSlash('wide rev', 110); break;     // 라지: 교차 파도
      case 'judgment': addRing('gold'); addRing('red'); addSlash(''); addSlash('rev', 90); break; // 야찌
      default:         addSlash('');                                            // 기본 베기
    }
    const dmg = document.createElement('span');
    dmg.className = 'dmg-float' + (fx === 'judgment' ? ' big' : '');
    dmg.textContent = `-${hit.amount}`;
    el.appendChild(dmg);
    cleanup.push(dmg);
    setTimeout(() => { cleanup.forEach(n => n.remove()); el.classList.remove('hit'); }, 720);
    // 처치 연출: 베인 뒤 무너져 내림
    if (hit.killed) setTimeout(() => el.classList.add('dying'), 300);
  }
}

// 플레이어 사망 연출: 붉은 장막이 덮이고 게이지가 비워진 뒤 엔딩으로
function playerDeathFx() {
  renderBattle({ playerHit: true });
  const veil = document.createElement('div');
  veil.className = 'death-veil';
  app.append(veil);
  setTimeout(() => {
    busy = false;
    run.hp = 0;
    clearSave();
    showEnd(false);
  }, 1000);
}

function finishBattle() {
  setTimeout(() => {
    busy = false;
    run.hp = battle.player.hp;
    if (battle.result === 'defeat') { clearSave(); showEnd(false); return; }
    // (승리 시 처치 연출을 여유 있게 재생)
    // 승리 시 회복 유물 (빵부스러기)
    const heal = run.relics.map(id => DB.relicById[id])
      .filter(r => r.hook.type === 'healOnVictory')
      .reduce((s, r) => s + r.hook.amount, 0);
    if (heal > 0) run.hp = Math.min(run.maxHp, run.hp + heal);
    if (currentNodeType === 'boss') { clearSave(); showEnd(true); return; }
    showReward();
  }, 850);
}

// ---------- 보상: 범주 상자 → 열면 그 범주의 카드 3장이 튀어나옴 ----------
const KIND_BOX = {
  category: { icon: '📜', name: '낡은 두루마리', desc: '족보가 잠들어 있다' },
  die: { icon: '🎲', name: '가죽 주머니', desc: '주사위가 굴러다닌다' },
  relic: { icon: '🎁', name: '숲의 상자', desc: '유물이 숨겨져 있다' },
};

function showReward() {
  const choices = rollRewards(run, currentNodeType);
  if (choices.length === 0) { saveRun(run); showMap(); return; }
  const box = KIND_BOX[choices[0].kind];
  app.innerHTML = '';
  app.append(h(`
    <div class="screen center reward-screen">
      <h2>승리!</h2>
      <p>${esc(box.desc)}</p>
      <button class="chest" id="chest">
        <span class="chest-icon">${box.icon}</span>
        <span class="chest-name">${esc(box.name)}</span>
      </button>
      <p class="hint">탭해서 연다</p>
    </div>`));
  document.getElementById('chest').addEventListener('click', function open() {
    const chest = document.getElementById('chest');
    chest.classList.add('opening');
    chest.disabled = true;
    setTimeout(() => showRewardCards(choices, box), 480);
  }, { once: true });
}

function showRewardCards(choices, box) {
  app.innerHTML = '';
  app.append(h(`
    <div class="screen center reward-screen">
      <h2>${box.icon} ${esc(box.name)}</h2>
      <p>하나를 고른다</p>
      <div class="reward-cards">
        ${choices.map((c, i) => {
          const isCat = c.kind === 'category';
          const isNew = isCat && !c.item.owned;
          return `
          <button class="card pop-in r-${c.item.tier} ${c.item.tier === 'epic' ? 'shiny-epic' : c.item.tier === 'rare' ? 'shiny-rare' : c.item.tier === 'uncommon' ? 'shiny-un' : ''} ${isNew ? 'new-cat' : ''}"
            data-idx="${i}" style="--d:${0.12 + i * 0.22}s">
            ${isNew ? '<span class="new-badge">새 족보!</span>' : ''}
            <span class="cost">${c.kind === 'die' ? '🎲 주사위' : c.kind === 'relic' ? (c.item.icon || '🪬') + ' 유물' : `📜 ${esc(isCat ? c.item.cat.name : '족보')}`}</span>
            <span class="card-name">${esc(isCat ? c.item.variant.name : c.item.name)}</span>
            <span class="card-text">${
              c.kind === 'die' ? `[${c.item.faces.join(',')}]<br>${esc(c.item.desc)}` :
              c.kind === 'relic' ? esc(c.item.desc) :
              isNew
                ? `새 족보 획득<br>✨ ${esc(c.item.variant.abilityText || '')}`
                : `${esc(c.item.cat.name)} 변형 추가<br>✨ ${esc(c.item.variant.abilityText || '')}`
            }</span>
            <span class="card-rarity">${c.item.tier}</span>
          </button>`;
        }).join('')}
      </div>
      <button class="btn ghost pop-in" id="skip-btn" style="--d:${0.2 + choices.length * 0.22}s">넘어가기</button>
    </div>`));
  app.querySelectorAll('.reward-cards .card').forEach(el => {
    el.addEventListener('click', () => {
      const c = choices[parseInt(el.dataset.idx, 10)];
      if (c.kind === 'relic') { run.relics.push(c.item.id); saveRun(run); showMap(); }
      else if (c.kind === 'category') {
        (run.categories[c.item.cat.id] = run.categories[c.item.cat.id] || []).push(c.item.variant.id);
        saveRun(run); showMap();
      }
      else showReplaceDie(c.item);
    });
  });
  document.getElementById('skip-btn').addEventListener('click', () => { saveRun(run); showMap(); });
}

function showReplaceDie(newDie, onDone = null) {
  app.append(h(`
    <div class="modal-back">
      <div class="modal">
        <h3>${esc(newDie.name)} 획득 — 어느 주사위와 교체?</h3>
        <p class="modal-text">${esc(newDie.desc || '')}</p>
        <ul class="deck-list">
          ${run.dice.map((id, i) => {
            const d = DB.diceById[id];
            return `<li><button class="btn replace-btn" data-idx="${i}"><b>${esc(d.name)}</b> [${d.faces.join(',')}]</button></li>`;
          }).join('')}
        </ul>
        <button class="btn ghost" id="replace-cancel">${onDone ? '가지지 않는다' : '취소 (보상 화면으로)'}</button>
      </div>
    </div>`));
  app.querySelectorAll('.replace-btn').forEach(el => {
    el.addEventListener('click', () => {
      run.dice[parseInt(el.dataset.idx, 10)] = newDie.id;
      saveRun(run);
      if (onDone) onDone(); else showMap();
    });
  });
  document.getElementById('replace-cancel').addEventListener('click', () => {
    app.querySelector('.modal-back').remove();
    if (onDone) onDone();
  });
}

// ---------- 엔딩 ----------
function showEnd(victory) {
  app.innerHTML = '';
  app.append(h(`
    <div class="screen center end-screen">
      <div class="rest-art">${victory ? '🌅' : '🥀'}</div>
      <h2>${victory ? '늑대를 쓰러뜨렸다' : '숲에 삼켜졌다'}</h2>
      <p>${victory ? '운명의 주사위는 소녀의 편이었다. — 1막 클리어' : `${run.floor}층에서 쓰러짐`}</p>
      <button class="btn primary" id="restart-btn">${victory ? '새로운 런' : '다시 도전'}</button>
    </div>`));
  document.getElementById('restart-btn').addEventListener('click', showTitle);
}
