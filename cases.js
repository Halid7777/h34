/* FitQuest Pro — js/cases.js
   Кейсы, рулетка, выпадение предметов
   (обычный скрипт: глобальные функции и переменные общие для всех файлов, порядок подключения см. в index.html) */

/* =========================================================================
   15. СИСТЕМА КЕЙСОВ, РУЛЕТКА И ВЫПАДАЮЩИЕ ПРЕДМЕТЫ
   ========================================================================= */
function canClaimDailyCase() {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  return (now - state.lastDailyCaseTimestamp) >= dayMs;
}

function getDailyCaseTimeRemaining() {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const diff = dayMs - (now - state.lastDailyCaseTimestamp);
  if (diff <= 0) return 'Готов к открытию!';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}ч ${mins}мин`;
}

// Выбор предмета с учётом редкости кейса
function rollItemFromCase(c) {
  const pool = Object.values(ITEM_CATALOG).map(it => {
    const rank = RARITY_RANK[it.rarity] || 1;
    const w = it.weight * (1 + (rank - 1) * c.rareDropChance * 2);
    return { it, w };
  });
  const total = pool.reduce((a, b) => a + b.w, 0);
  let r = Math.random() * total;
  for (const p of pool) {
    r -= p.w;
    if (r <= 0) return p.it;
  }
  return pool[0].it;
}

function rollTrophyFromCase(c) {
  const chance = 0.04 + c.rareDropChance * 0.12;
  if (Math.random() > chance) return null;
  const missing = TROPHY_DROP_ORDER.filter(id => !state.trophies.includes(id));
  if (!missing.length) return null;
  return missing[Math.floor(Math.random() * missing.length)];
}

function openCaseWithRoulette(c, payMode) {
  if (c.isDaily) {
    if (!canClaimDailyCase()) {
      Sound.denied();
      showToast(`Ежедневный кейс перезаряжается: ${getDailyCaseTimeRemaining()}`);
      return;
    }
    state.lastDailyCaseTimestamp = Date.now();
  } else {
    const useVoucher = payMode === 'voucher' || (payMode !== 'coins' && itemCount('voucher') > 0 && state.player.coins < c.price);
    if (useVoucher) {
      if (itemCount('voucher') <= 0) { showToast('Нет купонов в сумке'); return; }
      state.inventory.voucher--;
      if (state.inventory.voucher <= 0) delete state.inventory.voucher;
      showToast('Использован золотой купон на открытие!');
    } else if (state.player.coins < c.price) {
      Sound.denied();
      showToast('Недостаточно монет 🪙 для открытия кейса');
      return;
    } else {
      state.player.coins -= c.price;
    }
  }

  Sound.click();

  const wonCoins = Math.round((c.minCoins + Math.random() * (c.maxCoins - c.minCoins)) * (1 + cb('caseCoins')));
  const wonXp = Math.round(c.minXp + Math.random() * (c.maxXp - c.minXp));

  // Персонаж (только из пула кейсовых бойцов)
  let wonCharacter = null;
  const lockedCaseChars = state.characters.filter(ch => ch.unlockType === 'case' && ch.active && !state.unlockedCharacters.includes(ch.id));

  if (lockedCaseChars.length > 0 && Math.random() < c.rareDropChance) {
    const totalWeight = lockedCaseChars.reduce((sum, ch) => sum + (ch.dropWeight || 10), 0);
    let randWeight = Math.random() * totalWeight;
    for (const ch of lockedCaseChars) {
      randWeight -= (ch.dropWeight || 10);
      if (randWeight <= 0) {
        wonCharacter = ch;
        break;
      }
    }
    if (!wonCharacter) wonCharacter = lockedCaseChars[0];
    state.unlockedCharacters.push(wonCharacter.id);
  }

  // Предметы, которые потом можно использовать из сумки
  const wonItems = [];
  for (let i = 0; i < (c.itemRolls || 1); i++) {
    if (Math.random() < (c.itemChance != null ? c.itemChance : 0.6)) {
      const it = rollItemFromCase(c);
      addItem(it.id, 1);
      const ex = wonItems.find(x => x.id === it.id);
      if (ex) ex.count++; else wonItems.push({ id: it.id, count: 1 });
    }
  }

  const wonTrophyId = rollTrophyFromCase(c);
  if (wonTrophyId) state.trophies.push(wonTrophyId);

  state.player.coins += wonCoins;
  updateQuestProgress('case', 1);
  persist();

  startRouletteAnimation(c, wonCoins, wonXp, wonCharacter, wonItems, wonTrophyId);
}

function startRouletteAnimation(caseObj, wonCoins, wonXp, wonCharacter, wonItems, wonTrophyId) {
  const root = document.getElementById('modal-root');

  const dummyItems = [
    { icon: '🪙', label: '+60 Монет', rarity: 'common' },
    { icon: '✨', label: '+45 XP', rarity: 'common' },
    { icon: '🥤', label: 'Энергетик', rarity: 'common' },
    { icon: '🔋', label: 'Батарейка', rarity: 'common' },
    { icon: '🥷', label: 'Арман «Тень»', rarity: 'rare' },
    { icon: '🧃', label: 'Мега-энергетик', rarity: 'rare' },
    { icon: '🏆', label: 'Кубок Арены', rarity: 'rare' },
    { icon: '🏋️', label: 'Заур «Титан»', rarity: 'epic' },
    { icon: '🧪', label: 'Бустер XP ×2', rarity: 'epic' },
    { icon: '🎟️', label: 'Купон кейса', rarity: 'epic' },
    { icon: '⚔️', label: 'Самурай Кэндзи', rarity: 'legendary' },
    { icon: '👑', label: 'Чингиз Хан', rarity: 'mythic' },
  ];

  const trackList = [];
  for (let i = 0; i < 28; i++) {
    const dummy = dummyItems[Math.floor(Math.random() * dummyItems.length)];
    trackList.push({ ...dummy });
  }

  const winningIndex = 22;
  if (wonCharacter) {
    trackList[winningIndex] = { icon: wonCharacter.icon, label: wonCharacter.name, rarity: wonCharacter.rarity };
  } else if (wonItems.length) {
    const best = wonItems.map(w => ITEM_CATALOG[w.id]).sort((a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity])[0];
    trackList[winningIndex] = { icon: best.icon, label: best.name, rarity: best.rarity };
  } else if (wonTrophyId) {
    const t = TROPHY_CATALOG[wonTrophyId];
    trackList[winningIndex] = { icon: t.icon, label: t.name, rarity: t.rarity };
  } else {
    trackList[winningIndex] = { icon: '🪙', label: `+${wonCoins} 🪙`, rarity: 'rare' };
  }

  root.innerHTML = `
    <div class="modal-overlay active" id="roulette-modal-ov">
      <div class="modal-sheet" style="text-align:center;">
        <div class="modal-bar-handle"></div>
        <div style="font-size:12px;font-weight:800;color:var(--gold);">ОТКРЫВАЕТСЯ ${esc(caseObj.name.toUpperCase())}</div>
        <div class="roulette-container">
          <div class="roulette-pointer"></div>
          <div class="roulette-track" id="roulette-track-el">
            ${trackList.map(it => `
              <div class="roulette-card-item">
                <span class="item-ic">${it.icon}</span>
                <span class="item-lbl">${esc(it.label)}</span>
                <div class="item-rarity-bar" style="background:var(--rarity-${it.rarity});"></div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="screen-sub" id="roulette-status-txt">Крутим рулетку...</div>
      </div>
    </div>`;

  let tickDelay = 55;
  let elapsed = 0;
  const totalSpinTime = 4200;

  function doTick() {
    if (elapsed >= totalSpinTime) return;
    Sound.rouletteTick();
    elapsed += tickDelay;
    tickDelay *= 1.075;
    setTimeout(doTick, tickDelay);
  }
  doTick();

  setTimeout(() => {
    const trackEl = document.getElementById('roulette-track-el');
    if (trackEl) {
      const itemWidth = 96;
      const containerWidth = trackEl.parentElement.offsetWidth || 340;
      const targetOffset = (winningIndex * itemWidth) - (containerWidth / 2) + (itemWidth / 2);
      trackEl.style.transform = `translateX(-${targetOffset}px)`;
    }
  }, 50);

  setTimeout(() => {
    Sound.fanfare();
    showWinModal(caseObj, wonCoins, wonXp, wonCharacter, wonItems, wonTrophyId);
  }, 4500);
}

function showWinModal(caseObj, wonCoins, wonXp, wonCharacter, wonItems, wonTrophyId) {
  const root = document.getElementById('modal-root');
  const trophy = wonTrophyId ? TROPHY_CATALOG[wonTrophyId] : null;

  root.innerHTML = `
    <div class="modal-overlay active" id="win-modal-ov">
      <div class="modal-sheet" style="text-align:center;">
        <div class="modal-bar-handle"></div>
        <div style="font-size:54px;margin-bottom:8px;">${wonCharacter ? wonCharacter.icon : (caseObj.icon)}</div>
        <h2 style="font-size:22px;font-weight:900;margin-bottom:6px;">
          ${wonCharacter ? (wonCharacter.rarity === 'mythic' ? '👑 МИФИЧЕСКИЙ БОЕЦ!' : '🎉 ВЫПАЛ НОВЫЙ БОЕЦ!') : 'Награда получена!'}
        </h2>

        ${wonCharacter ? `
          <div style="display:inline-block;padding:6px 14px;border-radius:var(--radius-pill);background:var(--rarity-${wonCharacter.rarity});color:#FFF;font-weight:900;font-size:12px;margin-bottom:12px;">
            ${wonCharacter.rarity.toUpperCase()} · ${esc(wonCharacter.name)}
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">${esc(wonCharacter.perk)}</div>
        ` : ''}

        <div style="display:flex;justify-content:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
          <div class="btn-chip" style="color:var(--gold);font-size:12px;padding:6px 14px;">🪙 +${wonCoins} монет</div>
          <div class="btn-chip" style="color:var(--violet);font-size:12px;padding:6px 14px;">✨ +${wonXp} XP</div>
        </div>

        ${(wonItems.length || trophy) ? `
          <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;margin-bottom:16px;">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">🎒 Добавлено в сумку (можно использовать):</div>
            <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">
              ${wonItems.map(w => {
                const it = ITEM_CATALOG[w.id];
                return `<span class="btn-chip" style="color:var(--rarity-${it.rarity});border-color:var(--rarity-${it.rarity});">${it.icon} ${esc(it.name)} ×${w.count}</span>`;
              }).join('')}
              ${trophy ? `<span class="btn-chip" style="color:var(--gold);border-color:var(--gold);">${trophy.icon} Трофей: ${esc(trophy.name)}</span>` : ''}
            </div>
          </div>
        ` : ''}

        <div style="display:flex;gap:10px;">
          ${(wonItems.length || trophy) ? `<button class="btn-premium-ghost" id="win-bag-btn" style="flex:1;">🎒 В сумку</button>` : ''}
          <button class="btn-premium-primary" id="win-collect-btn" style="flex:1.6;">Отлично, забрать!</button>
        </div>
      </div>
    </div>`;

  document.getElementById('win-collect-btn').onclick = () => {
    Sound.click();
    closeModal();
    addPlayerXp(wonXp);
    render();
  };
  const bagBtn = document.getElementById('win-bag-btn');
  if (bagBtn) bagBtn.onclick = () => {
    Sound.click();
    closeModal();
    addPlayerXp(wonXp);
    render();
    if (!document.getElementById('levelup-modal-ov')) openInventoryModal('items');
  };
}

