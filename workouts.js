/* FitQuest Pro — js/workouts.js
   Статистика тренировок, конструктор, плеер тренировки
   (обычный скрипт: глобальные функции и переменные общие для всех файлов, порядок подключения см. в index.html) */

/* =========================================================================
   12. СТАТИСТИКА ТРЕНИРОВОК, ЭНЕРГОЗАТРАТЫ И МНОЖИТЕЛИ НАГРАД
   ========================================================================= */
function energyCost(totalKcal) {
  const base = totalKcal * state.settings.energyCostFactor;
  const reduction = Math.min(0.7, cb('cost') + trophyBonus('costMult'));
  return Math.min(maxWE(), Math.max(1, Math.round(base * (1 - reduction))));
}

function workoutStats(w) {
  const steps = w.steps && w.steps.length ? w.steps : defaultSteps(w.icon);
  let sec = 0, kcal = 0, xp = 0, coins = 0;
  steps.forEach(st => {
    sec += st.duration;
    kcal += w.kcalPerMin * st.mult * st.duration / 60;
    xp += w.xpPerMin * st.duration / 60;
    coins += w.coinsPerMin * st.duration / 60;
  });
  return {
    steps, sec,
    min: Math.max(1, Math.round(sec / 60)),
    kcal: Math.round(kcal),
    xp: Math.round(xp),
    coins: Math.round(coins),
    energy: energyCost(kcal)
  };
}

function xpMultNow() {
  let m = 1 + cb('xp') + trophyBonus('xpMult');
  if (state.boosts.xpLeft > 0) m *= state.boosts.xpMult;
  return m;
}
function coinMultNow() {
  let m = 1 + cb('coins') + trophyBonus('coinMult');
  if (state.boosts.coinLeft > 0) m *= state.boosts.coinMult;
  return m;
}

function formatSec(s) {
  if (s >= 60) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return sec > 0 ? `${m}м ${sec}с` : `${m} мин`;
  }
  return `${s} сек`;
}

/* =========================================================================
   13. КОНСТРУКТОР ТРЕНИРОВКИ (С ФИЛЬТРОМ, КАЛОРИЯМИ И ЭНЕРГИЕЙ)
   ========================================================================= */
function idSelected(id) {
  return Object.prototype.hasOwnProperty.call(state.builderSelection, id);
}

function openBuilderModal() {
  Sound.click();
  renderBuilderSheet();
}

function renderBuilderSheet() {
  const root = document.getElementById('modal-root');
  const prevList = root.querySelector('.builder-exercise-list');
  const prevScroll = prevList ? prevList.scrollTop : 0;

  let totalSec = 0, totalXp = 0, totalCoins = 0, totalKcal = 0;

  const selectedExIds = Object.keys(state.builderSelection);
  selectedExIds.forEach(id => {
    const ex = state.exercises.find(x => x.id === id);
    if (ex) {
      const sec = state.builderSelection[id];
      totalSec += sec;
      totalXp += (ex.xpPerMin / 60) * sec;
      totalCoins += (ex.coinsPerMin / 60) * sec;
      totalKcal += (ex.kcalPerMin / 60) * sec;
    }
  });
  totalXp = Math.round(totalXp * xpMultNow());
  totalCoins = Math.round(totalCoins * coinMultNow());

  const totalMin = Math.max(1, Math.round(totalSec / 60));
  const cost = energyCost(totalKcal);
  const enough = state.workoutEnergy >= cost;

  const visible = state.exercises.filter(ex => state.builderCat === 'all' || (ex.cat || 'base') === state.builderCat);

  root.innerHTML = `
    <div class="modal-overlay active" id="builder-modal-ov">
      <div class="modal-sheet">
        <div class="modal-bar-handle"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <h2 style="font-size:18px;font-weight:900;">🛠️ Конструктор тренировки</h2>
          <span style="font-size:11px;font-weight:800;color:var(--primary);">${selectedExIds.length} выбрано</span>
        </div>
        <div class="screen-sub" style="margin-bottom:12px;">Выберите упражнения (бокс, ММА, грэпплинг, кроссфит) и настройте время:</div>

        <div class="cat-scroll" style="margin-bottom:10px;">
          ${EXERCISE_CATEGORIES.map(c => `<button class="btn-chip ${state.builderCat === c.id ? 'active' : ''}" data-b-cat="${c.id}">${c.label}</button>`).join('')}
        </div>

        <div class="builder-exercise-list">
          ${visible.map(ex => {
            const isSel = idSelected(ex.id);
            const currentSec = state.builderSelection[ex.id] || ex.defaultSec || 60;
            return `
              <div class="builder-item-card ${isSel ? 'selected' : ''}" data-item-id="${ex.id}">
                <div class="builder-item-check" data-toggle-ex="${ex.id}">${isSel ? '✓' : ''}</div>
                <div class="builder-item-icon">${ex.icon}</div>
                <div class="builder-item-info">
                  <div class="builder-item-name">${esc(ex.name)}</div>
                  <div class="builder-item-muscle">${esc(ex.muscle)} · 🔥 ${ex.kcalPerMin} ккал/мин</div>
                </div>
                ${isSel ? `
                  <div class="builder-item-timectrl">
                    <button class="time-stepper-btn" data-time-dec="${ex.id}">−</button>
                    <span class="time-stepper-val">${formatSec(currentSec)}</span>
                    <button class="time-stepper-btn" data-time-inc="${ex.id}">+</button>
                  </div>
                ` : `
                  <button class="btn-chip" data-toggle-ex="${ex.id}">Добавить</button>
                `}
              </div>`;
          }).join('')}
        </div>

        <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px 8px;display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:12px;">
          <div style="text-align:center;"><div style="font-size:10px;color:var(--text-muted);">Время</div><div style="font-size:13px;font-weight:900;color:var(--cyan);">${totalMin} мин</div></div>
          <div style="text-align:center;"><div style="font-size:10px;color:var(--text-muted);">Калории</div><div style="font-size:13px;font-weight:900;color:#FF7043;">🔥 ${Math.round(totalKcal)}</div></div>
          <div style="text-align:center;"><div style="font-size:10px;color:var(--text-muted);">XP</div><div style="font-size:13px;font-weight:900;color:var(--violet);">✨ +${totalXp}</div></div>
          <div style="text-align:center;"><div style="font-size:10px;color:var(--text-muted);">Монеты</div><div style="font-size:13px;font-weight:900;color:var(--gold);">🪙 +${totalCoins}</div></div>
          <div style="text-align:center;"><div style="font-size:10px;color:var(--text-muted);">Энергия</div><div style="font-size:13px;font-weight:900;color:${enough ? '#7DFFB5' : '#FF8A9B'};">⚡ −${cost}</div></div>
        </div>
        <div style="font-size:11px;font-weight:700;text-align:center;margin-bottom:12px;color:${enough ? 'var(--text-muted)' : '#FF8A9B'};">
          ${enough ? `У вас ⚡ ${Math.floor(state.workoutEnergy)} из ${maxWE()}` : `Не хватает энергии: нужно ${cost}, есть ${Math.floor(state.workoutEnergy)}. Используйте энергетик из сумки или подождите.`}
        </div>

        <div style="display:flex;gap:10px;">
          <button class="btn-premium-ghost" id="builder-close-btn" style="flex:1;">Закрыть</button>
          <button class="btn-premium-primary" id="builder-start-btn" style="flex:2;" ${selectedExIds.length === 0 ? 'disabled' : ''}>🚀 Начать сет</button>
        </div>
      </div>
    </div>`;

  const newList = root.querySelector('.builder-exercise-list');
  if (newList) newList.scrollTop = prevScroll;

  document.getElementById('builder-close-btn').onclick = closeModal;
  document.getElementById('builder-modal-ov').onclick = (e) => {
    if (e.target.id === 'builder-modal-ov') closeModal();
  };

  root.querySelectorAll('[data-b-cat]').forEach(btn => {
    btn.onclick = () => {
      Sound.click();
      state.builderCat = btn.dataset.bCat;
      renderBuilderSheet();
    };
  });

  root.querySelectorAll('[data-toggle-ex]').forEach(btn => {
    btn.onclick = () => {
      Sound.click();
      const id = btn.dataset.toggleEx;
      if (idSelected(id)) {
        delete state.builderSelection[id];
      } else {
        const ex = state.exercises.find(x => x.id === id);
        state.builderSelection[id] = (ex && ex.defaultSec) || 60;
      }
      persist();
      renderBuilderSheet();
    };
  });

  root.querySelectorAll('[data-time-dec]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      Sound.click();
      const id = btn.dataset.timeDec;
      if (idSelected(id)) {
        state.builderSelection[id] = Math.max(15, state.builderSelection[id] - 15);
        persist();
        renderBuilderSheet();
      }
    };
  });

  root.querySelectorAll('[data-time-inc]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      Sound.click();
      const id = btn.dataset.timeInc;
      if (idSelected(id)) {
        state.builderSelection[id] = Math.min(600, state.builderSelection[id] + 15);
        persist();
        renderBuilderSheet();
      }
    };
  });

  document.getElementById('builder-start-btn').onclick = () => {
    startCustomBuilderWorkoutSession();
  };
}

/* =========================================================================
   14. ПЛЕЕР ТРЕНИРОВКИ: ТАЙМЕР, КАЛОРИИ, ЭНЕРГИЯ, БУСТЕРЫ
   ========================================================================= */
function beginSession(title, queue, isBuilder) {
  if (state.activeWorkoutSession) return false;
  regenTick();

  let totalKcal = 0, plannedSec = 0;
  queue.forEach(q => { totalKcal += q.kcalRate * q.duration / 60; plannedSec += q.duration; });
  const cost = energyCost(totalKcal);

  if (state.workoutEnergy < cost) {
    Sound.denied();
    showToast(`Не хватает энергии ⚡ Нужно ${cost}, есть ${Math.floor(state.workoutEnergy)}. Энергетик из сумки поможет!`);
    return false;
  }

  spendWorkoutEnergy(cost);
  persist();
  closeModal();
  Sound.fanfare();
  if (isBuilder) updateQuestProgress('builder', 1);

  state.activeWorkoutSession = {
    title,
    queue,
    currentIndex: 0,
    remainingSeconds: queue[0].duration,
    isPaused: false,
    timerId: null,
    totalElapsedSeconds: 0,
    plannedSeconds: plannedSec,
    energySpent: cost,
    xpMult: xpMultNow(),
    coinMult: coinMultNow(),
    totalXpEarned: 0,
    totalCoinsEarned: 0,
    totalCaloriesBurned: 0
  };

  renderWorkoutPlayerModal();
  runWorkoutTicker();
  return true;
}

function startCustomBuilderWorkoutSession() {
  const selectedExIds = Object.keys(state.builderSelection);
  const queue = [];

  selectedExIds.forEach(id => {
    const ex = state.exercises.find(x => x.id === id);
    if (ex) {
      queue.push({
        id: ex.id,
        name: ex.name,
        muscle: ex.muscle,
        icon: ex.icon,
        duration: state.builderSelection[id],
        xpRate: ex.xpPerMin,
        coinsRate: ex.coinsPerMin,
        kcalRate: ex.kcalPerMin
      });
    }
  });

  if (!queue.length) { showToast('Выберите хотя бы одно упражнение'); return; }
  beginSession('Мой кастомный комплекс', queue, true);
}

function startStandardWorkout(w) {
  const steps = w.steps && w.steps.length ? w.steps : defaultSteps(w.icon);
  const queue = steps.map((st, i) => ({
    id: w.id + '-s' + i,
    name: st.name,
    muscle: st.muscle,
    icon: st.icon,
    duration: st.duration,
    xpRate: w.xpPerMin,
    coinsRate: w.coinsPerMin,
    kcalRate: w.kcalPerMin * st.mult
  }));
  beginSession(w.name, queue, false);
}

function runWorkoutTicker() {
  if (state.activeWorkoutSession.timerId) clearInterval(state.activeWorkoutSession.timerId);

  state.activeWorkoutSession.timerId = setInterval(() => {
    const s = state.activeWorkoutSession;
    if (!s || s.isPaused) return;

    if (s.remainingSeconds > 0) {
      s.remainingSeconds--;
      s.totalElapsedSeconds++;

      if (s.remainingSeconds <= 3 && s.remainingSeconds > 0) {
        Sound.beep(700, 0.08);
      } else if (s.remainingSeconds === 0) {
        Sound.beep(1200, 0.25);
      } else {
        Sound.tick();
      }

      const currentEx = s.queue[s.currentIndex];
      s.totalXpEarned += (currentEx.xpRate / 60);
      s.totalCoinsEarned += (currentEx.coinsRate / 60);
      s.totalCaloriesBurned += (currentEx.kcalRate / 60);

      updateWorkoutPlayerUI();
    } else {
      if (s.currentIndex < s.queue.length - 1) {
        s.currentIndex++;
        s.remainingSeconds = s.queue[s.currentIndex].duration;
        Sound.fanfare();
        showToast(`Следующее: ${s.queue[s.currentIndex].name}!`);
        renderWorkoutPlayerModal();
      } else {
        finishWorkoutSession();
      }
    }
  }, 1000);
}

function updateWorkoutPlayerUI() {
  const s = state.activeWorkoutSession;
  if (!s) return;
  const timeEl = document.getElementById('live-player-timer');
  const kcalEl = document.getElementById('live-player-kcal');
  const xpEl = document.getElementById('live-player-xp');
  const coEl = document.getElementById('live-player-coins');
  const prEl = document.getElementById('live-player-progress');

  const m = Math.floor(s.remainingSeconds / 60);
  const sec = s.remainingSeconds % 60;
  const timeStr = `${pad2(m)}:${pad2(sec)}`;

  if (timeEl) timeEl.textContent = timeStr;
  if (kcalEl) kcalEl.textContent = `🔥 ${s.totalCaloriesBurned.toFixed(1)} ккал сожжено`;
  if (xpEl) xpEl.textContent = `✨ +${Math.round(s.totalXpEarned * s.xpMult)} XP`;
  if (coEl) coEl.textContent = `🪙 +${Math.round(s.totalCoinsEarned * s.coinMult)}`;
  if (prEl) prEl.style.width = Math.min(100, Math.round((s.totalElapsedSeconds / s.plannedSeconds) * 100)) + '%';
}

function renderWorkoutPlayerModal() {
  const s = state.activeWorkoutSession;
  if (!s) return;
  const currentEx = s.queue[s.currentIndex];
  const nextEx = s.queue[s.currentIndex + 1];
  const m = Math.floor(s.remainingSeconds / 60);
  const sec = s.remainingSeconds % 60;
  const timeStr = `${pad2(m)}:${pad2(sec)}`;
  const progress = Math.min(100, Math.round((s.totalElapsedSeconds / s.plannedSeconds) * 100));

  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay active" id="player-modal-ov">
      <div class="modal-sheet" style="text-align:center;">
        <div class="modal-bar-handle"></div>
        <div style="font-size:11px;font-weight:800;color:var(--primary);text-transform:uppercase;margin-bottom:4px;">${esc(s.title)} · Раунд ${s.currentIndex + 1} из ${s.queue.length}</div>
        <div style="font-size:48px;margin:6px 0;">${currentEx.icon}</div>
        <h2 style="font-size:20px;font-weight:900;">${esc(currentEx.name)}</h2>
        <div class="screen-sub" style="margin-top:2px;">${esc(currentEx.muscle)}</div>

        <div class="live-timer-ring" id="live-player-timer">${timeStr}</div>

        <div class="session-progress"><div class="session-progress-fill" id="live-player-progress" style="width:${progress}%;"></div></div>

        <div class="live-calorie-badge" id="live-player-kcal">
          🔥 ${s.totalCaloriesBurned.toFixed(1)} ккал сожжено
        </div>

        <div style="display:flex;justify-content:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;">
          <div class="btn-chip" id="live-player-xp" style="color:var(--violet);">✨ +${Math.round(s.totalXpEarned * s.xpMult)} XP</div>
          <div class="btn-chip" id="live-player-coins" style="color:var(--gold);">🪙 +${Math.round(s.totalCoinsEarned * s.coinMult)}</div>
          <div class="btn-chip" style="color:#7DFFB5;">⚡ потрачено ${s.energySpent}</div>
        </div>

        ${(s.xpMult > 1 || s.coinMult > 1) ? `<div style="font-size:11px;font-weight:800;color:#D9A8FF;margin-bottom:12px;">Бонусы активны: XP ×${s.xpMult.toFixed(2)} · монеты ×${s.coinMult.toFixed(2)}</div>` : ''}

        ${nextEx ? `
          <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:var(--radius-md);padding:8px 12px;font-size:11px;color:var(--text-muted);margin-bottom:16px;">
            Далее: <b>${nextEx.icon} ${esc(nextEx.name)}</b> (${formatSec(nextEx.duration)})
          </div>
        ` : ''}

        <div style="display:flex;gap:10px;">
          <button class="btn-premium-ghost" id="player-pause-btn" style="flex:1;">
            ${s.isPaused ? '▶️ Продолжить' : '⏸️ Пауза'}
          </button>
          <button class="btn-premium-ghost" id="player-skip-btn" style="flex:1;">
            ⏭️ Пропуск
          </button>
          <button class="btn-premium-primary" id="player-finish-btn" style="flex:1.4;">
            🏁 Завершить
          </button>
        </div>
      </div>
    </div>`;

  document.getElementById('player-pause-btn').onclick = () => {
    Sound.click();
    s.isPaused = !s.isPaused;
    renderWorkoutPlayerModal();
  };

  document.getElementById('player-skip-btn').onclick = () => {
    Sound.click();
    s.remainingSeconds = 0;
  };

  document.getElementById('player-finish-btn').onclick = () => {
    finishWorkoutSession();
  };
}

function finishWorkoutSession() {
  const s = state.activeWorkoutSession;
  if (!s) return;
  if (s.timerId) clearInterval(s.timerId);
  state.activeWorkoutSession = null;

  // Слишком рано — награды нет, энергия возвращается целиком
  if (s.totalElapsedSeconds < 10) {
    gainWorkoutEnergy(s.energySpent);
    persist();
    closeModal();
    showToast('Тренировка прервана слишком рано — энергия возвращена');
    render();
    return;
  }

  // Возврат энергии за непройденную часть
  const unusedShare = Math.max(0, 1 - s.totalElapsedSeconds / s.plannedSeconds);
  const refund = Math.round(s.energySpent * unusedShare);
  if (refund > 0) gainWorkoutEnergy(refund);

  const xpEarned = Math.max(1, Math.round(s.totalXpEarned * s.xpMult));
  const coinsEarned = Math.max(1, Math.round(s.totalCoinsEarned * s.coinMult));
  const caloriesBurned = Math.max(1, Math.round(s.totalCaloriesBurned));
  const elapsedMinutes = Math.max(1, Math.round(s.totalElapsedSeconds / 60));

  // Расходуем активные бустеры
  if (state.boosts.xpLeft > 0) { state.boosts.xpLeft--; if (state.boosts.xpLeft <= 0) state.boosts.xpMult = 1; }
  if (state.boosts.coinLeft > 0) { state.boosts.coinLeft--; if (state.boosts.coinLeft <= 0) state.boosts.coinMult = 1; }

  state.player.coins += coinsEarned;

  state.history.unshift({
    id: genId('hist'),
    name: s.title,
    date: new Date().toLocaleDateString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    duration: elapsedMinutes,
    calories: caloriesBurned,
    xp: xpEarned,
    coins: coinsEarned
  });
  if (state.history.length > 60) state.history.length = 60;

  if (s.totalElapsedSeconds >= 60) updateQuestProgress('workout', 1);
  persist();
  closeModal();
  Sound.fanfare();
  showToast(`🎉 Готово! +${xpEarned} XP · +${coinsEarned} 🪙 · 🔥 ${caloriesBurned} ккал${refund > 0 ? ' · ⚡ вернули ' + refund : ''}`);

  addPlayerXp(xpEarned);
  render();
}

