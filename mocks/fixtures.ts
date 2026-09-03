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
  xp: 620,
  xpToNextLevel: 1000,
  matchesCount: 14,
  rating: 78,
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
