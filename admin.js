/* FitQuest Pro — js/admin.js
   Админ-панель с черновиком и сохранением изменений
   (обычный скрипт: глобальные функции и переменные общие для всех файлов, порядок подключения см. в index.html) */

/* =========================================================================
   20. АДМИН-ПАНЕЛЬ С СОХРАНЕНИЕМ ИЗМЕНЕНИЙ (ПАРОЛЬ Halid2007.)
   ========================================================================= */
let adminDraft = null;
let adminDirty = false;
let adminTab = 'general';
let adminCloseArmed = false;

function makeAdminDraft() {
  return {
    settings: clone(state.settings),
    cases: clone(state.cases),
    workouts: clone(state.workouts),
    characters: clone(state.characters)
  };
}

function pathGet(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}
function pathSet(obj, path, val) {
  const ks = path.split('.');
  let o = obj;
  for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]];
  o[ks[ks.length - 1]] = val;
}

function admField(label, path, o = {}) {
  const v = pathGet(adminDraft, path);
  const scale = o.scale || 1;
  const type = o.type || 'num';
  const shown = type === 'pass' ? '' : (typeof v === 'number' ? Math.round(v * scale * 1000) / 1000 : (v == null ? '' : v));
  const attrs = type === 'pass'
    ? 'type="password" placeholder="Новый пароль (от 4 символов)" autocomplete="new-password"'
    : `type="number" inputmode="decimal" step="${o.step || 1}"`;
  return `
    <div class="adm-field">
      <label>${esc(label)}</label>
      <input class="input-field sm" ${attrs} value="${esc(shown)}" data-dp="${path}" data-dt="${type}" data-scale="${scale}">
    </div>`;
}

function admSwitch(path) {
  const v = pathGet(adminDraft, path) !== false;
  return `<label class="switch"><input type="checkbox" data-dp="${path}" data-dt="bool" ${v ? 'checked' : ''}><span class="slider"></span></label>`;
}

function adminTabGeneral() {
  const th = adminDraft.settings.ambientTheme;
  return `
    <div class="admin-section-box">
      <div class="admin-sec-title">🎨 Анимация меню (внутри приложения)</div>
      <div class="screen-sub">Выберите частицы. Предпросмотр сразу, но запоминается после «Сохранить»:</div>
      <div class="season-selector-grid">
        <button class="season-opt-btn ${th === 'autumn' ? 'active' : ''}" data-set-theme="autumn"><span>🍁</span><span>Осень (Листопад)</span></button>
        <button class="season-opt-btn ${th === 'winter' ? 'active' : ''}" data-set-theme="winter"><span>❄️</span><span>Зима (Снегопад)</span></button>
        <button class="season-opt-btn ${th === 'spring' ? 'active' : ''}" data-set-theme="spring"><span>🌸</span><span>Весна (Сакура)</span></button>
        <button class="season-opt-btn ${th === 'summer' ? 'active' : ''}" data-set-theme="summer"><span>✨</span><span>Лето (Светлячки)</span></button>
      </div>
      <button class="btn-premium-ghost ${th === 'off' ? 'active' : ''}" data-set-theme="off" style="width:100%;margin-top:8px;font-size:11px;padding:8px;">🚫 Отключить анимацию</button>
    </div>

    <div class="admin-section-box">
      <div class="admin-sec-title">⚡ Энергия тренировок</div>
      <div class="adm-grid">
        ${admField('Максимум энергии', 'settings.maxWorkoutEnergy')}
        ${admField('Секунд на +1 энергии', 'settings.workoutRegenSec')}
        ${admField('Коэфф. затрат (ккал → энергия)', 'settings.energyCostFactor', { step: 0.05 })}
      </div>
    </div>

    <div class="admin-section-box">
      <div class="admin-sec-title">👊 Кликер</div>
      <div class="adm-grid">
        ${admField('Лимит ударов', 'settings.clickerMax')}
        ${admField('Секунд на +1 удар', 'settings.clickerRegenSec')}
        ${admField('XP за удар', 'settings.tapXp')}
        ${admField('Монет за удар', 'settings.tapCoins')}
        ${admField('Множитель крита', 'settings.critMultiplier', { step: 0.5 })}
      </div>
    </div>

    <div class="admin-section-box">
      <div class="admin-sec-title">🔑 Сменить секретный пароль</div>
      ${admField('Новый пароль', 'settings.adminPassword', { type: 'pass' })}
    </div>`;
}

function adminTabCases() {
  return adminDraft.cases.map((c, i) => `
    <div class="admin-section-box">
      <div class="adm-list-head">
        <span class="adm-name"><span>${c.icon}</span><span>${esc(c.name)}</span></span>
        ${admSwitch(`cases.${i}.active`)}
      </div>
      <div class="adm-grid">
        ${c.isDaily ? '' : admField('Цена (монеты)', `cases.${i}.price`)}
        ${admField('Монеты от', `cases.${i}.minCoins`)}
        ${admField('Монеты до', `cases.${i}.maxCoins`)}
        ${admField('XP от', `cases.${i}.minXp`)}
        ${admField('XP до', `cases.${i}.maxXp`)}
        ${admField('Шанс бойца, %', `cases.${i}.rareDropChance`, { scale: 100 })}
        ${admField('Попыток предмета', `cases.${i}.itemRolls`)}
        ${admField('Шанс предмета, %', `cases.${i}.itemChance`, { scale: 100 })}
      </div>
    </div>
  `).join('');
}

function adminTabWorkouts() {
  return `
    <div class="screen-sub" style="margin-bottom:10px;">Награды и расход калорий за минуту. Включайте и выключайте программы переключателем.</div>
    <div class="admin-section-box">
      ${adminDraft.workouts.map((w, i) => `
        <div class="adm-list-row">
          <div class="adm-list-head">
            <span class="adm-name"><span>${w.icon}</span><span>${esc(w.name)}</span></span>
            ${admSwitch(`workouts.${i}.active`)}
          </div>
          <div class="adm-grid-3">
            ${admField('XP/мин', `workouts.${i}.xpPerMin`)}
            ${admField('Монет/мин', `workouts.${i}.coinsPerMin`)}
            ${admField('Ккал/мин', `workouts.${i}.kcalPerMin`, { step: 0.1 })}
          </div>
        </div>
      `).join('')}
    </div>`;
}

function adminTabChars() {
  return `
    <div class="screen-sub" style="margin-bottom:10px;">Вес выпадения (чем больше, тем чаще) и уровень разблокировки бойцов.</div>
    <div class="admin-section-box">
      ${adminDraft.characters.map((c, i) => `
        <div class="adm-list-row">
          <div class="adm-list-head">
            <span class="adm-name"><span>${c.icon}</span><span>${esc(c.name)}</span></span>
            ${c.unlockType === 'case' ? admSwitch(`characters.${i}.active`) : `<span class="unlock-source-tag">🏆 за уровни</span>`}
          </div>
          <div class="adm-grid">
            ${c.unlockType === 'case'
              ? admField('Вес выпадения', `characters.${i}.dropWeight`, { step: 0.1 })
              : admField('Уровень разблокировки', `characters.${i}.unlockLevel`)}
          </div>
        </div>
      `).join('')}
    </div>`;
}

function adminTabInstant() {
  return `
    <div class="admin-section-box">
      <div class="admin-sec-title">💰 Мгновенные действия</div>
      <div class="screen-sub" style="margin-bottom:10px;">Эти кнопки срабатывают сразу, без «Сохранить».</div>
      <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
        <button class="btn-chip" id="admin-add-1000-coins">+1000 🪙</button>
        <button class="btn-chip" id="admin-add-5000-coins">+5000 🪙</button>
        <button class="btn-chip" id="admin-add-level">+1 Уровень 🏆</button>
        <button class="btn-chip" id="admin-add-voucher">+1 Купон 🎟️</button>
        <button class="btn-chip" id="admin-fill-energy">Заправить энергию ⚡</button>
        <button class="btn-chip" id="admin-reset-daily">Сбросить кулдаун кейса 🎁</button>
        <button class="btn-chip" id="admin-give-items">+1 каждого предмета 🎒</button>
        <button class="btn-chip" id="admin-reset-road">Сбросить дорогу 🛣️</button>
      </div>
      <button class="btn-premium-violet" id="admin-unlock-all-chars" style="width:100%;font-size:12px;padding:9px;margin-bottom:8px;">
        🔓 Открыть всех ${state.characters.length} бойцов сразу
      </button>
    </div>`;
}

function adminBodyHtml() {
  if (adminTab === 'cases') return adminTabCases();
  if (adminTab === 'workouts') return adminTabWorkouts();
  if (adminTab === 'chars') return adminTabChars();
  if (adminTab === 'instant') return adminTabInstant();
  return adminTabGeneral();
}

function openAdminLoginModal() {
  Sound.click();
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay active" id="admin-login-ov">
      <div class="modal-sheet">
        <div class="modal-bar-handle"></div>
        <h2 style="font-size:18px;font-weight:900;text-align:center;margin-bottom:6px;">🔑 Вход в Админ-панель</h2>
        <div class="screen-sub" style="text-align:center;margin-bottom:18px;">
          Введите секретный мастер-пароль доступа
        </div>
        <input type="password" class="input-field" id="admin-pass-input" placeholder="Секретный пароль">
        <div style="display:flex;gap:10px;">
          <button class="btn-premium-ghost" id="admin-login-cancel" style="flex:1;">Отмена</button>
          <button class="btn-premium-primary" id="admin-login-submit" style="flex:1.5;">Войти</button>
        </div>
      </div>
    </div>`;

  document.getElementById('admin-login-cancel').onclick = closeModal;
  document.getElementById('admin-login-ov').onclick = (e) => { if (e.target.id === 'admin-login-ov') closeModal(); };

  const submitBtn = document.getElementById('admin-login-submit');
  const doSubmit = () => {
    const entered = document.getElementById('admin-pass-input').value;
    const cleanEntered = entered.trim();
    if (cleanEntered === SECRET_ADMIN_PASSWORD || cleanEntered === 'Halid2007' || cleanEntered === state.settings.adminPassword) {
      Sound.fanfare();
      state.isAdmin = true;
      adminDraft = null;
      closeModal();
      showToast('Секретный доступ в панель администратора открыт!');
      openAdminDashboardModal();
    } else {
      Sound.punch();
      showToast('Неверный секретный пароль!');
    }
  };

  submitBtn.onclick = doSubmit;
  document.getElementById('admin-pass-input').onkeydown = (e) => { if (e.key === 'Enter') doSubmit(); };
}

function openAdminDashboardModal(tab) {
  Sound.click();
  if (!adminDraft) {
    adminDraft = makeAdminDraft();
    adminDirty = false;
  }
  if (tab) adminTab = tab;
  adminCloseArmed = false;
  renderAdminDashboard();
}

function markAdminDirty() {
  adminDirty = true;
  adminCloseArmed = false;
  const badge = document.getElementById('admin-dirty-badge');
  if (badge) {
    badge.textContent = 'Есть изменения';
    badge.className = 'admin-badge-tag dirty';
  }
  const saveBtn = document.getElementById('admin-save-btn');
  if (saveBtn) saveBtn.disabled = false;
  const cancelBtn = document.getElementById('admin-cancel-btn');
  if (cancelBtn) cancelBtn.disabled = false;
}

function renderAdminDashboard() {
  const root = document.getElementById('modal-root');
  const oldSheet = root.querySelector('.modal-sheet');
  const prevScroll = oldSheet ? oldSheet.scrollTop : 0;

  const tabs = [
    { id: 'general', label: '⚙️ Общее' },
    { id: 'cases', label: '🎁 Кейсы' },
    { id: 'workouts', label: '🏋️ Тренировки' },
    { id: 'chars', label: '🎖️ Бойцы' },
    { id: 'instant', label: '💰 Ресурсы' },
  ];

  root.innerHTML = `
    <div class="modal-overlay active" id="admin-dash-ov">
      <div class="modal-sheet">
        <div class="modal-bar-handle"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h2 style="font-size:18px;font-weight:900;">🛡️ Панель Администратора</h2>
          <span id="admin-dirty-badge" class="admin-badge-tag ${adminDirty ? 'dirty' : 'clean'}">${adminDirty ? 'Есть изменения' : 'Сохранено'}</span>
        </div>

        <div class="admin-tabs">
          ${tabs.map(t => `<button class="btn-chip ${adminTab === t.id ? 'active' : ''}" data-admin-tab="${t.id}">${t.label}</button>`).join('')}
        </div>

        <div id="admin-body">${adminBodyHtml()}</div>

        <div class="admin-section-box" style="margin-top:4px;">
          <button class="btn-premium-ghost" id="admin-defaults-btn" style="width:100%;font-size:11.5px;padding:9px;">
            ↺ Вернуть заводские значения (в черновик)
          </button>
        </div>

        <div class="admin-savebar">
          <button class="btn-premium-ghost" id="admin-cancel-btn" style="flex:1;" ${adminDirty ? '' : 'disabled'}>Отменить</button>
          <button class="btn-premium-emerald" id="admin-save-btn" style="flex:2;" ${adminDirty ? '' : 'disabled'}>💾 Сохранить изменения</button>
        </div>
        <button class="btn-premium-ghost" id="admin-close-dash-btn" style="width:100%;margin-top:10px;">Закрыть панель</button>
      </div>
    </div>`;

  const sheet = root.querySelector('.modal-sheet');
  if (sheet) sheet.scrollTop = prevScroll;

  bindAdminEvents(root);
}

function revertAdminPreview() {
  AmbientEngine.setMode(state.settings.ambientTheme || 'autumn');
}

function requestCloseAdmin() {
  if (adminDirty && !adminCloseArmed) {
    adminCloseArmed = true;
    Sound.denied();
    showToast('Есть несохранённые изменения! Нажмите «Закрыть» ещё раз, чтобы выйти без сохранения');
    return;
  }
  if (adminDirty) {
    revertAdminPreview();
    adminDraft = null;
    adminDirty = false;
  }
  adminCloseArmed = false;
  closeModal();
  render();
}

function commitAdminDraft() {
  const d = adminDraft;
  const s = d.settings;

  // Проверка и нормализация значений
  const pass = String(s.adminPassword || '').trim();
  if (pass.length < 4) {
    Sound.denied();
    showToast('Пароль должен быть не менее 4 символов!');
    return false;
  }
  s.adminPassword = pass;
  s.maxWorkoutEnergy = Math.max(10, Math.round(s.maxWorkoutEnergy) || 100);
  s.workoutRegenSec = Math.max(1, Math.round(s.workoutRegenSec) || 20);
  s.energyCostFactor = Math.max(0.05, Number(s.energyCostFactor) || 0.5);
  s.clickerMax = Math.max(1, Math.round(s.clickerMax) || 200);
  s.clickerRegenSec = Math.max(1, Math.round(s.clickerRegenSec) || 3);
  s.tapXp = Math.max(0, Math.round(s.tapXp));
  s.tapCoins = Math.max(0, Math.round(s.tapCoins));
  s.critMultiplier = Math.max(1, Number(s.critMultiplier) || 3);

  d.cases.forEach(c => {
    c.price = Math.max(0, Math.round(c.price) || 0);
    c.minCoins = Math.max(0, Math.round(c.minCoins) || 0);
    c.maxCoins = Math.max(c.minCoins, Math.round(c.maxCoins) || 0);
    c.minXp = Math.max(0, Math.round(c.minXp) || 0);
    c.maxXp = Math.max(c.minXp, Math.round(c.maxXp) || 0);
    c.rareDropChance = Math.min(1, Math.max(0, Number(c.rareDropChance) || 0));
    c.itemRolls = Math.max(0, Math.round(c.itemRolls) || 0);
    c.itemChance = Math.min(1, Math.max(0, Number(c.itemChance) || 0));
  });
  d.workouts.forEach(w => {
    w.xpPerMin = Math.max(0, Number(w.xpPerMin) || 0);
    w.coinsPerMin = Math.max(0, Number(w.coinsPerMin) || 0);
    w.kcalPerMin = Math.max(0.5, Number(w.kcalPerMin) || 1);
  });
  d.characters.forEach(c => {
    if (c.unlockType === 'case') c.dropWeight = Math.max(0.1, Number(c.dropWeight) || 1);
    else c.unlockLevel = Math.max(1, Math.round(c.unlockLevel) || 1);
  });

  // Применение
  state.settings = Object.assign({}, state.settings, s);
  state.cases = clone(d.cases);
  state.workouts = clone(d.workouts);
  state.characters = clone(d.characters);

  state.workoutEnergy = Math.min(state.workoutEnergy, maxWE());
  state.clickerEnergy = Math.min(state.clickerEnergy, maxCE());
  AmbientEngine.setMode(state.settings.ambientTheme || 'autumn');
  checkLevelUnlocks(calcLevel(state.player.xp).level);
  persist();

  adminDraft = makeAdminDraft();
  adminDirty = false;
  adminCloseArmed = false;
  return true;
}

function bindAdminEvents(root) {
  root.querySelectorAll('[data-admin-tab]').forEach(btn => {
    btn.onclick = () => {
      Sound.click();
      adminTab = btn.dataset.adminTab;
      const sheet = root.querySelector('.modal-sheet');
      renderAdminDashboard();
      const s2 = document.querySelector('#modal-root .modal-sheet');
      if (s2) s2.scrollTop = 0;
    };
  });

  // Любое поле формы пишет в черновик
  root.querySelectorAll('[data-dp]').forEach(inp => {
    const handler = () => {
      const path = inp.dataset.dp;
      const dt = inp.dataset.dt;
      if (dt === 'bool') {
        pathSet(adminDraft, path, inp.checked);
      } else if (dt === 'pass') {
        const val = inp.value.trim();
        pathSet(adminDraft, path, val.length ? val : state.settings.adminPassword);
      } else {
        const n = parseFloat(inp.value);
        if (isNaN(n)) return;
        pathSet(adminDraft, path, n / (parseFloat(inp.dataset.scale) || 1));
      }
      markAdminDirty();
    };
    inp.addEventListener(inp.type === 'checkbox' ? 'change' : 'input', handler);
  });

  root.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.onclick = () => {
      Sound.click();
      const theme = btn.dataset.setTheme;
      adminDraft.settings.ambientTheme = theme;
      AmbientEngine.setMode(theme);   // живой предпросмотр
      adminDirty = true;
      renderAdminDashboard();
    };
  });

  document.getElementById('admin-save-btn').onclick = () => {
    if (commitAdminDraft()) {
      Sound.fanfare();
      showToast('💾 Изменения сохранены и применены!');
      renderAdminDashboard();
      render();
    }
  };

  document.getElementById('admin-cancel-btn').onclick = () => {
    Sound.click();
    revertAdminPreview();
    adminDraft = makeAdminDraft();
    adminDirty = false;
    showToast('Изменения отменены');
    renderAdminDashboard();
  };

  document.getElementById('admin-defaults-btn').onclick = () => {
    Sound.click();
    adminDraft.settings = Object.assign({}, clone(DEFAULT_SETTINGS), { adminPassword: state.settings.adminPassword });
    adminDraft.cases = clone(initialCases);
    adminDraft.workouts = clone(initialWorkouts);
    adminDraft.characters = clone(initialCharacters);
    AmbientEngine.setMode(adminDraft.settings.ambientTheme);
    adminDirty = true;
    showToast('Заводские значения загружены в черновик — нажмите «Сохранить»');
    renderAdminDashboard();
  };

  document.getElementById('admin-close-dash-btn').onclick = requestCloseAdmin;
  document.getElementById('admin-dash-ov').onclick = (e) => { if (e.target.id === 'admin-dash-ov') requestCloseAdmin(); };

  // Мгновенные действия
  const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };

  bind('admin-add-1000-coins', () => {
    Sound.fanfare(); state.player.coins += 1000; persist(); updateCoinsUI(); showToast('+1000 🪙 добавлено!');
  });
  bind('admin-add-5000-coins', () => {
    Sound.fanfare(); state.player.coins += 5000; persist(); updateCoinsUI(); showToast('+5000 🪙 добавлено!');
  });
  bind('admin-add-level', () => {
    Sound.fanfare();
    const cur = calcLevel(state.player.xp);
    addPlayerXp(cur.xpForNextLevel - cur.xpIntoLevel);
    render();
  });
  bind('admin-add-voucher', () => {
    Sound.fanfare(); addItem('voucher', 1); persist(); showToast('+1 🎟️ Купон на кейс добавлен в сумку!');
  });
  bind('admin-fill-energy', () => {
    Sound.fanfare();
    state.workoutEnergy = maxWE();
    state.clickerEnergy = maxCE();
    persist(); updateEnergyUI(); showToast('⚡ Энергия и кликер заполнены!');
  });
  bind('admin-reset-daily', () => {
    Sound.fanfare(); state.lastDailyCaseTimestamp = 0; persist(); showToast('Ежедневный кейс снова доступен!');
  });
  bind('admin-give-items', () => {
    Sound.fanfare();
    Object.keys(ITEM_CATALOG).forEach(id => addItem(id, 1));
    persist(); showToast('🎒 В сумку добавлено по 1 каждому предмету!');
  });
  bind('admin-reset-road', () => {
    Sound.fanfare(); state.roadClaimed = []; persist(); render(); showToast('Награды дороги можно забрать заново');
  });
  bind('admin-unlock-all-chars', () => {
    Sound.fanfare();
    state.unlockedCharacters = state.characters.map(c => c.id);
    persist(); render();
    showToast(`Все ${state.characters.length} персонажей разблокированы!`);
  });
}

