/* FitQuest Pro — js/screens.js
   Рендер экранов: главная, тренировки, кейсы, бойцы, дорога, профиль, кликер
   (обычный скрипт: глобальные функции и переменные общие для всех файлов, порядок подключения см. в index.html) */

/* =========================================================================
   19. РЕНДЕР СТРАНИЦ ПРИЛОЖЕНИЯ
   ========================================================================= */
function renderNav() {
  const roadCount = roadClaimable().length;
  const tabs = [
    { id: 'home', label: 'Главная', ic: '🏠' },
    { id: 'workouts', label: 'Тренировки', ic: '🏋️' },
    { id: 'cases', label: 'Кейсы', ic: '🎁' },
    { id: 'characters', label: 'Бойцы', ic: '🎖️' },
    { id: 'road', label: 'Дорога', ic: '🛣️', dot: roadCount },
    { id: 'profile', label: 'Профиль', ic: '⚙️' },
  ];

  document.getElementById('bottom-nav').innerHTML = tabs.map(t => `
    <button class="tab-btn ${state.currentTab === t.id ? 'active' : ''}" data-tab="${t.id}">
      <span class="tab-ic">${t.ic}${t.dot ? `<span class="tab-dot">${t.dot}</span>` : ''}</span>
      <span>${t.label}</span>
    </button>
  `).join('');

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.onclick = () => switchTab(btn.dataset.tab);
  });
}

function questRowHtml(q) {
  const isDone = q.current >= q.target;
  const pct = Math.min(100, Math.round((q.current / q.target) * 100));
  return `
    <div class="card quest-row">
      <div class="quest-icon-wrap">${q.icon}</div>
      <div class="quest-info">
        <div class="quest-name">${esc(q.title)} <span style="font-size:9px;color:var(--text-dim);">${q.period === 'week' ? '· неделя' : '· день'}</span></div>
        <div class="quest-bar"><div class="quest-fill" style="width:${pct}%;"></div></div>
        <div class="quest-meta">+${q.rewardCoins}🪙 +${q.rewardXp}XP (${q.current}/${q.target})</div>
      </div>
      ${q.claimed
        ? `<span style="font-size:11px;font-weight:800;color:var(--text-muted);">✓ Взято</span>`
        : `<button class="btn-premium-primary" data-claim-quest="${q.id}" style="padding:6px 12px;font-size:11px;" ${!isDone ? 'disabled' : ''}>Забрать</button>`
      }
    </div>`;
}

function workoutCardHtml(w, compact) {
  const st = workoutStats(w);
  const xpShown = Math.round(st.xp * xpMultNow());
  const coinsShown = Math.round(st.coins * coinMultNow());
  const lacks = state.workoutEnergy < st.energy;
  return `
    <div class="card workout-item">
      <div class="workout-icon-wrap">${w.icon}</div>
      <div class="workout-details">
        ${w.cat ? `<span class="cat-tag">${CATEGORY_NAMES[w.cat] || w.cat}</span>` : ''}
        <div class="workout-title">${esc(w.name)}</div>
        <div class="workout-desc">${esc(w.description)}</div>
        <div class="workout-rate-chips">
          <span class="rate-chip fire">🔥 <b>~${st.kcal} ккал</b></span>
          <span class="rate-chip">✨ <b>+${xpShown} XP</b></span>
          <span class="rate-chip">🪙 <b>+${coinsShown}</b></span>
          <span class="rate-chip">⏱️ ${st.min} мин · ${st.steps.length} раунд.</span>
          <span class="rate-chip energy ${lacks ? 'bad' : ''}">⚡ <b>−${st.energy}</b></span>
        </div>
      </div>
      <button class="btn-premium-primary" data-start-w="${w.id}" style="padding:9px 14px;font-size:12px;flex-shrink:0;">${compact ? 'Старт' : 'Начать'}</button>
    </div>`;
}

function quickItemsRow(ids) {
  const have = ids.filter(id => itemCount(id) > 0);
  if (!have.length) return '';
  return `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
      ${have.map(id => {
        const it = ITEM_CATALOG[id];
        return `<button class="btn-chip" style="color:var(--rarity-${it.rarity});border-color:var(--rarity-${it.rarity});" data-quick-use="${id}">${it.icon} ${esc(it.name)} ×${itemCount(id)}</button>`;
      }).join('')}
    </div>`;
}

function renderHome() {
  const lvl = calcLevel(state.player.xp);
  const rank = getRank(lvl.level);
  const xpPct = Math.round((lvl.xpIntoLevel / lvl.xpForNextLevel) * 100);
  const activeChar = getActiveChar();
  const claimable = roadClaimable();
  const next = nextRoadReward();
  const bonuses = bonusSummary();

  let roadSub = 'Все награды получены 🎉';
  if (claimable.length) roadSub = `Ждут тебя: ${claimable.length} — забирай! 🎁`;
  else if (next) roadSub = `Следующая награда на ур. ${next.level} (ещё ${next.level - lvl.level} ур.)`;

  return `
    <div class="screen-pad">
      <div class="screen-header">
        <div>
          <div class="screen-sub">Твой путь к величию 💪</div>
          <h1 class="screen-title">FitQuest Pro 🔥</h1>
        </div>
        <div class="coins-badge js-coins">🪙 ${state.player.coins}</div>
      </div>

      <div class="hero-level-card">
        <div class="level-row-top">
          <div>
            <div class="level-num">Уровень ${lvl.level}</div>
            <div class="rank-badge">${esc(rank.name)}</div>
          </div>
          <div class="hero-char-avatar" title="${esc(activeChar.name)}">
            ${activeChar.icon}
          </div>
        </div>
        <div class="hero-xp-track">
          <div class="hero-xp-fill" style="width:${xpPct}%;"></div>
        </div>
        <div class="hero-xp-meta">
          <span>${lvl.xpIntoLevel} / ${lvl.xpForNextLevel} XP</span>
          <span>${xpPct}% до ${lvl.level + 1} ур.</span>
        </div>
        ${bonuses.length ? `<div class="hero-bonus-line">${esc(bonuses.join(' · '))}</div>` : ''}
      </div>

      <div class="stat-bars">
        ${energyBarHtml('w')}
        ${energyBarHtml('c')}
        ${boostPillsHtml()}
      </div>

      <div class="quick-grid">
        <button class="quick-card cases-btn" id="home-to-cases">
          <span class="q-ic">🎁</span>
          <span class="q-title">Кейсы</span>
          <span class="q-sub">${canClaimDailyCase() ? '⭐ Доступен!' : 'Рулетка'}</span>
        </button>
        <button class="quick-card clicker-btn" id="home-to-clicker">
          <span class="q-ic">👊</span>
          <span class="q-title">Кликер</span>
          <span class="q-sub">Тапай</span>
        </button>
        <button class="quick-card builder-btn" id="home-to-builder">
          <span class="q-ic">🛠️</span>
          <span class="q-title">Сборка</span>
          <span class="q-sub">Свой сет</span>
        </button>
        <button class="quick-card bag-btn" id="home-to-bag">
          <span class="q-ic">🎒</span>
          <span class="q-title">Сумка</span>
          <span class="q-sub">${totalItems()} предм.</span>
        </button>
      </div>

      <div class="card road-summary" id="home-to-road" style="cursor:pointer;">
        <div class="rs-ic">🛣️</div>
        <div class="rs-main">
          <div class="rs-title">Дорога уровней</div>
          <div class="rs-sub">${esc(roadSub)}</div>
        </div>
        <span class="btn-chip ${claimable.length ? 'active' : ''}">${claimable.length ? '🎁 ' + claimable.length : '→'}</span>
      </div>

      <div class="section-title-row">
        <h2 class="section-title">Квесты</h2>
      </div>
      <div style="margin-bottom:20px;">
        ${state.quests.map(questRowHtml).join('')}
      </div>

      <div class="section-title-row">
        <h2 class="section-title">Быстрый старт тренировки</h2>
        <button class="section-link" id="home-all-workouts-link">Все (${state.workouts.filter(w => w.active !== false).length}) →</button>
      </div>
      <div>
        ${state.workouts.filter(w => w.active !== false).slice(0, 3).map(w => workoutCardHtml(w, true)).join('')}
      </div>
    </div>`;
}

function renderWorkouts() {
  const list = state.workouts.filter(w => w.active !== false && (state.workoutCat === 'all' || w.cat === state.workoutCat));

  return `
    <div class="screen-pad">
      <div class="screen-header">
        <div>
          <h1 class="screen-title">🏋️ Тренировки</h1>
          <div class="screen-sub">${state.workouts.filter(w => w.active !== false).length} программ: ММА, бокс, грэпплинг, кроссфит</div>
        </div>
        <button class="btn-premium-gold" id="btn-open-constructor" style="padding:9px 14px;font-size:12px;">🛠️ Конструктор</button>
      </div>

      <div class="stat-bars" style="margin-bottom:14px;">
        ${energyBarHtml('w')}
        ${boostPillsHtml()}
      </div>

      ${quickItemsRow(['energy_drink', 'protein', 'mega_energy', 'xp_boost', 'coin_boost'])}

      <div style="background:rgba(123,92,250,0.1);border:1px solid rgba(123,92,250,0.3);border-radius:var(--radius-md);padding:14px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
        <div style="font-size:28px;">⚙️</div>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:800;color:#FFF;">Индивидуальная тренировка</div>
          <div style="font-size:11px;color:var(--text-muted);">51 упражнение, точное время и расчёт калорий и энергии!</div>
        </div>
        <button class="btn-premium-violet" id="banner-constructor-btn" style="padding:8px 12px;font-size:11.5px;">Собрать</button>
      </div>

      <div class="section-title-row">
        <h2 class="section-title">Готовые комплексы</h2>
        <button class="section-link" id="workouts-open-bag">🎒 Сумка (${totalItems()})</button>
      </div>

      <div class="cat-scroll">
        ${WORKOUT_CATEGORIES.map(c => `<button class="btn-chip ${state.workoutCat === c.id ? 'active' : ''}" data-w-cat="${c.id}">${c.label}</button>`).join('')}
      </div>

      <div>
        ${list.length ? list.map(w => workoutCardHtml(w, false)).join('') : `<div class="inv-empty">В этой категории пока нет тренировок</div>`}
      </div>
    </div>`;
}

function renderCases() {
  const dailyReady = canClaimDailyCase();
  const dailyTime = getDailyCaseTimeRemaining();
  const vouchers = itemCount('voucher');

  return `
    <div class="screen-pad">
      <div class="screen-header">
        <div>
          <h1 class="screen-title">🎁 Кейсы & Рулетка</h1>
          <div class="screen-sub">Бойцы, предметы для использования, трофеи и монеты!</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          ${vouchers > 0 ? `<span class="btn-chip" style="color:var(--cyan);border-color:var(--cyan);">🎟️ ${vouchers}</span>` : ''}
          <div class="coins-badge js-coins">🪙 ${state.player.coins}</div>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:14px;">
        <button class="btn-premium-ghost" id="cases-open-bag" style="flex:1;padding:10px;font-size:12px;">🎒 Сумка (${totalItems()})</button>
        <button class="btn-premium-ghost" id="cases-open-trophies" style="flex:1;padding:10px;font-size:12px;">🏆 Трофеи (${state.trophies.length})</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px;">
        ${state.cases.filter(c => c.active !== false).map(c => {
          const lootRow = `
            <div class="case-loot-row">
              <span>🎒 до ${c.itemRolls || 1} предм.</span>
              <span>🎖️ шанс бойца ${Math.round(c.rareDropChance * 100)}%</span>
            </div>`;

          if (c.isDaily) {
            return `
              <div class="card case-banner-card daily-card">
                <div class="case-banner-icon">${c.icon}</div>
                <div class="case-banner-title">${esc(c.name)}</div>
                <div class="case-banner-desc">${esc(c.desc)}</div>
                <div style="display:flex;justify-content:center;gap:12px;font-size:12px;font-weight:800;color:var(--emerald);margin-bottom:8px;">
                  <span>🪙 ${c.minCoins}–${c.maxCoins}</span>
                  <span>✨ ${c.minXp}–${c.maxXp} XP</span>
                </div>
                ${lootRow}
                <button class="btn-premium-emerald" data-open-case="${c.id}" style="width:100%;" ${!dailyReady ? 'disabled' : ''}>
                  ${dailyReady ? '🎁 Забрать бесплатно!' : `⏳ Перезарядка: ${dailyTime}`}
                </button>
              </div>`;
          }

          return `
            <div class="card case-banner-card">
              <div class="case-banner-icon">${c.icon}</div>
              <div class="case-banner-title">${esc(c.name)}</div>
              <div class="case-banner-desc">${esc(c.desc)}</div>
              <div style="display:flex;justify-content:center;gap:12px;font-size:12px;font-weight:800;color:var(--gold);margin-bottom:8px;">
                <span>🪙 ${c.minCoins}–${c.maxCoins}</span>
                <span>✨ ${c.minXp}–${c.maxXp} XP</span>
              </div>
              ${lootRow}
              ${vouchers > 0 ? `
                <div style="display:flex;gap:8px;">
                  <button class="btn-premium-emerald" data-open-case="${c.id}" data-pay="voucher" style="flex:1;font-size:12.5px;padding:12px 8px;">🎟️ По купону</button>
                  <button class="btn-premium-gold" data-open-case="${c.id}" data-pay="coins" style="flex:1;font-size:12.5px;padding:12px 8px;">За ${c.price} 🪙</button>
                </div>
              ` : `
                <button class="btn-premium-gold" data-open-case="${c.id}" data-pay="coins" style="width:100%;">
                  Открыть за ${c.price} 🪙
                </button>
              `}
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

function renderCharacters() {
  const now = Date.now();
  const lvl = calcLevel(state.player.xp).level;

  let filteredChars = state.characters;
  if (state.charSubTab === 'level') filteredChars = state.characters.filter(c => c.unlockType === 'level');
  else if (state.charSubTab === 'case') filteredChars = state.characters.filter(c => c.unlockType === 'case');

  return `
    <div class="screen-pad">
      <div class="screen-header">
        <div>
          <h1 class="screen-title">🎖️ Бойцы (${state.characters.length})</h1>
          <div class="screen-sub">Бонус выбранного бойца работает в тренировках, кликере и кейсах</div>
        </div>
        <div class="coins-badge js-coins">🪙 ${state.player.coins}</div>
      </div>

      <div class="char-filter-tabs">
        <button class="btn-chip ${state.charSubTab === 'all' ? 'active' : ''}" data-char-filter="all">Все (${state.characters.length})</button>
        <button class="btn-chip ${state.charSubTab === 'level' ? 'active' : ''}" data-char-filter="level">🏆 За Уровни</button>
        <button class="btn-chip ${state.charSubTab === 'case' ? 'active' : ''}" data-char-filter="case">🎁 Из Кейсов</button>
      </div>

      <div class="characters-grid">
        ${filteredChars.map(c => {
          const isUnlocked = state.unlockedCharacters.includes(c.id);
          const isSelected = state.activeCharacterId === c.id;
          const trainEnd = state.charTrainings[c.id];
          const isTraining = trainEnd && trainEnd > now;
          const trainDone = trainEnd && trainEnd <= now;
          const mins = Math.round(trainingDurationMs(c) / 60000 * 10) / 10;

          return `
            <div class="char-box rarity-${c.rarity}">
              <div class="char-avatar-frame ${isUnlocked ? '' : 'locked'}">
                ${isUnlocked ? c.icon : '🔒'}
              </div>
              <div class="char-meta-col">
                <div class="char-headline">
                  <span class="char-name-txt">${esc(c.name)}</span>
                  <span class="rarity-pill ${c.rarity}">${c.rarity}</span>
                  <span class="unlock-source-tag ${c.unlockType}">${c.unlockType === 'level' ? `🏆 Ур. ${c.unlockLevel}` : '🎁 Кейс'}</span>
                </div>
                <div class="char-sport-lbl">${esc(c.sport)}</div>
                <div class="char-perk-lbl">${isUnlocked ? esc(c.perk) : (c.unlockType === 'level' ? `🏆 Достигните ${c.unlockLevel} уровня` : '🎁 Выпадает из кейсов в рулетке')}</div>
              </div>
              <div class="char-btn-col">
                ${isUnlocked ? `
                  <button class="btn-chip ${isSelected ? 'active' : ''}" data-select-char="${c.id}">
                    ${isSelected ? '✓ Выбран' : 'Выбрать'}
                  </button>
                  ${isTraining ? `
                    <span style="font-size:10px;color:var(--text-muted);">⏳ В зале...</span>
                  ` : (trainDone ? `
                    <button class="btn-premium-gold" data-collect-char="${c.id}" style="padding:5px 10px;font-size:10.5px;">🎁 Забрать</button>
                  ` : `
                    <button class="btn-premium-violet" data-train-char="${c.id}" style="padding:5px 10px;font-size:10.5px;">🏋️ В зал (${mins}м)</button>
                  `)}
                ` : `
                  <span style="font-size:11px;color:var(--text-dim);font-weight:800;">
                    ${c.unlockType === 'level' ? `Ур. ${c.unlockLevel} 🔒` : 'Кейс 🎁'}
                  </span>
                `}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

/* ---------------- ДОРОГА УРОВНЕЙ ---------------- */
function renderRoad() {
  const lvl = calcLevel(state.player.xp).level;
  const claimable = roadClaimable();
  const next = nextRoadReward();
  const totalMilestones = ROAD_REWARDS.length;
  const claimedCount = state.roadClaimed.length;

  let rows = '';
  for (let l = 1; l <= ROAD_MAX_LEVEL; l++) {
    const r = ROAD_REWARDS.find(x => x.level === l);

    if (r) {
      const reached = lvl >= l;
      const claimed = state.roadClaimed.includes(l);
      const canClaim = reached && !claimed;
      const nodeCls = claimed ? 'claimed' : (canClaim ? 'claimable' : (reached ? 'reached' : ''));
      rows += `
        <div class="road-row" ${lvl === l ? 'id="road-current"' : ''}>
          <div class="road-node ${nodeCls}">${claimed ? '✓' : r.icon}<small>${l}</small></div>
          <div class="card road-card ${canClaim ? 'claimable' : ''}">
            <div class="rc-head">
              <span class="rc-lvl">Ур. ${l} · ${esc(r.title)}</span>
              <span class="rc-state">${claimed ? '✓ Получено' : (canClaim ? '🎁 Готово!' : '🔒 Закрыто')}</span>
            </div>
            <div class="rc-chips">
              ${describeGive(r.give).map(t => `<span class="rate-chip"><b>${esc(t)}</b></span>`).join('')}
            </div>
            ${canClaim ? `<button class="btn-premium-gold" data-road-claim="${l}" style="width:100%;padding:10px;font-size:12.5px;">Забрать награду</button>` : ''}
          </div>
        </div>`;
    } else {
      const reached = lvl >= l;
      const isCur = lvl === l;
      rows += `
        <div class="road-dot-row" ${isCur ? 'id="road-current"' : ''}>
          <div class="road-dot ${reached ? 'reached' : ''} ${isCur ? 'current' : ''}"><span></span></div>
          <span class="road-dot-lbl ${isCur ? 'current' : ''}">${isCur ? `Вы здесь · Ур. ${l}` : `Ур. ${l}`}</span>
        </div>`;
    }
  }

  return `
    <div class="screen-pad">
      <div class="screen-header">
        <div>
          <h1 class="screen-title">🛣️ Дорога уровней</h1>
          <div class="screen-sub">Награда каждые ${ROAD_STEP} уровня — даже если было тяжело</div>
        </div>
        <div class="coins-badge js-coins">🪙 ${state.player.coins}</div>
      </div>

      <div class="card road-summary">
        <div class="rs-ic">${claimable.length ? '🎁' : '🏁'}</div>
        <div class="rs-main">
          <div class="rs-title">Ваш уровень: ${lvl}</div>
          <div class="rs-sub">
            ${claimable.length ? `Ждёт наград: ${claimable.length}` : (next ? `Следующая награда на ур. ${next.level} — ${next.icon} ${esc(next.title)}` : 'Все награды получены')}
            · Собрано ${claimedCount}/${totalMilestones}
          </div>
        </div>
        ${claimable.length ? `<button class="btn-premium-gold" id="road-claim-all" style="padding:9px 12px;font-size:12px;">Забрать все</button>` : ''}
      </div>

      <div class="road-wrap">
        <div class="road-line"></div>
        ${rows}
      </div>

      <div class="road-end">🏁 Дорога идёт до уровня ${ROAD_MAX_LEVEL}.<br>Копите опыт — впереди легендарные награды на ур. 30 и 60!</div>
    </div>`;
}

function scrollRoadToCurrent() {
  setTimeout(() => {
    const el = document.getElementById('road-current');
    const v = document.getElementById('view');
    if (!el || !v) return;
    const delta = el.getBoundingClientRect().top - v.getBoundingClientRect().top - v.clientHeight / 3;
    v.scrollTop += delta;
  }, 60);
}

function renderProfile() {
  const lvl = calcLevel(state.player.xp);
  const rank = getRank(lvl.level);
  const totalKcal = state.history.reduce((a, h) => a + (h.calories || 0), 0);
  const eqT = TROPHY_CATALOG[state.equippedTrophy];

  return `
    <div class="screen-pad">
      <div class="screen-header">
        <h1 class="screen-title">⚙️ Профиль & Админка</h1>
      </div>

      <div class="card" style="display:flex;align-items:center;gap:14px;margin-bottom:16px;padding:16px;">
        <div style="width:58px;height:58px;border-radius:var(--radius-md);background:var(--primary-gradient);display:flex;align-items:center;justify-content:center;font-size:28px;">
          ${getActiveChar().icon}
        </div>
        <div style="flex:1;">
          <div style="font-size:16px;font-weight:900;">Атлет FitQuest</div>
          <div style="font-size:11.5px;color:var(--cyan);font-weight:700;">${esc(rank.name)} · Уровень ${lvl.level}</div>
          ${eqT && state.trophies.includes(eqT.id) ? `<div style="font-size:10.5px;color:var(--gold);font-weight:800;margin-top:2px;">${eqT.icon} Титул: ${esc(eqT.name)}</div>` : ''}
        </div>
        <div class="coins-badge js-coins">🪙 ${state.player.coins}</div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;margin-bottom:10px;">
        <div class="card" style="text-align:center;padding:12px 8px;"><div style="font-size:18px;font-weight:900;color:var(--cyan);">${lvl.level}</div><div style="font-size:10px;color:var(--text-muted);">Уровень</div></div>
        <div class="card" style="text-align:center;padding:12px 8px;"><div style="font-size:18px;font-weight:900;color:var(--violet);">${state.history.length}</div><div style="font-size:10px;color:var(--text-muted);">Тренировок</div></div>
        <div class="card" style="text-align:center;padding:12px 8px;"><div style="font-size:18px;font-weight:900;color:var(--gold);">${state.unlockedCharacters.length} / ${state.characters.length}</div><div style="font-size:10px;color:var(--text-muted);">Бойцов</div></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;margin-bottom:16px;">
        <div class="card" style="text-align:center;padding:12px 8px;"><div style="font-size:18px;font-weight:900;color:#FF7043;">${totalKcal}</div><div style="font-size:10px;color:var(--text-muted);">Ккал сожжено</div></div>
        <div class="card" style="text-align:center;padding:12px 8px;"><div style="font-size:18px;font-weight:900;color:var(--emerald);">${totalItems()}</div><div style="font-size:10px;color:var(--text-muted);">Предметов</div></div>
        <div class="card" style="text-align:center;padding:12px 8px;"><div style="font-size:18px;font-weight:900;color:#BFAEFF;">${state.roadClaimed.length}/${ROAD_REWARDS.length}</div><div style="font-size:10px;color:var(--text-muted);">Наград дороги</div></div>
      </div>

      <div class="card" style="margin-bottom:16px;padding:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-size:13px;font-weight:800;">🏆 Трофеи (${state.trophies.length})</div>
          <button class="btn-chip" id="profile-open-bag">🎒 Открыть сумку</button>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${state.trophies.map(tid => {
            const t = TROPHY_CATALOG[tid];
            if (!t) return '';
            return `<span class="btn-chip" style="color:var(--gold);border-color:rgba(255,184,0,${state.equippedTrophy === tid ? '0.9' : '0.3'});">${t.icon} ${esc(t.name)}${state.equippedTrophy === tid ? ' ✓' : ''}</span>`;
          }).join('')}
        </div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:20px;">🛡️</span>
            <span style="font-weight:800;font-size:14px;">Секретная Панель Администратора</span>
          </div>
          ${state.isAdmin ? `<span class="admin-badge-tag">Доступ открыт</span>` : ''}
        </div>
        <div class="screen-sub" style="margin-bottom:14px;">
          Анимация меню, энергия и кликер, цены кейсов, шансы бойцов, награды тренировок. Все правки сохраняются кнопкой «Сохранить изменения».
        </div>
        ${state.isAdmin ? `
          <button class="btn-premium-violet" id="open-admin-dashboard-btn" style="width:100%;margin-bottom:8px;">
            Открыть настройки админки →
          </button>
          <button class="btn-premium-ghost" id="admin-logout-btn" style="width:100%;color:var(--danger);font-size:12px;padding:8px;">
            Выйти из режима админа
          </button>
        ` : `
          <button class="btn-premium-primary" id="open-admin-login-btn" style="width:100%;">
            Вход для администратора 🔑
          </button>
        `}
      </div>

      <div class="section-title-row">
        <h2 class="section-title">История тренировок</h2>
      </div>
      <div>
        ${state.history.length ? state.history.slice(0, 8).map(h => `
          <div class="card" style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;margin-bottom:8px;">
            <div style="min-width:0;">
              <div style="font-size:13px;font-weight:800;">${esc(h.name)}</div>
              <div style="font-size:10.5px;color:var(--text-muted);">${esc(h.date)} · ${h.duration || 1} мин</div>
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <div style="font-size:11px;font-weight:800;color:#FF7043;">🔥 ${h.calories || 0} ккал</div>
              <div style="font-size:10.5px;font-weight:800;color:var(--gold);">+${h.coins} 🪙 · +${h.xp} XP</div>
            </div>
          </div>
        `).join('') : `
          <div style="text-align:center;padding:30px;color:var(--text-muted);font-size:12px;">Пока нет завершенных тренировок</div>
        `}
      </div>
    </div>`;
}

function renderClickerTab() {
  const tapXp = Math.max(1, Math.round(state.settings.tapXp * (1 + cb('tap'))));
  const tapCoins = Math.max(1, Math.round(state.settings.tapCoins * (1 + cb('tap'))));
  const critChance = Math.round(cb('crit') * 100);

  return `
    <div class="screen-pad">
      <div class="screen-header">
        <button class="btn-chip" id="clicker-back-btn">← Назад</button>
        <h1 class="screen-title" style="margin:0;font-size:18px;">👊 Боксёрская груша</h1>
        <div class="coins-badge js-coins" id="clicker-coins-val">🪙 ${state.player.coins}</div>
      </div>

      <div class="clicker-container">
        <div class="energy-pill-box">
          <div class="energy-hdr">
            <span>⚡ Запас ударов</span>
            <span data-ce-val>${Math.floor(state.clickerEnergy)} / ${maxCE()}</span>
          </div>
          <div class="energy-progress-bar">
            <div class="energy-progress-fill" data-ce-fill style="width:${(state.clickerEnergy / maxCE()) * 100}%;"></div>
          </div>
          <div class="energy-sub">
            <span>+1 удар каждые ${state.settings.clickerRegenSec} сек</span>
            <span data-ce-timer>${state.clickerEnergy >= maxCE() ? 'Полный ✓' : 'Следующий через ' + secToNextCE() + 'с'}</span>
          </div>
        </div>

        <button class="punch-circle-btn" id="main-punch-btn">
          🥊
        </button>

        <div style="font-size:13px;font-weight:800;color:var(--text-main);margin-bottom:4px;">Тапай по боксёрской груше!</div>
        <div class="screen-sub">Каждый удар: +${tapXp} XP и +${tapCoins} 🪙${critChance ? ` · шанс крита ${critChance}% (×${state.settings.critMultiplier})` : ''}</div>

        <div style="margin-top:16px;width:100%;">
          ${quickItemsRow(['click_charge', 'click_full', 'legend_elixir'])}
        </div>
      </div>
    </div>`;
}

