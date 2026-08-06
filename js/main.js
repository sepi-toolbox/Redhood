// main.js — 부트스트랩 + 화면(UI) 렌더링 (v0.5: 다중 적·타겟팅·연출)
import { loadAll, DB } from './data.js';
import { createBattle, initialRoll, reroll, toggleHold, confirmCategory, enemyPhase, previewAll, intentOf, aliveEnemies, isAoE } from './engine.js';
import { newRun, rollEncounter, rollRewards, applyRest, restHealAmount, saveRun, loadRun, clearSave, hasSave, chooseWeapon, offerWeapons, pickEvent, applyEventEffects, applyRelicPickup, rollShopStock, bossRelicChoices, bossLegendaryChoices, loadMeta, setEnlight, gainEnlight, advanceAct, themeOf, finalEncounter, coinReward, reachableNodes } from './run.js';

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
// 등급 표기 (성권 지시: 족보·주사위 4등급, 유물은 일반/정예 2등급, epic=전설)
const TIER_KO = { common: '커먼', uncommon: '언커먼', rare: '레어', epic: '전설', normal: '일반', elite: '정예' };
const SHINY = { uncommon: 'shiny-un', rare: 'shiny-rare', epic: 'shiny-epic', elite: 'shiny-epic', normal: '' };

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
        <p class="modal-text">예시: ${(cat.example || []).map(f => PIPS[f]).join(' ')} · 등급: ${esc(TIER_KO[v.tier] || v.tier || '')}</p>
        <p class="modal-text">성립하지 않으면 선택할 수 없다. 같은 족보의 다른 변형을 얻으면 나란히 추가된다.</p>
        <button class="btn primary" id="cat-info-close">닫기</button>
      </div>
    </div>`));
  const back = document.getElementById('cat-info');
  document.getElementById('cat-info-close').addEventListener('click', () => back.remove());
  back.addEventListener('click', (e) => { if (e.target === back) back.remove(); });
}

// ---------- 타이틀 ----------
const ENLIGHT_DESC = [
  '엘리트가 더 자주 나타난다', '모든 일반 적 공격력 +15%', '모든 엘리트 공격력 +15%', '보스 공격력 +15%',
  '보스 처치 회복 50% → 15%', 'HP 30%를 잃은 채 시작', '모든 일반 적 체력 +20%', '모든 엘리트 체력 +20%',
  '모든 보스 체력 +20%', '주사위 하나가 저주 주사위로', '휴식 회복량 -50%',
  '일반의 언커먼·엘리트의 레어 확률 절반', '적이 주는 🪙 -25%', '최대 HP -10%',
  '이벤트의 대가가 가혹해진다', '상점 가격 증가', '일반 적에게 계몽 패턴', '엘리트에게 계몽 패턴',
  '보스에게 계몽 패턴', '최종 보스가 두 마리',
];

function showTitle() {
  run = null; battle = null;
  const enlight = loadMeta().enlight;
  app.innerHTML = '';
  app.append(h(`
    <div class="screen title-screen">
      <img class="logo" src="assets/ui/logo.png" alt="REDHOOD" draggable="false">
      <p class="subtitle">빨간망토의 모험 — 주사위판</p>
      ${hasSave() ? `<button class="btn primary" id="continue-btn">이어하기</button>` : ''}
      <button class="btn primary" id="start-btn">숲으로 들어간다</button>
      <button class="btn ghost" id="enlight-btn">🔮 계몽 ${enlight}</button>
      <p class="hint">야찌 족보로 점수를 내면, 그만큼 늑대가 아프다.</p>
      <button class="btn ghost hidden" id="install-btn">📲 홈 화면에 설치</button>
      <p class="hint">iOS는 공유 버튼 → "홈 화면에 추가"</p>
    </div>`));
  document.getElementById('start-btn').addEventListener('click', () => { run = newRun(); showIntro(); });
  document.getElementById('enlight-btn').addEventListener('click', showEnlightModal);
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

// ---------- 캐릭터 아트 (v0.30): 이미지 보유 시 이모지 대체 ----------
const ENEMY_ART = new Set(['stray_dog', 'wolf', 'crow', 'will_o_wisp', 'forest_spider', 'thorn_bush', 'twig_golem', 'brook_sprite', 'leech', 'rat_swarm', 'living_broom']);
const BG_ART = new Set(['forest']); // 전투 테마 배경 보유 목록
const NPC_ART = { '잿빛 방물장수': 'peddler', '부러진 이정표': 'signpost', '낯익은 환영': 'redhood' };
function enemyArtHtml(e) {
  return ENEMY_ART.has(e.defId)
    ? `<img class="enemy-art enemy-art-img" src="assets/enemies/${e.defId}.png" alt="" draggable="false">`
    : `<span class="enemy-art">${e.art}</span>`;
}
function npcArtHtml(npc) {
  const f = NPC_ART[npc.name];
  return f
    ? `<img class="npc-art npc-art-img" src="assets/npc/${f}.png" alt="" draggable="false">`
    : `<span class="npc-art">${npc.art}</span>`;
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
        <span>${run.floor > 0 ? `🪙${run.coins}` : ''}</span>
      </header>
      <div class="npc-stage">
        ${npcArtHtml(npc)}
        <div class="npc-overlay">
          <span class="npc-name">${esc(npc.name)}</span>
          <div class="dialogue-panel">${linesHtml}</div>
        </div>
      </div>
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
        <span class="choice-main">${ico('weapon_' + w.id, 'ico-weapon')} <b>${esc(w.name)}</b></span>
        <span class="choice-sub">${esc(w.desc)}</span>
        <span class="choice-cats">📜 ${Object.entries(w.start).map(([cid, vid]) => esc(variantName(cid, vid))).join(' · ')}</span>
      </button>`).join(''))));
  app.querySelectorAll('.weapon-choice').forEach(el => {
    el.addEventListener('click', () => {
      const w = weapons[parseInt(el.dataset.idx, 10)];
      chooseWeapon(run, w.id);
      saveRun(run);
      showEventResult(intro.npc,
        `<p class="npc-line">${esc(intro.resultLine || '')}</p>`,
        null,
        `<div class="gain-box"><span class="event-effect">${ico('weapon_' + w.id, 'ico-weapon')} ${esc(w.name)} — ${Object.entries(w.start).map(([cid, vid]) => esc(variantName(cid, vid))).join(' · ')}</span></div>`);
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
        `<p class="npc-line">${esc(ch.result || '')}</p>`,
        pendingDie,
        messages.length ? `<div class="gain-box"><span class="event-effect">${messages.map(esc).join(' · ')}</span></div>` : '');
    });
  });
}

// 선택 결과 화면 — pendingDie가 있으면 '길을 나선다' 전에 교체 모달
// v0.37: 획득 표시는 오버레이가 아니라 아래 선택지 영역(gainHtml)으로 — 대사·이름만 이미지 위에
function showEventResult(npc, linesHtml, pendingDie = null, gainHtml = '') {
  const choicesHtml = `${gainHtml}<button class="btn primary" id="event-done">길을 나선다</button>`;
  // v0.34: 같은 NPC의 무대가 이미 떠 있으면 화면 전환 없이 대사·선택지만 교체
  const stage = app.querySelector('.npc-stage');
  const sameNpc = stage && app.querySelector('.npc-name')?.textContent === npc.name;
  if (sameNpc) {
    app.querySelector('.npc-overlay .dialogue-panel').innerHTML = linesHtml;
    app.querySelector('.choice-zone').innerHTML = choicesHtml;
  } else {
    app.innerHTML = '';
    app.append(h(eventFrame(npc, linesHtml, choicesHtml)));
  }
  document.getElementById('event-done').addEventListener('click', () => {
    if (pendingDie) showReplaceDie(pendingDie, () => { saveRun(run); showMap(); });
    else { saveRun(run); showMap(); }
  }, { once: true });
}

// ---------- 계몽 설정 (치트 — 원래는 클리어로만 상승) ----------
function showEnlightModal() {
  const render = () => {
    const cur = loadMeta().enlight;
    const back = document.getElementById('enlight-modal');
    if (back) back.remove();
    app.append(h(`
      <div class="modal-back" id="enlight-modal">
        <div class="modal">
          <h3>🔮 계몽 — 현재 ${cur}단계</h3>
          <p class="modal-text">3막 보스를 처치할 때마다 +1. 높을수록 숲이 가혹해진다.<br>⚠ 아래 버튼은 테스트용 치트 — 다음 런부터 적용.</p>
          <div class="enlight-ctl">
            <button class="btn" id="enl-minus">−</button>
            <span class="enlight-num">${cur}</span>
            <button class="btn" id="enl-plus">＋</button>
          </div>
          <ul class="deck-list enlight-list">
            ${ENLIGHT_DESC.map((d, i) => `<li class="${i < cur ? 'on' : ''}">${i + 1}. ${esc(d)}</li>`).join('')}
          </ul>
          <button class="btn primary" id="enl-close">닫기</button>
        </div>
      </div>`));
    document.getElementById('enl-minus').addEventListener('click', () => { setEnlight(cur - 1); render(); });
    document.getElementById('enl-plus').addEventListener('click', () => { setEnlight(cur + 1); render(); });
    document.getElementById('enl-close').addEventListener('click', () => {
      document.getElementById('enlight-modal').remove();
      showTitle();
    });
  };
  render();
}

// ---------- 상점 (v0.13): 커먼~레어 주사위 + 일반 유물, 화폐는 🪙 ----------
function showShop() {
  const stock = rollShopStock(run);
  const sold = new Set();
  const merchant = { name: '잿빛 방물장수', art: '🧙' };
  const render = () => {
    const rows = stock.map((s, i) => {
      const isSold = sold.has(i);
      const afford = run.coins >= s.price;
      const tierTag = TIER_KO[s.item.tier] || s.item.tier;
      const name = s.kind === 'die' ? `🎲 ${s.item.name}` : `${s.item.icon} ${s.item.name}`;
      const sub = s.kind === 'die' ? `[${s.item.faces.join(',')}] ${s.item.desc}` : s.item.desc;
      return `
        <button class="sheet-row choice-row shop-item ${isSold || !afford ? 'used' : ''}" data-idx="${i}" ${isSold || !afford ? 'disabled' : ''}>
          <span class="choice-main">${esc(name)} <small class="cat-tag">${esc(tierTag)}</small><span class="shop-price">${isSold ? '판매됨' : `🪙${s.price}`}</span></span>
          <span class="choice-sub">${esc(sub)}</span>
        </button>`;
    }).join('') + `<button class="btn ghost" id="shop-leave">🌲 떠난다</button>`;
    app.innerHTML = '';
    app.append(h(eventFrame(merchant,
      `<p class="npc-line">"또 만났구나, 빨간 두건. 골라 보렴 — 이번엔 값을 먼저 받으마."</p>`,
      rows)));
    app.querySelector('.event-screen').classList.add('shop-screen');
    app.querySelectorAll('.shop-item:not([disabled])').forEach(el => {
      el.addEventListener('click', () => {
        const i = parseInt(el.dataset.idx, 10);
        const s = stock[i];
        if (sold.has(i) || run.coins < s.price) return;
        if (s.kind === 'relic') {
          run.coins -= s.price;
          sold.add(i);
          applyRelicPickup(run, s.item);
          saveRun(run);
          render();
        } else {
          // 주사위: 교체를 마쳐야 결제 (취소하면 무료)
          showReplaceDie(s.item,
            () => { run.coins -= s.price; sold.add(i); saveRun(run); render(); },
            () => render());
        }
      });
    });
    document.getElementById('shop-leave').addEventListener('click', () => { saveRun(run); showMap(); });
  };
  render();
}

// ---------- 보스 전리품: 정예 유물 → 전설(에픽) 족보/주사위 ----------
function showLootCards(title, subtitle, choices, onPick) {
  app.innerHTML = '';
  app.append(h(`
    <div class="screen center reward-screen">
      <h2>${title}</h2>
      <p>${esc(subtitle)}</p>
      <div class="reward-cards">
        ${choices.map((c, i) => {
          const t = c.item.tier;
          const isCat = c.kind === 'category';
          return `
          <button class="card pop-in r-${t} ${SHINY[t] || ''}" data-idx="${i}" style="--d:${0.12 + i * 0.22}s">
            <span class="cost">${c.kind === 'die' ? '🎲 주사위' : c.kind === 'relic' ? (c.item.icon || '🪬') + ' 유물' : `📜 ${esc(c.item.cat.name)}`}</span>
            <span class="card-name">${esc(isCat ? c.item.variant.name : c.item.name)}</span>
            <span class="card-text">${
              c.kind === 'die' ? `[${c.item.faces.join(',')}]<br>${esc(c.item.desc)}` :
              c.kind === 'relic' ? esc(c.item.desc) : `✨ ${esc(c.item.variant.abilityText || '')}`
            }</span>
            <span class="card-rarity">${esc(TIER_KO[t] || t)}</span>
          </button>`;
        }).join('')}
      </div>
      <button class="btn ghost pop-in" id="skip-btn" style="--d:${0.2 + choices.length * 0.22}s">넘어가기</button>
    </div>`));
  app.querySelectorAll('.reward-cards .card').forEach(el => {
    el.addEventListener('click', () => onPick(choices[parseInt(el.dataset.idx, 10)]));
  });
  document.getElementById('skip-btn').addEventListener('click', () => onPick(null));
}

function showBossReward(onDone) {
  const stage2 = () => {
    const legend = bossLegendaryChoices(run);
    if (legend.length === 0) return onDone();
    showLootCards('🏆 전리품', '전설의 유산 — 하나를 고른다', legend, (c) => {
      if (!c) return onDone();
      if (c.kind === 'category') {
        (run.categories[c.item.cat.id] = run.categories[c.item.cat.id] || []).push(c.item.variant.id);
        onDone();
      } else {
        showReplaceDie(c.item, onDone, onDone);
      }
    });
  };
  const relics = bossRelicChoices(run);
  if (relics.length === 0) return stage2();
  showLootCards('🏆 전리품', '정예 유물 — 하나를 고른다', relics, (c) => {
    if (c) applyRelicPickup(run, c.item);
    stage2();
  });
}

// 보스 처치 후: 1·2막 → 회복하고 다음 막 / 3막 → 계몽 +1, 최후의 어둠
function afterBossVictory() {
  if (run.act < 3) {
    const healed = advanceAct(run);
    saveRun(run);
    const theme = themeOf(run);
    app.innerHTML = '';
    app.append(h(`
      <div class="screen center end-screen">
        <div class="rest-art">${theme.icon}</div>
        <h2>${run.act}막 — ${esc(theme.name)}</h2>
        <p>상처를 여미고 다시 걷는다. <b class="coin-gain">+${healed} HP</b> (❤️ ${run.hp}/${run.maxHp})</p>
        <button class="btn primary" id="next-act-btn">더 깊은 곳으로</button>
      </div>`));
    document.getElementById('next-act-btn').addEventListener('click', showMap);
  } else {
    const n = gainEnlight();
    clearSave(); // 최종전은 세이브 없음 — 여기서부터는 돌아갈 수 없다
    app.innerHTML = '';
    app.append(h(`
      <div class="screen center end-screen">
        <div class="rest-art">🔮</div>
        <h2>계몽 — ${n}단계</h2>
        <p>세 번째 어둠이 걷혔다. 빨간 두건은 알게 되었다.<br>
        숲의 끝에서, <b>이름 없는 공포</b>가 기다린다는 것을.</p>
        <p class="hint">이 존재는 쓰러지지 않는다. 버틸 수 있는 만큼 버텨라.</p>
        <button class="btn primary" id="final-btn">마주한다</button>
      </div>`));
    document.getElementById('final-btn').addEventListener('click', startFinalBattle);
  }
}

function startFinalBattle() {
  run.act = 4;
  currentNodeType = 'final';
  battle = createBattle(run, finalEncounter(run));
  selectedCat = null; busy = false;
  targetUid = aliveEnemies(battle)[0]?.uid || null;
  renderBattle();
}

function showFinalEnd(turns) {
  const enlight = loadMeta().enlight;
  app.innerHTML = '';
  app.append(h(`
    <div class="screen center end-screen">
      <div class="rest-art">🌑</div>
      <h2>심연에 삼켜졌다</h2>
      <p>이름 없는 공포 앞에서 <b class="coin-gain">${turns}턴</b>을 버텼다.<br>숲은 끝났고, 빨간 두건은 계몽했다. (🔮 ${enlight})</p>
      <button class="btn primary" id="restart-btn">새로운 런</button>
    </div>`));
  document.getElementById('restart-btn').addEventListener('click', showTitle);
}

// ---------- 아이콘 아트 (v0.24): 이모지 자리 → 그림 아이콘 ----------
function ico(name, cls = '') {
  return `<img class="ico ${cls}" src="assets/icons/${name}.png" alt="" draggable="false">`;
}
// 적 의도 문자열(engine.intentOf)의 이모지를 그림으로 치환
function iconifyIntent(s) {
  return s
    .replaceAll('⚔️', ico('intent_attack', 'ico-intent'))
    .replaceAll('🛡', ico('intent_defend', 'ico-intent'))
    .replaceAll('🌀', ico('intent_confuse', 'ico-intent'))
    .replaceAll('💪', ico('intent_empower', 'ico-intent'))
    .replaceAll('💚', ico('intent_heal', 'ico-intent'))
    .replaceAll('❓', ico('intent_unknown', 'ico-intent'));
}

// ---------- 맵 ----------
const NODE_META = {
  battle: { icon: ico('node_battle', 'ico-node'), label: '전투' },
  elite: { icon: ico('node_elite', 'ico-node'), label: '엘리트' },
  rest: { icon: ico('node_rest', 'ico-node'), label: '휴식' },
  event: { icon: ico('node_event', 'ico-node'), label: '만남' },
  shop: { icon: ico('node_shop', 'ico-node'), label: '상점' },
  boss: { icon: ico('node_boss', 'ico-node'), label: '보스' },
  final: { icon: '🌑', label: '최후' },
};

// v0.26: 슬더스식 분기 지도 — 양피지 위 점선 잉크 길 + 메달 도장 노드
const MAP_ROW_H = 78, MAP_PAD_TOP = 26, MAP_PAD_BOT = 40;
let mapResizeObs = null; // v0.29: 캔버스 크기 변화 시 잉크길 재작도 (노드-선 어긋남 근본 해결)
function mapJitter(f, i) { return (((f * 7 + i * 13) % 5) - 2) * 1.1; } // 손그림 흔들림 (결정적)
function mapNodeXY(canvasH, nd, f, i) {
  const x = 15 + nd.lane * 17.5 + mapJitter(f, i);          // % (lane 0~4 → 15%~85%)
  const y = canvasH - MAP_PAD_BOT - f * MAP_ROW_H - MAP_ROW_H / 2; // px (아래가 1층)
  return { x, y };
}
function showMap() {
  saveRun(run);
  const { floors, edges } = run.map;
  const F = floors.length;
  const canvasH = F * MAP_ROW_H + MAP_PAD_TOP + MAP_PAD_BOT;
  const reach = new Set(run.floor < F ? reachableNodes(run) : []);
  const nextFloorIdx = run.floor;                            // 다음으로 갈 층 인덱스
  const pathSet = new Set(run.path.map((i, f) => `${f}:${i}`));
  const nodesHtml = floors.map((fl, f) => fl.map((nd, i) => {
    const { x, y } = mapNodeXY(canvasH, nd, f, i);
    const onPath = pathSet.has(`${f}:${i}`);
    const isCur = run.floor > 0 && f === run.floor - 1 && i === run.pos;
    const state = f === nextFloorIdx && reach.has(i) ? 'reachable'
      : onPath ? 'trodden'
      : f < nextFloorIdx ? 'missed' : 'ahead';
    return `<button class="map-node2 ${state} ${nd.type === 'boss' ? 'boss-node' : ''}" data-f="${f}" data-i="${i}"
      style="left:${x}%;top:${y}px" ${state === 'reachable' ? '' : 'disabled'}
      aria-label="${NODE_META[nd.type].label}">
      ${ico('doodle_' + nd.type, 'ico-node')}
      ${isCur ? '<span class="you-marker n2">🧣</span>' : ''}
    </button>`;
  }).join('')).join('');
  app.innerHTML = '';
  app.append(h(`
    <div class="screen map-screen">
      <header class="topbar">
        <span>${themeOf(run).icon} ${run.act}막 · ${esc(themeOf(run).name)} ${run.floor}/${F}</span>
        <span class="relic-bar">${run.relics.map(id => DB.relicById[id].icon).join('')}</span>
        <span>🪙${run.coins} <span class="hp">❤️ ${run.hp}/${run.maxHp}</span></span>
      </header>
      <div class="map-scroll parchment">
        <div class="map-canvas" style="height:${canvasH}px">
          <svg class="map-links" width="100%" height="${canvasH}" aria-hidden="true"></svg>
          ${nodesHtml}
          <span class="start-label n2" style="top:${canvasH - 16}px">${run.floor === 0 ? '🧣 ' : ''}🌲 숲의 입구</span>
        </div>
      </div>
      <footer class="bottombar">
        <button class="btn ghost" id="bag-btn">🎲 가방</button>
        <button class="btn ghost" id="abandon-btn">런 포기</button>
      </footer>
    </div>`));
  // v0.29: 최초 작도는 레이아웃 확정 후 + 이후 크기 변화(주소창 접힘·회전·폰트 로드)마다 재작도
  drawMapLinks();
  requestAnimationFrame(drawMapLinks);
  if (mapResizeObs) mapResizeObs.disconnect();
  if (window.ResizeObserver) {
    mapResizeObs = new ResizeObserver(() => drawMapLinks());
    mapResizeObs.observe(app.querySelector('.map-canvas'));
  }
  app.querySelectorAll('.map-node2:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = parseInt(btn.dataset.f, 10), i = parseInt(btn.dataset.i, 10);
      run.floor = f + 1;
      run.pos = i;
      run.path[f] = i;
      enterNode(run.map.floors[f][i].type);
    });
  });
  document.getElementById('bag-btn').addEventListener('click', showBagModal);
  document.getElementById('abandon-btn').addEventListener('click', () => {
    if (confirm('런을 포기할까요?')) { clearSave(); showTitle(); }
  });
  // 다음 갈 층이 화면 가운데 오도록 스크롤 (시작은 맨 아래)
  const scroll = app.querySelector('.map-scroll');
  const target = app.querySelector('.map-node2.reachable');
  scroll.scrollTop = target ? target.offsetTop - scroll.clientHeight / 2 : canvasH;
}

// 노드 실제 좌표를 읽어 점선 잉크 길을 그린다 (지나온 길 진하게, 다음 길 강조)
function drawMapLinks() {
  const svg = app.querySelector('.map-links');
  if (!svg) return;
  const { edges } = run.map;
  const btns = {};
  app.querySelectorAll('.map-node2').forEach(b => { btns[`${b.dataset.f}:${b.dataset.i}`] = b; });
  // v0.32: 마진 정렬 — 아이콘 중심 = 요소 좌상단 + (반너비, 20px). transform 무관이라 애니메이션에 안전
  const center = b => ({ x: b.offsetLeft + b.offsetWidth / 2, y: b.offsetTop + 20 });
  const parts = [];
  edges.forEach((fl, f) => fl.forEach((tos, i) => tos.forEach(j => {
    const a = btns[`${f}:${i}`], b = btns[`${f + 1}:${j}`];
    if (!a || !b) return;
    const p1 = center(a), p2 = center(b);
    const mx = (p1.x + p2.x) / 2 + mapJitter(f, i + j), my = (p1.y + p2.y) / 2;
    const trodden = run.path[f] === i && run.path[f + 1] === j;
    const active = f === run.floor - 1 && i === run.pos; // 지금 위치에서 뻗는 길
    const first = run.floor === 0 && f === 0 ? false : active;
    parts.push(`<path d="M${p1.x},${p1.y - 24} Q${mx},${my} ${p2.x},${p2.y + 24}"
      class="ink ${trodden ? 'ink-done' : first ? 'ink-next' : ''}"/>`);
  })));
  svg.innerHTML = parts.join('');
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
  if (type === 'shop') { showShop(); return; }
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
      <div class="rest-art">${ico('node_rest', 'ico-big')}</div>
      <h2>모닥불</h2>
      <button class="btn primary" id="rest-btn">휴식 (HP ${restHealAmount(run)} 회복)</button>
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
  // v0.27: 재렌더 시 족보 목록 스크롤 위치 보존 (아래 족보 탭 → 맨 위로 튀는 문제)
  const prevSheetScroll = app.querySelector('.sheet-zone')?.scrollTop || 0;
  const previews = previewAll(battle);
  const lastR = battle.lastResult;
  const multi = aliveEnemies(battle).length > 1;
  // 방어도는 LoL식: HP바 끝에 회백색 실드 구간으로 겹쳐 표시 (넘치면 바 전체가 재비율)
  const barTotal = Math.max(p.maxHp, p.hp + p.block);
  const hpPct = Math.max(0, p.hp / barTotal * 100);
  const shieldPct = Math.max(0, Math.min(p.block, barTotal - p.hp) / barTotal * 100);
  app.innerHTML = '';
  app.append(h(`
    <div class="screen battle-screen" style="${(() => {
      // v0.35: 테마 배경 — 보유한 배경만, 어두운 오버레이로 눌러서 몬스터가 도드라지게
      const themeId = run.act <= 3 ? themeOf(run).id : null;
      return BG_ART.has(themeId)
        ? `background-image: linear-gradient(rgba(16, 12, 10, .34), rgba(16, 12, 10, .5) 42%, #14100f 76%), url('assets/bg/bg_${themeId}.jpg')`
        : '';
    })()}">
      <header class="topbar">
        <span>${NODE_META[currentNodeType].icon} ${run.floor}층 · ${battle.turn}턴</span>
        <span class="relic-bar">${battle.relics.map(r => r.icon).join('')}</span>
        <span>🪙${run.coins} <span class="hp">❤️</span></span>
      </header>
      <div class="enemy-zone">
        ${battle.enemies.filter(e => e.hp > 0 || (battle.lastHits || []).some(x => x.uid === e.uid && x.killed)).map(e => `
          <button class="enemy ${targetUid === e.uid && e.hp > 0 ? 'targeted' : ''}" data-uid="${e.uid}">
            ${targetUid === e.uid && e.hp > 0 ? '<span class="target-pin">▼</span>' : ''}
            <span class="intent">${iconifyIntent(intentOf(e))} <small>${esc(e.nextMove.hidden && !e.stunned ? '???' : e.nextMove.name)}</small></span>
            ${enemyArtHtml(e)}
            <span class="enemy-name">${esc(e.name)}</span>
            ${(() => {
              // 적 방어도 LoL식: HP 구간 끝에 회백색 실드 세그먼트
              const ebTotal = Math.max(e.maxHpInit, e.hp + e.block);
              const ehpPct = e.final ? 100 : Math.max(0, e.hp / ebTotal * 100);
              const eshPct = e.final ? 0 : Math.min(e.block, ebTotal - e.hp) / ebTotal * 100;
              return `<span class="bar t-${e.tier}"><i style="width:${ehpPct}%"></i>${e.block > 0 && !e.final ? `<b class="ebar-shield" style="left:${ehpPct}%;width:${eshPct}%"></b>` : ''}</span>`;
            })()}
            <span class="enemy-hp">${e.final ? '∞' : `${e.hp}/${e.maxHpInit}`}${(() => {
              const d = e.debuffs || {};
              const chips = [
                e.block > 0 ? `${ico('intent_defend')}${e.block}` : '', e.power > 0 ? `${ico('intent_empower')}+${e.power}` : '',
                d.weak > 0 ? `${ico('status_weak')}${d.weak}` : '', d.bleed > 0 ? `${ico('status_bleed')}${d.bleed}` : '', d.vulnerable > 0 ? `${ico('status_vulnerable')}${d.vulnerable}` : '',
              ].filter(Boolean).join(' ');
              return chips ? ` <span class="enemy-buffs">${chips}</span>` : '';
            })()}</span>
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
          const skinned = DIE_SKINS.has(def.id); // 전용 스킨 보유 시 테두리 구분 불필요
          return `<button class="die art ${blank ? 'blank' : ''} ${marked ? 'mark-reroll' : ''} ${d.confused ? 'confused' : ''} ${!skinned && def.gold ? 'gold' : ''} ${!skinned && def.id !== 'normal' && !def.gold ? 'special' : ''}"
            data-idx="${i}" title="${esc(def.name)}" style="--tilt:${blank ? 0 : dieTilts[i] || 0}deg">
            ${blank
              ? '<span class="pip-art empty"></span>'
              : `<img class="pip-art" src="${dieFaceSrc(def.id, d.face)}" alt="${d.face}" draggable="false">`}
            <small>${marked ? '다시' : d.confused ? `${ico('status_confuse')}혼란` : ''}</small>
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
      ${(() => {
        // 내 버프 칩 — 체력바 위, 길게 눌러 상세 (v0.19)
        const b = battle.buffs;
        const chips = [
          b.strength > 0 ? `${ico('status_strength')}${b.strength}` : '', b.focus > 0 ? `${ico('status_focus')}+${b.focus}` : '', b.regen > 0 ? `${ico('status_regen')}+${b.regen}` : '',
        ].filter(Boolean);
        return chips.length ? `<div class="buff-strip" id="buff-strip">${chips.map(c => `<span class="buff-chip">${c}</span>`).join('')}</div>` : '';
      })()}
      <div class="player-bar ${opts.playerHit ? 'hurt' : ''}">
        <span class="pb-side"></span>
        <div class="hp-gauge">
          <div class="hp-fill" style="width:${hpPct}%"></div>
          ${p.block > 0 ? `<div class="hp-shield" style="left:${hpPct}%; width:${shieldPct}%"></div>` : ''}
          <span class="hp-text">❤️ ${p.hp} / ${p.maxHp}${p.block > 0 ? `<span class="shield-num">${ico('status_block')}${p.block}</span>` : ''}</span>
        </div>
        <span class="pb-side">${battle.pendingBuff > 0 ? `⚡+${battle.pendingBuff}` : ''}</span>
      </div>
    </div>`));

  // 족보 목록 스크롤 복원 (v0.27) — 늦게 오는 리셋 대비 짧게 두 번 더 고정
  if (prevSheetScroll > 0) {
    const restoreSheetScroll = () => {
      const z = app.querySelector('.sheet-zone');
      if (z && Math.abs(z.scrollTop - prevSheetScroll) > 2) z.scrollTop = prevSheetScroll;
    };
    restoreSheetScroll();
    setTimeout(restoreSheetScroll, 60);
    setTimeout(restoreSheetScroll, 160);
  }
  updateComboHint(); // v0.42: 재렌더(리롤 등) 후에도 선택 족보의 구성 주사위 하이라이트 유지

  // 주사위 — v0.28: 탭 시 전체 재렌더 대신 제자리 갱신 (이미지 재생성 깜빡임 제거)
  app.querySelectorAll('.die').forEach(el => {
    el.addEventListener('click', () => {
      if (busy || !battle.rolled) return;
      toggleHold(battle, parseInt(el.dataset.idx, 10));
      updateDiceMarks();
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
  // 적 탭 = 표적 변경 (언제든, 확정과 무관) / 길게 누르면 행동 상세 (치트)
  app.querySelectorAll('.enemy').forEach(el => {
    addLongPress(el, () => showEnemyInfo(el.dataset.uid));
    el.addEventListener('click', () => {
      if (busy) return;
      const uid = el.dataset.uid;
      const alive = aliveEnemies(battle);
      if (!alive.some(e => e.uid === uid)) return;
      targetUid = uid;
      renderBattle();
    });
  });
  // 내 버프 — 체력바(또는 버프 칩) 길게 눌러 상세
  const pbEl = app.querySelector('.player-bar');
  if (pbEl) addLongPress(pbEl, showPlayerBuffs);
  const bsEl = document.getElementById('buff-strip');
  if (bsEl) addLongPress(bsEl, showPlayerBuffs);
  // 족보 — 선택 키는 (족보:변형) 조합, 같은 족보의 다른 변형은 별개 버튼
  app.querySelectorAll('.sheet-row').forEach(el => {
    const catId = el.dataset.cat;
    const variantId = el.dataset.variant;
    const key = `${catId}:${variantId}`;
    addLongPress(el, () => showCategoryInfo(catId, variantId));
    el.addEventListener('click', () => {
      if (busy || el.dataset.locked === '1') return;
      if (selectedCat !== key) { selectedCat = key; updateSheetSelection(); return; } // v0.28: 제자리 갱신
      tryConfirm(catId, variantId, targetUid);
    });
  });
}

// v0.28: 재렌더 없는 제자리 갱신 — 주사위 마킹 상태
function updateDiceMarks() {
  app.querySelectorAll('.die').forEach(el => {
    const i = parseInt(el.dataset.idx, 10);
    const d = battle.dice[i];
    if (d.confused) return; // 혼란 주사위는 상태 불변 (아이콘 유지)
    const marked = battle.rolled && !d.held;
    el.classList.toggle('mark-reroll', marked);
    const sm = el.querySelector('small');
    if (sm) sm.textContent = marked ? '다시' : '';
  });
  const rb = document.getElementById('reroll-btn');
  if (rb) rb.disabled = battle.rollsLeft <= 0 || battle.await || battle.dice.every(d => d.held);
}

// v0.28: 재렌더 없는 제자리 갱신 — 족보 선택 강조
function updateSheetSelection() {
  app.querySelectorAll('.sheet-row').forEach(el => {
    el.classList.toggle('selected', `${el.dataset.cat}:${el.dataset.variant}` === selectedCat);
  });
  const hint = app.querySelector('.hint-line');
  if (hint) hint.textContent = '한 번 더 탭하면 확정';
  updateComboHint();
}

// v0.42: 선택한 족보를 이루는 주사위를 은은히 하이라이트
function updateComboHint() {
  const dieEls = app.querySelectorAll('.die');
  dieEls.forEach(el => el.classList.remove('combo-hint'));
  if (!selectedCat || !battle || !battle.rolled || battle.over) return;
  const [cid, vid] = selectedCat.split(':');
  const row = previewAll(battle).find(x => x.cat.id === cid && x.variant.id === vid);
  if (!row || !row.bd || !(row.bd.total > 0)) return;
  for (const i of (row.bd.contributing || [])) dieEls[i]?.classList.add('combo-hint');
}

// ---------- 적 행동 상세 (치트): 적 길게 눌러 예고 행동의 실제 내용 확인 — ❓ 의문도 공개 ----------
const ENEMY_TIER_KO = { normal: '일반', elite: '정예', boss: '보스' };
function enemyEffectText(e, ef) {
  const weak = e.debuffs ? e.debuffs.weak : 0;
  switch (ef.op) {
    case 'damage': {
      const base = Math.round(ef.amount * (e.atkScale || 1));
      const final = Math.max(0, base + (e.power || 0) - weak);
      const parts = [];
      if (e.power > 0) parts.push(`+강화 ${e.power}`);
      if (weak > 0) parts.push(`-약화 ${weak}`);
      return `${ico('intent_attack')} 피해 ${final}` + (parts.length ? ` (기본 ${base} ${parts.join(' ')})` : '');
    }
    case 'block': return `${ico('intent_defend')} 방어 ${ef.amount} 획득`;
    case 'confuse': return `${ico('intent_confuse')} 혼란 — 다음 턴 내 주사위 ${ef.amount}개 뒤틀림`;
    case 'empower': return `${ico('intent_empower')} 강화 — 공격력 +${ef.amount} (전투 내 누적)`;
    case 'heal': return `${ico('intent_heal')} 자신 HP ${ef.amount} 회복`;
    default: return ef.op;
  }
}
// 내게 걸린 버프/디버프 상세 — 체력바 길게 누르기 (v0.19)
function showPlayerBuffs() {
  if (!battle) return;
  const b = battle.buffs;
  const confusedNow = battle.dice.filter(d => d.confused).length;
  const items = [
    b.strength > 0 ? `<li>${ico('status_strength')} 힘 ${b.strength} — 이번 전투 동안 모든 족보 피해 +${b.strength}</li>` : '',
    b.focus > 0 ? `<li>${ico('status_focus')} 집중 ${b.focus} — 이번 전투 동안 매 턴 리롤 +${b.focus}</li>` : '',
    b.regen > 0 ? `<li>${ico('status_regen')} 재생 ${b.regen} — 매 턴 시작 시 HP +${b.regen}</li>` : '',
    battle.player.block > 0 ? `<li>${ico('status_block')} 방어 ${battle.player.block} — 다음 적 행동까지 받는 피해 흡수</li>` : '',
    confusedNow > 0 ? `<li>${ico('status_confuse')} 혼란 — 이번 턴 주사위 ${confusedNow}개가 뒤틀려 다시 굴릴 수 없음</li>` : '',
    battle.pendingConfuse > 0 ? `<li>${ico('status_confuse')} 혼란 예고 — 다음 턴 주사위 ${battle.pendingConfuse}개가 뒤틀린다</li>` : '',
  ].filter(Boolean).join('');
  app.append(h(`
    <div class="modal-back" id="pbuff-info">
      <div class="modal">
        <h3>🧣 빨간 두건 <small class="cat-tag">걸린 효과</small></h3>
        <ul class="deck-list">${items || '<li class="modal-text">걸린 효과 없음</li>'}</ul>
        <p class="hint">힘·집중·재생은 이번 전투가 끝날 때까지 유지된다</p>
        <button class="btn primary" id="pbuff-close">닫기</button>
      </div>
    </div>`));
  const back = document.getElementById('pbuff-info');
  document.getElementById('pbuff-close').addEventListener('click', () => back.remove());
  back.addEventListener('click', (ev) => { if (ev.target === back) back.remove(); });
}

function showEnemyInfo(uid) {
  const e = battle && battle.enemies.find(x => x.uid === uid);
  if (!e || !e.nextMove) return;
  const mv = e.nextMove;
  const effects = mv.effects.map(ef => `<li>${enemyEffectText(e, ef)}</li>`).join(''); // enemyEffectText는 내부 생성 HTML(아이콘 포함)
  const d = e.debuffs || {};
  const status = [
    e.block > 0 ? `<li>${ico('intent_defend')} 방어 ${e.block} — 다음 행동까지 받는 피해 흡수</li>` : '',
    e.power > 0 ? `<li>${ico('intent_empower')} 강화 +${e.power} — 공격력 증가 (전투 내 누적)</li>` : '',
    d.weak > 0 ? `<li>${ico('status_weak')} 약화 ${d.weak} — 공격력 -${d.weak}</li>` : '',
    d.bleed > 0 ? `<li>${ico('status_bleed')} 출혈 ${d.bleed} — 행동할 때마다 ${d.bleed} 피해, 스택 -1씩 감소</li>` : '',
    d.vulnerable > 0 ? `<li>${ico('status_vulnerable')} 취약 ${d.vulnerable} — 받는 피해 +${d.vulnerable}</li>` : '',
    e.stunned ? '<li>💫 다음 행동 취소됨</li>' : '',
  ].filter(Boolean).join('');
  app.append(h(`
    <div class="modal-back" id="enemy-info">
      <div class="modal">
        <h3>${e.art} ${esc(e.name)} <small class="cat-tag">${ENEMY_TIER_KO[e.tier] || e.tier}${e.final ? ' · 무한' : ''}</small></h3>
        <p class="modal-text">${e.final ? '체력 ∞' : `HP ${e.hp}/${e.maxHpInit}`}</p>
        ${status ? `<p class="info-ability">걸린 효과</p><ul class="deck-list">${status}</ul>` : ''}
        <p class="info-ability">🔍 예고 행동: <b>${esc(mv.name)}</b>${mv.hidden ? ' <small class="cat-tag">(❓ 의문 — 치트로 공개)</small>' : ''}</p>
        <ul class="deck-list">${effects || '<li class="modal-text">아무것도 하지 않는다</li>'}</ul>
        ${e.escalation ? `<p class="modal-text">⚠ 매 턴 공격력 +${e.escalation} 누적 — 점점 강해진다</p>` : ''}
        ${e.enlightened ? `<p class="modal-text">🔮 계몽 상태 — 3번째 행동마다 강화 기술 사용</p>` : ''}
        <p class="hint">⚠ 치트 보기 — 숨겨진 정보(❓)까지 공개된다</p>
        <button class="btn primary" id="enemy-info-close">닫기</button>
      </div>
    </div>`));
  const back = document.getElementById('enemy-info');
  document.getElementById('enemy-info-close').addEventListener('click', () => back.remove());
  back.addEventListener('click', (ev) => { if (ev.target === back) back.remove(); });
}

// 굴림 연출: 낙하-텀블링-바운스 착지, 왼쪽부터 차례로 멈추며 값 공개
const dieTilts = [0, 0, 0, 0, 0]; // 착지 후 살짝 기울어진 각도 (물리감)
// 주사위 아트 (v0.21): 스킨별 6면 — 없는 스킨은 기본 눈(pip)으로 폴백
const DIE_SKINS = new Set(['normal', 'gold', 'cursed', 'fang', 'straw', 'ember', 'moonlit', 'bramble', 'lead', 'even', 'odd', 'high', 'ace']);
const dieFaceSrc = (defId, f) => DIE_SKINS.has(defId) ? `assets/dice/${defId}${f}.png` : `assets/dice/pip${f}.png`;
// 프리로드 (연출 중 깜빡임 방지)
for (let f = 1; f <= 6; f++) {
  const im = new Image(); im.src = `assets/dice/pip${f}.png`;
  for (const s of DIE_SKINS) { const i2 = new Image(); i2.src = `assets/dice/${s}${f}.png`; }
}

function animateRoll(indices) {
  busy = true;
  renderBattle();
  const dieEls = [...app.querySelectorAll('.die')];
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
    // 빈 슬롯이면 이미지 요소로 교체 후 면을 빠르게 교차 (구르다 멈추는 감속)
    let img = el.querySelector('img.pip-art');
    if (!img) {
      const ph = el.querySelector('.pip-art');
      img = document.createElement('img');
      img.className = 'pip-art';
      img.draggable = false;
      if (ph) ph.replaceWith(img); else el.prepend(img);
    }
    const defId = battle.diceDefs[idx].id;
    let delay = 42;
    (function cycle() {
      if (stopped.has(idx)) return;
      img.src = dieFaceSrc(defId, 1 + Math.floor(Math.random() * 6));
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
      const img = el.querySelector('img.pip-art');
      if (img) { img.src = dieFaceSrc(battle.diceDefs[idx].id, battle.dice[idx].face); img.alt = battle.dice[idx].face; }
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
      if (battle.over) {
        if (battle.result === 'victory') { renderBattle(); finishBattle(); return; } // 출혈사 — 적 페이즈 중 전멸
        playerDeathFx(); return; // 사망 연출
      }
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
    dmg.className = 'dmg-float' + (fx === 'judgment' ? ' big' : '') + (hit.amount === 0 ? ' blocked' : '');
    dmg.textContent = hit.amount > 0 ? `-${hit.amount}` : '🛡막음';
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
    if (currentNodeType === 'final') { showFinalEnd(battle.turn); return; }
    showEnd(false);
  }, 1000);
}

let lastCoinGain = 0;
function finishBattle() {
  setTimeout(() => {
    busy = false;
    run.hp = battle.player.hp;
    if (battle.result === 'defeat') {
      clearSave();
      if (currentNodeType === 'final') { showFinalEnd(battle.turn); return; }
      showEnd(false);
      return;
    }
    // (승리 시 처치 연출을 여유 있게 재생)
    // 승리 시 회복 유물 (빵부스러기·꿀단지)
    const heal = run.relics.map(id => DB.relicById[id])
      .filter(r => r.hook.type === 'healOnVictory')
      .reduce((s, r) => s + r.hook.amount, 0);
    if (heal > 0) run.hp = Math.min(run.maxHp, run.hp + heal);
    if (currentNodeType === 'boss') { showBossReward(afterBossVictory); return; }
    // 코인 획득 (v0.13 — 계몽 13: -25%)
    lastCoinGain = coinReward(run, currentNodeType);
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
      <p class="coin-gain">🪙 +${lastCoinGain} <span class="hint">(보유 ${run.coins})</span></p>
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
          <button class="card pop-in r-${c.item.tier} ${SHINY[c.item.tier] || ''} ${isNew ? 'new-cat' : ''}"
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
            <span class="card-rarity">${esc(TIER_KO[c.item.tier] || c.item.tier)}</span>
          </button>`;
        }).join('')}
      </div>
      <button class="btn ghost pop-in" id="skip-btn" style="--d:${0.2 + choices.length * 0.22}s">넘어가기</button>
    </div>`));
  app.querySelectorAll('.reward-cards .card').forEach(el => {
    el.addEventListener('click', () => {
      const c = choices[parseInt(el.dataset.idx, 10)];
      if (c.kind === 'relic') { applyRelicPickup(run, c.item); saveRun(run); showMap(); }
      else if (c.kind === 'category') {
        (run.categories[c.item.cat.id] = run.categories[c.item.cat.id] || []).push(c.item.variant.id);
        saveRun(run); showMap();
      }
      else showReplaceDie(c.item);
    });
  });
  document.getElementById('skip-btn').addEventListener('click', () => { saveRun(run); showMap(); });
}

function showReplaceDie(newDie, onDone = null, onCancel = null) {
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
    if (onCancel) onCancel();
    else if (onDone) onDone();
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
