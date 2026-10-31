/* FitQuest Pro — js/clicker.js
   Кликер: лимит 200, +1 удар / 3 сек
   (обычный скрипт: глобальные функции и переменные общие для всех файлов, порядок подключения см. в index.html) */

/* =========================================================================
   18. КЛИКЕР-ТАПАЛКА: ЛИМИТ 200, +1 УДАР КАЖДЫЕ 3 СЕКУНДЫ
   ========================================================================= */
function tapPunch(e) {
  regenTick();
  if (state.clickerEnergy < 1) {
    Sound.denied();
    showToast(`Удары закончились! +1 каждые ${state.settings.clickerRegenSec} сек. Или примените 🔋 батарейку.`);
    return;
  }

  spendClick();

  const crit = Math.random() < cb('crit');
  const mult = (1 + cb('tap')) * (crit ? state.settings.critMultiplier : 1);
  const xpGain = Math.max(1, Math.round(state.settings.tapXp * mult));
  const coinsGain = Math.max(1, Math.round(state.settings.tapCoins * mult));

  if (crit) Sound.crit(); else Sound.punch();

  state.player.coins += coinsGain;
  updateQuestProgress('click', 1);
  addPlayerXp(xpGain);

  const pop = document.createElement('div');
  pop.className = 'floating-punch-text' + (crit ? ' crit' : '');
  pop.textContent = (crit ? 'КРИТ! ' : '') + `+${xpGain}XP +${coinsGain}🪙`;
  const target = e.currentTarget || e.target;
  const rect = target.getBoundingClientRect();
  const shellRect = document.getElementById('app-shell').getBoundingClientRect();
  pop.style.left = (rect.left - shellRect.left + rect.width / 2 - 40 + (Math.random() * 30 - 15)) + 'px';
  pop.style.top = (rect.top - shellRect.top + (Math.random() * 20 - 10)) + 'px';
  document.getElementById('app-shell').appendChild(pop);
  setTimeout(() => pop.remove(), 750);

  updateClickerUI();
}

function updateClickerUI() {
  updateEnergyUI();
  updateCoinsUI();
}

