// main.js — 부트스트랩 + 화면(UI) 렌더링
import { loadAll, DB } from './data.js';
import { createBattle, playCard, canPlay, endTurn, previewMoveDamage, frenzyStage } from './engine.js';
import { newRun, rollEncounter, rollCardRewards, applyRest, saveRun, loadRun, clearSave, hasSave } from './run.js';

const app = document.getElementById('app');
let run = null;
let battle = null;
let currentNodeType = null;
let selectedCard = -1;

// ---------- 부트 ----------
(async function boot() {
  try {
    await loadAll();
  } catch (e) {
    app.innerHTML = `<div class="screen center"><p class="error">${e.message}</p></div>`;
    return;
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  showTitle();
})();

// PWA 설치 프롬프트
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstall = e;
  const btn = document.getElementById('install-btn');
  if (btn) btn.classList.remove('hidden');
});

function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content; }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

// ---------- 타이틀 ----------
function showTitle() {
  run = null; battle = null;
  const weapons = Object.entries(DB.weapons).filter(([k]) => !k.startsWith('_'));
  app.innerHTML = '';
  app.append(h(`
    <div class="screen title-screen">
      <div class="title-art">🌲🌕🌲</div>
      <h1>REDHOOD</h1>
      <p class="subtitle">빨간망토의 모험</p>
      ${hasSave() ? `<button class="btn primary" id="continue-btn">이어하기</button>` : ''}
      <p class="pick-label">무기를 선택하고 숲으로</p>
      <div class="weapon-list">
        ${weapons.map(([id, w]) => `
          <button class="weapon-card" data-weapon="${id}">
            <span class="weapon-name">${esc(w.name)} <small>${esc(w.title)}</small></span>
            <span class="weapon-desc">${esc(w.desc)}</span>
          </button>`).join('')}
      </div>
      <button class="btn ghost hidden" id="install-btn">📲 홈 화면에 설치</button>
      <p class="hint">iOS는 공유 버튼 → "홈 화면에 추가"</p>
    </div>`));
  app.querySelectorAll('.weapon-card').forEach(btn => {
    btn.addEventListener('click', () => { run = newRun(btn.dataset.weapon); saveRun(run); showMap(); });
  });
  const cont = document.getElementById('continue-btn');
  if (cont) cont.addEventListener('click', () => { const r = loadRun(); if (r) { run = r; showMap(); } });
  const install = document.getElementById('install-btn');
  if (install) install.addEventListener('click', async () => {
    if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; install.classList.add('hidden'); }
  });
  if (deferredInstall && install) install.classList.remove('hidden');
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
        <span>🌲 어두운 숲 — ${run.floor}/${run.map.length}층</span>
        <span class="hp">❤️ ${run.hp}/${run.maxHp}</span>
      </header>
      <div class="map-scroll">${rows.join('')}</div>
      <footer class="bottombar">
        <button class="btn ghost" id="deck-btn">덱 보기 (${run.deck.length})</button>
        <button class="btn ghost" id="abandon-btn">런 포기</button>
      </footer>
    </div>`));
  app.querySelectorAll('.map-node:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = parseInt(btn.dataset.floor, 10);
      const node = run.map[f - 1][parseInt(btn.dataset.idx, 10)];
      run.floor = f;
      enterNode(node.type);
    });
  });
  document.getElementById('deck-btn').addEventListener('click', showDeckModal);
  document.getElementById('abandon-btn').addEventListener('click', () => {
    if (confirm('런을 포기할까요?')) { clearSave(); showTitle(); }
  });
  const scroll = app.querySelector('.map-scroll');
  const nextRow = app.querySelector('.map-row.next');
  if (nextRow) scroll.scrollTop = nextRow.offsetTop - scroll.clientHeight / 2;
}

function showDeckModal() {
  const counts = {};
  for (const c of run.deck) counts[c.id] = (counts[c.id] || 0) + 1;
  const items = Object.entries(counts).map(([id, n]) => {
    const c = DB.cardById[id];
    return `<li><b>${esc(c.name)}</b>${n > 1 ? ` ×${n}` : ''} <span class="modal-text">${esc(c.text)}</span></li>`;
  }).join('');
  const modal = h(`
    <div class="modal-back">
      <div class="modal">
        <h3>덱 (${run.deck.length}장)</h3>
        <ul class="deck-list">${items}</ul>
        <button class="btn primary" id="modal-close">닫기</button>
      </div>
    </div>`);
  app.append(modal);
  document.getElementById('modal-close').addEventListener('click', () =>
    app.querySelector('.modal-back').remove());
}

function enterNode(type) {
  currentNodeType = type;
  if (type === 'rest') { showRest(); return; }
  const encounter = rollEncounter(run, type);
  battle = createBattle(run, encounter);
  selectedCard = -1;
  renderBattle();
}

// ---------- 휴식 ----------
function showRest() {
  app.innerHTML = '';
  app.append(h(`
    <div class="screen center rest-screen">
      <div class="rest-art">🔥</div>
      <h2>모닥불</h2>
      <p>잠시 숨을 돌린다.</p>
      <button class="btn primary" id="rest-btn">휴식 (HP ${Math.floor(run.maxHp * DB.act1.rest.healRatio)} 회복)</button>
    </div>`));
  document.getElementById('rest-btn').addEventListener('click', () => {
    const healed = applyRest(run);
    saveRun(run);
    app.querySelector('.rest-screen').innerHTML =
      `<div class="rest-art">✨</div><h2>+${healed} HP</h2><p>❤️ ${run.hp}/${run.maxHp}</p>
       <button class="btn primary" id="rest-done">숲으로</button>`;
    document.getElementById('rest-done').addEventListener('click', showMap);
  });
}

// ---------- 전투 ----------
function resourceBarHtml() {
  const res = DB.weapons[battle.weaponId].resource;
  const p = battle.player;
  if (res.type === 'frenzy') {
    const stage = frenzyStage(battle);
    const segs = [];
    for (let i = 1; i <= DB.frenzy.max; i++) {
      segs.push(`<i class="fseg ${i <= p.frenzy ? 'on s-' + stage.id : ''}"></i>`);
    }
    return `<div class="frenzy-wrap"><span class="res-label">열광 ${p.frenzy} <b class="stage-${stage.id}">${stage.name}</b></span>
      <div class="frenzy-bar">${segs.join('')}</div></div>`;
  }
  if (res.type === 'ammo') {
    const pips = [];
    for (let i = 1; i <= res.max; i++) pips.push(`<i class="pip ${i <= p.resource ? 'on' : ''}"></i>`);
    return `<div class="res-wrap"><span class="res-label">탄환 ${p.resource}/${res.max}</span><div class="pips">${pips.join('')}</div></div>`;
  }
  return `<div class="res-wrap"><span class="res-label">기름 <b class="oil">${p.resource}</b>/${res.max} <small>(+${res.turnStartGain}/턴)</small></span></div>`;
}

function statusesHtml(unit) {
  return Object.entries(unit.statuses).map(([k, v]) => {
    const s = DB.statuses[k];
    return s ? `<span class="status" title="${esc(s.desc)}">${s.icon}${v}</span>` : '';
  }).join('');
}

function intentHtml(e) {
  const dmg = previewMoveDamage(battle, e);
  const parts = [];
  if (dmg) parts.push(`⚔️${dmg}`);
  for (const ef of e.nextMove.effects) {
    if (ef.op === 'block') parts.push(`🛡${ef.amount}`);
    if (ef.op === 'applyStatus') parts.push(ef.target === 'self' ? '↑' : '☠');
  }
  return `<span class="intent" title="${esc(e.nextMove.name)}">${parts.join(' ') || '❓'}</span>`;
}

function cardCostHtml(card) {
  const res = DB.weapons[battle.weaponId].resource;
  if (res.type === 'frenzy') {
    const delta = (card.cost || 0) + (card.frenzy || 0);
    if (delta > 0) return `<span class="cost frenzy-up">+${delta}🔥</span>`;
    if (delta < 0) return `<span class="cost frenzy-down">${delta}🔥</span>`;
    return `<span class="cost zero">0</span>`;
  }
  return `<span class="cost">${card.cost}${res.icon}</span>`;
}

function renderBattle() {
  const p = battle.player;
  app.innerHTML = '';
  app.append(h(`
    <div class="screen battle-screen">
      <header class="topbar">
        <span>${NODE_META[currentNodeType].icon} ${run.floor}층</span>
        <span class="hp">❤️ ${p.hp}/${p.maxHp} ${p.block > 0 ? `🛡${p.block}` : ''}</span>
      </header>
      <div class="enemy-zone">
        ${battle.enemies.map(e => `
          <button class="enemy ${selectedCard >= 0 ? 'targetable' : ''}" data-uid="${e.uid}">
            ${intentHtml(e)}
            <span class="enemy-art">${e.tier === 'boss' ? '🐺' : e.tier === 'elite' ? '💀' : '🌑'}</span>
            <span class="enemy-name">${esc(e.name)}</span>
            <span class="bar"><i style="width:${Math.max(0, e.hp / (e.maxHpInit || e.hp) * 100)}%"></i></span>
            <span class="enemy-hp">${e.hp} ${e.block > 0 ? `🛡${e.block}` : ''} ${statusesHtml(e)}</span>
          </button>`).join('')}
      </div>
      <div class="player-zone">
        ${resourceBarHtml()}
        <span class="player-statuses">${statusesHtml(p)}</span>
      </div>
      <div class="hand-zone">
        ${battle.hand.map((c, i) => `
          <button class="card r-${c.rarity} ${i === selectedCard ? 'selected' : ''} ${canPlay(battle, c) ? '' : 'unplayable'}" data-idx="${i}">
            ${cardCostHtml(c)}
            <span class="card-name">${esc(c.name)}</span>
            <span class="card-text">${esc(c.text)}</span>
          </button>`).join('')}
      </div>
      <footer class="bottombar">
        <span class="pile">${battle.drawPile.length}🂠</span>
        <span class="turn-hint" id="hint">${selectedCard >= 0 ? '적을 탭하거나 카드를 다시 탭해 사용' : ''}</span>
        <button class="btn primary" id="end-turn">턴 종료</button>
        <span class="pile">${battle.discardPile.length}🗑</span>
      </footer>
    </div>`));

  app.querySelectorAll('.card').forEach(el => {
    el.addEventListener('click', () => {
      const i = parseInt(el.dataset.idx, 10);
      if (selectedCard === i) { tryPlay(i, null); return; }
      selectedCard = i; renderBattle();
    });
  });
  app.querySelectorAll('.enemy').forEach(el => {
    el.addEventListener('click', () => {
      if (selectedCard >= 0) tryPlay(selectedCard, el.dataset.uid);
    });
  });
  document.getElementById('end-turn').addEventListener('click', () => {
    selectedCard = -1;
    endTurn(battle);
    afterAction();
  });
}

function tryPlay(idx, targetUid) {
  const card = battle.hand[idx];
  if (!card) { selectedCard = -1; renderBattle(); return; }
  if (!canPlay(battle, card)) { selectedCard = -1; renderBattle(); return; }
  selectedCard = -1;
  playCard(battle, idx, targetUid);
  afterAction();
}

function afterAction() {
  if (!battle.over) { renderBattle(); return; }
  run.hp = battle.player.hp;
  if (battle.result === 'defeat') { clearSave(); showEnd(false); return; }
  if (currentNodeType === 'boss') { clearSave(); showEnd(true); return; }
  showReward();
}

// ---------- 보상 ----------
function showReward() {
  const choices = rollCardRewards(run, currentNodeType);
  app.innerHTML = '';
  app.append(h(`
    <div class="screen center reward-screen">
      <h2>승리!</h2>
      <p>전리품 — 카드 한 장을 덱에 넣는다</p>
      <div class="reward-cards">
        ${choices.map((c, i) => `
          <button class="card r-${c.rarity}" data-idx="${i}">
            <span class="cost">${c.weapon === 'scythe' ? ((c.cost || 0) + (c.frenzy || 0) >= 0 ? '+' : '') + ((c.cost || 0) + (c.frenzy || 0)) + '🔥' : c.cost}</span>
            <span class="card-name">${esc(c.name)}</span>
            <span class="card-text">${esc(c.text)}</span>
            <span class="card-rarity">${c.rarity}</span>
          </button>`).join('')}
      </div>
      <button class="btn ghost" id="skip-btn">넘어가기</button>
    </div>`));
  app.querySelectorAll('.reward-cards .card').forEach(el => {
    el.addEventListener('click', () => {
      run.deck.push(choices[parseInt(el.dataset.idx, 10)]);
      saveRun(run); showMap();
    });
  });
  document.getElementById('skip-btn').addEventListener('click', () => { saveRun(run); showMap(); });
}

// ---------- 엔딩 ----------
function showEnd(victory) {
  app.innerHTML = '';
  app.append(h(`
    <div class="screen center end-screen">
      <div class="rest-art">${victory ? '🌅' : '🥀'}</div>
      <h2>${victory ? '늑대를 쓰러뜨렸다' : '숲에 삼켜졌다'}</h2>
      <p>${victory ? '소녀는 아침 해를 본다. — 1막 클리어' : `${run.floor}층에서 쓰러짐`}</p>
      <button class="btn primary" id="restart-btn">${victory ? '새로운 런' : '다시 도전'}</button>
    </div>`));
  document.getElementById('restart-btn').addEventListener('click', showTitle);
}
