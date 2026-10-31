/* FitQuest Pro — js/data.js
   Каталоги данных: упражнения, бойцы, тренировки, кейсы, предметы, трофеи, дорога уровней, квесты
   (обычный скрипт: глобальные функции и переменные общие для всех файлов, порядок подключения см. в index.html) */

/* =========================================================================
   3. КАТАЛОГИ ДАННЫХ
   ========================================================================= */
const STORAGE_KEY = 'fitquest_pro_state_v7';
const OLD_STORAGE_KEY = 'fitquest_pro_state_v6';
const SECRET_ADMIN_PASSWORD = 'Halid2007.';

const DEFAULT_SETTINGS = {
  ambientTheme: 'autumn',
  adminPassword: SECRET_ADMIN_PASSWORD,
  maxWorkoutEnergy: 100,     // максимум энергии для тренировок
  workoutRegenSec: 20,       // 1 единица энергии тренировок за N секунд
  energyCostFactor: 0.5,     // стоимость энергии = ккал × коэффициент
  clickerMax: 200,           // лимит кликера
  clickerRegenSec: 3,        // 1 клик за N секунд
  tapXp: 2,
  tapCoins: 2,
  critMultiplier: 3
};

const EXERCISE_CATEGORIES = [
  { id: 'all', label: 'Все' },
  { id: 'base', label: '💪 Базовые' },
  { id: 'box', label: '🥊 Бокс' },
  { id: 'mma', label: '🥋 ММА' },
  { id: 'grappling', label: '🤼 Грэпплинг' },
  { id: 'crossfit', label: '🔥 Кроссфит' }
];

const WORKOUT_CATEGORIES = [
  { id: 'all', label: 'Все' },
  { id: 'mma', label: '🥋 ММА' },
  { id: 'box', label: '🥊 Бокс' },
  { id: 'grappling', label: '🤼 Грэпплинг' },
  { id: 'crossfit', label: '🔥 Кроссфит' },
  { id: 'general', label: '💪 Общие' }
];

const CATEGORY_NAMES = { mma: 'ММА', box: 'БОКС', grappling: 'ГРЭПЛИНГ', crossfit: 'КРОССФИТ', general: 'ОБЩАЯ', base: 'БАЗА' };

// 51 упражнение с реальными коэффициентами расхода калорий (kcalPerMin)
const availableExercises = [
  // Разминка
  { id: 'ex-1', name: 'Суставная гимнастика', muscle: 'Все тело · Разминка', icon: '🧘', xpPerMin: 2, coinsPerMin: 1, kcalPerMin: 3.5, defaultSec: 180 },
  { id: 'ex-2', name: 'Вращения руками и корпусом', muscle: 'Плечи и позвоночник', icon: '🤸', xpPerMin: 2, coinsPerMin: 1, kcalPerMin: 4.0, defaultSec: 120 },
  { id: 'ex-3', name: 'Динамическая растяжка ног', muscle: 'Бедра и связки', icon: '🦵', xpPerMin: 3, coinsPerMin: 1, kcalPerMin: 4.2, defaultSec: 120 },

  // Грудь и руки
  { id: 'ex-4', name: 'Классические отжимания', muscle: 'Грудь, трицепс, плечи', icon: '💪', xpPerMin: 5, coinsPerMin: 3, kcalPerMin: 7.2, defaultSec: 90 },
  { id: 'ex-5', name: 'Широкие отжимания', muscle: 'Грудные мышцы акцент', icon: '🏋️', xpPerMin: 6, coinsPerMin: 3, kcalPerMin: 7.6, defaultSec: 90 },
  { id: 'ex-6', name: 'Алмазные отжимания', muscle: 'Трицепс и центр груди', icon: '💎', xpPerMin: 7, coinsPerMin: 4, kcalPerMin: 8.2, defaultSec: 60 },
  { id: 'ex-7', name: 'Отжимания на брусьях', muscle: 'Грудь и трицепс', icon: '⚡', xpPerMin: 8, coinsPerMin: 5, kcalPerMin: 9.0, defaultSec: 90 },
  { id: 'ex-8', name: 'Обратные отжимания от скамьи', muscle: 'Трицепс', icon: '🪑', xpPerMin: 4, coinsPerMin: 2, kcalPerMin: 6.0, defaultSec: 90 },

  // Спина и плечи
  { id: 'ex-9', name: 'Подтягивания широким хватом', muscle: 'Широчайшие мышцы', icon: '🧗', xpPerMin: 9, coinsPerMin: 6, kcalPerMin: 9.5, defaultSec: 90 },
  { id: 'ex-10', name: 'Австралийские подтягивания', muscle: 'Середина спины', icon: '🪵', xpPerMin: 5, coinsPerMin: 3, kcalPerMin: 6.8, defaultSec: 90 },
  { id: 'ex-11', name: 'Отжимания «Домиком»', muscle: 'Дельтовидные плечи', icon: '⛺', xpPerMin: 6, coinsPerMin: 3, kcalPerMin: 7.4, defaultSec: 60 },
  { id: 'ex-12', name: 'Лодочка на животе', muscle: 'Поясница и осанка', icon: '🛶', xpPerMin: 4, coinsPerMin: 2, kcalPerMin: 5.5, defaultSec: 60 },

  // Пресс и кор
  { id: 'ex-13', name: 'Скручивания на пресс', muscle: 'Прямая мышца живота', icon: '🎯', xpPerMin: 4, coinsPerMin: 2, kcalPerMin: 5.8, defaultSec: 60 },
  { id: 'ex-14', name: 'Планка на локтях', muscle: 'Глубокий кор', icon: '🧱', xpPerMin: 5, coinsPerMin: 3, kcalPerMin: 5.0, defaultSec: 60 },
  { id: 'ex-15', name: 'Боковая планка', muscle: 'Косые мышцы', icon: '📐', xpPerMin: 5, coinsPerMin: 3, kcalPerMin: 5.2, defaultSec: 60 },
  { id: 'ex-16', name: 'Велосипед на пресс', muscle: 'Косые и нижний пресс', icon: '🚴', xpPerMin: 6, coinsPerMin: 3, kcalPerMin: 7.5, defaultSec: 60 },
  { id: 'ex-17', name: 'Подъёмы ног лежа', muscle: 'Нижний пресс', icon: '🪜', xpPerMin: 5, coinsPerMin: 3, kcalPerMin: 6.2, defaultSec: 60 },
  { id: 'ex-18', name: 'Русский твист', muscle: 'Ротация кора', icon: '🌪️', xpPerMin: 5, coinsPerMin: 3, kcalPerMin: 6.8, defaultSec: 60 },

  // Ноги и ягодицы
  { id: 'ex-19', name: 'Взрывные приседания', muscle: 'Квадрицепс и ягодицы', icon: '💥', xpPerMin: 6, coinsPerMin: 4, kcalPerMin: 8.5, defaultSec: 90 },
  { id: 'ex-20', name: 'Выпады назад', muscle: 'Баланс и ягодицы', icon: '🚶', xpPerMin: 5, coinsPerMin: 3, kcalPerMin: 7.2, defaultSec: 90 },
  { id: 'ex-21', name: 'Болгарские сплит-приседы', muscle: 'Изоляция бедра', icon: '🔥', xpPerMin: 7, coinsPerMin: 4, kcalPerMin: 8.8, defaultSec: 90 },
  { id: 'ex-22', name: 'Ягодичный мостик', muscle: 'Задняя поверхность', icon: '🌉', xpPerMin: 4, coinsPerMin: 2, kcalPerMin: 5.4, defaultSec: 60 },

  // Кардио
  { id: 'ex-23', name: 'Бёрпи с прыжком', muscle: 'Все тело · Взрыв', icon: '💣', xpPerMin: 10, coinsPerMin: 6, kcalPerMin: 13.0, defaultSec: 60 },
  { id: 'ex-24', name: 'Джампинг Джек', muscle: 'Кардио выносливость', icon: '⭐', xpPerMin: 5, coinsPerMin: 3, kcalPerMin: 9.0, defaultSec: 90 },
  { id: 'ex-25', name: 'Скоростная скакалка', muscle: 'Икры и координация', icon: '🪢', xpPerMin: 7, coinsPerMin: 4, kcalPerMin: 11.5, defaultSec: 120 },
  { id: 'ex-26', name: 'Бой с тенью (комбинации)', muscle: 'Ударная скорость ММА', icon: '🥊', xpPerMin: 8, coinsPerMin: 5, kcalPerMin: 10.5, defaultSec: 120 },
  { id: 'ex-27', name: 'Заминка и растяжка шпагатов', muscle: 'Восстановление', icon: '🍃', xpPerMin: 3, coinsPerMin: 1, kcalPerMin: 3.2, defaultSec: 180 },

  /* ---------------- БОКС ---------------- */
  { id: 'ex-28', cat: 'box', name: 'Джеб–кросс на тени', muscle: 'Прямые удары и скорость', icon: '🥊', xpPerMin: 8, coinsPerMin: 5, kcalPerMin: 10.0, defaultSec: 120 },
  { id: 'ex-29', cat: 'box', name: 'Хуки и апперкоты по мешку', muscle: 'Боковые и нижние удары', icon: '👊', xpPerMin: 9, coinsPerMin: 6, kcalPerMin: 11.5, defaultSec: 120 },
  { id: 'ex-30', cat: 'box', name: 'Нырки и уклоны', muscle: 'Защита и реакция', icon: '🌀', xpPerMin: 7, coinsPerMin: 4, kcalPerMin: 9.0, defaultSec: 90 },
  { id: 'ex-31', cat: 'box', name: 'Боксёрский шаг и работа ног', muscle: 'Манёвр по рингу', icon: '👟', xpPerMin: 6, coinsPerMin: 3, kcalPerMin: 8.5, defaultSec: 90 },
  { id: 'ex-32', cat: 'box', name: 'Полный раунд на мешке (3 мин)', muscle: 'Выносливость бойца', icon: '🪨', xpPerMin: 10, coinsPerMin: 6, kcalPerMin: 12.5, defaultSec: 180 },

  /* ---------------- ММА ---------------- */
  { id: 'ex-33', cat: 'mma', name: 'Лоу-кики и мид-кики', muscle: 'Ударная техника ног', icon: '🦶', xpPerMin: 8, coinsPerMin: 5, kcalPerMin: 10.0, defaultSec: 90 },
  { id: 'ex-34', cat: 'mma', name: 'Колени в клинче', muscle: 'Клинч и ближний бой', icon: '🤺', xpPerMin: 8, coinsPerMin: 5, kcalPerMin: 10.5, defaultSec: 90 },
  { id: 'ex-35', cat: 'mma', name: 'Сбивание ног (тейкдаун-спринт)', muscle: 'Взрывной вход в ноги', icon: '🤼', xpPerMin: 9, coinsPerMin: 6, kcalPerMin: 12.0, defaultSec: 60 },
  { id: 'ex-36', cat: 'mma', name: 'Ground and pound по мешку', muscle: 'Удары сверху', icon: '🔨', xpPerMin: 9, coinsPerMin: 6, kcalPerMin: 11.8, defaultSec: 90 },
  { id: 'ex-37', cat: 'mma', name: 'Спрол и возврат в стойку', muscle: 'Защита от тейкдауна', icon: '🐊', xpPerMin: 8, coinsPerMin: 5, kcalPerMin: 10.8, defaultSec: 60 },
  { id: 'ex-38', cat: 'mma', name: 'Комбинации рука–нога', muscle: 'Связки ММА', icon: '🥋', xpPerMin: 9, coinsPerMin: 6, kcalPerMin: 11.2, defaultSec: 120 },

  /* ---------------- ГРЭПЛИНГ ---------------- */
  { id: 'ex-39', cat: 'grappling', name: 'Ползки: креветка и мост', muscle: 'Подвижность на ковре', icon: '🦐', xpPerMin: 6, coinsPerMin: 3, kcalPerMin: 7.5, defaultSec: 90 },
  { id: 'ex-40', cat: 'grappling', name: 'Мостики борца', muscle: 'Шея и спина', icon: '🏗️', xpPerMin: 5, coinsPerMin: 3, kcalPerMin: 6.5, defaultSec: 60 },
  { id: 'ex-41', cat: 'grappling', name: 'Свипы и пассы (дриллы)', muscle: 'Работа в гарде', icon: '♟️', xpPerMin: 6, coinsPerMin: 4, kcalPerMin: 7.8, defaultSec: 120 },
  { id: 'ex-42', cat: 'grappling', name: 'Захваты и подтягивание полотенца', muscle: 'Хват и предплечья', icon: '🧶', xpPerMin: 7, coinsPerMin: 4, kcalPerMin: 8.5, defaultSec: 90 },
  { id: 'ex-43', cat: 'grappling', name: 'Бросок через бедро (дрилл)', muscle: 'Техника бросков', icon: '🏯', xpPerMin: 8, coinsPerMin: 5, kcalPerMin: 10.0, defaultSec: 90 },
  { id: 'ex-44', cat: 'grappling', name: 'Контроль сбоку: обход по кругу', muscle: 'Давление и баланс', icon: '🛡️', xpPerMin: 6, coinsPerMin: 4, kcalPerMin: 7.2, defaultSec: 90 },

  /* ---------------- КРОССФИТ ---------------- */
  { id: 'ex-45', cat: 'crossfit', name: 'Трастеры с гантелями или рюкзаком', muscle: 'Ноги + жим', icon: '🏋️', xpPerMin: 9, coinsPerMin: 6, kcalPerMin: 12.5, defaultSec: 90 },
  { id: 'ex-46', cat: 'crossfit', name: 'Махи гирей или рюкзаком', muscle: 'Задняя цепь и кор', icon: '🔔', xpPerMin: 9, coinsPerMin: 6, kcalPerMin: 12.0, defaultSec: 90 },
  { id: 'ex-47', cat: 'crossfit', name: 'Прыжки на тумбу (box jump)', muscle: 'Взрывная сила ног', icon: '📦', xpPerMin: 8, coinsPerMin: 5, kcalPerMin: 11.0, defaultSec: 60 },
  { id: 'ex-48', cat: 'crossfit', name: 'Двойные прыжки на скакалке', muscle: 'Координация и кардио', icon: '🪂', xpPerMin: 9, coinsPerMin: 6, kcalPerMin: 13.0, defaultSec: 60 },
  { id: 'ex-49', cat: 'crossfit', name: 'Бёрпи + подтягивание', muscle: 'Все тело · Предел', icon: '🦾', xpPerMin: 11, coinsPerMin: 7, kcalPerMin: 14.0, defaultSec: 60 },
  { id: 'ex-50', cat: 'crossfit', name: 'Ходьба «медведем»', muscle: 'Плечи, кор, ноги', icon: '🐻', xpPerMin: 6, coinsPerMin: 4, kcalPerMin: 8.5, defaultSec: 60 },
  { id: 'ex-51', cat: 'crossfit', name: 'Табата: приседы с выпрыгиванием', muscle: '20 сек работа / 10 отдых', icon: '⏱️', xpPerMin: 10, coinsPerMin: 6, kcalPerMin: 13.5, defaultSec: 60 },
];

// 20 ПЕРСОНАЖЕЙ: 10 ЗА УРОВНИ И 10 ИЗ КЕЙСОВ. Поле bonus — реальные бонусы, которые работают у выбранного бойца
const initialCharacters = [
  { id: 'c-1', name: 'Дэн «Кобра» Северов', sport: 'Бокс & ММА', unlockType: 'level', unlockLevel: 1, description: 'Стартовый боец с молниеносной реакцией', perk: '+10% XP за все тренировки', bonus: { xp: 0.10 }, icon: '🥊', rarity: 'common', active: true },
  { id: 'c-2', name: 'Тимур Волков', sport: 'Самбо & Дзюдо', unlockType: 'level', unlockLevel: 1, description: 'Мастер бросков и железного захвата', perk: '+10% монет за тренировку', bonus: { coins: 0.10 }, icon: '🥋', rarity: 'common', active: true },
  { id: 'c-3', name: 'Марко «Торпедо»', sport: 'Плавание & Кросс', unlockType: 'level', unlockLevel: 3, description: 'Неутомимый атлет с бесконечным дыханием', perk: '+15% наград за удары в кликере', bonus: { tap: 0.15 }, icon: '🏊', rarity: 'common', active: true },
  { id: 'c-4', name: 'Влад «Скала»', sport: 'Воркаут', unlockType: 'level', unlockLevel: 5, description: 'Король турников и чистых подтягиваний', perk: '+12% XP за тренировки', bonus: { xp: 0.12 }, icon: '🧗', rarity: 'common', active: true },
  { id: 'c-5', name: 'Рикардо Феррейра', sport: 'Кикбоксинг', unlockType: 'level', unlockLevel: 7, description: 'Бразильская школа сокрушительных хай-киков', perk: '+15% монет за тренировки', bonus: { coins: 0.15 }, icon: '🦵', rarity: 'rare', active: true },
  { id: 'c-6', name: 'Никита Громов', sport: 'ММА · лёгкий вес', unlockType: 'level', unlockLevel: 10, description: 'Молниеносные контратаки и тайминг', perk: '+15% XP за тренировки', bonus: { xp: 0.15 }, icon: '⚡', rarity: 'rare', active: true },
  { id: 'c-7', name: 'Диего Марсело', sport: 'Футбольный атлетизм', unlockType: 'level', unlockLevel: 13, description: 'Взрывная скорость и координация ног', perk: '−20% затрат энергии на тренировки', bonus: { cost: 0.20 }, icon: '⚽', rarity: 'rare', active: true },
  { id: 'c-8', name: 'Леон «Снайпер»', sport: 'Стретчинг & Стрельба', unlockType: 'level', unlockLevel: 16, description: 'Филигранная точность каждого движения', perk: '+10% шанс крита в кликере (×3)', bonus: { crit: 0.10 }, icon: '🎯', rarity: 'rare', active: true },
  { id: 'c-9', name: 'Камила «Пантера»', sport: 'Муай-тай', unlockType: 'level', unlockLevel: 20, description: 'Грациозная и беспощадная чемпионка ринга', perk: '+20% XP за тренировки', bonus: { xp: 0.20 }, icon: '🐆', rarity: 'epic', active: true },
  { id: 'c-10', name: 'Руслан «Стальной Молот»', sport: 'Вольная борьба Pro', unlockType: 'level', unlockLevel: 25, description: 'Непобедимый чемпион ковра, сминающий защиту', perk: '+40% ко всем XP и монетам!', bonus: { xp: 0.40, coins: 0.40, tap: 0.40 }, icon: '🤼', rarity: 'legendary', active: true },

  { id: 'c-11', name: 'Арман «Тень»', sport: 'Грепплинг & BJJ', unlockType: 'case', unlockLevel: null, description: 'Секретный мастер удушающих приёмов', perk: '+25% монет из кейсов', bonus: { caseCoins: 0.25 }, icon: '🥷', rarity: 'rare', dropWeight: 25, inCase: true, active: true },
  { id: 'c-12', name: 'Баир «Феникс»', sport: 'Тайский бокс', unlockType: 'case', unlockLevel: null, description: 'Восстанавливается после самых жёстких боёв', perk: '−30% времени авто-тренировки', bonus: { autoTime: 0.30 }, icon: '🔥', rarity: 'rare', dropWeight: 25, inCase: true, active: true },
  { id: 'c-13', name: 'Заур «Титан»', sport: 'Пауэрлифтинг', unlockType: 'case', unlockLevel: null, description: 'Поднимает невероятные веса с ледяным спокойствием', perk: '+25% XP за тренировки', bonus: { xp: 0.25 }, icon: '🏋️', rarity: 'epic', dropWeight: 14, inCase: true, active: true },
  { id: 'c-14', name: 'Амир «Громовержец»', sport: 'Кроссфит Pro', unlockType: 'case', unlockLevel: null, description: 'Превращает тяжелейшие комплексы в искусство', perk: '−25% затрат энергии на тренировки', bonus: { cost: 0.25 }, icon: '⚡', rarity: 'epic', dropWeight: 14, inCase: true, active: true },
  { id: 'c-15', name: 'Эрик «Викинг»', sport: 'Стронгмен', unlockType: 'case', unlockLevel: null, description: 'Северная ярость и стальная несгибаемость', perk: '+35% монет за тренировки', bonus: { coins: 0.35 }, icon: '🪓', rarity: 'epic', dropWeight: 12, inCase: true, active: true },
  { id: 'c-16', name: 'Самурай Кэндзи', sport: 'Кэндо & Ниндзюцу', unlockType: 'case', unlockLevel: null, description: 'Ментальная концентрация абсолютного мастера', perk: '+40% к наградам за квесты', bonus: { quest: 0.40 }, icon: '⚔️', rarity: 'legendary', dropWeight: 4, inCase: true, active: true },
  { id: 'c-17', name: 'Кибер-Валькирия Астра', sport: 'Нео-Кроссфит 2077', unlockType: 'case', unlockLevel: null, description: 'Бионические рефлексы и футуристический темп', perk: 'Удваивает награды тапа кликера!', bonus: { tap: 1.0 }, icon: '🦾', rarity: 'legendary', dropWeight: 3.5, inCase: true, active: true },
  { id: 'c-18', name: 'Мастер Ли «Дракон»', sport: 'Шаолинь Кунг-фу', unlockType: 'case', unlockLevel: null, description: 'Сверхчеловеческий контроль дыхания и тела', perk: 'Авто-тренировка приносит ×2 приз', bonus: { auto: 1.0 }, icon: '🐉', rarity: 'legendary', dropWeight: 3, inCase: true, active: true },
  { id: 'c-19', name: 'Чингиз «Хан»', sport: 'Абсолютный Чемпион', unlockType: 'case', unlockLevel: null, description: 'Легенда арены, его имя внушает благоговейный трепет', perk: '👑 МИФИЧЕСКИЙ БУСТ: +100% ВСЕГО!', bonus: { xp: 1.0, coins: 1.0, tap: 1.0, quest: 1.0, caseCoins: 1.0 }, icon: '👑', rarity: 'mythic', dropWeight: 1.2, inCase: true, active: true },
  { id: 'c-20', name: 'Макс «Джаггернаут»', sport: 'Титаническая Сила', unlockType: 'case', unlockLevel: null, description: 'Неудержимая разрушительная сила вселенского масштаба', perk: '💎 Авто-сбор квестов + ×2 монеты', bonus: { coins: 1.0, autoClaim: 1 }, icon: '🪐', rarity: 'mythic', dropWeight: 0.8, inCase: true, active: true },
];

/* ---------------- ТРЕНИРОВКИ ---------------- */
function S(name, muscle, icon, duration, mult = 1) {
  return { name, muscle, icon, duration, mult };
}

function defaultSteps(icon) {
  return [
    S('Раунд 1 · Разогрев', 'Разогрев и вход в ритм', icon, 180, 1),
    S('Пиковый раунд', 'Максимальная интенсивность', icon, 240, 1.2),
    S('Финишный спурт', 'Выжимка сил до конца', '🏁', 180, 1.1)
  ];
}

function mkW(id, cat, name, description, icon, xpPerMin, coinsPerMin, kcalPerMin, steps) {
  return { id, cat, name, description, icon, xpPerMin, coinsPerMin, kcalPerMin, steps: steps || defaultSteps(icon), active: true };
}

const initialWorkouts = [
  /* --------- ОБЩИЕ --------- */
  mkW('w-1', 'general', 'Утренняя взрывная зарядка', 'Быстрый разгон метаболизма и заряд бодрости на весь день', '🌅', 5, 3, 6.5),
  mkW('w-2', 'general', 'Силовой воркаут «Грудь и Трицепс»', 'Отжимания разных стилей, упоры и планка', '💪', 7, 4, 7.8),
  mkW('w-3', 'general', 'ММА Кардио-штурм', 'Интенсивные раунды, удары и скоростные бёрпи', '🥊', 9, 6, 11.2),
  mkW('w-4', 'general', 'Стальной пресс & Кор', 'Комплекс для прокачки рельефных кубиков и осанки', '🧱', 6, 4, 6.8),
  mkW('w-5', 'general', 'Глубокая растяжка & Мобильность', 'Снятие зажимов, развитие гибкости суставов и связок', '🧘', 3, 2, 3.8),
  mkW('w-6', 'general', 'Взрывные ноги «Спринтер»', 'Плиометрика, выпрыгивания и мощные выпады', '🦵', 8, 5, 9.2),

  /* --------- БОКС --------- */
  mkW('w-7', 'box', 'Бокс: джеб–кросс–хук', 'Базовые связки на тени и мешке: скорость, дистанция, ритм', '🥊', 8, 5, 10.5, [
    S('Разминка на тени', 'Лёгкий бой с тенью', '🥊', 120, 0.7),
    S('Раунд: джеб–кросс', 'Прямые удары', '👊', 180, 1),
    S('Раунд: хуки', 'Боковые удары', '🌀', 180, 1.1),
    S('Раунд на мешке', 'Полная связка в темпе', '🪨', 180, 1.25),
    S('Заминка', 'Дыхание и растяжка плеч', '🍃', 120, 0.4)
  ]),
  mkW('w-8', 'box', 'Бокс: 6 раундов на мешке', 'Шесть трёхминутных раундов — настоящий боксёрский темп', '🪨', 10, 6, 12.0, [
    S('Раунд 1 · Разогрев', 'Спокойный темп', '🥊', 180, 0.8),
    S('Раунд 2 · Прямые', 'Джеб и кросс', '👊', 180, 1),
    S('Раунд 3 · Боковые', 'Хуки по корпусу', '🌀', 180, 1.1),
    S('Раунд 4 · Серии', 'Серии по 5 ударов', '⚡', 180, 1.2),
    S('Раунд 5 · Пик', 'Максимум интенсивности', '🔥', 180, 1.35),
    S('Раунд 6 · Финиш', 'Всё, что осталось', '🏁', 180, 1.25)
  ]),
  mkW('w-9', 'box', 'Бокс: защита и уклоны', 'Нырки, уклоны и контратаки — учимся не пропускать', '🌀', 7, 4, 9.0, [
    S('Работа ног', 'Боксёрский шаг', '👟', 150, 0.9),
    S('Нырки и уклоны', 'Защита корпуса', '🌀', 180, 1),
    S('Контратаки', 'Уклон и ответ', '🥊', 180, 1.15),
    S('Раунд с тенью', 'Свободный бой', '👊', 150, 1.1)
  ]),
  mkW('w-10', 'box', 'Бокс + скакалка (кардио)', 'Скакалка, тень и сильные серии на выносливость', '🪢', 8, 5, 11.0, [
    S('Скакалка · лёгкая', 'Разогрев икр', '🪢', 180, 0.9),
    S('Бой с тенью', 'Работа руками', '🥊', 180, 1),
    S('Скакалка · скоростная', 'Двойные пропуски', '⚡', 180, 1.25),
    S('Серии по мешку', 'Взрыв и отдых', '🪨', 180, 1.2)
  ]),

  /* --------- ММА --------- */
  mkW('w-11', 'mma', 'ММА: ударная техника', 'Руки, ноги, колени — связки для стойки', '🥋', 9, 5, 10.8, [
    S('Разминка', 'Суставы и динамика', '🧘', 120, 0.6),
    S('Руки: джеб–кросс–хук', 'Бокс в ММА', '🥊', 180, 1),
    S('Лоу-кики и мид-кики', 'Удары ногами', '🦶', 180, 1.1),
    S('Колени в клинче', 'Ближний бой', '🤺', 150, 1.15),
    S('Комбинации рука–нога', 'Связки ММА', '🥋', 180, 1.25)
  ]),
  mkW('w-12', 'mma', 'ММА: спарринг-раунды 5×3', 'Пять раундов по три минуты с переходами стойка–партер', '🥊', 10, 6, 12.5, [
    S('Раунд 1', 'Разведка и дистанция', '🥊', 180, 0.9),
    S('Раунд 2', 'Темп растёт', '👊', 180, 1.05),
    S('Раунд 3', 'Тейкдауны и контроль', '🤼', 180, 1.2),
    S('Раунд 4', 'Партер и удары сверху', '🔨', 180, 1.3),
    S('Раунд 5', 'Решающий', '🔥', 180, 1.4)
  ]),
  mkW('w-13', 'mma', 'ММА: клинч и тейкдауны', 'Заходы в ноги, клинч у сетки и защита от тейкдаунов', '🤼', 9, 6, 11.5, [
    S('Спринт-входы', 'Взрывной заход в ноги', '🤼', 150, 1.1),
    S('Клинч и колени', 'Давление у сетки', '🤺', 180, 1.1),
    S('Спрол и возврат', 'Защита от тейкдауна', '🐊', 150, 1.15),
    S('Ground and pound', 'Удары сверху по мешку', '🔨', 150, 1.25)
  ]),
  mkW('w-14', 'mma', 'ММА Fight Camp: финальный блок', 'Самая тяжёлая тренировка подготовки бойца — для сильных', '🔥', 11, 7, 13.0, [
    S('Разминка бойца', 'Динамика и тень', '🥊', 150, 0.7),
    S('Ударный блок', 'Руки и ноги', '👊', 180, 1.1),
    S('Борцовский блок', 'Тейкдауны и клинч', '🤼', 180, 1.25),
    S('Партер', 'Контроль и удары', '🔨', 180, 1.3),
    S('Раунд-финал', 'Всё вместе', '🔥', 180, 1.45),
    S('Заминка', 'Восстановление', '🍃', 120, 0.4)
  ]),

  /* --------- ГРЭПЛИНГ --------- */
  mkW('w-15', 'grappling', 'Грэпплинг: борцовский стартер', 'Стойки, захваты и броски — основа борьбы', '🤼', 8, 5, 9.5, [
    S('Разминка борца', 'Мостики, кувырки', '🏗️', 150, 0.7),
    S('Захваты и хват', 'Предплечья и кор', '🧶', 150, 1),
    S('Бросок через бедро', 'Дрилл на технику', '🏯', 180, 1.15),
    S('Контроль сбоку', 'Давление и баланс', '🛡️', 150, 1)
  ]),
  mkW('w-16', 'grappling', 'BJJ: гард и свипы (дриллы)', 'Работа в гарде, свипы и переходы на пассе', '🥋', 7, 4, 8.5, [
    S('Ползки: креветка', 'Подвижность', '🦐', 150, 0.9),
    S('Свипы (дрилл)', 'Работа в гарде', '♟️', 210, 1),
    S('Пассы (дрилл)', 'Прохождение гарда', '🛡️', 210, 1.05),
    S('Мостики и возврат', 'Побег из под контроля', '🏗️', 150, 0.9)
  ]),
  mkW('w-17', 'grappling', 'Грэпплинг: удержания и побеги', 'Дриллы на технику: контроль позиции и выход из неё', '🔒', 8, 5, 9.0, [
    S('Контроль сбоку', 'Давление корпусом', '🛡️', 180, 1),
    S('Побег: мост и креветка', 'Выход из-под контроля', '🦐', 180, 1.05),
    S('Переходы между позициями', 'Плавность и баланс', '♟️', 180, 1.1),
    S('Раунд на скорость', 'Лёгкий темп с партнёром', '🤼', 150, 1.2)
  ]),
  mkW('w-18', 'grappling', 'Грэпплинг: силовая для борца', 'Шея, хват, спина и кор — фундамент борца', '💪', 8, 5, 8.8, [
    S('Мостики борца', 'Шея и спина', '🏗️', 150, 0.8),
    S('Подтягивания с полотенцем', 'Хват и предплечья', '🧶', 150, 1.1),
    S('Ходьба «медведем»', 'Плечи и кор', '🐻', 150, 1),
    S('Выпрыгивания и бёрпи', 'Взрывная сила', '💣', 150, 1.3)
  ]),

  /* --------- КРОССФИТ --------- */
  mkW('w-19', 'crossfit', 'WOD «Огонь»: AMRAP 12', 'Максимум раундов за 12 минут: бёрпи, приседы, отжимания', '🔥', 10, 6, 12.5, [
    S('Разминка WOD', 'Суставы и пульс', '🧘', 120, 0.6),
    S('AMRAP · блок 1', 'Бёрпи / приседы / отжимания', '💣', 240, 1.15),
    S('AMRAP · блок 2', 'Продолжай без пауз', '🔥', 240, 1.25),
    S('AMRAP · блок 3', 'Финальный рывок', '🏁', 240, 1.35)
  ]),
  mkW('w-20', 'crossfit', 'EMOM 10: сила и взрыв', 'Каждую минуту — новое задание. Отдых — только остаток минуты', '⏱️', 9, 6, 11.5, [
    S('EMOM · минуты 1–3', 'Трастеры', '🏋️', 180, 1.1),
    S('EMOM · минуты 4–6', 'Махи и прыжки', '🔔', 180, 1.15),
    S('EMOM · минуты 7–10', 'Бёрпи + подтягивания', '🦾', 240, 1.3)
  ]),
  mkW('w-21', 'crossfit', 'Табата-ад 4×4', 'Четыре табаты подряд: 20 секунд работы, 10 отдыха', '⚡', 10, 7, 13.5, [
    S('Табата 1 · приседы', 'Приседы с выпрыгиванием', '⏱️', 240, 1.1),
    S('Табата 2 · бёрпи', 'Бёрпи с прыжком', '💣', 240, 1.25),
    S('Табата 3 · скакалка', 'Двойные прыжки', '🪂', 240, 1.2),
    S('Табата 4 · всё тело', 'Бёрпи + подтягивание', '🦾', 240, 1.35)
  ]),
  mkW('w-22', 'crossfit', 'WOD «Спартанец»', 'Тяжёлый комплекс на силу, кор и выносливость', '🏛️', 11, 7, 12.8, [
    S('Трастеры', 'Ноги + жим', '🏋️', 180, 1.1),
    S('Подтягивания и бёрпи', 'Спина и кардио', '🦾', 180, 1.3),
    S('Махи гирей', 'Задняя цепь', '🔔', 180, 1.2),
    S('Прыжки на тумбу', 'Взрыв ног', '📦', 150, 1.15),
    S('Ходьба «медведем»', 'Кор и плечи', '🐻', 150, 1)
  ]),
  mkW('w-23', 'crossfit', 'Кроссфит: ноги и кор', 'Приседы, прыжки и планки — ноги будут гореть', '🦵', 9, 5, 10.5, [
    S('Болгарские приседы', 'Изоляция бедра', '🔥', 180, 1.05),
    S('Прыжки на тумбу', 'Взрывная сила', '📦', 150, 1.15),
    S('Выпады с прыжком', 'Баланс и мощность', '🚶', 150, 1.1),
    S('Планки: фронт и бок', 'Глубокий кор', '🧱', 150, 0.8)
  ]),
];

/* ---------------- КЕЙСЫ ---------------- */
const initialCases = [
  { id: 'case-daily', name: 'Ежедневный бонусный кейс', icon: '🎁', isDaily: true, price: 0, minCoins: 40, maxCoins: 150, minXp: 25, maxXp: 70, rareDropChance: 0.18, itemRolls: 1, itemChance: 0.65, desc: 'Бесплатный кейс каждые 24 часа! Монеты, предметы и шанс на бойца.', active: true },
  { id: 'case-bronze', name: 'Стартовый бронзовый кейс', icon: '📦', isDaily: false, price: 75, minCoins: 25, maxCoins: 95, minXp: 15, maxXp: 40, rareDropChance: 0.15, itemRolls: 1, itemChance: 0.60, desc: 'Доступный бокс с монетами, энергетиками и редкими бойцами', active: true },
  { id: 'case-silver', name: 'Серебряный кейс Воина', icon: '🥈', isDaily: false, price: 220, minCoins: 75, maxCoins: 260, minXp: 45, maxXp: 110, rareDropChance: 0.30, itemRolls: 2, itemChance: 0.60, desc: 'Повышенный шанс на редких бойцов и ценные предметы', active: true },
  { id: 'case-gold', name: 'Золотой сундук Чемпиона', icon: '🥇', isDaily: false, price: 480, minCoins: 180, maxCoins: 600, minXp: 90, maxXp: 220, rareDropChance: 0.45, itemRolls: 2, itemChance: 0.75, desc: 'Высокий шанс на Эпических и Легендарных бойцов ринга', active: true },
  { id: 'case-cyber', name: 'Алмазный Кибер-Кейс', icon: '💎', isDaily: false, price: 850, minCoins: 350, maxCoins: 1200, minXp: 180, maxXp: 400, rareDropChance: 0.60, itemRolls: 3, itemChance: 0.75, desc: 'Кибернетические награды, бустеры и Легенды', active: true },
  { id: 'case-mythic', name: 'Мифический кейс Титанов', icon: '👑', isDaily: false, price: 1500, minCoins: 800, maxCoins: 2500, minXp: 400, maxXp: 900, rareDropChance: 0.85, itemRolls: 3, itemChance: 0.90, desc: 'Редчайший шанс выбить Мифических Чингиз Хана и Джаггернаута!', active: true },
];

/* ---------------- ПРЕДМЕТЫ ИЗ КЕЙСОВ (МОЖНО ИСПОЛЬЗОВАТЬ) ---------------- */
const ITEM_CATALOG = {
  energy_drink: { id: 'energy_drink', name: 'Энергетик', icon: '🥤', rarity: 'common', weight: 30, group: 'workout', desc: '+40 энергии для тренировок' },
  protein: { id: 'protein', name: 'Протеиновый шейкер', icon: '🥛', rarity: 'common', weight: 20, group: 'workout', desc: '+25 энергии и ×1.5 XP на следующую тренировку' },
  mega_energy: { id: 'mega_energy', name: 'Мега-энергетик', icon: '🧃', rarity: 'rare', weight: 11, group: 'workout', desc: 'Полностью восстанавливает энергию тренировок' },
  click_charge: { id: 'click_charge', name: 'Батарейка кликера', icon: '🔋', rarity: 'common', weight: 28, group: 'click', desc: '+50 ударов в кликере' },
  click_full: { id: 'click_full', name: 'Заряд Тайфуна', icon: '🌀', rarity: 'rare', weight: 10, group: 'click', desc: 'Полностью заряжает кликер' },
  coin_pouch: { id: 'coin_pouch', name: 'Мешочек монет', icon: '👝', rarity: 'common', weight: 24, group: 'other', desc: '+300 монет мгновенно' },
  xp_scroll: { id: 'xp_scroll', name: 'Свиток опыта', icon: '📜', rarity: 'rare', weight: 12, group: 'other', desc: '+150 XP мгновенно' },
  xp_boost: { id: 'xp_boost', name: 'Бустер XP ×2', icon: '🧪', rarity: 'epic', weight: 6, group: 'boost', desc: 'Удваивает XP за следующую тренировку' },
  coin_boost: { id: 'coin_boost', name: 'Золотой магнит', icon: '🧲', rarity: 'epic', weight: 6, group: 'boost', desc: 'Удваивает монеты за следующую тренировку' },
  voucher: { id: 'voucher', name: 'Золотой купон', icon: '🎟️', rarity: 'epic', weight: 5, group: 'other', desc: 'Бесплатно открывает любой платный кейс' },
  legend_elixir: { id: 'legend_elixir', name: 'Эликсир Чемпиона', icon: '🏆', rarity: 'legendary', weight: 1.6, group: 'boost', desc: 'Полная энергия + полный кликер + XP ×2 на тренировку' },
};

const RARITY_RANK = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };

/* ---------------- ТРОФЕИ (МОЖНО НАДЕТЬ) ---------------- */
const TROPHY_CATALOG = {
  'tr-badge': { id: 'tr-badge', name: 'Значок Первопроходца', icon: '🏅', rarity: 'common', desc: '+3% монет за тренировки', coinMult: 0.03 },
  'tr-gloves': { id: 'tr-gloves', name: 'Золотые перчатки', icon: '🥊', rarity: 'rare', desc: '+5% XP за тренировки', xpMult: 0.05 },
  'tr-cup': { id: 'tr-cup', name: 'Кубок арены', icon: '🏆', rarity: 'epic', desc: '+8% монет за тренировки', coinMult: 0.08 },
  'tr-shaker': { id: 'tr-shaker', name: 'Платиновый шейкер', icon: '🥤', rarity: 'rare', desc: '−10% затрат энергии на тренировки', costMult: 0.10 },
  'tr-belt': { id: 'tr-belt', name: 'Пояс Чемпиона', icon: '👑', rarity: 'legendary', desc: '+10% XP и +10% монет', xpMult: 0.10, coinMult: 0.10 },
};
const TROPHY_DROP_ORDER = ['tr-gloves', 'tr-cup', 'tr-shaker', 'tr-belt'];

/* ---------------- ДОРОГА УРОВНЕЙ: награда каждые 3 уровня ---------------- */
const ROAD_STEP = 3;
const ROAD_MAX_LEVEL = 60;

function buildRoadRewards() {
  const list = [];
  for (let lvl = ROAD_STEP; lvl <= ROAD_MAX_LEVEL; lvl += ROAD_STEP) {
    const idx = lvl / ROAD_STEP;
    let give = {};
    let icon = '🎁';
    let title = 'Утешительный подарок';
    const kind = idx % 6;

    if (kind === 1) {
      give = { coins: 150 + lvl * 12 };
      icon = '🪙'; title = 'Мешок монет';
    } else if (kind === 2) {
      give = { energy: 35 + Math.min(40, lvl), items: { energy_drink: 1 } };
      icon = '🥤'; title = 'Заряд сил';
    } else if (kind === 3) {
      give = { clicks: 60 + lvl, items: { click_charge: 1 } };
      icon = '🔋'; title = 'Заряд для тапа';
    } else if (kind === 4) {
      give = { xp: 80 + lvl * 6, coins: 100 };
      icon = '📜'; title = 'Мудрость тренера';
    } else if (kind === 5) {
      give = { items: { protein: 1, coin_pouch: 1 }, coins: 120 };
      icon = '🥛'; title = 'Набор атлета';
    } else {
      give = { items: { voucher: 1, xp_boost: 1 }, coins: 250 + lvl * 8 };
      icon = '🎟️'; title = 'Большой приз';
    }

    if (lvl % 30 === 0) {
      give = { items: { voucher: 3, legend_elixir: 1, mega_energy: 2 }, coins: 2000 + lvl * 20 };
      icon = '🏆'; title = 'ЛЕГЕНДАРНАЯ НАГРАДА';
    }
    if (lvl === 15 || lvl === 45) {
      give = { items: { mega_energy: 1, click_full: 1, xp_boost: 1, coin_boost: 1 }, coins: 500 };
      icon = '💎'; title = 'Сундук вехи';
    }
    list.push({ level: lvl, icon, title, give });
  }
  return list;
}
const ROAD_REWARDS = buildRoadRewards();

/* ---------------- КВЕСТЫ ---------------- */
const initialQuests = [
  { id: 'q-1', title: 'Завершить любую тренировку', target: 1, current: 0, rewardCoins: 60, rewardXp: 40, icon: '🏋️', claimed: false, period: 'day' },
  { id: 'q-2', title: 'Сделать 40 ударов в кликере', target: 40, current: 0, rewardCoins: 50, rewardXp: 30, icon: '👊', claimed: false, period: 'day' },
  { id: 'q-3', title: 'Собрать свой комплекс в конструкторе', target: 1, current: 0, rewardCoins: 80, rewardXp: 50, icon: '🛠️', claimed: false, period: 'day' },
  { id: 'q-4', title: 'Открыть кейс с рулеткой', target: 1, current: 0, rewardCoins: 100, rewardXp: 60, icon: '🎁', claimed: false, period: 'day' },
  { id: 'q-6', title: 'Использовать предмет из сумки', target: 1, current: 0, rewardCoins: 70, rewardXp: 45, icon: '🎒', claimed: false, period: 'day' },
  { id: 'q-7', title: 'Забрать награду на Дороге уровней', target: 1, current: 0, rewardCoins: 90, rewardXp: 55, icon: '🛣️', claimed: false, period: 'week' },
  { id: 'q-5', title: 'Завершить 4 тренировки за неделю', target: 4, current: 0, rewardCoins: 300, rewardXp: 200, icon: '📅', claimed: false, period: 'week' },
];

const RANKS = [
  { min: 0, name: 'Новичок зала', color: '#7E8B9B' },
  { min: 3, name: 'Любитель спорта', color: '#00B4D8' },
  { min: 7, name: 'Атлет прогресса', color: '#00E676' },
  { min: 12, name: 'Профи тренировок', color: '#9D4EDD' },
  { min: 18, name: 'Мастер дисциплины', color: '#FF3B5C' },
  { min: 25, name: 'Гранд-Мастер', color: '#FFB800' },
  { min: 35, name: 'Живая Легенда', color: '#FF007F' },
];

