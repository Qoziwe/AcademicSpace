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
