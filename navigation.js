/* FitQuest Pro — js/navigation.js
   Свайп-навигация и переключение вкладок
   (обычный скрипт: глобальные функции и переменные общие для всех файлов, порядок подключения см. в index.html) */

/* =========================================================================
   11. СВАЙП-НАВИГАЦИЯ МЕЖДУ ЭКРАНАМИ (ТАБАМИ)
   ========================================================================= */
const TABS_ORDER = ['home', 'workouts', 'cases', 'characters', 'road', 'profile'];

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let touchBlocked = false;

function setupSwipeGestures() {
  const shell = document.getElementById('app-shell');

  shell.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    // Не листаем табы, если палец начал движение на горизонтальном списке
    touchBlocked = !!(e.target.closest && e.target.closest('.cat-scroll, .char-filter-tabs, .admin-tabs, .builder-exercise-list'));
  }, { passive: true });

  shell.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    if (!touchBlocked) handleSwipeGesture();
  }, { passive: true });
}

function handleSwipeGesture() {
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  if (Math.abs(diffY) > Math.abs(diffX) || Math.abs(diffX) < 55) return;
  if (document.querySelector('.modal-overlay.active')) return;

  const currentIdx = TABS_ORDER.indexOf(state.currentTab);
  if (currentIdx === -1) return;

  if (diffX < 0) {
    if (currentIdx < TABS_ORDER.length - 1) switchTab(TABS_ORDER[currentIdx + 1], 'right');
  } else {
    if (currentIdx > 0) switchTab(TABS_ORDER[currentIdx - 1], 'left');
  }
}

function switchTab(newTab, direction = null) {
  Sound.click();
  const currentIdx = TABS_ORDER.indexOf(state.currentTab);
  const newIdx = TABS_ORDER.indexOf(newTab);

  if (!direction) {
    direction = newIdx >= currentIdx ? 'right' : 'left';
  }

  state.currentTab = newTab;
  render(direction);
  const v = document.getElementById('view');
  v.style.scrollBehavior = 'auto';
  v.scrollTop = 0;
  v.style.scrollBehavior = '';
  if (newTab === 'road') scrollRoadToCurrent();
}

