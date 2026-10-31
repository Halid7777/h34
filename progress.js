/* FitQuest Pro — js/progress.js
   Дорога уровней, квесты, повышение уровня
   (обычный скрипт: глобальные функции и переменные общие для всех файлов, порядок подключения см. в index.html) */

/* =========================================================================
   8. ДОРОГА УРОВНЕЙ: УТЕШИТЕЛЬНАЯ НАГРАДА КАЖДЫЕ 3 УРОВНЯ
   ========================================================================= */
function roadClaimable() {
  const lvl = calcLevel(state.player.xp).level;
  return ROAD_REWARDS.filter(r => r.level <= lvl && !state.roadClaimed.includes(r.level));
}
function nextRoadReward() {
  const lvl = calcLevel(state.player.xp).level;
  return ROAD_REWARDS.find(r => r.level > lvl) || null;
}

function claimRoadReward(level) {
  const r = ROAD_REWARDS.find(x => x.level === level);
  if (!r || state.roadClaimed.includes(level)) return;
  if (calcLevel(state.player.xp).level < level) { showToast('Этот уровень ещё не достигнут'); return; }
  state.roadClaimed.push(level);
  Sound.fanfare();
  updateQuestProgress('road', 1);
  applyGive(r.give);
  showToast(`🛣️ Награда ур. ${level}: ${describeGive(r.give).join(' · ')}`);
  render();
}

function claimAllRoadRewards() {
  const list = roadClaimable();
  if (!list.length) return;
  Sound.fanfare();
  const merged = { coins: 0, xp: 0, energy: 0, clicks: 0, items: {} };
  list.forEach(r => {
    state.roadClaimed.push(r.level);
    const g = r.give;
    merged.coins += g.coins || 0;
    merged.xp += g.xp || 0;
    merged.energy += g.energy || 0;
    merged.clicks += g.clicks || 0;
    Object.keys(g.items || {}).forEach(id => { merged.items[id] = (merged.items[id] || 0) + g.items[id]; });
  });
  updateQuestProgress('road', list.length);
  applyGive(merged);
  showToast(`🛣️ Забрано наград: ${list.length}`);
  render();
}

/* =========================================================================
   9. КВЕСТЫ (СБРОС КАЖДЫЙ ДЕНЬ / НЕДЕЛЮ)
   ========================================================================= */
function resetQuestsIfNeeded() {
  const dk = dayKeyNow();
  const wk = weekKeyNow();
  let changed = false;
  state.quests.forEach(q => {
    const isWeek = q.period === 'week';
    if ((!isWeek && state.questDayKey !== dk) || (isWeek && state.questWeekKey !== wk)) {
      q.current = 0;
      q.claimed = false;
      changed = true;
    }
  });
  if (state.questDayKey !== dk) { state.questDayKey = dk; changed = true; }
  if (state.questWeekKey !== wk) { state.questWeekKey = wk; changed = true; }
  if (changed) persist();
}

function claimQuest(id, silent) {
  const q = state.quests.find(x => x.id === id);
  if (!q || q.claimed || q.current < q.target) return false;
  q.claimed = true;
  const mult = 1 + cb('quest');
  const coins = Math.round(q.rewardCoins * mult);
  const xp = Math.round(q.rewardXp * mult);
  state.player.coins += coins;
  persist();
  addPlayerXp(xp);
  if (!silent) showToast(`Квест сдан! +${coins}🪙 +${xp}XP`);
  return true;
}

function updateQuestProgress(actionKey, amount = 1) {
  const map = { workout: 'тренировк', click: 'клик', builder: 'конструктор', case: 'кейс', item: 'предмет', road: 'дорог' };
  const needle = map[actionKey];
  if (!needle) return;
  state.quests.forEach(q => {
    if (!q.claimed && q.title.toLowerCase().includes(needle)) {
      q.current = Math.min(q.target, q.current + amount);
    }
  });
  persist();
  // Бонус Джаггернаута: авто-сбор квестов
  if (cb('autoClaim')) {
    state.quests.forEach(q => { if (!q.claimed && q.current >= q.target) claimQuest(q.id, true); });
  }
}

/* =========================================================================
   10. УРОВНИ, РАЗБЛОКИРОВКА БОЙЦОВ, ПОВЫШЕНИЕ УРОВНЯ
   ========================================================================= */
function checkLevelUnlocks(level) {
  const newlyUnlocked = [];
  state.characters.forEach(c => {
    if (c.unlockType === 'level' && c.unlockLevel <= level && !state.unlockedCharacters.includes(c.id)) {
      state.unlockedCharacters.push(c.id);
      newlyUnlocked.push(c);
    }
  });
  if (newlyUnlocked.length > 0) persist();
  return newlyUnlocked;
}

function addPlayerXp(amount) {
  const oldLevel = calcLevel(state.player.xp).level;
  state.player.xp += amount;
  const newLevel = calcLevel(state.player.xp).level;

  if (newLevel > oldLevel) {
    const unlockedChars = checkLevelUnlocks(newLevel);
    triggerLevelUpModal(oldLevel, newLevel, unlockedChars);
  }
  persist();
}

function triggerLevelUpModal(oldLvl, newLvl, unlockedChars) {
  Sound.levelUpFanfare();
  const rank = getRank(newLvl);
  const bonusCoins = newLvl * 60;
  state.player.coins += bonusCoins;
  persist();

  const newRoad = ROAD_REWARDS.filter(r => r.level > oldLvl && r.level <= newLvl && !state.roadClaimed.includes(r.level));

  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay active" id="levelup-modal-ov">
      <div class="modal-sheet" style="text-align:center;">
        <div class="modal-bar-handle"></div>
        <div class="levelup-badge-anim">🏆</div>
        <div style="font-size:12px;font-weight:800;color:var(--gold);letter-spacing:1px;text-transform:uppercase;margin-top:6px;">ПОЗДРАВЛЯЕМ!</div>
        <h2 style="font-size:26px;font-weight:900;margin:4px 0 6px;">НОВЫЙ УРОВЕНЬ!</h2>

        <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin:12px 0;">
          <span style="font-size:18px;font-weight:800;color:var(--text-muted);">Ур. ${oldLvl}</span>
          <span style="font-size:22px;color:var(--gold);">➔</span>
          <span style="font-size:26px;font-weight:900;color:var(--cyan);background:rgba(0,229,255,0.15);padding:4px 16px;border-radius:var(--radius-pill);border:1px solid var(--cyan);">Ур. ${newLvl}</span>
        </div>

        <div style="font-size:13px;font-weight:700;color:var(--violet);margin-bottom:14px;">Ранг: ${esc(rank.name)}</div>

        <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;margin-bottom:18px;">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">Награды за достижение:</div>
          <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">
            <span class="btn-chip" style="color:var(--gold);">🪙 +${bonusCoins} Монет</span>
            ${unlockedChars.map(c => `
              <span class="btn-chip" style="color:var(--cyan);border-color:var(--cyan);">🎖️ Разблокирован: ${c.icon} ${esc(c.name)}</span>
            `).join('')}
            ${newRoad.map(r => `
              <span class="btn-chip" style="color:#7DFFB5;border-color:rgba(0,230,118,0.5);">🛣️ Дорога ур. ${r.level}: ${r.icon} ${esc(r.title)}</span>
            `).join('')}
          </div>
        </div>

        <div style="display:flex;gap:10px;">
          ${newRoad.length ? `<button class="btn-premium-ghost" id="levelup-road-btn" style="flex:1;">🛣️ На дорогу</button>` : ''}
          <button class="btn-premium-gold" id="levelup-collect-btn" style="flex:1.5;">Забрать награды 🔥</button>
        </div>
      </div>
    </div>`;

  document.getElementById('levelup-collect-btn').onclick = () => {
    Sound.click();
    closeModal();
    render();
  };
  const roadBtn = document.getElementById('levelup-road-btn');
  if (roadBtn) roadBtn.onclick = () => {
    closeModal();
    switchTab('road');
  };
}

