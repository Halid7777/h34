/* FitQuest Pro — js/state.js
   Утилиты, хранилище, состояние, бонусы бойцов, шкалы энергии
   (обычный скрипт: глобальные функции и переменные общие для всех файлов, порядок подключения см. в index.html) */

/* =========================================================================
   4. УТИЛИТЫ, ХРАНИЛИЩЕ И СОСТОЯНИЕ
   ========================================================================= */
function calcLevel(xp) {
  let level = 1, need = 100, remaining = xp;
  while (remaining >= need) {
    remaining -= need;
    level++;
    need = Math.round(need * 1.25);
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: need };
}

function getRank(level) {
  let r = RANKS[0];
  for (const item of RANKS) {
    if (level >= item.min) r = item;
  }
  return r;
}

function genId(p) { return p + '-' + Date.now() + '-' + Math.floor(Math.random() * 10000); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function pad2(n) { return String(n).padStart(2, '0'); }

function dayKeyNow() {
  const d = new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}
function weekKeyNow() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // понедельник = 0
  d.setDate(d.getDate() - day);
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function loadRaw(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}

// Загрузка с миграцией прогресса из старой версии (v6)
let saved = loadRaw(STORAGE_KEY);
let migratedFromV6 = false;
if (!saved) {
  const old = loadRaw(OLD_STORAGE_KEY);
  if (old) {
    migratedFromV6 = true;
    saved = {
      player: old.player,
      unlockedCharacters: old.unlockedCharacters,
      activeCharacterId: old.activeCharacterId,
      charTrainings: old.charTrainings,
      history: old.history,
      lastDailyCaseTimestamp: old.lastDailyCaseTimestamp,
      oldVouchers: old.freeCaseVouchers || 0,
      oldTrophies: old.trophies || [],
      settings: old.settings ? { ambientTheme: old.settings.ambientTheme, adminPassword: old.settings.adminPassword } : null
    };
  }
}

function migrateTrophies(oldList) {
  const out = ['tr-badge'];
  (oldList || []).forEach(name => {
    Object.values(TROPHY_CATALOG).forEach(t => {
      if (String(name).indexOf(t.name) !== -1 && !out.includes(t.id)) out.push(t.id);
    });
  });
  return out;
}

const state = {
  settings: Object.assign({}, DEFAULT_SETTINGS, (saved && saved.settings) || {}),

  player: (saved && saved.player) || { xp: 0, coins: 350 },
  characters: (saved && saved.characters) || clone(initialCharacters),
  unlockedCharacters: (saved && saved.unlockedCharacters) || ['c-1', 'c-2'],
  activeCharacterId: (saved && saved.activeCharacterId) || 'c-1',
  charTrainings: (saved && saved.charTrainings) || {},

  // Сумка: предметы (id → количество), трофеи (список id) и надетый трофей
  inventory: (saved && saved.inventory) || (migratedFromV6 && saved.oldVouchers ? { voucher: saved.oldVouchers } : {}),
  trophies: (saved && saved.trophies) || (migratedFromV6 ? migrateTrophies(saved.oldTrophies) : ['tr-badge']),
  equippedTrophy: (saved && saved.equippedTrophy) || null,
  boosts: (saved && saved.boosts) || { xpMult: 1, xpLeft: 0, coinMult: 1, coinLeft: 0 },
  roadClaimed: (saved && saved.roadClaimed) || [],
  lastDailyCaseTimestamp: (saved && saved.lastDailyCaseTimestamp) || 0,

  workouts: (saved && saved.workouts) || clone(initialWorkouts),
  exercises: (saved && saved.exercises) || clone(availableExercises),
  cases: (saved && saved.cases) || clone(initialCases),
  quests: (saved && saved.quests) || clone(initialQuests),
  questDayKey: (saved && saved.questDayKey) || dayKeyNow(),
  questWeekKey: (saved && saved.questWeekKey) || weekKeyNow(),
  history: (saved && saved.history) || [],

  // Конструктор: { exerciseId: durationInSeconds }
  builderSelection: (saved && saved.builderSelection) || { 'ex-1': 120, 'ex-28': 120, 'ex-33': 90, 'ex-14': 60, 'ex-27': 120 },
  builderCat: 'all',

  // Энергия тренировок и кликера (с отметкой времени для офлайн-восстановления)
  workoutEnergy: (saved && saved.workoutEnergy != null) ? saved.workoutEnergy : DEFAULT_SETTINGS.maxWorkoutEnergy,
  workoutTs: (saved && saved.workoutTs) || Date.now(),
  clickerEnergy: (saved && saved.clickerEnergy != null && !migratedFromV6) ? saved.clickerEnergy : DEFAULT_SETTINGS.clickerMax,
  clickerTs: (saved && saved.clickerTs && !migratedFromV6) ? saved.clickerTs : Date.now(),

  // Навигация
  currentTab: 'home',
  charSubTab: 'all',
  workoutCat: 'all',
  isAdmin: false,

  activeWorkoutSession: null
};

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      settings: state.settings,
      player: state.player,
      characters: state.characters,
      unlockedCharacters: state.unlockedCharacters,
      activeCharacterId: state.activeCharacterId,
      charTrainings: state.charTrainings,
      inventory: state.inventory,
      trophies: state.trophies,
      equippedTrophy: state.equippedTrophy,
      boosts: state.boosts,
      roadClaimed: state.roadClaimed,
      lastDailyCaseTimestamp: state.lastDailyCaseTimestamp,
      workouts: state.workouts,
      exercises: state.exercises,
      cases: state.cases,
      quests: state.quests,
      questDayKey: state.questDayKey,
      questWeekKey: state.questWeekKey,
      history: state.history,
      builderSelection: state.builderSelection,
      workoutEnergy: state.workoutEnergy,
      workoutTs: state.workoutTs,
      clickerEnergy: state.clickerEnergy,
      clickerTs: state.clickerTs
    }));
  } catch(e) {}
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 2800);
}

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
}

/* =========================================================================
   5. БОНУСЫ ПЕРСОНАЖЕЙ И ТРОФЕЕВ
   ========================================================================= */
function getActiveChar() {
  return state.characters.find(c => c.id === state.activeCharacterId && state.unlockedCharacters.includes(c.id)) || state.characters[0];
}
function cb(key) {
  const c = getActiveChar();
  return (c && c.bonus && c.bonus[key]) || 0;
}
function trophyBonus(key) {
  const t = TROPHY_CATALOG[state.equippedTrophy];
  return (t && state.trophies.includes(t.id) && t[key]) || 0;
}
function bonusSummary() {
  const c = getActiveChar();
  const t = TROPHY_CATALOG[state.equippedTrophy];
  const parts = [];
  if (c) parts.push(c.icon + ' ' + c.perk);
  if (t && state.trophies.includes(t.id)) parts.push(t.icon + ' ' + t.desc);
  return parts;
}

/* =========================================================================
   6. ШКАЛЫ ЭНЕРГИИ: ТРЕНИРОВКИ И КЛИКЕР (С ВОССТАНОВЛЕНИЕМ ПО ВРЕМЕНИ)
   ========================================================================= */
function maxWE() { return state.settings.maxWorkoutEnergy; }
function maxCE() { return state.settings.clickerMax; }

function regenTick() {
  const now = Date.now();
  let changed = false;

  // Энергия тренировок
  const wMax = maxWE();
  const wInt = Math.max(1, state.settings.workoutRegenSec) * 1000;
  if (state.workoutEnergy >= wMax) {
    state.workoutEnergy = wMax;
    state.workoutTs = now;
  } else {
    const g = Math.floor((now - state.workoutTs) / wInt);
    if (g > 0) {
      state.workoutEnergy = Math.min(wMax, state.workoutEnergy + g);
      state.workoutTs = state.workoutEnergy >= wMax ? now : state.workoutTs + g * wInt;
      changed = true;
    }
  }

  // Клики: 1 клик каждые clickerRegenSec секунд (по умолчанию 3), лимит 200
  const cMax = maxCE();
  const cInt = Math.max(1, state.settings.clickerRegenSec) * 1000;
  if (state.clickerEnergy >= cMax) {
    state.clickerEnergy = cMax;
    state.clickerTs = now;
  } else {
    const g2 = Math.floor((now - state.clickerTs) / cInt);
    if (g2 > 0) {
      state.clickerEnergy = Math.min(cMax, state.clickerEnergy + g2);
      state.clickerTs = state.clickerEnergy >= cMax ? now : state.clickerTs + g2 * cInt;
      changed = true;
    }
  }

  if (changed) persist();
  return changed;
}

function spendWorkoutEnergy(n) {
  if (state.workoutEnergy >= maxWE()) state.workoutTs = Date.now();
  state.workoutEnergy = Math.max(0, state.workoutEnergy - n);
}
function gainWorkoutEnergy(n) {
  state.workoutEnergy = Math.min(maxWE(), state.workoutEnergy + n);
}
function spendClick() {
  if (state.clickerEnergy >= maxCE()) state.clickerTs = Date.now();
  state.clickerEnergy = Math.max(0, state.clickerEnergy - 1);
}
function gainClicks(n) {
  state.clickerEnergy = Math.min(maxCE(), state.clickerEnergy + n);
}

function secToNextWE() {
  if (state.workoutEnergy >= maxWE()) return 0;
  const wInt = Math.max(1, state.settings.workoutRegenSec) * 1000;
  return Math.max(0, Math.ceil((wInt - (Date.now() - state.workoutTs)) / 1000));
}
function secToNextCE() {
  if (state.clickerEnergy >= maxCE()) return 0;
  const cInt = Math.max(1, state.settings.clickerRegenSec) * 1000;
  return Math.max(0, Math.ceil((cInt - (Date.now() - state.clickerTs)) / 1000));
}
function secToFullWE() {
  const missing = maxWE() - Math.floor(state.workoutEnergy);
  if (missing <= 0) return 0;
  return secToNextWE() + (missing - 1) * state.settings.workoutRegenSec;
}
function fmtLong(sec) {
  if (sec <= 0) return '0с';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}м ${pad2(s)}с` : `${s}с`;
}

function energyBarHtml(kind) {
  if (kind === 'w') {
    const pct = Math.round((state.workoutEnergy / maxWE()) * 100);
    return `
      <div class="card bar-card">
        <div class="bar-head">
          <span>⚡ Энергия тренировок</span>
          <span data-we-val>${Math.floor(state.workoutEnergy)} / ${maxWE()}</span>
        </div>
        <div class="bar-track"><div class="bar-fill w ${pct < 25 ? 'low' : ''}" data-we-fill style="width:${pct}%;"></div></div>
        <div class="bar-sub">
          <span>+1 каждые ${state.settings.workoutRegenSec} сек</span>
          <span data-we-timer>${state.workoutEnergy >= maxWE() ? 'Полная ✓' : 'До полной: ' + fmtLong(secToFullWE())}</span>
        </div>
      </div>`;
  }
  const pct = Math.round((state.clickerEnergy / maxCE()) * 100);
  return `
    <div class="card bar-card">
      <div class="bar-head">
        <span>👊 Запас ударов кликера</span>
        <span data-ce-val>${Math.floor(state.clickerEnergy)} / ${maxCE()}</span>
      </div>
      <div class="bar-track"><div class="bar-fill c ${pct < 10 ? 'low' : ''}" data-ce-fill style="width:${pct}%;"></div></div>
      <div class="bar-sub">
        <span>+1 удар каждые ${state.settings.clickerRegenSec} сек</span>
        <span data-ce-timer>${state.clickerEnergy >= maxCE() ? 'Полный ✓' : 'Следующий через ' + secToNextCE() + 'с'}</span>
      </div>
    </div>`;
}

function boostPillsHtml() {
  const pills = [];
  if (state.boosts.xpLeft > 0) pills.push(`<span class="boost-pill">🧪 XP ×${state.boosts.xpMult} · ещё ${state.boosts.xpLeft} трен.</span>`);
  if (state.boosts.coinLeft > 0) pills.push(`<span class="boost-pill">🧲 Монеты ×${state.boosts.coinMult} · ещё ${state.boosts.coinLeft} трен.</span>`);
  return pills.length ? `<div class="boost-row">${pills.join('')}</div>` : '';
}

function updateEnergyUI() {
  const wPct = Math.round((state.workoutEnergy / maxWE()) * 100);
  document.querySelectorAll('[data-we-fill]').forEach(el => {
    el.style.width = wPct + '%';
    el.classList.toggle('low', wPct < 25);
  });
  document.querySelectorAll('[data-we-val]').forEach(el => { el.textContent = `${Math.floor(state.workoutEnergy)} / ${maxWE()}`; });
  document.querySelectorAll('[data-we-timer]').forEach(el => {
    el.textContent = state.workoutEnergy >= maxWE() ? 'Полная ✓' : 'До полной: ' + fmtLong(secToFullWE());
  });

  const cPct = Math.round((state.clickerEnergy / maxCE()) * 100);
  document.querySelectorAll('[data-ce-fill]').forEach(el => {
    el.style.width = cPct + '%';
    el.classList.toggle('low', cPct < 10);
  });
  document.querySelectorAll('[data-ce-val]').forEach(el => { el.textContent = `${Math.floor(state.clickerEnergy)} / ${maxCE()}`; });
  document.querySelectorAll('[data-ce-timer]').forEach(el => {
    el.textContent = state.clickerEnergy >= maxCE() ? 'Полный ✓' : 'Следующий через ' + secToNextCE() + 'с';
  });
}

function updateCoinsUI() {
  document.querySelectorAll('.js-coins').forEach(el => { el.textContent = `🪙 ${state.player.coins}`; });
}

// Общий тикер энергии — раз в полсекунды
setInterval(() => {
  regenTick();
  updateEnergyUI();
}, 500);

