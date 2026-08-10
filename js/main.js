// main.js — 부트스트랩 + 화면(UI) 렌더링 (v0.5: 다중 적·타겟팅·연출)
import { loadAll, DB } from './data.js';
import { createBattle, initialRoll, reroll, toggleHold, confirmCategory, enemyPhase, previewAll, intentOf, aliveEnemies, isAoE, rerollCost, confirmVoidCall, variantOf, modOf } from './engine.js';
import { whetMultOf } from './yahtzee.js';
import { newRun, rollEncounter, rollRewards, applyRest, restHealAmount, saveRun, loadRun, clearSave, hasSave, chooseWeapon, offerWeapons, pickEvent, applyEventEffects, applyRelicPickup, rollShopStock, bossRelicChoices, bossLegendaryChoices, eliteRelicChoices, loadMeta, setEnlight, gainEnlight, advanceAct, themeOf, finalEncounter, coinReward, reachableNodes, rollCardRewards } from './run.js';
import { createCardBattle, clashDice, playCard, endCardTurn, previewTurn, setTarget, aliveFoes, cardOf, cardTargetKind, movePower, moveHurts } from './cardbattle.js';

export const VERSION = 'v3.15'; // 로비 하단 표기 — 판을 올릴 때 함께 올린다
import { setScene, toggleMute, isMuted, prefetch } from './audio.js';

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
  // v0.61: SW를 캐시 없이 등록하고 새 버전이 오면 즉시 교체 (구버전 화면 고착 방지)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(reg => {
      reg.update();
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'activated' && navigator.serviceWorker.controller) location.reload();
        });
      });
    }).catch(() => {});
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!reloaded) { reloaded = true; location.reload(); }
    });
  }
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
  '일반의 언커먼·엘리트의 레어 확률 절반', '적이 주는 돈 -25%', '최대 HP -10%',
  '이벤트의 대가가 가혹해진다', '상점 가격 증가', '일반 적에게 계몽 패턴', '엘리트에게 계몽 패턴',
  '보스에게 계몽 패턴', '최종 보스가 두 마리',
];

function showTitle() {
  setScene('title');
  run = null; battle = null;
  const enlight = loadMeta().enlight;
  app.innerHTML = '';
  app.append(h(`
    <div class="screen title-screen">
      <div class="title-bg"></div>
      <img class="logo" src="assets/ui/logo.png" alt="REDHOOD" draggable="false">
      <p class="subtitle">빨간망토의 모험 — 주사위판</p>
      ${hasSave() ? `<button class="btn primary" id="continue-btn">이어하기</button>` : ''}
      <button class="btn primary" id="start-btn">숲으로 들어간다</button>
      <button class="btn ghost" id="enlight-btn">🔮 계몽 ${enlight}</button>
      <button class="btn ghost hidden" id="install-btn">📲 홈 화면에 설치</button>
      <button class="btn ghost" id="mute-btn">${isMuted() ? '🔇 소리 꺼짐' : '🔊 소리 켜짐'}</button>
      <p class="hint notice">이 앱은 AI를 이용해 제작되었습니다</p>
      <p class="hint">${VERSION}</p>
    </div>`));
  document.getElementById('start-btn').addEventListener('click', () => { run = newRun(); showIntro(); });
  document.getElementById('enlight-btn').addEventListener('click', showEnlightModal);
  bindMute('mute-btn', (m) => (m ? '🔇 소리 꺼짐' : '🔊 소리 켜짐'));
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

// v0.65: 로컬에서만 열리는 테스트 훅 — 보스 전리품처럼 손으로 도달하기 어려운 화면 검증용
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  window.__dev = { showBossReward: (cb) => showBossReward(cb || (() => showMap())), get run() { return run; },
    get battle() { return battle; }, redraw: () => (battle && battle.myDice ? renderCardBattle() : renderBattle()), DB };
}

// v0.81: 배경 층 — 화면 위쪽 띠에만 그린다.
// 전체에 깔면 그림의 아래쪽(바닥·물가·마룻바닥)이 족보 영역에 통째로 가려져 하늘만 보였다.
// 띠 안에서 cover로 채우고 세로 55% 지점을 잡아, 위 비네트와 아래 검정을 잘라내고 알맹이만 보여준다.
// (CSS 변수로 넘기면 브라우저가 URL을 stylesheet 기준으로 풀어버려서, 인라인 배경으로 직접 지정한다)
function bgLayer() {
  const themeId = run && run.act <= 3 ? themeOf(run).id : null;
  // 최종전은 4막이라 테마가 없다 — 전용 배경(최후의 어둠)을 쓴다
  const bgId = run && run.act >= 4 ? 'final' : (BG_ART.has(themeId) ? themeId : 'forest');
  return `<div class="bg-layer" style="background-image: linear-gradient(rgba(16,12,10,.08), rgba(16,12,10,.24) 60%, #0f0c0b 98%), url('assets/bg/bg_${bgId}.jpg')"></div>`;
}

// v0.90: 음소거 버튼 — 설정은 저장되고 화면을 다시 그려도 유지된다
function bindMute(id, label) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', () => { el.textContent = label(toggleMute()); });
}

// ---------- 캐릭터 아트 (v0.30): 이미지 보유 시 이모지 대체 ----------
const ENEMY_ART = new Set(['stray_dog', 'wolf', 'crow', 'will_o_wisp', 'forest_spider', 'thorn_bush', 'twig_golem', 'brook_sprite', 'leech', 'rat_swarm', 'living_broom', 'alpha_dog', 'old_pike', 'cellar_thing', 'old_teddy', 'river_hag', 'swamp_king', 'fog_mother', 'the_buried',
  'bog_toad', 'mosquito_swarm', 'mist_wraith', 'pale_stag', 'skeleton',
  'grave_worm', 'mud_golem', 'headless_knight', 'grave_keeper', 'nightmare_hare', 'floating_eye', 'dream_moth',
  'whisper_polyp', 'faceless_cultist', 'screaming_stone', 'hollow_priest', 'choir_ghost', 'candle_swarm', 'sandman',
  'hill_tentacle', 'bell_ringer', 'lucid_king', 'the_maw', 'false_saint', 'nameless_dread']);
const BG_ART = new Set(['forest', 'stream', 'cabin', 'swamp', 'mist', 'grave', 'dream', 'hill', 'church']); // 전투 테마 배경 보유 목록
const NPC_ART = { '잿빛 방물장수': 'peddler', '부러진 이정표': 'signpost', '낯익은 환영': 'redhood',
  '숯쟁이 난쟁이': 'dwarf', '이끼 낀 제단': 'altar', '가라앉은 상자': 'stream_chest',
  '늪 위의 불빛': 'swamp_light', '안개 속 목소리': 'voice_in_mist',
  '열린 관': 'open_grave', '달콤한 꿈': 'sweet_dream',
  '속삭이는 비석': 'whispering_stone', '텅 빈 고해실': 'confession' };
function enemyArtHtml(e) {
  return ENEMY_ART.has(e.defId)
    ? `<img class="enemy-art enemy-art-img" src="assets/enemies/${e.defId}.png" alt="" draggable="false">`
    : `<span class="enemy-art">${e.art}</span>`;
}
// v0.56: 인물은 무대를 꽉 채우게(크롭 허용), 사물은 형태 보존(전체 표시)
const NPC_PERSON = new Set(['peddler', 'dwarf', 'redhood']);
function npcArtHtml(npc) {
  const f = NPC_ART[npc.name];
  if (!f) return `<span class="npc-art">${npc.art}</span>`;
  const kind = NPC_PERSON.has(f) ? '' : ' obj';
  return `<img class="npc-art npc-art-img${kind}" src="assets/npc/${f}.png" alt="" draggable="false">`;
}

// v0.58: 표적 표시만 제자리 갱신 — 재렌더 시 이미지가 다시 그려지며 깜빡이던 문제 해소
function updateTargetMark() {
  app.querySelectorAll('.enemy').forEach(el => {
    const e = battle.enemies.find(x => x.uid === el.dataset.uid);
    el.classList.toggle('targeted', !!e && e.uid === targetUid && e.hp > 0);
  });
}

// ---------- v0.57: 줄 UI 공통 — [원형 아이콘][본문][값] ----------
// 아이콘 규격: 정사각 1:1, 투명 배경, 원형 안에 들어가는 심볼. 리소스 확보 전 임시 표기 사용.
function rowIcon(inner) {
  return `<span class="row-icon">${inner}</span>`;
}
// 족보 아이콘 — 전용 리소스가 오면 assets/icons/combo_{variantId}.png 로 자동 교체
// 그 전까지는 변형의 능력(버프·디버프)에 대응하는 기존 아이콘을 사용
// v0.88: 족보 줄 판 — 양피지 띠와 아이콘을 하나로 합친 변형별 전용 그림.
// 자산이 들어온 변형만 여기에 추가하면 그 줄만 전용 판으로 바뀌고, 나머지는 기본 종이 + 능력 아이콘으로 남는다.
// 규격은 기본 paper_row와 동일(800x212, 9-슬라이스 55 92)이라 CSS는 그림만 갈아끼운다.
const COMBO_PLATE_READY = new Set(['instinct', 'clasped_hands', 'judgment_night', 'hunt_drive', 'triple_axe', 'twin_sisters',
  'whisper', 'red_shoes', 'two_moons', 'woodsman_breath', 'heavy_blow',
  'cottage', 'windpath', 'four_fangs', 'hearth', 'moonpath',
  'blood_moon', 'storm_run']);
// v0.96: 판마다 양 끝 장식의 폭이 다르다. 테두리 폭을 17px로 고정해두면
// 장식이 넓은 판일수록 좌우로 짓눌린다(할머니의 오두막은 원본 대비 62%까지 찌그러졌다).
// 그래서 판별로 '원본 장식 폭 ÷ 원본 높이 × 줄 높이(45)'를 계산해 테두리 폭을 따로 준다.
// 값이 없는 판은 20px — 비례 절단의 최소치(45 × 92/212)와 같다.
const PLATE_EDGE = {
  judgment_night: 30, cottage: 27, instinct: 27, moonpath: 26, hearth: 25,
  hunt_drive: 23, blood_moon: 23, windpath: 22, four_fangs: 22, twin_sisters: 21,
  red_shoes: 21, storm_run: 21,
};
const plateEdge = (id) => PLATE_EDGE[id] || 20;
const COMBO_ICON_READY = new Set();
const ABILITY_ICON = {
  strength: 'status_strength', focus: 'status_focus', regen: 'status_regen',
  block: 'status_block', weakEnemy: 'status_weak', bleed: 'status_bleed',
  vulnerable: 'status_vulnerable',
};
function comboIcon(cat, variant) {
  if (COMBO_ICON_READY.has(variant.id)) {
    return `<img class="row-ico-img" src="assets/icons/combo_${variant.id}.png" alt="" draggable="false">`;
  }
  const ab = variant.ability;
  const ops = ab ? (Array.isArray(ab) ? ab : [ab]).map(a => a.op) : [];
  const file = ABILITY_ICON[ops[0]] || 'intent_attack'; // 부가 능력 없는 족보는 공격 아이콘
  return `<img class="row-ico-img" src="assets/icons/${file}.png" alt="" draggable="false">`;
}
// 선택지 텍스트 맨 앞 이모지를 아이콘 자리로 분리
function splitLeadEmoji(text) {
  const m = (text || '').match(/^([\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{200D}]+)\s*(.*)$/u);
  return m ? { icon: m[1], text: m[2] } : { icon: '', text: text || '' };
}

// ---------- 대화 이벤트 화면 ----------
// 배틀 화면과 같은 골격: 적 위치=NPC, 주사위 위치=검은 그라데이션 대사판, 족보 위치=선택지
function eventFrame(npc, linesHtml, choicesHtml) {
  setScene('event');
  const hpPct = Math.max(0, run.hp / run.maxHp * 100);
  return `
    <div class="screen battle-screen event-screen">
      ${bgLayer()}
      <header class="topbar">
        <span>💬 ${run.floor > 0 ? `${run.floor}층 · ` : ''}만남</span>
        <span class="relic-bar">${run.relics.map(id => DB.relicById[id].icon).join('')}</span>
        <span>${run.floor > 0 ? `${uiIco("coin")}${run.coins}` : ''}</span>
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
          <span class="hp-text">${run.hp} / ${run.maxHp}</span>
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
        ${rowIcon(`<img class="row-ico-img" src="assets/icons/weapon_${w.id}.png" alt="" draggable="false">`)}
        <span class="row-body">
          <span class="choice-main">${esc(w.name)}</span>
          <span class="choice-sub">${esc(w.desc)}</span>
        </span>
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
        ${(() => { const { icon, text } = splitLeadEmoji(ch.text); return rowIcon(icon || '·') + `
        <span class="row-body">
          <span class="choice-main">${esc(text)}</span>
          ${ch.sub ? `<span class="choice-sub">${esc(ch.sub)}</span>` : ''}
        </span>`; })()}
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
  setScene('shop');
  const stock = rollShopStock(run);
  const sold = new Set();
  const merchant = { name: '잿빛 방물장수', art: '🧙' };
  const render = () => {
    const rows = stock.map((s, i) => {
      const isSold = sold.has(i);
      const afford = run.coins >= s.price;
      const tierTag = TIER_KO[s.item.tier] || s.item.tier;
      const name = s.kind === 'die' ? `${uiIco("roll")} ${s.item.name}` : `${s.item.icon} ${s.item.name}`;
      const sub = s.kind === 'die' ? `[${s.item.faces.join(',')}] ${s.item.desc}` : s.item.desc;
      return `
        <button class="sheet-row choice-row shop-item ${isSold || !afford ? 'used' : ''}" data-idx="${i}" ${isSold || !afford ? 'disabled' : ''}>
          <span class="choice-main">${esc(name)} <small class="cat-tag">${esc(tierTag)}</small><span class="shop-price">${isSold ? '판매됨' : `${uiIco("coin")}${s.price}`}</span></span>
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

// ---------- 보스 전리품 ----------
// v0.65: 전용 전면 화면(showLootCards)을 없애고 일반 승리와 같은 전리품 목록 + 모달로 통일
function showBossReward(onDone) {
  const relics = bossRelicChoices(run);
  const legend = bossLegendaryChoices(run);
  const groups = [];
  if (relics.length) groups.push({ kind: 'relic', choices: relics, label: '정예 유물' });
  if (legend.length) groups.push({ kind: 'legend', choices: legend, label: '전설의 유산' });
  if (groups.length === 0) return onDone();
  lootState = { title: '보스 격파!', coins: 0, groups, onExit: onDone };
  renderLoot();
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
        <p>상처를 여미고 다시 걷는다. <b class="coin-gain">+${healed} HP</b> (${uiIco("heart")} ${run.hp}/${run.maxHp})</p>
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
    prefetch('battle', { kind: 'final' }); // 이 화면에 머무는 동안 최종전 곡을 받아둔다
  }
}

function startFinalBattle() {
  run.act = 4;
  currentNodeType = 'final';
  battle = createBattle(run, finalEncounter(run));
  busy = false;
  renderBattle();
}

function showFinalEnd(turns) {
  setScene('end');
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
/* ---------- 표식(badge) — v1.33 -------------------------------------------
 * 화면에 뜨는 '아이콘 + 값' 은 전부 이 하나를 통과한다. 결(tone)은 셋뿐:
 *   good  내게 유리한 것  (내 버프 · 적에게 걸린 디버프)
 *   bad   내게 불리한 것  (내가 물린 지속 피해 · 적이 두른 것)
 *   rule  규칙·제약       (정예/보스 기믹)
 * 아이콘은 그림이 있으면 그림, 없으면 글자 — 담는 틀은 어느 쪽이든 같다.
 * ------------------------------------------------------------------------ */
// v3.14: 손으로 적던 흰 목록이 fx_*·ui_* 를 몰라 배지에 파일 이름이 그대로 찍혔다.
// 접두사로 판별한다 — 새 아이콘을 넣을 때마다 여기를 고칠 일이 없게.
const ICON_ASSET = /^(status|intent|fx|ui|node|doodle)_/;
function badgeIcon(icon) {
  return ICON_ASSET.test(icon)
    ? `<img class="bdg-ico" src="assets/icons/${icon}.png" alt="" draggable="false">`
    : `<span class="bdg-ico glyph">${icon}</span>`;
}
function badge(tone, icon, value, opt = {}) {
  return `<span class="badge t-${tone}${opt.cls ? ' ' + opt.cls : ''}"${opt.title ? ` title="${esc(opt.title)}"` : ''}>`
    + badgeIcon(icon)
    + (value !== '' && value != null ? `<span class="bdg-val">${value}</span>` : '')
    + (opt.sub ? `<span class="bdg-sub">${opt.sub}</span>` : '')
    + '</span>';
}
const badgeRow = (cls, list) => {
  const inner = list.filter(Boolean).join('');
  return inner ? `<span class="${cls}">${inner}</span>` : '';
};

function ico(name, cls = '') {
  return `<img class="ico ${cls}" src="assets/icons/${name}.png" alt="" draggable="false">`;
}
// v3.14: 전투·상점·지도에 남아 있던 이모지를 정식 표식 아트로 (C절 — 메달 없이 심볼만)
const UI_ICO = { coin: 'ui_coin', unknown: 'ui_unknown', heart: 'ui_heart', roll: 'ui_roll', burst: 'ui_burst', whet: 'ui_whet' };
const uiIco = (key, cls = 'ico-ui') => ico(UI_ICO[key], cls);
// 적 의도 문자열(engine.intentOf)의 이모지를 그림으로 치환
function iconifyIntent(s) {
  return s
    .replaceAll('⚔️', ico('intent_attack', 'ico-intent'))
    .replaceAll('🛡', ico('intent_defend', 'ico-intent'))
    .replaceAll('🌀', ico('intent_confuse', 'ico-intent'))
    .replaceAll('💪', ico('intent_empower', 'ico-intent'))
    .replaceAll('💚', ico('intent_heal', 'ico-intent'))
    .replaceAll('❓', ico('intent_unknown', 'ico-intent'))
    .replaceAll('🪨', ico('fx_ward', 'ico-intent'))
    .replaceAll('⛓', ico('fx_cap', 'ico-intent'))
    .replaceAll('💗', ico('status_regen', 'ico-intent'))
    .replaceAll('💢', ico('fx_enrage', 'ico-intent'))
    .replaceAll('🌵', ico('fx_reflect', 'ico-intent'));
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
let mapResizeObs = null; // v0.29: 캔버스 크기 변화 시 잉크길 재작도 (노드-선 어긋남 근본 해결)
// v0.86: 보스 노드는 테마별 전용 낙서 아이콘을 쓴다 — 보스만 보고도 어느 구역인지 알 수 있게.
// 자산이 준비된 보스만 여기에 추가하면 자동 교체되고, 없으면 공용 보스 낙서로 표시된다.
const BOSS_ICON_READY = new Set(['wolf', 'river_hag', 'old_teddy', 'swamp_king', 'fog_mother',
  'the_buried', 'lucid_king', 'the_maw', 'false_saint']); // v3.14: 9종 전량 도착
function nodeDoodle(type) {
  if (type !== 'boss') return 'doodle_' + type;
  const bossId = run && run.act <= 3 ? themeOf(run).boss : null;
  return bossId && BOSS_ICON_READY.has(bossId) ? `doodle_boss_${bossId}` : 'doodle_boss';
}

// v0.70: 좌표 계산 제거. 층=행, 열=최대 4칸인 표로 배치하고 브라우저가 정한 위치를 읽어 잇는다.
const MAP_COLS = 4;
function showMap() {
  setScene('map');
  prefetch('battle', { act: run.act, kind: 'battle' }); // 다음 전투 곡을 미리 받아둔다
  saveRun(run);
  const { floors } = run.map;
  const F = floors.length;
  // v0.92: 보스 테마는 곡당 0.5MB다. 보스방이 두 층 안으로 들어왔을 때만 미리 받는다.
  if (run.act <= 3 && run.floor >= F - 2) {
    prefetch('battle', { act: run.act, kind: 'boss', bossId: themeOf(run).boss });
  }
  const reach = new Set(run.floor < F ? reachableNodes(run) : []);
  const nextFloorIdx = run.floor;
  const pathSet = new Set(run.path.map((i, f) => `${f}:${i}`));
  // DOM 순서 = 1층부터. 화면에서는 column-reverse로 뒤집혀 아래가 1층이 된다.
  const rowsHtml = floors.map((fl, f) => {
    const cells = fl.map((nd, i) => {
      const onPath = pathSet.has(`${f}:${i}`);
      const state = f === nextFloorIdx && reach.has(i) ? 'reachable'
        : onPath ? 'trodden'
        : f < nextFloorIdx ? 'missed' : 'ahead';
      const isBoss = nd.type === 'boss';
      const lane = Math.max(0, Math.min(MAP_COLS - 1, nd.lane | 0)); // 옛 저장(5열)도 안전하게
      const col = isBoss ? `grid-column: 1 / -1;` : `grid-column: ${lane + 1};`;
      return `<button class="map-node2 ${state} ${isBoss ? 'boss-node' : ''}" data-f="${f}" data-i="${i}"
        style="${col}" ${state === 'reachable' ? '' : 'disabled'}
        aria-label="${NODE_META[nd.type].label}">
        ${ico(nodeDoodle(nd.type), 'ico-node')}
      </button>`;
    }).join('');
    return `<div class="map-row2 ${fl.some(nd => nd.type === 'boss') ? 'boss-row' : ''}">${cells}</div>`;
  }).reverse().join(''); // 화면에서는 위가 보스, 아래가 1층
  app.innerHTML = '';
  app.append(h(`
    <div class="screen map-screen">
      <header class="topbar map-top">
        <button class="btn ghost tiny" id="abandon-btn">런 포기</button>
        <span class="relic-bar">${run.relics.map(id => DB.relicById[id].icon).join('')}</span>
        <span class="coin-slot">${uiIco("coin")}${run.coins}</span>
        <button class="mute-mini" id="map-mute">${isMuted() ? '🔇' : '🔊'}</button>
      </header>
      <div class="map-scroll parchment">
        <div class="map-grid">
          <svg class="map-links" aria-hidden="true"></svg>
          ${rowsHtml}
        </div>
      </div>
      <div class="player-bar map-foot">
        <button class="btn ghost tiny" id="bag-btn">${uiIco("roll")} 가방</button>
        <div class="hp-gauge">
          <div class="hp-fill" style="width:${Math.max(0, run.hp / run.maxHp * 100)}%"></div>
          <span class="hp-text">${run.hp} / ${run.maxHp}</span>
        </div>
        <span class="pb-side"></span>
      </div>
    </div>`));
  // 배치가 끝난 뒤 실제 위치를 읽어 작도. 크기가 변하면 (주소창 접힘·회전·폰트 로드) 다시 그린다.
  drawMapLinks();
  requestAnimationFrame(drawMapLinks);
  if (mapResizeObs) mapResizeObs.disconnect();
  if (window.ResizeObserver) {
    mapResizeObs = new ResizeObserver(() => drawMapLinks());
    mapResizeObs.observe(app.querySelector('.map-grid'));
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
  bindMute('map-mute', (m) => (m ? '🔇' : '🔊'));
  document.getElementById('abandon-btn').addEventListener('click', () => {
    if (confirm('런을 포기할까요?')) { clearSave(); showTitle(); }
  });
  const scroll = app.querySelector('.map-scroll');
  const target = app.querySelector('.map-node2.reachable');
  scroll.scrollTop = target ? Math.max(0, target.offsetTop - scroll.clientHeight / 2) : scroll.scrollHeight;
}

// 노드 실제 좌표를 읽어 점선 잉크 길을 그린다 (지나온 길 진하게, 다음 길 강조)
function drawMapLinks() {
  const svg = app.querySelector('.map-links');
  const grid = app.querySelector('.map-grid');
  if (!svg || !grid) return;
  const { edges } = run.map;
  const btns = {};
  app.querySelectorAll('.map-node2').forEach(b => { btns[`${b.dataset.f}:${b.dataset.i}`] = b; });
  const gr = grid.getBoundingClientRect();
  // 브라우저가 실제로 배치한 위치를 그대로 읽는다 — 좌표를 직접 찍지 않으므로 어긋날 수 없다
  const center = (b) => {
    const r = b.getBoundingClientRect();
    return { x: r.left - gr.left + r.width / 2, y: r.top - gr.top + r.height / 2 };
  };
  const R = 23; // 아이콘 반지름만큼 물러나서 시작·끝
  const parts = [];
  edges.forEach((fl, f) => fl.forEach((tos, i) => tos.forEach(j => {
    const a = btns[`${f}:${i}`], b = btns[`${f + 1}:${j}`];
    if (!a || !b) return;
    const p1 = center(a), p2 = center(b);
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const x1 = p1.x + ux * R, y1 = p1.y + uy * R;
    const x2 = p2.x - ux * R, y2 = p2.y - uy * R;
    if (len <= R * 2) return;
    const trodden = run.path[f] === i && run.path[f + 1] === j;
    const active = f === run.floor - 1 && i === run.pos;
    const first = run.floor === 0 && f === 0 ? false : active;
    parts.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
      class="ink ${trodden ? 'ink-done' : first ? 'ink-next' : ''}"/>`);
  })));
  svg.setAttribute('width', Math.round(gr.width));
  svg.setAttribute('height', Math.round(grid.scrollHeight));
  svg.innerHTML = parts.join('');
}

function showBagModal() {
  const diceItems = run.dice.map(id => {
    const d = DB.diceById[id];
    return `<li><b>${esc(d.name)}</b> <span class="modal-text">[${d.faces.join(',')}] ${esc(d.desc)}</span></li>`;
  }).join('');
  // v3.1 수집제: 가진 족보만 보여준다
  const catItems = DB.scoring.categories.filter(c => c.id in run.categories).map(c => {
    const v = variantOf(c, run.categories[c.id]);
    return `<li${v.base ? ' class="slot-empty"' : ''}><b>${esc(v.name)}</b> <small class="cat-tag${v.base ? ' t-slot' : ''}">${v.base ? '빈 자리' : esc(c.name)}</small>`
      + `${v.burst ? ` <small class="cat-tag t-burst">${uiIco('burst')}일격</small>` : ''}`
      + `${isAoE(c) ? ' <small class="aoe-tag">전체</small>' : ''} `
      + `<span class="modal-text">${esc(v.abilityText || '')}</span></li>`;
  }).join('');
  const relicItems = run.relics.length
    ? run.relics.map(id => { const r = DB.relicById[id]; return `<li>${r.icon} <b>${esc(r.name)}</b> <span class="modal-text">${esc(r.desc)}</span></li>`; }).join('')
    : '<li class="modal-text">유물 없음</li>';
  app.append(h(`
    <div class="modal-back">
      <div class="modal">
        <h3>족보 (${Object.keys(run.categories).length}/${DB.scoring.categories.length})</h3><ul class="deck-list">${catItems}</ul>
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
  busy = false;
  renderBattle();
}

// 표적 유지: 죽었으면 다음(맨 왼쪽 생존)으로 자동 이동
function syncTarget() {
  const alive = aliveEnemies(battle);
  if (!alive.some(e => e.uid === targetUid)) targetUid = alive[0]?.uid || null;
}

// ---------- 휴식 ----------
function showRest() {
  setScene('rest');
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
      `<div class="rest-art">✨</div><h2>+${healed} HP</h2><p>${uiIco("heart")} ${run.hp}/${run.maxHp}</p>
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

// v0.64: 힌트 줄 — 족보를 고르면 그 족보의 설명이 뜬다. 확정 안내는 뒤에 짧게 붙인다.
function hintHtml() {
  if (!battle.rolled) return '굴려서 턴을 시작한다';
  if (selectedCat) {
    const [cid, vid] = selectedCat.split(':');
    const cat = DB.scoring.categories.find(c => c.id === cid);
    const v = (cat?.variants || []).find(x => x.id === vid) || {};
    const desc = v.abilityText || cat?.ruleText || '';
    return `<b class="hint-desc">${esc(desc)}</b>${desc ? ' ' : ''}<span class="hint-confirm">· 한 번 더 탭 = 확정</span>`;
  }
  return aliveEnemies(battle).length > 1
    ? '주사위 탭=다시 굴릴 것 선택 · 적 탭=표적 변경'
    : '주사위 탭=다시 굴릴 것 선택 · 족보 길게 눌러 설명';
}

function selectedCatDef() {
  return selectedCat ? DB.scoring.categories.find(c => c.id === selectedCat) : null;
}

function renderBattle(opts = {}) {
  setScene('battle', {
    act: run.act,
    kind: currentNodeType,                                   // battle | elite | boss | final
    bossId: currentNodeType === 'boss' && run.act <= 3 ? themeOf(run).boss : null,
  });
  const p = battle.player;
  // v0.27: 재렌더 시 족보 목록 스크롤 위치 보존 (아래 족보 탭 → 맨 위로 튀는 문제)
  const prevSheetScroll = app.querySelector('.sheet-zone')?.scrollTop || 0;
  const previews = previewAll(battle);
  const lastR = battle.lastResult;
  const blindMod = modOf(battle, 'blind');       // 도사림 — 족보 위력 숨김
  const multi = aliveEnemies(battle).length > 1;
  // 방어도는 LoL식: HP바 끝에 회백색 실드 구간으로 겹쳐 표시 (넘치면 바 전체가 재비율)
  const barTotal = Math.max(p.maxHp, p.hp + p.block);
  const hpPct = Math.max(0, p.hp / barTotal * 100);
  const shieldPct = Math.max(0, Math.min(p.block, barTotal - p.hp) / barTotal * 100);
  app.innerHTML = '';
  app.append(h(`
    <div class="screen battle-screen">
      ${bgLayer()}
      <header class="topbar">
        <span>${NODE_META[currentNodeType].icon} ${run.floor}층 · ${battle.turn}턴</span>
        <span class="relic-bar">${battle.relics.map(r => r.icon).join('')}</span>
        <span class="coin-slot">${uiIco("coin")}${run.coins} <span class="hp">${uiIco("heart")}</span></span>
      </header>
      <div class="enemy-zone ${multi ? 'multi' : ''}">
        ${battle.enemies.filter(e => e.hp > 0 || (battle.lastHits || []).some(x => x.uid === e.uid && x.killed)).map(e => `
          <button class="enemy t-${e.tier} ${targetUid === e.uid && e.hp > 0 ? 'targeted' : ''}" data-uid="${e.uid}">
            ${/* v0.52: 정보(의도·이름·체력바)는 머리 위, 그림은 크게 아래 */ ''}
            <span class="target-pin">▼</span>
            <span class="intent ${e.nextMove.id === 'surge' ? 'surging' : ''} ${e.nextMove.chained ? 'chained' : ''} ${e.nextMove.phaseShift ? 'phase-shift' : ''} ${e.nextMove.broken ? 'broken' : ''}">${iconifyIntent(intentOf(e))} <small>${esc(e.nextMove.hidden && !e.stunned ? '???' : e.nextMove.name)}</small></span>
            ${badgeRow('rule-row', [
              e.wardLeft > 0 ? badge('rule', FX_ICON.ward, e.ward, { title: `문턱 ${e.ward} — 한 번에 넘겨야 뚫린다` }) : '',
              e.capLeft > 0 ? badge('rule', FX_ICON.cap, e.cap, { title: `상한 ${e.cap} — 한 번에 이 이상 줄 수 없다` }) : '',
            ])}
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
              return ' ' + badgeRow('enemy-buffs', [
                e.block > 0 ? badge('bad', 'intent_defend', e.block, { title: '적 방어도' }) : '',
                e.power > 0 ? badge('bad', 'intent_empower', '+' + e.power, { title: '적 강화' }) : '',
                e.regenLeft > 0 && e.regen > 0 ? badge('bad', FX_ICON.regen, e.regen, { title: `재생 ${e.regen} — 자기 차례마다 아문다 (${e.regenLeft}턴)` }) : '',
                e.enrage > 0 ? badge('bad', FX_ICON.enrage, '+' + e.enrage, { title: '격노 — 맞을 때마다 힘이 오른다' }) : '',
                e.reflectLeft > 0 && e.reflect > 0 ? badge('bad', FX_ICON.reflect, e.reflect, { title: `반사 ${e.reflect} — 때리면 되받는다 (방어도로 막힘)` }) : '',
                e.undying > 0 ? badge('bad', FX_ICON.undying, '', { title: '불사 — 한 번은 다시 일어선다' }) : '',
                // 적에게 불리한 것 = 내게 유리한 것
                d.weak > 0 ? badge('good', 'status_weak', d.weak, { title: '약화' }) : '',
                d.bleed > 0 ? badge('good', 'status_bleed', d.bleed, { title: '출혈' }) : '',
                d.vulnerable > 0 ? badge('good', 'status_vulnerable', d.vulnerable, { title: '취약' }) : '',
              ]);
            })()}</span>
            ${enemyArtHtml(e)}
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
          const st = d.st ? DB.statusById[d.st.kind] : null;
          const hidden = st && st.rule === 'hideFace';
          const sealedOff = st && st.rule === 'needReroll' && !d.st.opened;
          const pinned = !!d.pinned && def.effect && def.effect.op === 'pin';
          return `<button class="die art ${d.sigLock ? 'siglocked' : ''} ${pinned ? 'pinned' : ''} ${blank ? 'blank' : ''} ${marked ? 'mark-reroll' : ''} ${d.confused ? 'confused' : ''} ${!skinned && def.gold ? 'gold' : ''} ${!skinned && def.id !== 'normal' && !def.gold ? 'special' : ''} ${st ? 'st t-' + st.id : ''}"
            data-idx="${i}" title="${esc(def.name)}${st ? ' · ' + st.name + ' — ' + st.text : ''}" style="--tilt:${blank ? 0 : dieTilts[i] || 0}deg">
            ${blank || hidden || sealedOff
              ? '<span class="pip-art empty"></span>'
              : `<img class="pip-art" src="${dieFaceSrc(def.id, d.face)}" alt="${d.face}" draggable="false">`}
            ${st ? `<span class="st-tint"></span><img class="st-art" src="assets/ui/status_die_${st.id}.png" alt="" draggable="false"><span class="st-rim"></span>${st.id === 'confuse' ? '<span class="st-swirlbox"><img class="st-swirl" src="assets/ui/status_die_confuse.png" alt=""></span>' : ''}` : ''}
            ${pinned && !st ? '<span class="st-tint"></span><span class="st-rim"></span>' : ''}
            ${d.sigLock ? '<span class="st-tint"></span><img class="st-art" src="assets/ui/status_die_bite.png" alt="" draggable="false"><span class="st-rim"></span>' : ''}
            <small>${d.sigLock ? esc((modOf(battle, 'lockHigh') || {}).name || '물림') : st ? esc(st.name) : marked ? '다시' : pinned ? '새김' : ''}</small>
          </button>`;
        }).join('')}
      </div>
      <div class="roll-bar">
        ${!battle.rolled
          ? `<button class="btn primary roll-btn" id="roll-btn">${uiIco("roll")} 굴림</button>`
          : `<button class="btn primary roll-btn" id="reroll-btn" ${battle.rollsLeft < rerollCost(battle) || battle.await || battle.dice.every(d => d.held) ? 'disabled' : ''}>${uiIco("roll")} 리롤 (${battle.rollsLeft})${rerollCost(battle) > 1 ? ` <span class="cost">-${rerollCost(battle)}</span>` : ''}</button>`}
      </div>
      <div class="hint-line">${hintHtml()}</div>
      <div class="sheet-zone combo-list ${battle.rolled ? '' : 'dim'}">
        ${previews.map(({ cat, variant, seal, locked, burst, bd }) => `
          <button class="sheet-row combo-row t-${variant.tier || 'common'} ${burst ? 'burst' : ''} ${locked ? 'used' : ''} ${seal ? 'sig-sealed' : ''} ${COMBO_PLATE_READY.has(variant.id) ? 'has-plate' : ''} ${selectedCat === `${cat.id}:${variant.id}` ? 'selected' : ''}"
            data-cat="${cat.id}" data-variant="${variant.id}" data-locked="${locked ? 1 : 0}"
            ${COMBO_PLATE_READY.has(variant.id) ? `style="border-image-source: url('assets/ui/paper_${variant.id}.png')"` : ''}>
            <span class="row-body">
              <span class="sheet-name">${esc(variant.name)}</span>
              <small class="cat-tag${variant.base ? ' t-slot' : ''}">${burst ? `<b class="burst-mark">${uiIco('burst')}일격</b> · ` : ''}${variant.base ? '빈 자리' : esc(cat.short || cat.name)}${isAoE(cat) ? ' · 전체' : ''}</small>
            </span>
            <span class="sheet-preview">${seal ? `🔒${seal}` : battle.rolled ? (bd.total > 0 ? (blindMod ? '?' : bd.total) : '—') : '—'}</span>
          </button>`).join('')}
      </div>
      ${(() => {
        // 내 버프 칩 — 체력바 위, 길게 눌러 상세 (v0.19)
        const b = battle.buffs;
        const row = badgeRow('badge-row', [
          battle.whet > 0 ? badge('good', UI_ICO.whet, battle.whet,
            { sub: '×' + whetMultOf(battle.whet).toFixed(1), cls: 'whet', title: '벼름 — 일격 족보로만 터뜨린다' }) : '',
          b.strength > 0 ? badge('good', 'status_strength', b.strength, { title: '힘 — 확정마다 피해 +' }) : '',
          b.focus > 0 ? badge('good', 'status_focus', '+' + b.focus, { title: '집중 — 리롤 +' }) : '',
          b.regen > 0 ? badge('good', 'status_regen', '+' + b.regen, { title: '재생 — 턴마다 회복' }) : '',
          battle.player.dot > 0 ? badge('bad', 'status_bleed', battle.player.dot,
            { title: (DOT_KO[battle.player.dotKind] || '독') + ' — 내 행동 뒤에 피해' }) : '',
          ...['rollTax', 'holdTax', 'petrify', 'lockHigh', 'blind'].map(k => {
            const m = modOf(battle, k);
            return m ? badge('bad', FX_ICON[k], m.left, { title: `${m.name} — ${CB_MOD_KO[k]}` }) : '';
          }),
        ]);
        return row ? `<div class="buff-strip" id="buff-strip">${row}</div>` : '';
      })()}
      <div class="player-bar ${opts.playerHit ? 'hurt' : ''}">
        <span class="pb-side"></span>
        <div class="hp-gauge">
          <div class="hp-fill" style="width:${hpPct}%"></div>
          ${(() => {   // v1.14: 독·출혈로 곧 빠질 몫을 체력 끝자락에 초록으로 겹쳐 보여준다
            if (!(p.dot > 0)) return '';
            const lose = Math.min(p.hp, p.dot);
            const w = lose / p.maxHp * 100;
            return `<div class="hp-dot" style="left:${Math.max(0, hpPct - w)}%; width:${w}%"></div>`;
          })()}
          ${p.block > 0 ? `<div class="hp-shield" style="left:${hpPct}%; width:${shieldPct}%"></div>` : ''}
          <span class="hp-text">${p.hp} / ${p.maxHp}${p.block > 0 ? `<span class="shield-num">${ico('status_block')}${p.block}</span>` : ''}${p.dot > 0 ? `<span class="dot-num">${DOT_KO[p.dotKind] || '독'} ${p.dot}</span>` : ''}</span>
        </div>
        <span class="pb-side">${battle.pendingBuff > 0 ? `${uiIco('burst')}+${battle.pendingBuff}` : ''}</span>
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
      // 새 동작을 시작하면 앞의 동작은 취소한다 — 족보를 골라둔 채 주사위를 만지면 선택이 풀린다
      if (selectedCat) { selectedCat = null; updateSheetSelection(); }
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
    const hpBefore = battle.player.hp;
    const rerolled = battle.dice.map((d, i) => (d.held ? -1 : i)).filter(i => i >= 0);
    if (reroll(battle)) {
      animateRoll(rerolled);
      const tax = hpBefore - battle.player.hp;             // 시그니처 세금 (이빨 자국·가시)
      if (tax > 0) sigHurtFx(tax);
      if (battle.over && battle.result === 'defeat') setTimeout(() => renderBattle(), 700);
    }
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
      updateTargetMark(); // v0.58: 전체 재렌더 없이 표적 표시만 갱신
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
  if (rb) rb.disabled = battle.rollsLeft < rerollCost(battle) || battle.await || battle.dice.every(d => d.held);
}

// v0.28: 재렌더 없는 제자리 갱신 — 족보 선택 강조
function updateSheetSelection() {
  app.querySelectorAll('.sheet-row').forEach(el => {
    el.classList.toggle('selected', `${el.dataset.cat}:${el.dataset.variant}` === selectedCat);
  });
  const hint = app.querySelector('.hint-line');
  if (hint) hint.innerHTML = hintHtml();
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
const DOT_KO = { poison: '독', bleed: '출혈' };   // v1.14: 같은 장치, 이름만 다르다
// v3.10 상태/버프 아이콘 — 이모지 금지. (임시) 표시가 붙은 것은 전용 아트 대기 중
const FX_ICON = {          // v3.13 전량 정식 아트
  rollTax: 'fx_rolltax', holdTax: 'fx_holdtax', petrify: 'fx_petrify',
  lockHigh: 'fx_bite', blind: 'fx_blind', sealLast: 'fx_seal_cat', sealCat: 'fx_seal_cat',
  ward: 'fx_ward', cap: 'fx_cap', enrage: 'fx_enrage',
  reflect: 'fx_reflect', undying: 'fx_undying', regen: 'status_regen',
};
const fxIco = (key, cls = '') => ico(FX_ICON[key] || 'status_block', cls);

const CB_MOD_KO = {
  rollTax: '리롤할 때마다 피해 (방어도 무시)', holdTax: '리롤 시 지킨 주사위 2개당 피해 1',
  petrify: '그 눈이 나오면 굳는다 (기절)', lockHigh: '매 굴림 가장 높은 눈이 물린다', blind: '족보 위력이 보이지 않는다',
};

function enemyEffectText(e, ef) {
  const weak = e.debuffs ? e.debuffs.weak : 0;
  switch (ef.op) {
    case 'damage': {
      const base = Math.round(ef.amount * (e.atkScale || 1));
      const final = Math.max(0, base + (e.power || 0) - weak);
      const n = Math.max(1, Math.floor(ef.hits || 1));
      const parts = [];
      if (e.power > 0) parts.push(`+강화 ${e.power}`);
      if (weak > 0) parts.push(`-약화 ${weak}`);
      const head = n > 1 ? `피해 ${final} × ${n}타 = ${final * n}` : `피해 ${final}`;
      return `${ico('intent_attack')} ${head}` + (parts.length ? ` (한 대당 기본 ${base} ${parts.join(' ')})` : '');
    }
    case 'poison':
    case 'bleed': return `${ico('intent_confuse')} ${DOT_KO[ef.op]} ${ef.amount} — 내 행동이 끝날 때마다 쌓인 만큼 피해, 그 뒤 1 감소 (방어도로 막힘)`;
    case 'selfDamage': return `${uiIco('unknown')} 자해 — 스스로 ${ef.amount} 피해를 입는다 (방어도 무시)`;
    case 'block': return `${ico('intent_defend')} 방어 ${ef.amount} 획득`;
    case 'confuse': return `${ico('intent_confuse')} 혼란 — 다음 턴 내 주사위 ${ef.amount}개 뒤틀림`;
    case 'empower': return `${ico('intent_empower')} 강화 — 공격력 +${ef.amount} (전투 내 누적)`;
    case 'heal': return `${ico('intent_heal')} 자신 HP ${ef.amount} 회복`;
    case 'sealLast': return `${fxIco('sealLast')} 흉내 — 직전에 쓴 족보를 ${ef.turns || 1}턴 봉인`;
    case 'sealCat': return `${fxIco('sealCat')} 봉인 — ${(ef.cats || []).join('·')} 족보를 ${ef.turns || 1}턴 봉인`;
    case 'rollTax': return `${fxIco('rollTax')} 이빨 자국 — ${ef.turns || 1}턴간 리롤할 때마다 피해 ${ef.amount || 1} (방어도 무시)`;
    case 'holdTax': return `${fxIco('holdTax')} 가시 — ${ef.turns || 1}턴간 리롤 시 지킨 주사위 2개당 피해 1`;
    case 'petrify': return `${fxIco('petrify')} 굳음 — ${ef.turns || 1}턴간 ${ef.face || 6}이 나오면 굳는다(기절)`;
    case 'lockHigh': return `${fxIco('lockHigh')} 물기 — ${ef.turns || 1}턴간 매 굴림 가장 높은 눈이 물린다${ef.heal ? ' (그만큼 회복)' : ''}`;
    case 'blind': return `${fxIco('blind')} 어둠 — ${ef.turns || 1}턴간 족보 위력이 보이지 않는다`;
    case 'ward': return `${fxIco('ward')} 문턱 ${ef.amount} — 한 번에 넘겨야 뚫린다`;
    case 'regen': return `${fxIco('regen')} 재생 ${ef.amount} — ${ef.turns || 3}턴간 자기 차례마다 회복`;
    case 'enrage': return `${fxIco('enrage')} 격노 — 맞을 때마다 힘 +${ef.amount || 1} (전투 내 누적)`;
    case 'reflect': return `${fxIco('reflect')} 반사 ${ef.amount} — ${ef.turns || 3}턴간 때리면 되받는다`;
    case 'cap': return `${fxIco('cap')} 상한 ${ef.amount} — 한 번에 이 이상 안 들어간다`;
    case 'rest': return `💤 휴식`;
    case 'drainWhet': return `🌀 벼름을 빼앗는다`;
    case 'unpin': return `💨 새김을 흩는다`;
    case 'status': { const st = DB.statusById[ef.kind]; return `${ico('status_' + ef.kind)} ${st ? st.name : ef.kind} ×${ef.amount || 1} — ${st ? st.text : ''}`; }
    default: return ef.op;
  }
}
// 내게 걸린 버프/디버프 상세 — 체력바 길게 누르기 (v0.19)
function showPlayerBuffs() {
  if (!battle) return;
  const b = battle.buffs;
  const confusedNow = battle.dice.filter(d => d.confused).length;
  const items = [
    b.strength > 0 ? `<li>${ico('status_strength')} 힘 ${b.strength} — 모든 족보 피해 +${b.strength} · 매 턴 1 소멸</li>` : '',
    b.focus > 0 ? `<li>${ico('status_focus')} 집중 ${b.focus} — 매 턴 리롤 +${b.focus} · 매 턴 1 소멸</li>` : '',
    b.regen > 0 ? `<li>${ico('status_regen')} 재생 ${b.regen} — 매 턴 시작 시 HP +${b.regen} · 매 턴 1 소멸</li>` : '',
    battle.whet > 0 ? `<li>${uiIco('whet')} 벼름 ${battle.whet} — <b>${uiIco('burst')}일격</b> 족보로 터뜨리면 피해 <b>×${whetMultOf(battle.whet).toFixed(1)}</b>. 일격이 아닌 족보로는 쓰이지도 깎이지도 않는다</li>` : '',
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
    d.weak > 0 ? `<li>${ico('status_weak')} 약화 ${d.weak} — 공격력 -${d.weak} · 매 턴 1 소멸</li>` : '',
    d.bleed > 0 ? `<li>${ico('status_bleed')} 출혈 ${d.bleed} — 행동할 때마다 ${d.bleed} 피해, 스택 -1씩 감소</li>` : '',
    d.vulnerable > 0 ? `<li>${ico('status_vulnerable')} 취약 ${d.vulnerable} — 받는 피해 +${d.vulnerable} · 매 턴 1 소멸</li>` : '',
    e.wardLeft > 0 ? `<li>${fxIco('ward')} 문턱 ${e.ward} — 한 번에 ${e.ward} 이하로 때리면 아예 안 통한다 (${e.wardLeft}턴)</li>` : '',
    e.regenLeft > 0 && e.regen > 0 ? `<li>${fxIco('regen')} 재생 ${e.regen} — 자기 차례마다 회복 (${e.regenLeft}턴). 이보다 세게 때려야 줄어든다</li>` : '',
    e.enrage > 0 ? `<li>${fxIco('enrage')} 격노 — 피해를 받을 때마다 힘 +${e.enrage} (전투 내 누적). 잔펀치가 벌을 받는다</li>` : '',
    e.reflectLeft > 0 && e.reflect > 0 ? `<li>${fxIco('reflect')} 반사 ${e.reflect} — 때릴 때마다 되받는다 (${e.reflectLeft}턴, 방어도로 막힘)</li>` : '',
    e.undying > 0 ? `<li>${fxIco('undying')} 불사 — 처음 쓰러질 때 한 번 다시 일어선다</li>` : '',
    e.capLeft > 0 ? `<li>${fxIco('cap')} 상한 ${e.cap} — 한 번에 ${e.cap}을 넘겨 줄 수 없다 (${e.capLeft}턴)</li>` : '',
    e.stunned ? '<li>💫 다음 행동 취소됨</li>' : '',
  ].filter(Boolean).join('');
  app.append(h(`
    <div class="modal-back" id="enemy-info">
      <div class="modal">
        <h3>${e.art} ${esc(e.name)} <small class="cat-tag">${ENEMY_TIER_KO[e.tier] || e.tier}${e.final ? ' · 무한' : ''}</small></h3>
        <p class="modal-text">${e.final ? '체력 ∞' : `HP ${e.hp}/${e.maxHpInit}`}</p>
        ${status ? `<p class="info-ability">걸린 효과</p><ul class="deck-list">${status}</ul>` : ''}
        <p class="info-ability">🔍 예고 행동: <b>${esc(mv.name)}</b>${mv.hidden ? ` <small class="cat-tag">(${uiIco('unknown')} 의문 — 치트로 공개)</small>` : ''}${mv.phaseShift ? ' <small class="cat-tag">(국면 전환)</small>' : ''}${mv.broken ? ' <small class="cat-tag">(파쇄됨)</small>' : ''}</p>
        <ul class="deck-list">${effects || '<li class="modal-text">아무것도 하지 않는다</li>'}</ul>
        ${(() => {
          const br = mv.break;
          if (!br || !(br.damage > 0) || mv.phaseShift || mv.broken) return '';
          const left = Math.max(0, br.damage - (e.breakTaken || 0));
          const alt = (DB.enemyById[e.defId].uniqueMoves || {})[br.move];
          return `<p class="modal-text">🔨 파쇄 — 앞으로 <b>${left}</b> 피해를 더 주면 이 행동이 무너지고 <b>${esc(alt ? alt.name : br.move)}</b>(으)로 바뀐다. 방어도로 막힌 피해는 세지 않는다.</p>`;
        })()}
        ${e.escalation ? `<p class="modal-text">⚠ 매 턴 공격력 +${e.escalation} 누적 — 점점 강해진다</p>` : ''}
        ${e.enlightened ? `<p class="modal-text">🔮 계몽 상태 — 3번째 행동마다 강화 기술 사용</p>` : ''}
        <p class="hint">⚠ 치트 보기 — 숨겨진 정보(${uiIco('unknown')})까지 공개된다</p>
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
  updateRollStart(); // v0.63: 여기서 renderBattle()을 부르던 것이 굴림마다 화면 전체가 깜빡이던 원인
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

  setTimeout(() => { busy = false; updateAfterRoll(); }, 460 + indices.length * 170 + 80 + 260);
}

// v0.63: 굴림이 시작될 때 — 구르는 동안 점수를 알 수 없으므로 미리보기를 비우고 입력만 잠근다.
function updateRollStart() {
  selectedCat = null;
  const rb = document.getElementById('reroll-btn');
  if (rb) rb.disabled = true;
  app.querySelectorAll('.sheet-zone .combo-row').forEach(el => {
    el.classList.remove('selected');
    const prev = el.querySelector('.sheet-preview');
    if (prev && !prev.textContent.startsWith('🔒')) prev.textContent = '—';
  });
  app.querySelectorAll('.die').forEach(el => el.classList.remove('combo-hint'));
  const hint = app.querySelector('.hint-line');
  if (hint) hint.textContent = '굴리는 중…';
}

// v0.63: 굴림 직후 전체 재렌더를 없앤다.
// 재렌더는 배경·적 그림·주사위·아이콘 <img>를 전부 새로 만들기 때문에
// 굴릴 때마다 화면 전체가 한 번 깜빡였다. 굴림으로 바뀌는 것만 제자리에서 고친다.
function updateAfterRoll() {
  if (!battle || battle.over) { renderBattle(); return; }
  const previews = previewAll(battle);
  // 1) 굴림 버튼 → 리롤 버튼 (첫 굴림에서 한 번만 교체)
  const bar = app.querySelector('.roll-bar');
  if (bar) {
    const disabled = battle.rollsLeft < rerollCost(battle) || battle.await || battle.dice.every(d => d.held);
    let rb = document.getElementById('reroll-btn');
    if (!rb) {
      bar.innerHTML = `<button class="btn primary roll-btn" id="reroll-btn">${uiIco("roll")} 리롤 (${battle.rollsLeft})</button>`;
      rb = document.getElementById('reroll-btn');
      rb.addEventListener('click', () => {
        if (busy) return;
        selectedCat = null;
        const rerolled = battle.dice.map((d, i) => (d.held ? -1 : i)).filter(i => i >= 0);
        if (reroll(battle)) animateRoll(rerolled);
      });
    } else {
      rb.innerHTML = `${uiIco('roll')} 리롤 (${battle.rollsLeft})`;
    }
    rb.disabled = disabled;
  }
  // 2) 족보 시트 — 점수 미리보기와 잠금 상태만 갱신
  const zone = app.querySelector('.sheet-zone');
  if (zone) zone.classList.toggle('dim', !battle.rolled);
  app.querySelectorAll('.sheet-zone .combo-row').forEach(el => {
    const pv = previews.find(x => x.cat.id === el.dataset.cat && x.variant.id === el.dataset.variant);
    if (!pv) return;
    el.classList.toggle('used', !!pv.locked);
    el.dataset.locked = pv.locked ? '1' : '0';
    const prev = el.querySelector('.sheet-preview');
    if (prev) prev.textContent = pv.seal ? `🔒${pv.seal}` : battle.rolled ? (pv.bd.total > 0 ? pv.bd.total : '—') : '—';
  });
  // 3) 힌트·주사위 표시·선택 강조
  const hint = app.querySelector('.hint-line');
  if (hint) hint.innerHTML = hintHtml();
  updateDiceMarks();
  app.querySelectorAll('.sheet-row').forEach(el => {
    el.classList.toggle('selected', `${el.dataset.cat}:${el.dataset.variant}` === selectedCat);
  });
  updateComboHint();
}

// 확정 → 베기 연출 → 적 페이즈 → 다음 턴
function tryConfirm(catId, variantId, uid) {
  if (busy) return;
  busy = true;
  selectedCat = null;
  const res = (variantId === 'void_call') ? confirmVoidCall(battle) : confirmCategory(battle, catId, variantId, uid);
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
          const arts = [...ez.querySelectorAll('.enemy-art')].map(a => a.getBoundingClientRect()).filter(r => r.height);
          const r = ez.getBoundingClientRect();
          const cx = arts.length ? arts.reduce((s2, a) => s2 + a.left + a.width / 2, 0) / arts.length : r.left + r.width / 2;
          const cy = arts.length ? arts.reduce((s2, a) => s2 + a.top + a.height / 2, 0) / arts.length : r.top + r.height * 0.6;
          const boom = document.createElement('div');
          boom.className = 'explosion';
          boom.style.left = `${cx - sRect.left}px`;
          boom.style.top = `${cy - sRect.top}px`;
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
// v0.86: 이펙트 기준점을 몬스터 '그림'의 한가운데로 맞춘다.
// 버튼 상자에는 예고·이름·체력바가 함께 들어 있고 그림은 아래로 넘쳐 내려가 있어서,
// 상자 기준 50%로 치면 베기와 숫자가 몬스터 머리 위쪽에서 터졌다.
function setFxPivot(el) {
  const art = el.querySelector('.enemy-art');
  if (!art) return;
  const er = el.getBoundingClientRect();
  const ar = art.getBoundingClientRect();
  if (!ar.height) return;
  el.style.setProperty('--fx-x', `${Math.round(ar.left - er.left + ar.width / 2)}px`);
  el.style.setProperty('--fx-y', `${Math.round(ar.top - er.top + ar.height / 2)}px`);
}

function playHitEffects(hits, fx = 'slash') {
  for (const hit of hits) {
    const el = app.querySelector(`.enemy[data-uid="${hit.uid}"]`);
    if (!el) continue;
    setFxPivot(el);
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
    if (battle.coinsLost > 0) {                    // v1.17 약탈로 뺏긴 코인
      run.coins = Math.max(0, run.coins - battle.coinsLost);
      battle.coinsLost = 0;
    }
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
    run.coins -= lastCoinGain; // v0.65: 전리품 창의 '재화'를 눌러서 받는다 (coinReward가 미리 더해둔 몫을 되돌림)
    showReward();
  }, 850);
}

// ---------- 보상: 전리품 목록 ----------
// v0.65: 전투 승리 → 전리품 목록 한 장. 항목을 누르면 페이지가 바뀌는 대신 모달이 열린다.
// lootState.groups = [{ kind, choices, label }] — 받으면 그 묶음이 목록에서 사라진다.
let lootState = null;
const LOOT_META = {
  coins: { icon: '\u{1FA99}', name: '재화' },
  category: { icon: '\u{1F4DC}', name: '족보' },
  die: { icon: '\u{1F3B2}', name: '주사위' },
  relic: { icon: '\u{1FAAC}', name: '유물' },
  legend: { icon: '\u{1F31F}', name: '전설의 유산' },
  card: { icon: '\u{1F0CF}', name: '감정 카드' },
};

function showReward() {
  const choices = rollRewards(run, currentNodeType);
  const groups = choices.length ? [{ kind: choices[0].kind, choices }] : [];
  // v0.72: 정예는 유물 확정 드랍 — 일반 보상과 별개의 줄로 붙는다
  if (currentNodeType === 'elite') {
    const relics = eliteRelicChoices(run);
    if (relics.length) groups.push({ kind: 'relic', choices: relics, label: relics[0].item.tier === 'elite' ? '정예 유물' : '유물' });
  }
  lootState = {
    title: '승리!',
    coins: lastCoinGain,
    groups,
    onExit: () => { saveRun(run); showMap(); },
  };
  renderLoot();
}

function lootRowHtml(icon, name, sub, attrs) {
  return `
    <button class="sheet-row choice-row loot-row" ${attrs}>
      ${rowIcon(`<span class="row-ico-emoji">${icon}</span>`)}
      <span class="row-body">
        <span class="choice-main">${esc(name)}</span>
        ${sub ? `<span class="choice-sub">${esc(sub)}</span>` : ''}
      </span>
    </button>`;
}

function renderLoot() {
  const rows = [];
  if (lootState.coins > 0) rows.push(lootRowHtml(LOOT_META.coins.icon, '재화', `+${lootState.coins}`, 'data-act="coins"'));
  lootState.groups.forEach((g, i) => {
    const m = LOOT_META[g.kind];
    rows.push(lootRowHtml(m.icon, g.label || m.name, `${g.choices.length}개 중 하나를 고른다`, `data-act="group" data-idx="${i}"`));
  });
  rows.push(lootRowHtml('\u{1F6AA}', '나가기', '', 'data-act="exit"'));
  // v0.67: 전투 프레임을 그대로 두고 족보 목록 영역 안만 전리품 줄로 바꾼다.
  //        화면을 덮는 오버레이·전용 화면 금지 (성권 지시).
  const zone = app.querySelector('.sheet-zone');
  if (!zone) { lootState.onExit(); return; }
  app.querySelector('.screen')?.classList.add('loot-mode');
  showChest(lootState.groups.length === 0 && lootState.coins <= 0);
  zone.classList.remove('dim');
  zone.classList.add('loot-list');
  zone.innerHTML = rows.join('');
  const hint = app.querySelector('.hint-line');
  if (hint) hint.textContent = lootState.title;
  zone.querySelectorAll('.loot-row').forEach(el => {
    el.addEventListener('click', () => {
      const act = el.dataset.act;
      if (act === 'coins') {
        run.coins += lootState.coins; lootState.coins = 0; saveRun(run); syncCoinSlot(); renderLoot();
      } else if (act === 'group') {
        showLootModal(parseInt(el.dataset.idx, 10));
      } else {
        // 재화는 선택의 여지가 없으므로 안 받고 나가도 손해 보지 않게 자동 정산
        if (lootState.coins > 0) { run.coins += lootState.coins; lootState.coins = 0; }
        lootState.onExit();
      }
    });
  });
}

// 뒤에 남아 있는 전투 화면의 코인 표시만 맞춰준다
function syncCoinSlot() {
  const slot = app.querySelector('.coin-slot');
  if (slot && slot.firstChild) slot.firstChild.textContent = `\u{1FA99}${run.coins} `;
}

// v0.87: 쓰러진 자리에 보물상자를 놓는다.
// 일반 전투는 나무 상자, 정예·보스는 좋은 상자. 다 가져가면 열린 빈 상자로 바뀐다.
// 자산이 들어오면 CHEST_ART_READY를 true로 바꾸면 켜진다.
// (없는 파일을 미리 찔러보면 콘솔에 404가 쌓여 테스트 신호가 더러워지므로 플래그로 막아둔다)
const CHEST_ART_READY = false;
function chestSrc(emptied) {
  if (emptied) return 'assets/ui/chest_open.png';
  return currentNodeType === 'battle' ? 'assets/ui/chest_normal.png' : 'assets/ui/chest_rare.png';
}
function showChest(emptied) {
  if (!CHEST_ART_READY) return;
  const ez = app.querySelector('.enemy-zone');
  if (!ez) return;
  const src = chestSrc(emptied);
  const cur = ez.querySelector('.chest-art');
  if (cur && cur.getAttribute('src') === src) return;   // 이미 같은 상자면 그대로 (깜빡임 방지)
  const probe = new Image();
  probe.onload = () => {
    if (!ez.isConnected) return;
    ez.classList.add('chest-zone');
    const tier = currentNodeType === 'boss' ? ' t-boss' : currentNodeType === 'elite' ? ' t-elite' : '';
    ez.innerHTML = `<img class="chest-art${tier}${emptied ? ' opened' : ''}" src="${src}" alt="" draggable="false">`;
  };
  probe.src = src;
}

// 전리품 묶음 하나를 고르는 모달 — 가로로 긴 선택지 줄, 화면 전환 없음
function showLootModal(gi) {
  const g = lootState.groups[gi];
  if (!g) return;
  app.append(h(`
    <div class="modal-back" id="loot-modal">
      <div class="modal loot-modal-box">
        <h3>${LOOT_META[g.kind].icon} ${esc(g.label || LOOT_META[g.kind].name)} — 하나를 고른다</h3>
        <div class="loot-choices">
          ${g.choices.map((c, i) => {
            const isCat = c.kind === 'category';
            const isNew = isCat && c.item.newCat;
            const name = isCat ? c.item.variant.name : c.item.name;
            const sub = c.kind === 'die' ? `[${c.item.faces.join(',')}] ${c.item.desc || ''}`
              : c.kind === 'relic' ? (c.item.desc || '')
              : c.kind === 'card' ? `자원 ${c.item.cost} · ${c.item.desc || ''}`
              : c.item.newCat ? `✨ 새 족보 — ${c.item.cat.name} 을(를) 쓸 수 있게 된다 · ${c.item.variant.abilityText || '부가 없음'}`
              : `${c.item.cat.name} 자리 · ${c.item.replaces ? `${c.item.replaces.name} 을(를) 대신한다` : '지금은 기본'} · ${c.item.variant.abilityText || '부가 없음'}`;
            return `
              <button class="sheet-row choice-row loot-choice t-${c.item.tier}" data-idx="${i}">
                ${rowIcon(`<span class="row-ico-emoji">${LOOT_META[c.kind].icon}</span>`)}
                <span class="row-body">
                  <span class="choice-main">${esc(name)} <small class="cat-tag">${esc(TIER_KO[c.item.tier] || '')}</small>${isCat && c.item.variant.burst ? `<small class="cat-tag t-burst">${uiIco('burst')}일격</small>` : ''}</span>
                  <span class="choice-sub">${esc(sub)}</span>
                </span>
              </button>`;
          }).join('')}
        </div>
        <button class="btn ghost" id="loot-modal-close">돌아가기</button>
      </div>
    </div>`));
  const back = document.getElementById('loot-modal');
  const close = () => back.remove();
  const take = () => { lootState.groups.splice(gi, 1); close(); saveRun(run); renderLoot(); };
  back.querySelectorAll('.loot-choice').forEach(el => {
    el.addEventListener('click', () => {
      const c = g.choices[parseInt(el.dataset.idx, 10)];
      if (c.kind === 'card') { run.cards.push(c.item.id); take(); }
      else if (c.kind === 'relic') { applyRelicPickup(run, c.item); take(); }
      else if (c.kind === 'category') {
        run.categories[c.item.cat.id] = c.item.variant.id;   // 그 자리에 끼운다 (있던 건 밀려난다)
        take();
      } else {
        // 주사위는 교체 대상 선택이 한 단계 더 필요하다 (모달 위에 모달)
        showReplaceDie(c.item, take, () => {});
      }
    });
  });
  document.getElementById('loot-modal-close').addEventListener('click', close);
  back.addEventListener('click', (e) => { if (e.target === back) close(); });
}

function showReplaceDie(newDie, onDone = null, onCancel = null) {
  app.append(h(`
    <div class="modal-back" id="replace-modal">
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
  const rback = document.getElementById('replace-modal');
  rback.querySelectorAll('.replace-btn').forEach(el => {
    el.addEventListener('click', () => {
      run.dice[parseInt(el.dataset.idx, 10)] = newDie.id;
      saveRun(run);
      rback.remove(); // v0.65: 첫 번째 모달이 아니라 자기 자신을 닫는다
      if (onDone) onDone(); else showMap();
    });
  });
  rback.querySelector('#replace-cancel').addEventListener('click', () => {
    rback.remove();
    if (onCancel) onCancel();
    else if (onDone) onDone();
  });
}

/* ==========================================================================
 * v2.0 카드 전투 화면 — 상호 차감 배정 + 감정 카드
 *  · 주사위: 내 것 탭 → 적 것 탭 = 즉시 부딪치기 (큰 쪽이 차액만큼 잔존)
 *  · 카드: 꾹 누르면 상세, 위로 끌어올리면 발동 (대상 카드는 이어서 주사위 탭)
 *  · 턴 종료: 내 공격 먼저 (처치된 적의 공격 불발) → 살아남은 적들의 반격
 * ========================================================================== */
let cbSel = -1;          // 선택된 내 주사위
let cbPicking = null;    // 대상 선택 중인 카드 { hi, kind }

/* ---------- 📐 배치 (v2.03) ----------
 * 기본값은 data/layout.json. 배치 편집 모드에서 만진 값은 이 기기(localStorage)에
 * 바로 적용되고, '내보내기'로 뽑은 JSON을 layout.json에 넣으면 전체 적용된다. */
/* ---------- 배치 (v2.04) ----------
 * 전투 화면 배치는 data/layout.json 하나로 조정한다.
 * 값은 별도 도구(docs/layout_editor.html — 배치 편집기)에서 만들어 내보낸다. */
function layoutOf() {
  return { ...((DB.layout && DB.layout.battle) || {}) };
}
const LAYOUT_PCT = new Set(['cnX','cnY','cnW','cnH','ccX','ccY','ccW','ccH','caX','caY','caW','caH','cdX','cdY','cdW','cdH']); // 카드 내부는 카드 크기 기준 %
function applyLayout(el) {
  const L = layoutOf();
  for (const [k, v] of Object.entries(L)) el.style.setProperty('--cb-' + k, v + (LAYOUT_PCT.has(k) ? '%' : 'px'));
  return L;
}

function renderCardBattle() {
  setScene('battle', {
    act: run.act,
    kind: currentNodeType,
    bossId: currentNodeType === 'boss' && run.act <= 3 ? themeOf(run).boss : null,
  });
  cbSel = -1; cbPicking = null;
  const multi = aliveFoes(battle).length > 1;
  app.innerHTML = '';
  app.append(h(`
    <div class="screen battle-screen card-battle">
      ${bgLayer()}
      <header class="topbar">
        <span id="cb-top">${NODE_META[currentNodeType].icon} ${run.floor}층 · ${battle.turn}턴</span>
        <span class="relic-bar">${run.relics.map(id => DB.relicById[id].icon).join('')}</span>
        <span class="coin-slot">${uiIco("coin")}${run.coins} <span class="hp">${uiIco("heart")}</span></span>
      </header>
      <div class="enemy-zone ${multi ? 'multi' : ''}">
        ${battle.enemies.filter(e => e.hp > 0).map(e => `
          <button class="enemy t-${e.tier} ${battle.target === e.uid ? 'targeted' : ''}" data-uid="${e.uid}">
            <span class="target-pin">▼</span>
            <span class="enemy-name">${esc(e.name)}</span>
            <span class="bar t-${e.tier}"><i style="width:${e.final ? 100 : Math.max(0, e.hp / e.maxHpInit * 100)}%"></i></span>
            <span class="enemy-hp">${e.final ? '∞' : `${e.hp}/${e.maxHpInit}`}${e.block > 0 ? ` <b class="fshield">🛡${e.block}</b>` : ''}${e.rage > 0 ? ` <b class="frage">${fxIco('enrage')}+${e.rage}</b>` : ''}</span>
            <span class="cb-intent" data-uid="${e.uid}"></span>
            ${enemyArtHtml(e)}
            <span class="fdice" data-uid="${e.uid}"></span>
          </button>`).join('')}
      </div>
      <div class="cb-hud">
        <div class="hp-gauge">
          <div class="hp-fill" style="width:${Math.max(0, battle.player.hp / battle.player.maxHp * 100)}%"></div>
          <span class="hp-text">${battle.player.hp} / ${battle.player.maxHp}</span>
        </div>
        <span class="cb-bleedbadge" id="cb-bleed"></span>
      </div>
      <div class="cb-preview" id="cb-preview"></div>
      <div class="cb-dice" id="cb-dice"></div>
      <div class="cb-handzone"><div class="cb-hand" id="cb-hand"></div></div>
      <div class="cb-orb" id="cb-orb" title="자원 — 카드를 쓰는 힘"><b>${battle.res}</b></div>
      <div class="cb-pile deck" id="cb-deck" title="덱에 남은 카드"><b>0</b></div>
      <div class="cb-pile disc" id="cb-disc" title="버려진 카드"><b>0</b></div>
      <button class="btn primary cb-end" id="cb-end">턴 종료</button>
      <div class="hint-line cb-hintline"></div>
      <div class="sheet-zone combo-grid cb-loot"></div>
      <div class="cb-banner" id="cb-banner"></div>
      <div class="cb-zoom" id="cb-zoom"></div>
    </div>`));
  document.getElementById('cb-zoom').addEventListener('pointerdown', () => cbZoom(null));
  // 조준 중 빈 곳 탭 = 선택 해제 (주사위 탭은 각자 처리)
  app.querySelector('.card-battle').addEventListener('click', (e) => {
    if (cbSel >= 0 && !e.target.closest('.cdie') && !e.target.closest('.fdie')) { cbSel = -1; cbUpdate(); }
  });
  applyLayout(app.querySelector('.card-battle'));
  cbUpdate();
  requestAnimationFrame(cbFitEnemyZone);
  if (battle.turn !== cbLastRollTurn) {
    cbLastRollTurn = battle.turn;
    requestAnimationFrame(cbRollFx);
    // 격앙이 막 시작된 턴 — 한 번만 알린다
    const raged = battle.enemies.filter(e => e.hp > 0 && e.rage > 0);
    if (raged.length && !cbRageWarned) { cbRageWarned = true; setTimeout(() => cbBanner('적이 격앙한다 — 끌수록 주사위가 커진다!', 1800), 500); }
  }
  // 적: 탭 = 표적, 길게 = 정보
  app.querySelectorAll('.enemy').forEach(el => {
    addLongPress(el, () => cbFoeInfo(el.dataset.uid));
    el.addEventListener('click', (e) => {
      if (busy || battle.over) return;
      if (e.target.closest('.fdie')) return;             // 주사위 탭은 대결 쪽에서
      if (setTarget(battle, el.dataset.uid)) {
        app.querySelectorAll('.enemy').forEach(x => x.classList.toggle('targeted', x.dataset.uid === battle.target));
        cbPreviewUpdate();
      }
    });
  });
  document.getElementById('cb-end').addEventListener('click', cbEndTurn);
}

// 적 예고 한 줄 — 위력은 남은 주사위 합이라 깎을 때마다 즉시 줄어든다
function cbIntentHtml(e) {
  const mv = e.move;
  if (!mv || e.hp <= 0) return '';
  const P = movePower(e);
  if (mv.op === 'damage') return `${ico('intent_attack', 'ico-intent')} ${esc(mv.name)} <b>${P}</b>`;
  if (mv.op === 'bleed') return `${ico('intent_attack', 'ico-intent')} ${esc(mv.name)} <b>${P}</b> <small>🩸${mv.amount ?? 2}</small>`;
  if (mv.op === 'lifesteal') return `${ico('intent_attack', 'ico-intent')} ${esc(mv.name)} <b>${P}</b> <small>💚흡혈</small>`;
  if (mv.op === 'armor') return `${ico('intent_defend', 'ico-intent')} ${esc(mv.name)} <b>${P}</b>`;
  if (mv.op === 'heal') return `${ico('intent_heal', 'ico-intent')} ${esc(mv.name)} <b>${P}</b>`;
  if (mv.op === 'empower') return `${ico('intent_empower', 'ico-intent')} ${esc(mv.name)} <b>+${Math.max(1, P)}</b>`;
  return esc(mv.name);
}

// ---------- 제자리 갱신 (적 그림을 다시 만들지 않는다 — 깜빡임 방지) ----------
function cbUpdate() {
  const scrEl = app.querySelector('.card-battle');
  if (scrEl) scrEl.classList.toggle('aiming', cbSel >= 0);
  const top = document.getElementById('cb-top');
  if (top) top.textContent = `${run.floor}층 · ${battle.turn}턴`;
  // 적 예고 + 주사위
  for (const e of battle.enemies) {
    const it = app.querySelector(`.cb-intent[data-uid="${e.uid}"]`);
    if (it) {
      it.innerHTML = cbIntentHtml(e);
      it.classList.toggle('hurt', moveHurts(e.move));
      it.classList.toggle('util', !moveHurts(e.move));
    }
    const zone = app.querySelector(`.fdice[data-uid="${e.uid}"]`);
    if (!zone) continue;
    zone.innerHTML = e.hp > 0 ? e.dice.map((d, di) => `
      <b class="fdie ${d.dead ? 'dead' : ''} ${cbSel >= 0 && !d.dead ? 'pickable' : ''}" data-di="${di}">${
        d.dead ? '' : `<img src="assets/dice/blank.png" alt="" draggable="false"><span class="fnum">${d.v}</span>`}</b>`).join('') : '';
    zone.querySelectorAll('.fdie:not(.dead)').forEach(fd => {
      fd.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (busy || battle.over || cbSel < 0 || cbShooting) return;
        const myIdx = cbSel;
        const myEl = document.getElementById('cb-dice')?.querySelectorAll('.cdie')[myIdx];
        const di = parseInt(fd.dataset.di, 10);
        const r = clashDice(battle, myIdx, e.uid, di);
        if (!r) return;
        cbShooting = true;
        // 발사되며 내 주사위가 먼저 줄어든다
        const m = battle.myDice[myIdx];
        if (myEl) {
          const n = myEl.querySelector('.cnum');
          if (m.dead) { myEl.classList.add('dead'); myEl.innerHTML = ''; }
          else if (n) n.textContent = m.v;
        }
        if (r.myDead) cbSel = -1;               // 잔존하면 이어서 부딪칠 수 있게 선택 유지
        cbShoot(myEl, fd, () => {               // 명중 → 상대 주사위 감소
          cbShooting = false;
          cbFloat(fd, `-${r.x}`, '#f4c9ae');
          cbUpdate();
        });
      });
    });
  }
  // 내 주사위 — 보유한 주사위 스킨 그대로 (눈 조작 기능은 플레이어 전용)
  const dz = document.getElementById('cb-dice');
  if (dz) {
    dz.innerHTML = battle.myDice.map((d, i) => {
      const pick = cbPicking && ((cbPicking.kind === 'active' && !d.dead) || (cbPicking.kind === 'dead' && d.dead));
      const face = d.dead ? ''
        : `<img class="pip-art" src="assets/dice/blank.png" alt="" draggable="false"><span class="cnum">${d.v}</span>`;
      return `<button class="cdie art ${d.dead ? 'dead' : ''} ${i === cbSel ? 'sel' : ''} ${pick ? 'pickable' : ''}" data-i="${i}">
        ${face}${!d.dead && d.v !== d.orig ? `<span class="corig">${d.orig}</span>` : ''}</button>`;
    }).join('');
    dz.querySelectorAll('.cdie').forEach(el => {
      el.addEventListener('click', () => {
        if (busy || battle.over) return;
        const i = parseInt(el.dataset.i, 10);
        const d = battle.myDice[i];
        if (cbPicking) {                                   // 카드 대상 선택
          const ok = (cbPicking.kind === 'active' && !d.dead) || (cbPicking.kind === 'dead' && d.dead);
          if (!ok) return;
          const res = playCard(battle, cbPicking.hi, i);
          cbPicking = null;
          cbBanner('');
          if (res) { cbCardFx(res); }
          cbUpdate(); cbRenderHand();
          return;
        }
        if (d.dead) return;
        cbSel = (cbSel === i ? -1 : i);
        cbUpdate();
      });
    });
  }
  // 자원 구슬·덱/버림 더미·미리보기·손패
  const orb = document.getElementById('cb-orb');
  if (orb) { orb.querySelector('b').textContent = battle.res; orb.classList.toggle('empty', battle.res <= 0); }
  const dk = document.getElementById('cb-deck');
  if (dk) dk.querySelector('b').textContent = battle.deck.length;
  const dc = document.getElementById('cb-disc');
  if (dc) dc.querySelector('b').textContent = battle.discard.length;
  const bl = document.getElementById('cb-bleed');
  if (bl) bl.textContent = battle.playerBleed > 0 ? `🩸${battle.playerBleed}` : '';
  cbPreviewUpdate();
  cbRenderHand();
}

/* 화면 높이가 낮으면 몬스터 묶음(그림·주사위·이름)이 체력바를 침범한다.
 * 실제 배치 결과를 재서 넘치는 만큼 위 기준으로 축소 — 어떤 해상도에서도 겹치지 않는다. */
function cbFitEnemyZone() {
  const scr = app.querySelector('.card-battle');
  if (!scr) return;
  const zone = scr.querySelector('.enemy-zone');
  const hud = scr.querySelector('.cb-hud');
  if (!zone || !hud) return;
  zone.style.transform = '';
  const zr = zone.getBoundingClientRect();
  let low = zr.bottom;
  zone.querySelectorAll('.enemy, .fdice, .enemy-art-img, span.enemy-art').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.bottom > low) low = r.bottom;
  });
  const availBottom = hud.getBoundingClientRect().top - 6;
  const used = low - zr.top;
  const avail = availBottom - zr.top;
  if (used > avail && avail > 60) {
    zone.style.transformOrigin = '50% 0';
    zone.style.transform = `scale(${Math.max(0.5, avail / used).toFixed(3)})`;
  }
}
window.addEventListener('resize', () => { if (battle && battle.myDice) cbFitEnemyZone(); });

function cbPreviewUpdate() {
  const pv = document.getElementById('cb-preview');
  if (!pv) return;
  if (cbSel >= 0) { pv.innerHTML = '🛡 <b class="kill">방어할 주사위를 골라주세요</b>'; return; }
  const p = previewTurn(battle);
  const tgt = battle.enemies.find(e => e.uid === p.targetUid);
  pv.innerHTML = `턴 종료 → 내 공격 <b class="atk">${p.atk}</b>${tgt ? ` (🎯${esc(tgt.name)})` : ''}`
    + `${p.kills ? ' <b class="kill">처치! 공격 불발</b>' : ''} · 예상 피격 <b class="dmg">${p.take}</b>`;
}

function cbCardFx(res) {
  const dz = document.getElementById('cb-dice');
  if (!dz) return;
  for (const f of res.fx) {
    const el = dz.querySelectorAll('.cdie')[f.i];
    if (el) cbFloat(el, f.txt, '#9fd89a');
  }
}

// 카드 사용 가능 판정 — 비용과 '대상이 있는가'까지 본다
function cbCardUsable(key) {
  const c = cardOf(key);
  if (!c || battle.res < c.cost) return false;
  const kind = cardTargetKind(key);
  if (kind === 'dead') return battle.myDice.some(d => d.dead);
  if (kind === 'active') return battle.myDice.some(d => !d.dead);
  return battle.myDice.some(d => !d.dead);   // 용기·고양도 살아있는 주사위가 필요
}

// ---------- 손패 (부채꼴) ----------
function cbRenderHand() {
  const hand = document.getElementById('cb-hand');
  if (!hand) return;
  hand.innerHTML = '';
  battle.hand.forEach((key, hi) => {
    const c = cardOf(key);
    const n = battle.hand.length;
    const off = hi - (n - 1) / 2;
    // 좌우 여백을 지키고, 카드가 늘면 같은 폭 안에서 더 겹친다 (양옆 더미·버튼 자리 확보)
    const W = hand.clientWidth || 390;
    const L = layoutOf();
    const spacing = n > 1 ? Math.min(L.handMaxGap ?? 58, Math.max(18, (W - (L.handMargin ?? 100) - (L.cardW ?? 118)) / (n - 1))) : 0;
    const usable = cbCardUsable(key);
    const el = document.createElement('div');
    el.className = `cb-card t-${c.tier || 'common'}` + tierFrameCls(c.tier) + (usable ? ' usable' : ' unusable');
    el.dataset.hi = hi;
    const art = CARD_ART.has(key)
      ? `<span class="cart" style="background-image:url('assets/cards/card_${key}.webp')"></span>`
      : `<span class="cart">${c.icon}</span>`;
    el.innerHTML = `<span class="ccost">${c.cost}</span>${art}<span class="cnm">${esc(c.name)}</span>`;
    el.style.transform = `translateX(${off * spacing}px) rotate(${off * 5}deg) translateY(${Math.abs(off) * 8 + (usable ? 0 : 16)}px)`;
    hand.appendChild(el);
    bindCbCard(el, hi, key);
  });
}

// 카드 제스처: 꾹 누르면 상세, 위로 끌어올리면 발동
function bindCbCard(el, hi, key) {
  let sx = 0, sy = 0, drag = false, holdT = null, zoomed = false, pressed = false, baseT = '';
  const down = (x, y) => {
    if (busy || battle.over) return;
    pressed = true; sx = x; sy = y; drag = false; zoomed = false;
    baseT = el.style.transform;                       // 부채꼴 자리·기울기 보존
    holdT = setTimeout(() => { zoomed = true; cbZoom(key); }, 400);
  };
  const move = (x, y) => {
    if (!pressed) return;
    const dx = x - sx, dy = y - sy;
    if (!drag && Math.hypot(dx, dy) > 12) {
      drag = true; clearTimeout(holdT);
      if (zoomed) { cbZoom(null); zoomed = false; }
      el.classList.add('dragging');
    }
    if (drag) el.style.transform = `translate3d(${dx}px,${dy}px,0) ${baseT} scale(1.08)`;   // 잡은 지점 그대로 따라온다
  };
  const up = (y) => {
    if (!pressed) return;
    pressed = false; clearTimeout(holdT);
    if (zoomed) { cbZoom(null); cbRenderHand(); return; }
    if (drag) {
      // 주사위 줄까지 끌어올려야 발동 — 그 아래는 구경/오동작으로 보고 되돌린다
      const diceRow = app.querySelector('.cb-dice');
      const limit = diceRow ? diceRow.getBoundingClientRect().bottom : 300;
      if (y < limit) cbTryPlay(hi, key);
      else cbRenderHand();
    }
  };
  el.addEventListener('pointerdown', (e) => { try { el.setPointerCapture(e.pointerId); } catch (_) {} down(e.clientX, e.clientY); });
  el.addEventListener('pointermove', (e) => move(e.clientX, e.clientY));
  el.addEventListener('pointerup', (e) => up(e.clientY));
  el.addEventListener('pointercancel', () => { pressed = false; clearTimeout(holdT); cbZoom(null); cbRenderHand(); });
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}

function cbTryPlay(hi, key) {
  const c = cardOf(key);
  if (battle.res < c.cost) { cbBanner(`자원이 부족해 (${c.cost} 필요)`, 1300); cbRenderHand(); return; }
  const kind = cardTargetKind(key);
  if (kind) {
    // 대상이 있는지 먼저 확인 (복구인데 부서진 주사위가 없으면 헛걸음)
    const has = battle.myDice.some(d => (kind === 'active' ? !d.dead : d.dead));
    if (!has) { cbBanner(kind === 'dead' ? '부서진 주사위가 없어' : '살아있는 주사위가 없어', 1300); cbRenderHand(); return; }
    cbPicking = { hi, kind };
    cbBanner(`${c.name} — 대상 주사위를 골라줘 (다른 곳을 누르면 취소)`);
    cbUpdate(); cbRenderHand();
    return;
  }
  const res = playCard(battle, hi);
  if (!res) { cbBanner('지금은 쓸 수 없어', 1200); cbRenderHand(); return; }
  cbCardFx(res);
  cbUpdate();
}

const CARD_ART = new Set(['courage', 'stalk', 'elate', 'repair']);   // 일러 보유 카드
const CARD_FRAME_READY = new Set([]);   // 등급 프레임 생성본이 온 등급만 (uncommon/rare/epic)
const tierFrameCls = (tier) => (CARD_FRAME_READY.has(tier) ? ` tf-${tier}` : '');
function cbZoom(key) {
  const z = document.getElementById('cb-zoom');
  if (!z) return;
  if (!key) { z.classList.remove('on'); return; }
  const c = cardOf(key);
  const art = CARD_ART.has(key)
    ? `<div class="zart" style="background-image:url('assets/cards/card_${key}.webp')"></div>`
    : `<div class="zart">${c.icon}</div>`;
  z.innerHTML = `<div class="zbig t-${c.tier || 'common'}${tierFrameCls(c.tier)}">${art}<div class="ztt">${esc(c.name)}</div>
    <div class="zcc" title="자원">${c.cost}</div><div class="zdd">${esc(c.desc)}</div></div>`;
  z.classList.add('on');
}

let cbBannerT = null;
function cbBanner(t, ms) {
  const b = document.getElementById('cb-banner');
  if (!b) return;
  clearTimeout(cbBannerT);
  if (!t) { b.classList.remove('on'); return; }
  b.textContent = t;
  b.classList.add('on');
  if (ms) cbBannerT = setTimeout(() => b.classList.remove('on'), ms);
}

// 대상 선택 중 빈 곳을 누르면 취소
document.addEventListener('click', (e) => {
  if (!cbPicking || !battle || !battle.myDice) return;
  if (e.target.closest('.cdie') || e.target.closest('.cb-card')) return;
  cbPicking = null;
  cbBanner('');
  cbUpdate(); cbRenderHand();
}, true);

let cbShooting = false;
// 투사체: from → to 로 금빛 구슬이 날아가 명중 시 onHit
function cbShoot(fromEl, toEl, onHit, opts = {}) {
  const scr = app.querySelector('.battle-screen');
  if (!scr || !fromEl || !toEl || !fromEl.isConnected || !toEl.isConnected) { if (onHit) onHit(); return; }
  const sr = scr.getBoundingClientRect();
  const a = fromEl.getBoundingClientRect();
  const b2 = toEl.getBoundingClientRect();
  const p = document.createElement('div');
  p.className = 'cb-proj';
  const x0 = a.left - sr.left + a.width / 2 - 7, y0 = a.top - sr.top + a.height / 2 - 7;
  const x1 = b2.left - sr.left + b2.width / 2 - 7, y1 = b2.top - sr.top + b2.height / 2 - 7;
  p.style.left = `${x0}px`;
  p.style.top = `${y0}px`;
  scr.appendChild(p);
  let done = false;
  const finish = () => { if (done) return; done = true; p.remove(); if (onHit) onHit(); };
  try {
    const anim = p.animate(
      [{ transform: 'translate(0,0) scale(.7)' }, { transform: `translate(${x1 - x0}px,${y1 - y0}px) scale(1.05)` }],
      { duration: opts.dur || 280, easing: 'cubic-bezier(.3,.1,.6,1)' });
    anim.onfinish = finish;
  } catch (err) { /* WAAPI 미지원 폴백 */ }
  setTimeout(finish, (opts.dur || 280) + 120);
}
// 턴 시작 굴림 연출: 숫자가 구르다 멈춘다
let cbLastRollTurn = 0;
let cbRageWarned = false;   // 격앙 배너는 전투마다 한 번
function cbRollFx() {
  app.querySelectorAll('.cdie .cnum, .fdie .fnum').forEach(sp => {
    const cell = sp.closest('.cdie, .fdie');
    const real = sp.textContent;
    let steps = 5 + Math.floor(Math.random() * 4);
    let delay = 45;
    if (cell) cell.classList.add('rolling');
    (function cyc() {
      if (!sp.isConnected) return;
      if (steps-- <= 0) { sp.textContent = real; if (cell) cell.classList.remove('rolling'); return; }
      sp.textContent = 1 + Math.floor(Math.random() * 6);
      delay *= 1.2;
      setTimeout(cyc, delay);
    })();
  });
}
// 적 HP 게이지만 제자리 갱신 (명중 → 피해 → 게이지 순서용)
function cbSetFoeHp(uid, hp) {
  const el = app.querySelector(`.enemy[data-uid="${uid}"]`);
  const e = battle.enemies.find(x => x.uid === uid);
  if (!el || !e) return;
  const bar = el.querySelector('.bar i');
  if (bar) bar.style.width = `${e.final ? 100 : Math.max(0, hp / e.maxHpInit * 100)}%`;
  const t = el.querySelector('.enemy-hp');
  if (t) t.childNodes[0].textContent = e.final ? '∞' : `${Math.max(0, hp)}/${e.maxHpInit}`;
}

function cbFloat(el, txt, color) {
  const r = el.getBoundingClientRect();
  const screen = app.querySelector('.battle-screen');
  if (!screen) return;
  const sr = screen.getBoundingClientRect();
  const s = document.createElement('span');
  s.className = 'cb-float';
  s.textContent = txt;
  s.style.left = `${r.left - sr.left + r.width / 2 - 8}px`;
  s.style.top = `${r.top - sr.top - 8}px`;
  if (color) s.style.color = color;
  screen.appendChild(s);
  setTimeout(() => s.remove(), 950);
}

// ---------- 턴 종료 연출 ----------
function cbEndTurn() {
  if (busy || battle.over) return;
  busy = true;
  cbPicking = null; cbBanner('');
  const hpBefore = battle.player.hp;
  const foeHpBefore = {};
  battle.enemies.forEach(e => { foeHpBefore[e.uid] = e.hp; });
  const atkDiceEls = [...app.querySelectorAll('.cdie:not(.dead)')];
  const script = endCardTurn(battle);
  if (!script) { busy = false; return; }
  // 1) 내 공격 — 살아남은 주사위마다 투사체 → 명중(베기·피해 숫자) → 게이지 감소
  let t = 150;
  if (script.atk > 0 && script.targetUid) {
    const foeEl = app.querySelector(`.enemy[data-uid="${script.targetUid}"] .enemy-art-img`)
      || app.querySelector(`.enemy[data-uid="${script.targetUid}"]`);
    atkDiceEls.forEach((de, i) => setTimeout(() => cbShoot(de, foeEl, null, { dur: 300 }), t + i * 80));
    const impact = t + Math.max(0, atkDiceEls.length - 1) * 80 + 300;
    const eff = script.atk - script.blocked;
    setTimeout(() => {
      playHitEffects([{ uid: script.targetUid, amount: eff, killed: script.killed }], 'slash');
      if (script.blocked > 0) cbBanner(`🛡 방어도가 ${script.blocked} 막음`, 1300);
    }, impact);
    setTimeout(() => cbSetFoeHp(script.targetUid, Math.max(0, (foeHpBefore[script.targetUid] || 0) - eff)), impact + 300);
    if (script.killed) setTimeout(() => cbBanner('처치! 공격 불발', 1400), impact + 350);
    t = impact + 800;
  }
  // 2) 살아남은 적들의 예고 행동 실행 (순서대로)
  let hpShown = hpBefore;
  for (const hit of script.foeHits) {
    const mv = hit.move || {};
    setTimeout(() => {
      const el = app.querySelector(`.enemy[data-uid="${hit.uid}"]`);
      if (el) { el.classList.add('attacking'); setTimeout(() => el.classList.remove('attacking'), 700); }
      if (hit.dmg > 0) { hpShown = Math.max(0, hpShown - hit.dmg); cbShowPlayerHit(hit.dmg, hpShown); }
      const extra = mv.op === 'bleed' ? ` · 🩸출혈 ${mv.amount ?? 2}`
        : mv.op === 'lifesteal' ? (mv.heal ? ` · 💚흡혈 ${mv.heal}` : '')
        : mv.op === 'armor' ? ` 🛡${mv.block ?? 0}`
        : mv.op === 'heal' ? ` 💚${mv.heal ?? 0}`
        : mv.op === 'empower' ? ` — 다음 턴 주사위 +${mv.power ?? 1}` : '';
      cbBanner(`${esc(mv.name || '공격')}${hit.dmg > 0 ? ` ${hit.dmg}` : ''}${extra}`, 1250);
      const foe = battle.enemies.find(x => x.uid === hit.uid);   // 회복·흡혈이 게이지에 보이게
      if (foe && (mv.heal || 0) > 0) cbSetFoeHp(hit.uid, foe.hp);
    }, t);
    t += 760;
  }
  if (script.bleed > 0) {
    setTimeout(() => { hpShown = Math.max(0, hpShown - script.bleed); cbShowPlayerHit(script.bleed, hpShown); cbBanner(`🩸 출혈 ${script.bleed}`, 1100); }, t);
    t += 700;
  }
  // 3) 마무리
  setTimeout(() => {
    if (script.result === 'defeat') { cbDeathFx(); return; }
    if (script.result === 'victory') { finishCardBattle(); return; }
    busy = false;
    renderCardBattle();
  }, t + 300);
}

function cbShowPlayerHit(dmg, hpShown) {
  const screen = app.querySelector('.battle-screen');
  if (!screen) return;
  screen.classList.add('screen-shake');
  const veil = document.createElement('div');
  veil.className = 'hurt-veil';
  screen.appendChild(veil);
  setTimeout(() => { screen.classList.remove('screen-shake'); veil.remove(); }, 640);
  const g = app.querySelector('.cb-hud .hp-gauge');
  if (g) {
    g.querySelector('.hp-fill').style.width = `${Math.max(0, hpShown / battle.player.maxHp * 100)}%`;
    g.querySelector('.hp-text').textContent = `${hpShown} / ${battle.player.maxHp}`;
    const f = document.createElement('span');
    f.className = 'pdmg-float';
    f.textContent = `-${dmg}`;
    g.appendChild(f);
    setTimeout(() => f.remove(), 1900);
  }
}

function cbDeathFx() {
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

function finishCardBattle() {
  setTimeout(() => {
    busy = false;
    run.hp = battle.player.hp;
    // 승리 회복 (기본) — 소모전 완화, cards.json config.victoryHeal
    run.hp = Math.min(run.maxHp, run.hp + (DB.cards.config.victoryHeal || 0));
    // 승리 시 회복 유물 (빵부스러기·꿀단지)
    const heal = run.relics.map(id => DB.relicById[id])
      .filter(r => r.hook.type === 'healOnVictory')
      .reduce((s, r) => s + r.hook.amount, 0);
    if (heal > 0) run.hp = Math.min(run.maxHp, run.hp + heal);
    if (currentNodeType === 'boss') { showBossReward(afterBossVictory); return; }
    lastCoinGain = coinReward(run, currentNodeType);
    run.coins -= lastCoinGain;  // 전리품 창에서 눌러 받는다
    showCardReward();
  }, 900);
}

// 전투 보상: 재화 + 감정 카드 3장 중 1장 (엘리트는 유물 줄 추가)
function showCardReward() {
  const choices = rollCardRewards(run, currentNodeType);
  const groups = choices.length ? [{ kind: 'card', choices }] : [];
  if (currentNodeType === 'elite') {
    const relics = eliteRelicChoices(run);
    if (relics.length) groups.push({ kind: 'relic', choices: relics, label: relics[0].item.tier === 'elite' ? '정예 유물' : '유물' });
  }
  lootState = {
    title: '승리!',
    coins: lastCoinGain,
    groups,
    onExit: () => { saveRun(run); showMap(); },
  };
  renderLoot();
}

// 격앙 안내 — 이 적의 시계가 언제부터 도는지
function cbRageInfo(e) {
  if (e.final) return '';
  const cfg = (DB.cards.config.rage || {});
  const def = DB.enemyById[e.defId] || {};
  const r = { ...(cfg[e.tier] || {}), ...(def.rage || {}) };
  if (!r.start) return '';
  const amt = r.amount ?? cfg.amount ?? 1;
  const ev = Math.max(1, r.every ?? 1);
  const now = e.rage > 0 ? ` — 지금 <b class="frage">${fxIco('enrage')}+${e.rage}</b>` : '';
  return `<p class="modal-text">${fxIco('enrage')} 격앙: ${r.start}턴부터 ${ev > 1 ? `${ev}턴마다` : '매 턴'} 주사위 +${amt}${now}</p>`;
}

const CB_MOVE_KO = {
  damage: '피해', bleed: '피해 + 출혈', armor: '자기 방어도', lifesteal: '피해 + 같은 값 회복',
  heal: '자기 회복', empower: '다음 턴 자기 주사위 강화',
};

function cbFoeInfo(uid) {
  const e = battle && battle.enemies.find(x => x.uid === uid);
  if (!e) return;
  app.append(h(`
    <div class="modal-back" id="foe-info">
      <div class="modal">
        <h3>${e.art} ${esc(e.name)} <small class="cat-tag">${ENEMY_TIER_KO[e.tier] || e.tier}${e.final ? ' · 무한' : ''}</small></h3>
        <p class="modal-text">${e.final ? '체력 ∞ — 쓰러지지 않는다' : `HP ${e.hp}/${e.maxHpInit}`}</p>
        <p class="modal-text">${uiIco("roll")} 매 턴 주사위 ${e.dice.length || e.diceN}개 ${e.faces ? `— 나오는 눈: ${e.faces.join(', ')}${battle.actBonus ? ` (+${battle.actBonus})` : ''}` : `(${e.dmin + battle.actBonus}~${e.dmax + battle.actBonus})`}${e.final ? ' — 시간이 갈수록 늘어난다' : ''}</p>
        <ul class="deck-list">${(e.moves || []).map(m => `<li>${esc(m.name)} — ${CB_MOVE_KO[m.op] || m.op}${m.op === 'bleed' ? ` ${m.amount ?? 2}` : ''}</li>`).join('')}</ul>
        ${cbRageInfo(e)}
        <p class="hint">예고한 행동의 위력 = 남은 주사위 합. 내 주사위로 부딪쳐 깎을수록 약해진다.</p>
        <button class="btn primary" id="foe-info-close">닫기</button>
      </div>
    </div>`));
  const back = document.getElementById('foe-info');
  document.getElementById('foe-info-close').addEventListener('click', () => back.remove());
  back.addEventListener('click', (ev) => { if (ev.target === back) back.remove(); });
}

// ---------- 엔딩 ----------
function showEnd(victory) {
  setScene('end');
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
