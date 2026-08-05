// main.js — 부트스트랩 + 화면(UI) 렌더링 (v2: 주사위)
import { loadAll, DB } from './data.js';
import { createBattle, reroll, toggleHold, confirmCategory, previewAll, intentOf } from './engine.js';
import { newRun, rollEncounter, rollRewards, applyRest, saveRun, loadRun, clearSave, hasSave } from './run.js';

const app = document.getElementById('app');
let run = null;
let battle = null;
let currentNodeType = null;
let selectedCat = null;

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
        <h3>${esc(cat.name)}${level > 1 ? ` <b class="lv">Lv${level}</b>` : ''}</h3>
        <p class="info-rule">${esc(cat.ruleText || '')}</p>
        <p class="info-ability">✨ ${esc(cat.abilityText || '부가 없음')}</p>
        ${level > 1 ? `<p class="modal-text">레벨 보정: 피해 ×${level} (부가 능력은 고정)</p>` : ''}
        <p class="modal-text">0점으로 확정하면 부가 능력은 발동하지 않는다.</p>
        <button class="btn primary" id="cat-info-close">닫기</button>
      </div>
    </div>`));
  const back = document.getElementById('cat-info');
  document.getElementById('cat-info-close').addEventListener('click', () => back.remove());
  back.addEventListener('click', (e) => { if (e.target === back) back.remove(); });
}

const PIPS = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' };

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
    .map(c => `<li><b>${esc(c.name)}</b> Lv${run.categories[c.id]} <span class="modal-text">${esc(c.abilityText || '')}</span></li>`)
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
  selectedCat = null;
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
function breakdownText(bd) {
  if (bd.isZero) return '0점 버리기';
  const parts = [`기본 ${bd.base}`];
  if (bd.gold) parts.push(`+금박 ${bd.gold}`);
  if (bd.level > 1) parts.push(`×Lv${bd.level}`);
  if (bd.mult !== 1) parts.push(`×${bd.mult}`);
  if (bd.bonus) parts.push(`+${bd.bonus}`);
  if (bd.flat) parts.push(`+${bd.flat}`);
  return parts.join(' ');
}

function renderBattle() {
  const p = battle.player;
  const e = battle.enemy;
  const previews = previewAll(battle);
  const lastR = battle.lastResult;
  app.innerHTML = '';
  app.append(h(`
    <div class="screen battle-screen">
      <header class="topbar">
        <span>${NODE_META[currentNodeType].icon} ${run.floor}층 · ${battle.turn}턴</span>
        <span class="relic-bar">${battle.relics.map(r => r.icon).join('')}</span>
        <span class="hp">❤️ ${p.hp}/${p.maxHp}${p.block > 0 ? ` 🛡${p.block}` : ''}${battle.pendingBuff > 0 ? ` ⚡+${battle.pendingBuff}` : ''}</span>
      </header>
      <div class="enemy-panel">
        <span class="intent">${intentOf(battle)} <small>${esc(e.nextMove.name)}</small></span>
        <span class="enemy-art">${e.tier === 'boss' ? '🐺' : e.tier === 'elite' ? '💀' : '🌑'}</span>
        <span class="enemy-name">${esc(e.name)}</span>
        <span class="bar"><i style="width:${Math.max(0, e.hp / e.maxHpInit * 100)}%"></i></span>
        <span class="enemy-hp">${e.hp}/${e.maxHpInit}</span>
        ${lastR ? `<span class="last-result">${esc(lastR.catName)}: ${breakdownText(lastR)} = <b>${lastR.total}</b> ${lastR.bonusHits.map(esc).join(' ')}</span>` : ''}
      </div>
      <div class="dice-zone">
        ${battle.dice.map((d, i) => {
          const def = battle.diceDefs[i];
          return `<button class="die ${d.held ? 'held' : ''} ${def.gold ? 'gold' : ''} ${def.id !== 'normal' && !def.gold ? 'special' : ''}" data-idx="${i}" title="${esc(def.name)}">
            <span class="pip">${PIPS[d.face] || d.face}</span>
            <small>${d.held ? '홀드' : ''}</small>
          </button>`;
        }).join('')}
      </div>
      <div class="roll-bar">
        <button class="btn primary" id="reroll-btn" ${battle.rollsLeft <= 0 ? 'disabled' : ''}>
          🎲 리롤 (${battle.rollsLeft})
        </button>
        <span class="turn-hint">${selectedCat ? '한 번 더 탭하면 확정' : '주사위 탭=홀드 · 족보 탭=선택'}</span>
      </div>
      <div class="sheet-zone">
        ${previews.map(({ cat, level, seal, locked, bd }) => `
          <button class="sheet-row ${locked ? 'used' : ''} ${selectedCat === cat.id ? 'selected' : ''} ${!locked && bd.total === 0 ? 'zero' : ''}"
            data-cat="${cat.id}" data-locked="${locked ? 1 : 0}">
            <span class="sheet-main">
              <span class="sheet-name">${esc(cat.name)}${level > 1 ? ` <b class="lv">Lv${level}</b>` : ''}</span>
              <span class="sheet-ability">${esc(cat.abilityText || '')}</span>
            </span>
            <span class="sheet-preview">${seal ? `🔒${seal}` : bd.total > 0 ? bd.total : '0'}</span>
          </button>`).join('')}
      </div>
    </div>`));

  app.querySelectorAll('.die').forEach(el => {
    el.addEventListener('click', () => { toggleHold(battle, parseInt(el.dataset.idx, 10)); renderBattle(); });
  });
  document.getElementById('reroll-btn').addEventListener('click', () => {
    selectedCat = null;
    if (reroll(battle)) renderBattle();
  });
  app.querySelectorAll('.sheet-row').forEach(el => {
    const catId = el.dataset.cat;
    addLongPress(el, () => showCategoryInfo(catId, battle.categories[catId] || 1));
    el.addEventListener('click', () => {
      if (el.dataset.locked === '1') return; // 봉인된 족보: 탭 무시 (길게 눌러 설명은 가능)
      if (selectedCat !== catId) { selectedCat = catId; renderBattle(); return; }
      selectedCat = null;
      confirmCategory(battle, catId);
      afterAction();
    });
  });
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
              c.newLevel > 1 ? `강화: 점수 ×${c.newLevel}` : `새 족보 획득<br>${esc(c.item.abilityText || '')}`
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
