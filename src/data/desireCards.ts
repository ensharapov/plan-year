export interface DesireCard {
  key: string;
  title: string;
  description: string;
  tier: 1 | 2 | 3 | 4;
  tierLabel: string;
  emoji: string;
  gradient: string;
}

export const DESIRE_CARDS: DesireCard[] = [
  // Tier 1: $100–$1,000 — Доступные удовольствия
  {
    key: 'premium-massage',
    title: 'Премиум-массаж',
    description: 'Два часа в лучшем спа города. Горячие камни, аромамасла, полное растворение.',
    tier: 1, tierLabel: '💚 Доступно сейчас',
    emoji: '💆',
    gradient: 'from-emerald-600/50 to-teal-500/40',
  },
  {
    key: 'michelin-dinner',
    title: 'Ужин в мишленовском ресторане',
    description: 'Дегустационный сет из 12 подач. Каждое блюдо — произведение искусства.',
    tier: 1, tierLabel: '💚 Доступно сейчас',
    emoji: '🍽️',
    gradient: 'from-amber-600/50 to-orange-500/40',
  },
  {
    key: 'helicopter-flight',
    title: 'Полёт на вертолёте',
    description: 'Город с высоты птичьего полёта. Ветер, адреналин, абсолютная свобода.',
    tier: 1, tierLabel: '💚 Доступно сейчас',
    emoji: '🚁',
    gradient: 'from-sky-600/50 to-blue-500/40',
  },
  {
    key: 'personal-stylist',
    title: 'День с персональным стилистом',
    description: 'Полное обновление гардероба. Новый образ, новое ощущение себя.',
    tier: 1, tierLabel: '💚 Доступно сейчас',
    emoji: '👔',
    gradient: 'from-violet-600/50 to-purple-500/40',
  },
  {
    key: 'cooking-masterclass',
    title: 'Мастер-класс от шеф-повара',
    description: 'Научиться готовить пасту как в Италии. Руками, с душой, с бокалом вина.',
    tier: 1, tierLabel: '💚 Доступно сейчас',
    emoji: '👨‍🍳',
    gradient: 'from-red-600/50 to-rose-500/40',
  },
  {
    key: 'concert-vip',
    title: 'VIP на концерте мечты',
    description: 'Первый ряд, бэкстейдж, встреча с артистом. Музыка вибрирует в груди.',
    tier: 1, tierLabel: '💚 Доступно сейчас',
    emoji: '🎵',
    gradient: 'from-pink-600/50 to-fuchsia-500/40',
  },
  {
    key: 'weekend-nature',
    title: 'Уикенд в глэмпинге',
    description: 'Костёр, звёзды, тишина. Роскошный шатёр посреди дикой природы.',
    tier: 1, tierLabel: '💚 Доступно сейчас',
    emoji: '⛺',
    gradient: 'from-green-600/50 to-lime-500/40',
  },

  // Tier 2: $1,000–$10,000 — Значимые желания
  {
    key: 'bali-retreat',
    title: 'Ретрит на Бали',
    description: '2 недели в джунглях. Йога на рассвете, рисовые террасы, внутренняя тишина.',
    tier: 2, tierLabel: '💛 Значимая цель',
    emoji: '🌴',
    gradient: 'from-emerald-600/50 to-cyan-500/40',
  },
  {
    key: 'home-studio',
    title: 'Домашняя студия',
    description: 'Полностью оборудованная звуковая/видео студия. Творить когда захочется.',
    tier: 2, tierLabel: '💛 Значимая цель',
    emoji: '🎙️',
    gradient: 'from-indigo-600/50 to-violet-500/40',
  },
  {
    key: 'rolex-watch',
    title: 'Часы мечты',
    description: 'Механизм, который переживёт поколения. Каждый взгляд на запястье — кайф.',
    tier: 2, tierLabel: '💛 Значимая цель',
    emoji: '⌚',
    gradient: 'from-yellow-600/50 to-amber-500/40',
  },
  {
    key: 'japan-trip',
    title: 'Месяц в Японии',
    description: 'Токио, Киото, Осака. Храмы, рамен, сакура. Другая вселенная.',
    tier: 2, tierLabel: '💛 Значимая цель',
    emoji: '🗾',
    gradient: 'from-rose-600/50 to-red-500/40',
  },
  {
    key: 'personal-coach',
    title: 'Год с топ-коучем',
    description: 'Персональный ментор, который вытащит на новый уровень. 52 сессии трансформации.',
    tier: 2, tierLabel: '💛 Значимая цель',
    emoji: '🧠',
    gradient: 'from-purple-600/50 to-indigo-500/40',
  },
  {
    key: 'electric-bike',
    title: 'Премиум электробайк',
    description: 'Ветер в лицо, нулевой выхлоп. Скорость и свобода без бензина.',
    tier: 2, tierLabel: '💛 Значимая цель',
    emoji: '🏍️',
    gradient: 'from-slate-500/50 to-zinc-400/40',
  },

  // Tier 3: $10,000–$100,000 — Амбициозные мечты
  {
    key: 'tesla-model',
    title: 'Tesla',
    description: 'Бесшумная мощь. Автопилот. Ощущение будущего каждый день.',
    tier: 3, tierLabel: '🧡 Амбициозная мечта',
    emoji: '🚗',
    gradient: 'from-blue-600/50 to-indigo-500/40',
  },
  {
    key: 'startup-launch',
    title: 'Запустить свой стартап',
    description: 'Своя компания, своя команда, свой продукт. Создавать, а не исполнять.',
    tier: 3, tierLabel: '🧡 Амбициозная мечта',
    emoji: '🚀',
    gradient: 'from-orange-600/50 to-red-500/40',
  },
  {
    key: 'world-trip',
    title: 'Кругосветное путешествие',
    description: '6 месяцев, 20 стран. Каждую неделю — новый город, новые люди.',
    tier: 3, tierLabel: '🧡 Амбициозная мечта',
    emoji: '🌍',
    gradient: 'from-teal-600/50 to-emerald-500/40',
  },
  {
    key: 'apartment-renovation',
    title: 'Квартира мечты',
    description: 'Дизайнерский ремонт от и до. Каждый угол — ваш, каждая деталь — осознанная.',
    tier: 3, tierLabel: '🧡 Амбициозная мечта',
    emoji: '🏠',
    gradient: 'from-amber-600/50 to-yellow-500/40',
  },
  {
    key: 'yacht-week',
    title: 'Неделя на яхте',
    description: 'Средиземное море, свой капитан, закаты с палубы. Полная перезагрузка.',
    tier: 3, tierLabel: '🧡 Амбициозная мечта',
    emoji: '⛵',
    gradient: 'from-cyan-600/50 to-blue-500/40',
  },

  // Tier 4: $100,000–$1,000,000+ — Предельные мечты
  {
    key: 'villa-como',
    title: 'Вилла на озере Комо',
    description: 'Просыпаться с видом на Альпы. Свой причал, оливковая роща, вечность.',
    tier: 4, tierLabel: '❤️‍🔥 Предельная мечта',
    emoji: '🏰',
    gradient: 'from-rose-600/60 to-pink-500/50',
  },
  {
    key: 'financial-freedom',
    title: 'Полная финансовая свобода',
    description: 'Пассивный доход покрывает всё. Работать только когда хочется и над чем хочется.',
    tier: 4, tierLabel: '❤️‍🔥 Предельная мечта',
    emoji: '💎',
    gradient: 'from-violet-600/60 to-purple-500/50',
  },
  {
    key: 'ted-talk',
    title: 'Выступление на TED',
    description: 'Тысячи людей слушают вашу историю. Миллионы смотрят онлайн. Ваш голос меняет мир.',
    tier: 4, tierLabel: '❤️‍🔥 Предельная мечта',
    emoji: '🎤',
    gradient: 'from-red-600/60 to-orange-500/50',
  },
  {
    key: 'own-foundation',
    title: 'Свой благотворительный фонд',
    description: 'Менять мир системно. Ваше наследие живёт в тысячах спасённых жизней.',
    tier: 4, tierLabel: '❤️‍🔥 Предельная мечта',
    emoji: '🌟',
    gradient: 'from-yellow-600/60 to-emerald-500/50',
  },
  {
    key: 'private-island',
    title: 'Собственный остров',
    description: 'Кусочек рая, который принадлежит только вам. Тишина, океан, бесконечность.',
    tier: 4, tierLabel: '❤️‍🔥 Предельная мечта',
    emoji: '🏝️',
    gradient: 'from-teal-600/60 to-cyan-500/50',
  },
  {
    key: 'space-flight',
    title: 'Полёт в космос',
    description: 'Увидеть Землю из космоса. Понять масштаб. Вернуться другим человеком.',
    tier: 4, tierLabel: '❤️‍🔥 Предельная мечта',
    emoji: '🪐',
    gradient: 'from-indigo-600/60 to-blue-500/50',
  },
];
