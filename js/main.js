// main.js — 부트스트랩 + 화면(UI) 렌더링 (v0.5: 다중 적·타겟팅·연출)
import { loadAll, DB } from './data.js';
import { createBattle, initialRoll, reroll, toggleHold, confirmCategory, enemyPhase, previewAll, intentOf, aliveEnemies, isAoE } from './engine.js';
import { newRun, rollEncounter, rollRewards, applyRest, saveRun, loadRun, clearSave, hasSave } from './run.js';

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

function showCategoryInfo(catId, level) {
  const cat = DB.scoring.categories.find(c => c.id === catId);
  if (!cat) return;
  app.append(h(`
    <div class="modal-back" id="cat-info">
      <div class="modal">
        <h3>${esc(cat.name)}${level > 1 ? ` <b class="lv">Lv${level}</b>` : ''}${isAoE(cat) ? ' <small class="aoe-tag">전체 공격</small>' : ''}</h3>
        <p class="info-rule">${esc(cat.ruleText || '')}</p>
        <p class="info-ability">✨ ${esc(cat.abilityText || '부가 없음')}</p>
        <p class="modal-text">예시: ${(cat.example || []).map(f => PIPS[f]).join(' ')}</p>
        ${level > 1 ? `<p class="modal-text">레벨 보정: ${cat.levelFlat !== undefined ? `피해 +${cat.levelFlat * (level - 1)}` : `피해 ×${level}`} (부가 능력은 고정)</p>` : ''}
        <p class="modal-text">성립하지 않으면 선택할 수 없다.</p>
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
  document.getElementById('start-btn').addEventListener('click', () => { run = newRun(); saveRun(run); showMap(); });
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

// ---------- 맵 ----------
const NODE_META = {
  battle: { icon: '⚔️', label: '전투' },
  elite: { icon: '💀', label: '엘리트' },
  rest: { icon: '🔥', label: '휴식' },
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
        ${nodes.map((nd, i) => `
          <button class="map-node" data-floor="${f}" data-idx="${i}" ${f !== nextFloor ? 'disabled' : ''}>
            ${NODE_META[nd.type].icon}<small>${NODE_META[nd.type].label}</small>
          </button>`).join('')}
      </div>`);
  }
  app.innerHTML = '';
  app.append(h(`
    <div class="screen map-screen">
      <header class="topbar">
        <span>🌲 ${run.floor}/${run.map.length}층</span>
        <span class="relic-bar">${run.relics.map(id => DB.relicById[id].icon).join('')}</span>
        <span class="hp">❤️ ${run.hp}/${run.maxHp}</span>
      </header>
      <div class="map-scroll">${rows.join('')}</div>
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
    .filter(c => run.categories[c.id])
    .map(c => `<li><b>${esc(c.name)}</b> Lv${run.categories[c.id]}${isAoE(c) ? ' <small class="aoe-tag">전체</small>' : ''} <span class="modal-text">${esc(c.abilityText || '')}</span></li>`)
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
  battle = createBattle(run, rollEncounter(run, type));
  selectedCat = null; targetUid = null; busy = false;
  renderBattle();
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
  if (bd.level > 1 && !bd.levelFlatBonus) parts.push(`×Lv${bd.level}`);
  if (bd.mult !== 1) parts.push(`×${bd.mult}`);
  if (bd.levelFlatBonus) parts.push(`+Lv${bd.levelFlatBonus}`);
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
  const selDef = selectedCatDef();
  const targeting = selDef && !isAoE(selDef) && aliveEnemies(battle).length > 1;
  const hpPct = Math.max(0, p.hp / p.maxHp * 100);
  app.innerHTML = '';
  app.append(h(`
    <div class="screen battle-screen">
      <header class="topbar">
        <span>${NODE_META[currentNodeType].icon} ${run.floor}층 · ${battle.turn}턴</span>
        <span class="relic-bar">${battle.relics.map(r => r.icon).join('')}</span>
        <span class="upper-meter" title="상단 점수 누적 — 기준마다 추가 피해">☀ ${battle.upperTotal}/${upperThreshold()}</span>
      </header>
      <div class="enemy-zone">
        ${battle.enemies.filter(e => e.hp > 0).map(e => `
          <button class="enemy ${targeting ? 'targetable' : ''} ${targetUid === e.uid && selDef && !isAoE(selDef) ? 'targeted' : ''}" data-uid="${e.uid}">
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
          return `<button class="die ${blank ? 'blank' : ''} ${d.held ? 'held' : ''} ${def.gold ? 'gold' : ''} ${def.id !== 'normal' && !def.gold ? 'special' : ''}"
            data-idx="${i}" title="${esc(def.name)}" style="--tilt:${blank ? 0 : dieTilts[i] || 0}deg">
            <span class="pip">${blank ? '' : PIPS[d.face] || d.face}</span>
            <small>${d.held ? '홀드' : ''}</small>
          </button>`;
        }).join('')}
      </div>
      <div class="roll-bar">
        ${!battle.rolled
          ? `<button class="btn primary roll-btn" id="roll-btn">🎲 굴림</button>`
          : `<button class="btn primary roll-btn" id="reroll-btn" ${battle.rollsLeft <= 0 || battle.await ? 'disabled' : ''}>🎲 리롤 (${battle.rollsLeft})</button>`}
      </div>
      <div class="hint-line">${
        !battle.rolled ? '굴려서 턴을 시작한다' :
        targeting && selDef ? '공격할 적을 탭하라 (족보 다시 탭 = 첫 번째 적)' :
        selectedCat ? '한 번 더 탭하면 확정' : '주사위 탭=홀드 · 족보 길게 누르면 설명'
      }</div>
      <div class="sheet-zone ${battle.rolled ? '' : 'dim'}">
        ${previews.map(({ cat, level, seal, locked, bd }) => `
          <button class="sheet-row ${locked ? 'used' : ''} ${selectedCat === cat.id ? 'selected' : ''}"
            data-cat="${cat.id}" data-locked="${locked ? 1 : 0}">
            <span class="sheet-name">${esc(cat.name)}${level > 1 ? ` <b class="lv">Lv${level}</b>` : ''}${isAoE(cat) ? ' <small class="aoe-tag">전체</small>' : ''}</span>
            <span class="sheet-ability">${esc(cat.abilityText || '')}</span>
            <span class="sheet-example">${(cat.example || []).map(f => PIPS[f]).join('')}</span>
            <span class="sheet-preview">${seal ? `🔒${seal}` : battle.rolled ? (bd.total > 0 ? bd.total : '—') : '—'}</span>
          </button>`).join('')}
      </div>
      <div class="player-bar ${opts.playerHit ? 'hurt' : ''}">
        <span class="pb-side">${p.block > 0 ? `🛡${p.block}` : ''}</span>
        <div class="hp-gauge">
          <div class="hp-fill" style="width:${hpPct}%"></div>
          <span class="hp-text">❤️ ${p.hp} / ${p.maxHp}</span>
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
  // 적 (타겟 지정)
  app.querySelectorAll('.enemy').forEach(el => {
    el.addEventListener('click', () => {
      if (busy) return;
      const uid = el.dataset.uid;
      if (selectedCat) {
        const def = selectedCatDef();
        if (def && !isAoE(def)) { tryConfirm(selectedCat, uid); return; }
      }
      targetUid = uid; renderBattle();
    });
  });
  // 족보
  app.querySelectorAll('.sheet-row').forEach(el => {
    const catId = el.dataset.cat;
    addLongPress(el, () => showCategoryInfo(catId, battle.categories[catId] || 1));
    el.addEventListener('click', () => {
      if (busy || el.dataset.locked === '1') return;
      if (selectedCat !== catId) { selectedCat = catId; renderBattle(); return; }
      tryConfirm(catId, targetUid);
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
function tryConfirm(catId, uid) {
  if (busy) return;
  busy = true;
  selectedCat = null;
  const res = confirmCategory(battle, catId, uid);
  if (!res) { busy = false; renderBattle(); return; }
  targetUid = null;
  renderBattle();
  playHitEffects(battle.lastHits);
  const hitDelay = battle.lastHits.length > 0 ? 620 : 220;

  setTimeout(() => {
    if (battle.over) { finishBattle(); return; }
    const hpBefore = battle.player.hp;
    enemyPhase(battle);
    if (battle.over) { finishBattle(); return; }
    renderBattle({ playerHit: battle.player.hp < hpBefore });
    busy = false;
  }, hitDelay);
}

function playHitEffects(hits) {
  for (const hit of hits) {
    const el = app.querySelector(`.enemy[data-uid="${hit.uid}"]`);
    if (!el) continue;
    el.classList.add('hit');
    const slash = document.createElement('span');
    slash.className = 'slash';
    el.appendChild(slash);
    const dmg = document.createElement('span');
    dmg.className = 'dmg-float';
    dmg.textContent = `-${hit.amount}`;
    el.appendChild(dmg);
    setTimeout(() => { slash.remove(); dmg.remove(); el.classList.remove('hit'); }, 650);
  }
}

function finishBattle() {
  setTimeout(() => {
    busy = false;
    run.hp = battle.player.hp;
    if (battle.result === 'defeat') { clearSave(); showEnd(false); return; }
    // 승리 시 회복 유물 (빵부스러기)
    const heal = run.relics.map(id => DB.relicById[id])
      .filter(r => r.hook.type === 'healOnVictory')
      .reduce((s, r) => s + r.hook.amount, 0);
    if (heal > 0) run.hp = Math.min(run.maxHp, run.hp + heal);
    if (currentNodeType === 'boss') { clearSave(); showEnd(true); return; }
    showReward();
  }, 500);
}

// ---------- 보상 ----------
function showReward() {
  const choices = rollRewards(run, currentNodeType);
  app.innerHTML = '';
  app.append(h(`
    <div class="screen center reward-screen">
      <h2>승리!</h2>
      <p>전리품 — 하나를 고른다</p>
      <div class="reward-cards">
        ${choices.map((c, i) => `
          <button class="card r-${c.item.tier}" data-idx="${i}">
            <span class="cost">${c.kind === 'die' ? '🎲 주사위' : c.kind === 'relic' ? (c.item.icon || '🪬') + ' 유물' : '📜 족보'}</span>
            <span class="card-name">${esc(c.item.name)}${c.kind === 'category' && c.newLevel > 1 ? ` Lv${c.newLevel}` : ''}</span>
            <span class="card-text">${
              c.kind === 'die' ? `[${c.item.faces.join(',')}]<br>${esc(c.item.desc)}` :
              c.kind === 'relic' ? esc(c.item.desc) :
              c.newLevel > 1
                ? (c.item.levelFlat !== undefined ? `강화: 피해 +${c.item.levelFlat * (c.newLevel - 1)}` : `강화: 점수 ×${c.newLevel}`)
                : `새 족보 획득<br>${esc(c.item.abilityText || '')}`
            }</span>
            <span class="card-rarity">${c.item.tier}</span>
          </button>`).join('')}
      </div>
      <button class="btn ghost" id="skip-btn">넘어가기</button>
    </div>`));
  app.querySelectorAll('.reward-cards .card').forEach(el => {
    el.addEventListener('click', () => {
      const c = choices[parseInt(el.dataset.idx, 10)];
      if (c.kind === 'relic') { run.relics.push(c.item.id); saveRun(run); showMap(); }
      else if (c.kind === 'category') { run.categories[c.item.id] = c.newLevel; saveRun(run); showMap(); }
      else showReplaceDie(c.item);
    });
  });
  document.getElementById('skip-btn').addEventListener('click', () => { saveRun(run); showMap(); });
}

function showReplaceDie(newDie) {
  app.append(h(`
    <div class="modal-back">
      <div class="modal">
        <h3>${esc(newDie.name)} 획득 — 어느 주사위와 교체?</h3>
        <ul class="deck-list">
          ${run.dice.map((id, i) => {
            const d = DB.diceById[id];
            return `<li><button class="btn replace-btn" data-idx="${i}"><b>${esc(d.name)}</b> [${d.faces.join(',')}]</button></li>`;
          }).join('')}
        </ul>
        <button class="btn ghost" id="replace-cancel">취소 (보상 화면으로)</button>
      </div>
    </div>`));
  app.querySelectorAll('.replace-btn').forEach(el => {
    el.addEventListener('click', () => {
      run.dice[parseInt(el.dataset.idx, 10)] = newDie.id;
      saveRun(run); showMap();
    });
  });
  document.getElementById('replace-cancel').addEventListener('click', () => app.querySelector('.modal-back').remove());
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
