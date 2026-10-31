/* FitQuest Pro — js/app.js
   Главный рендер, привязка событий, инициализация
   (обычный скрипт: глобальные функции и переменные общие для всех файлов, порядок подключения см. в index.html) */

/* =========================================================================
   21. ГЛАВНЫЙ ЦИКЛ РЕНДЕРА И ПРИВЯЗКА СОБЫТИЙ
   ========================================================================= */
function render(direction = null) {
  const viewEl = document.getElementById('view');
  let html = '';

  if (state.currentTab === 'home') html = renderHome();
  else if (state.currentTab === 'workouts') html = renderWorkouts();
  else if (state.currentTab === 'cases') html = renderCases();
  else if (state.currentTab === 'characters') html = renderCharacters();
  else if (state.currentTab === 'road') html = renderRoad();
  else if (state.currentTab === 'profile') html = renderProfile();
  else if (state.currentTab === 'clicker') html = renderClickerTab();

  viewEl.innerHTML = html;

  viewEl.className = '';
  if (direction === 'right') viewEl.classList.add('slide-in-right');
  else if (direction === 'left') viewEl.classList.add('slide-in-left');
  else viewEl.classList.add('fade-in');

  renderNav();
  bindViewEvents(viewEl);
}

function bindViewEvents(root) {
  const byId = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };

  byId('home-to-cases', () => switchTab('cases'));
  byId('home-to-clicker', () => { Sound.click(); state.currentTab = 'clicker'; render(); });
  byId('home-to-builder', openBuilderModal);
  byId('home-to-bag', () => openInventoryModal('items'));
  byId('home-to-road', () => switchTab('road'));
  byId('btn-open-constructor', openBuilderModal);
  byId('banner-constructor-btn', openBuilderModal);
  byId('home-all-workouts-link', () => switchTab('workouts'));
  byId('workouts-open-bag', () => openInventoryModal('items'));
  byId('cases-open-bag', () => openInventoryModal('items'));
  byId('cases-open-trophies', () => openInventoryModal('trophies'));
  byId('profile-open-bag', () => openInventoryModal('items'));
  byId('road-claim-all', claimAllRoadRewards);

  // Фильтр персонажей
  root.querySelectorAll('[data-char-filter]').forEach(btn => {
    btn.onclick = () => {
      Sound.click();
      state.charSubTab = btn.dataset.charFilter;
      render();
    };
  });

  // Категории тренировок
  root.querySelectorAll('[data-w-cat]').forEach(btn => {
    btn.onclick = () => {
      Sound.click();
      state.workoutCat = btn.dataset.wCat;
      render();
    };
  });

  // Быстрое применение предметов
  root.querySelectorAll('[data-quick-use]').forEach(btn => {
    btn.onclick = () => {
      const ok = useItem(btn.dataset.quickUse);
      if (ok && !document.getElementById('levelup-modal-ov')) render();
    };
  });

  // Награды дороги
  root.querySelectorAll('[data-road-claim]').forEach(btn => {
    btn.onclick = () => claimRoadReward(parseInt(btn.dataset.roadClaim, 10));
  });

  // Квесты
  root.querySelectorAll('[data-claim-quest]').forEach(btn => {
    btn.onclick = () => {
      Sound.fanfare();
      claimQuest(btn.dataset.claimQuest);
      if (!document.getElementById('levelup-modal-ov')) render();
    };
  });

  // Запуск тренировок
  root.querySelectorAll('[data-start-w]').forEach(btn => {
    btn.onclick = () => {
      const w = state.workouts.find(x => x.id === btn.dataset.startW);
      if (w) startStandardWorkout(w);
    };
  });

  // Открытие кейсов
  root.querySelectorAll('[data-open-case]').forEach(btn => {
    btn.onclick = () => {
      const c = state.cases.find(x => x.id === btn.dataset.openCase);
      if (c) openCaseWithRoulette(c, btn.dataset.pay);
    };
  });

  // Выбор бойца
  root.querySelectorAll('[data-select-char]').forEach(btn => {
    btn.onclick = () => {
      Sound.click();
      state.activeCharacterId = btn.dataset.selectChar;
      persist();
      render();
      const ch = state.characters.find(x => x.id === btn.dataset.selectChar);
      showToast(`${ch.name} теперь ваш наставник! ${ch.perk}`);
    };
  });

  // Авто-тренировки
  root.querySelectorAll('[data-train-char]').forEach(btn => {
    btn.onclick = () => sendCharToTraining(btn.dataset.trainChar);
  });
  root.querySelectorAll('[data-collect-char]').forEach(btn => {
    btn.onclick = () => collectCharTrainingReward(btn.dataset.collectChar);
  });

  // Кликер
  const punchBtn = document.getElementById('main-punch-btn');
  if (punchBtn) punchBtn.onclick = (e) => tapPunch(e);
  byId('clicker-back-btn', () => switchTab('home'));

  // Админ-панель
  byId('open-admin-login-btn', openAdminLoginModal);
  byId('open-admin-dashboard-btn', () => openAdminDashboardModal());
  byId('admin-logout-btn', () => {
    Sound.click();
    state.isAdmin = false;
    adminDraft = null;
    adminDirty = false;
    render();
    showToast('Вы вышли из режима администратора');
  });
}

/* =========================================================================
   22. ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
   ========================================================================= */
window.addEventListener('DOMContentLoaded', () => {
  AmbientEngine.init();
  AmbientEngine.setMode(state.settings.ambientTheme || 'autumn');
  setupSwipeGestures();
  resetQuestsIfNeeded();
  regenTick();
  checkLevelUnlocks(calcLevel(state.player.xp).level);
  persist();
  render();

  // При возвращении во вкладку — догоняем энергию и обновляем квесты
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      regenTick();
      resetQuestsIfNeeded();
      updateEnergyUI();
    }
  });
});

