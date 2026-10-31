/* FitQuest Pro — js/characters.js
   Авто-тренировки персонажей
   (обычный скрипт: глобальные функции и переменные общие для всех файлов, порядок подключения см. в index.html) */

/* =========================================================================
   17. АВТО-ТРЕНИРОВКИ ПЕРСОНАЖЕЙ
   ========================================================================= */
function trainingDurationMs(ch) {
  const reduce = (ch.bonus && ch.bonus.autoTime) || 0;
  return Math.round(5 * 60 * 1000 * (1 - reduce));
}

function sendCharToTraining(charId) {
  Sound.click();
  const ch = state.characters.find(x => x.id === charId);
  const dur = trainingDurationMs(ch);
  state.charTrainings[charId] = Date.now() + dur;
  persist();
  render();
  showToast(`${ch.name} отправлен на авто-тренировку (${Math.round(dur / 60000 * 10) / 10} мин)!`);
}

function collectCharTrainingReward(charId) {
  Sound.fanfare();
  const ch = state.characters.find(x => x.id === charId);
  delete state.charTrainings[charId];

  let bonusCoins = 130;
  let bonusXp = 85;
  if (ch.rarity === 'epic') { bonusCoins = 240; bonusXp = 150; }
  else if (ch.rarity === 'legendary') { bonusCoins = 480; bonusXp = 300; }
  else if (ch.rarity === 'mythic') { bonusCoins = 900; bonusXp = 550; }

  const mult = 1 + ((ch.bonus && ch.bonus.auto) || 0);
  bonusCoins = Math.round(bonusCoins * mult);
  bonusXp = Math.round(bonusXp * mult);

  state.player.coins += bonusCoins;
  persist();
  addPlayerXp(bonusXp);
  render();
  showToast(`Добыча с тренировки ${ch.name}! +${bonusCoins}🪙 +${bonusXp}XP`);
}

