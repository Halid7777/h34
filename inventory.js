/* FitQuest Pro — js/inventory.js
   Сумка: предметы, применение, трофеи, окно инвентаря
   (обычный скрипт: глобальные функции и переменные общие для всех файлов, порядок подключения см. в index.html) */

/* =========================================================================
   7. СУМКА: ПРЕДМЕТЫ ИЗ КЕЙСОВ, КОТОРЫЕ МОЖНО ПРИМЕНЯТЬ
   ========================================================================= */
function itemCount(id) { return state.inventory[id] || 0; }
function totalItems() { return Object.values(state.inventory).reduce((a, b) => a + b, 0); }

function addItem(id, n = 1) {
  state.inventory[id] = (state.inventory[id] || 0) + n;
}

function addBoost(kind, mult, workouts) {
  const b = state.boosts;
  if (kind === 'xp') {
    b.xpMult = b.xpLeft > 0 ? Math.max(b.xpMult, mult) : mult;
    b.xpLeft += workouts;
  } else {
    b.coinMult = b.coinLeft > 0 ? Math.max(b.coinMult, mult) : mult;
    b.coinLeft += workouts;
  }
}

// Применить предмет из сумки. Возвращает true, если предмет израсходован
function useItem(id) {
  if (!(itemCount(id) > 0)) return false;
  regenTick();
  let msg = '';

  switch (id) {
    case 'energy_drink':
      if (state.workoutEnergy >= maxWE()) { showToast('Энергия тренировок уже полная ⚡'); Sound.denied(); return false; }
      gainWorkoutEnergy(40);
      msg = '🥤 +40 энергии тренировок!';
      break;
    case 'protein':
      if (state.workoutEnergy >= maxWE() && state.boosts.xpLeft > 0) { showToast('Шейкер сейчас не нужен'); Sound.denied(); return false; }
      gainWorkoutEnergy(25);
      addBoost('xp', 1.5, 1);
      msg = '🥛 +25 энергии и XP ×1.5 на следующую тренировку!';
      break;
    case 'mega_energy':
      if (state.workoutEnergy >= maxWE()) { showToast('Энергия тренировок уже полная ⚡'); Sound.denied(); return false; }
      state.workoutEnergy = maxWE();
      msg = '🧃 Энергия тренировок восстановлена полностью!';
      break;
    case 'click_charge':
      if (state.clickerEnergy >= maxCE()) { showToast('Кликер уже полностью заряжен 👊'); Sound.denied(); return false; }
      gainClicks(50);
      msg = '🔋 +50 ударов в кликере!';
      break;
    case 'click_full':
      if (state.clickerEnergy >= maxCE()) { showToast('Кликер уже полностью заряжен 👊'); Sound.denied(); return false; }
      state.clickerEnergy = maxCE();
      msg = '🌀 Кликер заряжен до максимума!';
      break;
    case 'coin_pouch':
      state.player.coins += 300;
      msg = '👝 +300 монет!';
      break;
    case 'xp_scroll':
      msg = '📜 +150 XP!';
      break;
    case 'xp_boost':
      addBoost('xp', 2, 1);
      msg = '🧪 Следующая тренировка даст ×2 XP!';
      break;
    case 'coin_boost':
      addBoost('coin', 2, 1);
      msg = '🧲 Следующая тренировка даст ×2 монет!';
      break;
    case 'legend_elixir':
      state.workoutEnergy = maxWE();
      state.clickerEnergy = maxCE();
      addBoost('xp', 2, 1);
      msg = '🏆 Эликсир Чемпиона: энергия, кликер и ×2 XP!';
      break;
    case 'voucher':
      closeModal();
      switchTab('cases');
      showToast('🎟️ Выберите платный кейс — купон применится при открытии');
      return false;
    default:
      return false;
  }

  state.inventory[id]--;
  if (state.inventory[id] <= 0) delete state.inventory[id];
  Sound.useItem();
  updateQuestProgress('item', 1);
  persist();
  showToast(msg);
  if (id === 'xp_scroll') addPlayerXp(150);
  updateEnergyUI();
  updateCoinsUI();
  return true;
}

function equipTrophy(id) {
  if (!state.trophies.includes(id)) return;
  state.equippedTrophy = state.equippedTrophy === id ? null : id;
  Sound.click();
  persist();
}

function describeGive(give) {
  const out = [];
  if (give.coins) out.push(`🪙 +${give.coins}`);
  if (give.xp) out.push(`✨ +${give.xp} XP`);
  if (give.energy) out.push(`⚡ +${give.energy} энергии`);
  if (give.clicks) out.push(`👊 +${give.clicks} ударов`);
  if (give.items) {
    Object.keys(give.items).forEach(id => {
      const it = ITEM_CATALOG[id];
      if (it) out.push(`${it.icon} ${it.name} ×${give.items[id]}`);
    });
  }
  return out;
}

function applyGive(give) {
  if (give.coins) state.player.coins += give.coins;
  if (give.energy) gainWorkoutEnergy(give.energy);
  if (give.clicks) gainClicks(give.clicks);
  if (give.items) Object.keys(give.items).forEach(id => addItem(id, give.items[id]));
  persist();
  if (give.xp) addPlayerXp(give.xp);
}

/* =========================================================================
   16. СУМКА: ОКНО ИНВЕНТАРЯ
   ========================================================================= */
let inventoryTab = 'items';

function openInventoryModal(tab) {
  if (tab) inventoryTab = tab;
  Sound.click();
  renderInventoryModal();
}

function renderInventoryModal() {
  const root = document.getElementById('modal-root');
  const ids = Object.keys(state.inventory).filter(id => state.inventory[id] > 0 && ITEM_CATALOG[id])
    .sort((a, b) => RARITY_RANK[ITEM_CATALOG[b].rarity] - RARITY_RANK[ITEM_CATALOG[a].rarity]);

  root.innerHTML = `
    <div class="modal-overlay active" id="inv-modal-ov">
      <div class="modal-sheet">
        <div class="modal-bar-handle"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <h2 style="font-size:18px;font-weight:900;">🎒 Сумка</h2>
          <span class="btn-chip" style="color:var(--gold);">🪙 ${state.player.coins}</span>
        </div>
        <div class="screen-sub" style="margin-bottom:12px;">Всё, что выпало из кейсов и дороги наград, можно применить здесь</div>

        ${boostPillsHtml()}

        <div class="inv-tabs" style="margin-top:12px;">
          <button class="btn-chip ${inventoryTab === 'items' ? 'active' : ''}" data-inv-tab="items">🧪 Предметы (${totalItems()})</button>
          <button class="btn-chip ${inventoryTab === 'trophies' ? 'active' : ''}" data-inv-tab="trophies">🏆 Трофеи (${state.trophies.length})</button>
        </div>

        ${inventoryTab === 'items' ? (ids.length ? `
          <div class="inv-grid">
            ${ids.map(id => {
              const it = ITEM_CATALOG[id];
              return `
                <div class="inv-item rarity-${it.rarity}">
                  <span class="inv-count">×${state.inventory[id]}</span>
                  <div class="inv-ic">${it.icon}</div>
                  <div class="inv-name">${esc(it.name)}</div>
                  <div class="inv-desc">${esc(it.desc)}</div>
                  <button class="btn-premium-emerald inv-use-btn" data-use-item="${id}">${id === 'voucher' ? 'К кейсам' : 'Применить'}</button>
                </div>`;
            }).join('')}
          </div>
        ` : `
          <div class="inv-empty">🎒 Сумка пуста.<br>Открывайте кейсы и забирайте награды на Дороге уровней!</div>
        `) : `
          <div>
            ${state.trophies.map(tid => {
              const t = TROPHY_CATALOG[tid];
              if (!t) return '';
              const eq = state.equippedTrophy === tid;
              return `
                <div class="trophy-row ${eq ? 'equipped' : ''}">
                  <div class="tr-ic">${t.icon}</div>
                  <div class="tr-info">
                    <div class="tr-name">${esc(t.name)} ${eq ? '· надето' : ''}</div>
                    <div class="tr-desc">${esc(t.desc)}</div>
                  </div>
                  <button class="btn-chip ${eq ? 'active' : ''}" data-equip-trophy="${tid}">${eq ? 'Снять' : 'Надеть'}</button>
                </div>`;
            }).join('')}
          </div>
        `}

        <button class="btn-premium-ghost" id="inv-close-btn" style="width:100%;margin-top:6px;">Закрыть</button>
      </div>
    </div>`;

  document.getElementById('inv-close-btn').onclick = () => { closeModal(); render(); };
  document.getElementById('inv-modal-ov').onclick = (e) => { if (e.target.id === 'inv-modal-ov') { closeModal(); render(); } };

  root.querySelectorAll('[data-inv-tab]').forEach(btn => {
    btn.onclick = () => { Sound.click(); inventoryTab = btn.dataset.invTab; renderInventoryModal(); };
  });
  root.querySelectorAll('[data-use-item]').forEach(btn => {
    btn.onclick = () => {
      const ok = useItem(btn.dataset.useItem);
      if (ok && !document.getElementById('levelup-modal-ov')) {
        renderInventoryModal();
        render();
      }
    };
  });
  root.querySelectorAll('[data-equip-trophy]').forEach(btn => {
    btn.onclick = () => {
      equipTrophy(btn.dataset.equipTrophy);
      renderInventoryModal();
      render();
    };
  });
}

