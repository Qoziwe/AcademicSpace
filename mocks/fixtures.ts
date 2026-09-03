/**
 * Статические сид-данные мок-слоя. Извлечены 1:1 из `renderVals()`
 * дизайн-референса (`docs/source/design-reference.html`, строки ~1201–1596).
 * Изменяемое состояние (какие пункты задач отмечены, залит ли документ,
 * заполнена ли анкета, история чата, статус оплаты) живёт в
 * `mocks/store.ts`; здесь — только неизменные справочники.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Профиль
// ─────────────────────────────────────────────────────────────────────────────

export const PROFILE = {
  id: 'u_demo',
  name: 'Батыркызы Тінатін',
  email: 'tinatin@mail.kz',
  grade: '11 класс',
  avatarUrl: null as string | null,
  level: 4,
  /** Стартовый XP демо-профиля. Дальше растёт в `mocks/store.ts` при закрытии модулей. */
  xp: 620,
  xpToNextLevel: 1000,
  matchesCount: 14,
  rating: 78,
} as const;

/**
 * Данные дашборда, которые в прототипе захардкожены прямо в разметке
 * (`design-reference.html`): подпись зоны анализа и плитки-статы карточки
 * профиля. Отдаются хендлером `GET /api/v1/profile/me` (`analysis`,
 * `dashboardStats`) — страна берётся из выбранных фильтров.
 */
export const DASHBOARD = {
  /** «подбор от 14 марта» — дата последнего прогона алгоритма. */
  analysisSinceLabel: '14 марта',
  /** «12/12 полей» в статах карточки профиля (анкета — 12 полей). */
  questionnaireFieldCount: 12,
} as const;

/** Предзаполнение формы регистрации/входа (в прототипе поля не пустые). */
export const AUTH_PREFILL = {
  name: 'Тінатін Батыркызы',
  email: 'tinatin@mail.kz',
  grade: '11 класс',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Анкета (QUESTIONNAIRE, шаг 1)
// ─────────────────────────────────────────────────────────────────────────────

export const QUESTIONNAIRE_GROUPS = [
  {
    title: 'Академические результаты',
    fields: [
      { label: 'Средний балл', value: '4,7' },
      { label: 'Профильная математика', value: '86' },
      { label: 'Английский', value: 'IELTS 5.5' },
      { label: 'Класс', value: '11' },
    ],
  },
  {
    title: 'Предпочтения по вузам',
    fields: [
      { label: 'Формат', value: 'Бакалавриат' },
      { label: 'Готовность к переезду', value: 'Да' },
      { label: 'Бюджет в год', value: 'до 3 000 €' },
    ],
  },
] as const;

export const INTERESTS = [
  'Инженерия',
  'Технологии',
  'Экономика',
  'Дизайн',
  'Медицина',
  'Право',
  'Физика',
  'Архитектура',
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Шаги фильтров (FILTER_COUNTRY … FILTER_COST) — `fsteps` прототипа
// ─────────────────────────────────────────────────────────────────────────────

export interface FilterOption {
  title: string;
  sub: string;
  badge?: string;
}

/** Ключ одиночного выбора в `mocks/store.ts.filters`. */
export type SingleFilterKey = 'country' | 'faculty' | 'language' | 'cost';

interface FilterStepBase {
  title: string;
  stepLabel: string;
  hint: string;
  options: FilterOption[];
}

export type FilterStepDef =
  | (FilterStepBase & { key: SingleFilterKey; multi: false })
  | (FilterStepBase & { key: 'universities'; multi: true });

export const FILTER_STEPS = [
  {
    key: 'country',
    title: 'Страна обучения',
    stepLabel: 'шаг 2 из 6',
    hint: 'За один подбор — одна страна, чтобы результаты не размешивались.',
    multi: false,
    options: [
      { title: 'Италия', sub: 'щедрые государственные стипендии', badge: '14 вузов' },
      { title: 'Германия', sub: 'обучение почти без платы', badge: '21 вуз' },
      { title: 'Чехия', sub: 'бесплатно на чешском', badge: '9 вузов' },
      { title: 'Казахстан', sub: 'гранты МОН', badge: '32 вуза' },
    ],
  },
  {
    key: 'universities',
    title: 'Университеты',
    stepLabel: 'шаг 3 из 6',
    hint: 'Отметьте вузы, которые вам интересны в выбранной стране.',
    multi: true,
    options: [
      { title: 'Università di Bologna', sub: 'Болонья · #154 QS' },
      { title: 'Politecnico di Milano', sub: 'Милан · #123 QS' },
      { title: 'Università di Padova', sub: 'Падова · #219 QS' },
      { title: 'Bocconi', sub: 'Милан · бизнес' },
    ],
  },
  {
    key: 'faculty',
    title: 'Факультет',
    stepLabel: 'шаг 4 из 6',
    hint: 'Показываем только те направления, которые есть в отмеченных вузах.',
    multi: false,
    options: [
      { title: 'Инженерия', sub: 'есть в 3 из 4 вузов' },
      { title: 'Информатика', sub: 'есть в 4 из 4' },
      { title: 'Экономика', sub: 'есть в 2 из 4' },
      { title: 'Архитектура', sub: 'есть в 2 из 4' },
    ],
  },
  {
    key: 'language',
    title: 'Язык обучения',
    stepLabel: 'шаг 5 из 6',
    hint: 'Проверяем, доступно ли выбранное направление на этом языке.',
    multi: false,
    options: [
      { title: 'Английский', sub: '9 программ из 14' },
      { title: 'Итальянский', sub: '14 программ' },
      { title: 'Смешанный', sub: '4 программы' },
    ],
  },
  {
    key: 'cost',
    title: 'Стоимость и стипендия',
    stepLabel: 'шаг 6 из 6',
    hint: 'Условия сильно различаются от страны к стране: в Италии стипендии преимущественно государственные и весьма щедрые.',
    multi: false,
    options: [
      { title: 'до 1 000 € в год', sub: '+ полная стипендия' },
      { title: 'до 3 000 € + стипендия', sub: 'покрытие до 100 %' },
      { title: 'до 8 000 €', sub: 'частичные гранты' },
      { title: 'без ограничений', sub: 'все программы' },
    ],
  },
] satisfies readonly FilterStepDef[];

// ─────────────────────────────────────────────────────────────────────────────
// Результаты подбора (RESULTS) — `resultGroups` прототипа
// ─────────────────────────────────────────────────────────────────────────────

export type UniCategoryKey = 'safety' | 'match' | 'reach';

export interface SearchItem {
  id: string;
  name: string;
  city: string;
  chance: string;
  tags: string[];
}

export interface SearchGroup {
  category: UniCategoryKey;
  title: string;
  sub: string;
  items: SearchItem[];
}

export const SEARCH_GROUPS: SearchGroup[] = [
  {
    category: 'safety',
    title: 'Безопасный выбор',
    sub: 'Safety · 5',
    items: [
      {
        id: 'padova',
        name: 'Università di Padova',
        city: 'Падова · Инженерия · англ.',
        chance: '92%',
        tags: ['2 500 €/год', 'стипендия до 100%', 'IELTS 5.5'],
      },
      {
        id: 'torino',
        name: 'Politecnico di Torino',
        city: 'Турин · Информатика · англ.',
        chance: '88%',
        tags: ['2 800 €/год', 'грант региона', 'IELTS 5.5'],
      },
    ],
  },
  {
    category: 'match',
    title: 'Оптимальный выбор',
    sub: 'Match · 6',
    items: [
      {
        id: 'bologna',
        name: 'Università di Bologna',
        city: 'Болонья · Инженерия · англ.',
        chance: '71%',
        tags: ['3 000 €/год', 'стипендия ER-GO', 'IELTS 6.0'],
      },
      {
        id: 'trento',
        name: 'Università di Trento',
        city: 'Тренто · Информатика · англ.',
        chance: '66%',
        tags: ['3 400 €/год', 'опекунский грант', 'IELTS 6.0'],
      },
    ],
  },
  {
    category: 'reach',
    title: 'Амбициозная цель',
    sub: 'Reach · 3 · зона роста',
    items: [
      {
        id: 'polimi',
        name: 'Politecnico di Milano',
        city: 'Милан · Инженерия · англ.',
        chance: '34%',
        tags: ['+9 баллов рейтинга', 'портфолио', 'IELTS 6.5'],
      },
      {
        id: 'bocconi',
        name: 'Università Bocconi',
        city: 'Милан · Экономика · англ.',
        chance: '21%',
        tags: ['+14 баллов', 'эссе', 'IELTS 7.0'],
      },
    ],
  },
];

/** Кол-во по категориям для bento-плиток дашборда (`buckets`). */
export const BUCKET_COUNTS = { safety: 5, match: 6, reach: 3 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// Задачи / модули (ACTIVE_TASKS, MODULE_DETAIL) — `s.tasks` прототипа
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskItemSeed {
  label: string;
  done: boolean;
}

export interface TaskSeed {
  id: string;
  kind: 'КАРТА' | 'ЧЕК-ЛИСТ' | 'ТАЙМЕР';
  title: string;
  meta: string;
  xp: number;
  isTimer?: boolean;
  items: TaskItemSeed[];
}

export const TASKS_SEED: TaskSeed[] = [
  {
    id: 'r1',
    kind: 'КАРТА',
    title: 'Дорожная карта: IELTS 6.5',
    meta: 'создано ИИ-ментором · дедлайн 20 марта',
    xp: 120,
    items: [
      { label: 'Пробный тест Listening', done: true },
      { label: '20 слов академической лексики', done: false },
      { label: 'Разбор Writing Task 2', done: false },
    ],
  },
  {
    id: 'c1',
    kind: 'ЧЕК-ЛИСТ',
    title: 'Мотивационное письмо',
    meta: 'создано ИИ-ментором · 3 из 4 шагов',
    xp: 80,
    items: [
      { label: 'Черновик первого абзаца', done: true },
      { label: 'Убрать общие формулировки', done: true },
      { label: 'Проверка у ментора', done: false },
    ],
  },
  {
    id: 't1',
    kind: 'ТАЙМЕР',
    title: '25 минут на Writing Task 2',
    meta: 'создано ИИ-ментором · сессия фокуса',
    xp: 40,
    isTimer: true,
    items: [
      { label: 'Разобрать структуру эссе', done: false },
      { label: 'Написать введение', done: false },
    ],
  },
];

/** Модуль, который ассистент предлагает создать в чате (`createModule`). */
export const CHAT_MODULE_TASK: TaskSeed = {
  id: 'new',
  kind: 'КАРТА',
  title: 'Дорожная карта: IELTS 6.5',
  meta: 'только что создано в чате',
  xp: 120,
  items: [
    { label: 'Пробный тест Listening', done: false },
    { label: 'Расписание на 8 недель', done: false },
  ],
};

/**
 * Как вид модуля превращается в запись журнала (ACHIEVEMENT_LOG) при
 * закрытии всех пунктов — `mocks/store.ts.completeTask`.
 */
export const TASK_KIND_LOG: Record<TaskSeed['kind'], { kind: string; dot: LogDotColor }> = {
  КАРТА: { kind: 'дорожная карта', dot: 'blue' },
  'ЧЕК-ЛИСТ': { kind: 'чек-лист', dot: 'green' },
  ТАЙМЕР: { kind: 'таймер', dot: 'blueLight' },
};

/**
 * Копирайт блока «Что дальше» на MODULE_DETAIL (`mdOutcome` прототипа) —
 * одинаков для всех модулей, поэтому экран берёт его отсюда напрямую.
 */
export const MODULE_OUTCOME_COPY = {
  pending:
    'Когда все пункты будут отмечены, карточка исчезнет с главного экрана и осядет в «Журнале выполненных заданий» вместе с начисленным опытом.',
  complete:
    'Все пункты закрыты — модуль уходит из активного блока и навсегда сохраняется в «Журнале выполненных заданий» в профиле.',
  rewardLabel: 'Награда за завершение',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Карточка вуза (UNIVERSITY_DETAILS) — `uniStats` / `uniRows` прототипа
// ─────────────────────────────────────────────────────────────────────────────

/** Общие для мока данные карточки (в прототипе захардкожены под Bologna). */
export const UNIVERSITY_DETAIL = {
  admissionsUrl: 'https://www.unibo.it',
  foundedNote: 'основан в 1088',
  stats: [
    { k: 'вероятность', v: '71%' },
    { k: 'в год', v: '3 000 €' },
    { k: 'QS World', v: '#154' },
  ],
  rows: [
    { k: 'Направление', v: 'Инженерия · бакалавриат' },
    { k: 'Язык', v: 'Английский' },
    { k: 'Дедлайн заявки', v: '12 мая' },
    { k: 'Стипендия', v: 'ER-GO, до 100 %' },
    { k: 'Требуемый IELTS', v: '6.0' },
  ],
  /** Текст блока документов для Premium / Free (`docText`). */
  docTextPremium:
    '9 документов: аттестат с апостилем, IELTS, мотивационное письмо, 2 рекомендации, dichiarazione di valore и др. Копилка уже создана.',
  docTextFree:
    'Список документов и копилка для их хранения доступны только в Premium. На базовом уровне вы видите сам список вузов.',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Документы для поступления (REQUIRED_DOCUMENTS) / копилка (VAULT_DETAIL)
// — `vaultCells` прототипа
// ─────────────────────────────────────────────────────────────────────────────

export const DOCUMENT_SLOTS = [
  { title: 'Аттестат с апостилем', filledSub: 'pdf · загружено 14 марта' },
  { title: 'Транскрипт оценок', filledSub: 'pdf · загружено' },
  { title: 'IELTS сертификат', filledSub: 'pdf · загружено' },
  { title: 'Мотивационное письмо', filledSub: 'нужен файл' },
  { title: 'Рекомендация №1', filledSub: 'нужен файл' },
  { title: 'Dichiarazione di valore', filledSub: 'нужен файл' },
  { title: 'Копия паспорта', filledSub: 'нужен файл' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// ИИ-портфолио (PORTFOLIO_UPLOAD) — `uploadSlots` прототипа
// ─────────────────────────────────────────────────────────────────────────────

export const PORTFOLIO_SLOTS = [
  { title: 'Резюме / CV', filledSub: 'cv.pdf · 1 стр.' },
  { title: 'Мотивационное письмо', filledSub: 'letter_v2.docx' },
  { title: 'Внеучебные активности', filledSub: 'загружено' },
  { title: 'Рекомендации', filledSub: 'загружено' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// ИИ-анализ (ANALYSIS_LOADING / ANALYSIS_PREVIEW)
// ─────────────────────────────────────────────────────────────────────────────

export const ANALYSIS_STEPS = [
  'Академические данные обработаны',
  'Портфолио и письма разобраны',
  'Составляем стратегию поступления',
] as const;

export const ANALYSIS_PREVIEW_BLOCKS = [
  {
    title: 'Сильные стороны профиля',
    text: 'Ваш профиль выигрышно смотрится в инженерных направлениях: стабильно высокие оценки по математике и физике, участие в двух региональных олимпиадах и собственный проект. Мотивационное письмо структурировано, но опирается на общие формулировки — там есть быстрый прирост.',
  },
  {
    title: 'План на 6 месяцев',
    text: 'Первые два месяца сфокусируйтесь на IELTS: целевой балл 6.5 открывает 9 из 14 подобранных программ. Параллельно перепишите мотивационное письмо под Politecnico di Milano, где приёмная комиссия ценит проектный опыт…',
  },
  {
    title: 'Что делать с Reach-вузами',
    text: 'Bocconi и Politecnico di Milano требуют дополнительного портфолио и подтверждённого уровня языка. Разрыв составляет примерно 9 баллов рейтинга, что реально закрыть за один семестр при условии…',
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Подписка (PAYWALL / PLAN_SELECTION / PAYMENT_FLOW) — `plans` / `money`
// ─────────────────────────────────────────────────────────────────────────────

export interface PlanSeed {
  id: 'week' | 'month';
  period: string;
  price: string;
  sub: string;
  best: boolean;
}

export const PLANS: PlanSeed[] = [
  { id: 'week', period: 'Неделя', price: '500 тг', sub: 'попробовать', best: false },
  { id: 'month', period: 'Месяц', price: '1 900 тг', sub: '≈ 63 тг в день', best: true },
];

/** Дата продления активной подписки (мок; в проде — с бекенда). */
export const SUBSCRIPTION_RENEWS_AT = '12 мая';
/** Тариф активной демо-подписки. */
export const ACTIVE_PLAN_ID: PlanSeed['id'] = 'month';

export const PREMIUM_PERKS = [
  'Полный ИИ-анализ портфолио и безлимитный чат с ментором',
  'Интерактивные модули: карты, чек-листы, таймеры, задания',
  'Список документов по каждому вузу + копилка',
  'Белый шум, дождь и трекеры продуктивности',
] as const;

export const PAYMENT_FIELDS = [
  { label: 'Номер карты', value: '4400 •••• •••• 1265' },
  { label: 'Срок / CVV', value: '09/28   •••' },
  { label: 'Держатель', value: 'T BATYRKYZY' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Чат ИИ-ментора (AI_CHAT) — `quickPrompts` прототипа
// ─────────────────────────────────────────────────────────────────────────────

export const CHAT_QUICK_PROMPTS = [
  'Как усилить письмо?',
  'Что делать с Reach-вузами?',
  'Собери план на неделю',
] as const;

export interface ChatModuleSeed {
  title: string;
  sub: string;
  desc: string;
  created: boolean;
}

export interface ChatMsgSeed {
  id: string;
  fromMe: boolean;
  text: string;
  module?: ChatModuleSeed;
}

/** Стартовая история чата (`s.messages` прототипа). Живой чат дальше — в `mocks/store.ts`. */
export const CHAT_MESSAGES_SEED: ChatMsgSeed[] = [
  {
    id: 'm1',
    fromMe: false,
    text: 'Ваша стратегия готова. Основной разрыв — язык: IELTS 6.5 открывает 9 из 14 подобранных программ. Предлагаю зафиксировать это как дорожную карту на 8 недель.',
  },
  { id: 'm2', fromMe: true, text: 'Давай, и ещё про мотивационное письмо' },
  {
    id: 'm3',
    fromMe: false,
    text: 'Хорошо. Оформлю подготовку к IELTS дорожной картой, а письмо — чек-листом, чтобы они были на главном экране, а не в переписке.',
    module: {
      title: 'Дорожная карта: IELTS 6.5',
      sub: '8 недель · 6 этапов',
      desc: 'Модуль появится в блоке «Активные задачи» на главной. Отмечать пункты можно не заходя в чат.',
      created: false,
    },
  },
];

/** Фиксированный ответ ассистента на произвольное сообщение (`send` прототипа). */
export const CHAT_ASSISTANT_REPLY =
  'Записал. Разберу это по шагам и предложу оформить модулем, если станет объёмно.';

// ─────────────────────────────────────────────────────────────────────────────
// Копилки документов (VAULTS_LIST) — `vaults` прототипа
// ─────────────────────────────────────────────────────────────────────────────

export interface VaultSeed {
  id: string;
  name: string;
  /** Короткое имя для строк-сводок (профиль: «2 копилки · Bologna, Padova»). */
  shortName: string;
  deadline: string;
  cellsTotal: number;
  /** Заполнено ячеек. Для первой копилки перекрывается `mocks/store.ts.vaultCells`. */
  filledFixed: number;
}

export const VAULTS: VaultSeed[] = [
  {
    id: 'bologna',
    name: 'Università di Bologna',
    shortName: 'Bologna',
    deadline: 'дедлайн 12 мая · 9 ячеек',
    cellsTotal: 9,
    filledFixed: 3,
  },
  {
    id: 'padova',
    name: 'Università di Padova',
    shortName: 'Padova',
    deadline: 'дедлайн 2 июня · 7 ячеек',
    cellsTotal: 7,
    filledFixed: 2,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Журнал выполненных заданий (ACHIEVEMENT_LOG) — `logDays` прототипа
// ─────────────────────────────────────────────────────────────────────────────

export type LogDotColor = 'blue' | 'blueLight' | 'green' | 'gold' | 'rose';

export interface LogEntry {
  title: string;
  kind: string;
  xp: number;
  dot: LogDotColor;
}

export interface LogDay {
  date: string;
  items: LogEntry[];
}

export const ACHIEVEMENT_LOG_DAYS: LogDay[] = [
  {
    date: 'сегодня, 14 марта',
    items: [
      { title: 'Пробный тест Listening', kind: 'дорожная карта · IELTS 6.5', xp: 20, dot: 'blue' },
      { title: 'Сессия фокуса 25 минут', kind: 'таймер', xp: 10, dot: 'blueLight' },
      {
        title: 'Черновик первого абзаца',
        kind: 'чек-лист · мотивационное письмо',
        xp: 15,
        dot: 'green',
      },
    ],
  },
  {
    date: '12 марта',
    items: [
      { title: 'Ачивка «Первый подбор»', kind: 'достижение', xp: 50, dot: 'gold' },
      {
        title: 'Оценка по математике обновлена',
        kind: 'академические данные',
        xp: 25,
        dot: 'rose',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Фокус (FOCUS_TOOLS) — `soundDefs` / `trackers` прототипа
// ─────────────────────────────────────────────────────────────────────────────

export const FOCUS_SOUNDS = [
  { name: 'Белый шум', sub: 'ровный фон' },
  { name: 'Дождь', sub: 'мягкий, без грома' },
  { name: 'Кафе', sub: 'негромкие голоса' },
  { name: 'Лес', sub: 'птицы и ветер' },
] as const;

export const FOCUS_TRACKERS = [
  { name: 'Подготовка к IELTS', value: '4 из 7 дней', days: 4 },
  { name: 'Мотивационное письмо', value: '2 из 7 дней', days: 2 },
  { name: 'Сессии фокуса', value: '5 из 7 дней', days: 5 },
] as const;

/** Дефолтная длина сессии фокуса, сек (`timer: 1500`). */
export const FOCUS_DEFAULT_SECONDS = 1500;

/** Подпись кнопки старта сессии/таймера (25 минут = `FOCUS_DEFAULT_SECONDS`). */
export const FOCUS_START_LABEL = `Начать ${Math.round(FOCUS_DEFAULT_SECONDS / 60)} минут`;

// ─────────────────────────────────────────────────────────────────────────────
// Профиль (PROFILE) — `profileStats` прототипа
// ─────────────────────────────────────────────────────────────────────────────

export const PROFILE_STATS = [
  { v: '4', k: 'уровень из 100' },
  { v: '620', k: 'XP всего' },
  { v: '14', k: 'подобрано вузов' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Настройки (SETTINGS) — `settingsGroups` прототипа
// ─────────────────────────────────────────────────────────────────────────────

export interface SettingsRowSeed {
  title: string;
  value?: string;
  /** Навигация: 'profile' → PROFILE, иначе строка без перехода (пункт-заглушка). */
  go?: 'profile';
}

export interface SettingsGroupSeed {
  title: string;
  rows: SettingsRowSeed[];
}

export const SETTINGS_GROUPS: SettingsGroupSeed[] = [
  {
    title: 'Аккаунт',
    rows: [
      { title: 'Профиль и класс', value: '11 класс', go: 'profile' },
      { title: 'E-mail', value: 'tinatin@mail.kz' },
      { title: 'Язык интерфейса', value: 'Русский' },
    ],
  },
  {
    title: 'Уведомления',
    rows: [
      { title: 'Дедлайны вузов', value: 'вкл' },
      { title: 'Напоминания по задачам', value: 'вкл' },
      { title: 'Новости и акции', value: 'выкл' },
    ],
  },
  {
    title: 'О приложении',
    rows: [
      { title: 'О нас', value: '' },
      { title: 'Условия использования', value: '' },
      { title: 'Политика конфиденциальности', value: '' },
      { title: 'Версия', value: '1.0.0 (24)' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Системные экраны (ERROR / OFFLINE / MAINTENANCE / UPDATE_REQUIRED)
// — `sysCopyMap` прототипа
// ─────────────────────────────────────────────────────────────────────────────

export const SYSTEM_COPY = {
  error: {
    title: 'Что-то пошло не так',
    text: 'Не удалось загрузить данные подбора. Попробуйте ещё раз — прогресс и загруженные документы сохранены.',
    cta: 'Повторить',
    detail: 'request_id: 7f3a19 · /universities/results',
  },
  offline: {
    title: 'Нет соединения',
    text: 'Приложение работает офлайн: доступны сохранённые вузы, копилки и активные задачи. Остальное подтянется при возврате сети.',
    cta: 'Продолжить офлайн',
    detail: null,
  },
  maintenance: {
    title: 'Технические работы',
    text: 'Обновляем сервис подбора. Обычно это занимает меньше часа — попробуйте зайти чуть позже.',
    cta: 'Обновить статус',
    detail: '503 · backend',
  },
  update: {
    title: 'Требуется обновление',
    text: 'Версия приложения устарела: алгоритм скоринга и ИИ-анализ работают только на 1.1 и выше.',
    cta: 'Обновить в магазине',
    detail: 'установлено 1.0.0 (24) · минимум 1.1.0',
  },
} as const;
