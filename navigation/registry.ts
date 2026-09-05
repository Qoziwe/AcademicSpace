/**
 * Реестр роутов AcademicSpace — типизированная копия таблицы из
 * `docs/source/03-routes.md` (§5) + `docs/screen-inventory.md`.
 *
 * Единственный источник правды для:
 *  - route-guard'ов (`auth` / `premium` колонки) — см. `navigation/withGuard.tsx`;
 *  - экранов-заглушек Фазы 1 (`components/dev/ScreenStub.tsx`) — навигация по
 *    `destinations` без единой «мёртвой» кнопки;
 *  - клик-теста «Entry points → Destinations → Back behavior».
 *
 * Дизайн-прототип рисует несколько роутов одним визуальным компонентом
 * (Auth, Filters, System, Paywall), но в Expo Router у каждого ID —
 * честный отдельный route-файл (`CLAUDE.md` §7). `file` ниже — путь этого
 * файла внутри `app/`.
 */

import type { Href } from 'expo-router';

export type RouteId =
  | 'SPLASH'
  | 'WELCOME'
  | 'AUTH_SIGNUP'
  | 'AUTH_SIGNIN'
  | 'AUTH_LOADING'
  | 'DASHBOARD'
  | 'QUESTIONNAIRE'
  | 'FILTER_COUNTRY'
  | 'FILTER_UNIVERSITY'
  | 'FILTER_FACULTY'
  | 'FILTER_LANGUAGE'
  | 'FILTER_COST'
  | 'RESULTS'
  | 'UNIVERSITY_DETAILS'
  | 'REQUIRED_DOCUMENTS'
  | 'PORTFOLIO_UPLOAD'
  | 'ANALYSIS_LOADING'
  | 'ANALYSIS_PREVIEW'
  | 'PAYWALL'
  | 'PLAN_SELECTION'
  | 'PAYMENT_FLOW'
  | 'AI_CHAT'
  | 'ACTIVE_TASKS'
  | 'MODULE_DETAIL'
  | 'VAULTS_LIST'
  | 'VAULT_DETAIL'
  | 'FOCUS_TOOLS'
  | 'PROFILE'
  | 'ACHIEVEMENT_LOG'
  | 'PROFILE_SUBSCRIPTION'
  | 'SETTINGS'
  | 'ERROR'
  | 'OFFLINE'
  | 'MAINTENANCE'
  | 'UPDATE_REQUIRED';

export type NavType = 'stack' | 'stack-no-back' | 'tab' | 'tab-conditional' | 'modal';

/** Куда ведёт кнопка «назад». `disabled` — назад запрещён; `none` — точки входа только программные. */
export type BackBehavior = RouteId | 'disabled' | 'none';

export interface RouteMeta {
  id: RouteId;
  /** Путь-паттерн Expo Router (как в URL, с `[param]`). */
  path: string;
  /** Расположение файла внутри `app/`. */
  file: string;
  title: string;
  /** Требуется мок-сессия (колонка Auth реестра). */
  auth: boolean;
  /** Требуется тариф premium (колонка Premium реестра). */
  premium: boolean;
  navType: NavType;
  /** Роуты, куда можно уйти с этого экрана (колонка Destinations). */
  destinations: RouteId[];
  /** Поведение «назад» (колонка Back behavior). */
  back: BackBehavior;
  /** Конкретный href для клик-теста (для динамических роутов — с мок-параметром). */
  demoHref: Href;
  /** Короткая заметка по реализации (из screen-inventory / §7). */
  note?: string;
}

const R = (m: RouteMeta): RouteMeta => m;

// Не аннотируем как `Record<RouteId, RouteMeta>`, чтобы `noUncheckedIndexedAccess`
// не добавлял `| undefined` при `ROUTES[id]`. `satisfies` проверяет полноту ключей.
export const ROUTES = {
  SPLASH: R({
    id: 'SPLASH',
    path: '/',
    file: 'index.tsx',
    title: 'Splash',
    auth: false,
    premium: false,
    navType: 'stack',
    destinations: ['WELCOME', 'DASHBOARD'],
    back: 'none',
    demoHref: '/',
  }),
  WELCOME: R({
    id: 'WELCOME',
    path: '/welcome',
    file: 'welcome.tsx',
    title: 'Welcome',
    auth: false,
    premium: false,
    navType: 'stack',
    destinations: ['AUTH_SIGNUP', 'AUTH_SIGNIN'],
    back: 'none',
    demoHref: '/welcome',
  }),
  AUTH_SIGNUP: R({
    id: 'AUTH_SIGNUP',
    path: '/auth/signup',
    file: 'auth/signup.tsx',
    title: 'Регистрация',
    auth: false,
    premium: false,
    navType: 'stack',
    destinations: ['AUTH_LOADING'],
    back: 'WELCOME',
    demoHref: '/auth/signup',
    note: 'Общий презентационный компонент с AUTH_SIGNIN (сегмент-контрол), §7',
  }),
  AUTH_SIGNIN: R({
    id: 'AUTH_SIGNIN',
    path: '/auth/signin',
    file: 'auth/signin.tsx',
    title: 'Вход',
    auth: false,
    premium: false,
    navType: 'stack',
    destinations: ['AUTH_LOADING'],
    back: 'WELCOME',
    demoHref: '/auth/signin',
    note: 'Общий презентационный компонент с AUTH_SIGNUP, §7',
  }),
  AUTH_LOADING: R({
    id: 'AUTH_LOADING',
    path: '/auth/loading',
    file: 'auth/loading.tsx',
    title: 'Активация навигатора',
    auth: false,
    premium: false,
    navType: 'stack-no-back',
    destinations: ['DASHBOARD'],
    back: 'disabled',
    demoHref: '/auth/loading',
    note: 'Авто-переход на DASHBOARD через 2.5s, back запрещён',
  }),
  DASHBOARD: R({
    id: 'DASHBOARD',
    path: '/dashboard',
    file: 'dashboard.tsx',
    title: 'Дашборд',
    auth: true,
    premium: false,
    navType: 'tab',
    destinations: [
      'QUESTIONNAIRE',
      'RESULTS',
      'PORTFOLIO_UPLOAD',
      'AI_CHAT',
      'ACTIVE_TASKS',
      'VAULTS_LIST',
      'FOCUS_TOOLS',
      'PROFILE',
      'PAYWALL',
    ],
    back: 'none',
    demoHref: '/dashboard',
    note: 'Таб-рут. Для Free плитки premium-разделов ведут на PAYWALL (§6)',
  }),
  QUESTIONNAIRE: R({
    id: 'QUESTIONNAIRE',
    path: '/universities/questionnaire',
    file: 'universities/questionnaire.tsx',
    title: 'Анкета',
    auth: true,
    premium: false,
    navType: 'stack',
    destinations: ['FILTER_COUNTRY'],
    back: 'DASHBOARD',
    demoHref: '/universities/questionnaire',
    note: 'Шаг 1 из 6 общего мастера (fstep), §7',
  }),
  FILTER_COUNTRY: R({
    id: 'FILTER_COUNTRY',
    path: '/universities/filters/country',
    file: 'universities/filters/country.tsx',
    title: 'Страна',
    auth: true,
    premium: false,
    navType: 'stack',
    destinations: ['FILTER_UNIVERSITY'],
    back: 'QUESTIONNAIRE',
    demoHref: '/universities/filters/country',
    note: 'Шаг 2 из 6',
  }),
  FILTER_UNIVERSITY: R({
    id: 'FILTER_UNIVERSITY',
    path: '/universities/filters/university',
    file: 'universities/filters/university.tsx',
    title: 'Университеты',
    auth: true,
    premium: false,
    navType: 'stack',
    destinations: ['FILTER_FACULTY'],
    back: 'FILTER_COUNTRY',
    demoHref: '/universities/filters/university',
    note: 'Шаг 3 из 6',
  }),
  FILTER_FACULTY: R({
    id: 'FILTER_FACULTY',
    path: '/universities/filters/faculty',
    file: 'universities/filters/faculty.tsx',
    title: 'Факультет',
    auth: true,
    premium: false,
    navType: 'stack',
    destinations: ['FILTER_LANGUAGE'],
    back: 'FILTER_UNIVERSITY',
    demoHref: '/universities/filters/faculty',
    note: 'Шаг 4 из 6',
  }),
  FILTER_LANGUAGE: R({
    id: 'FILTER_LANGUAGE',
    path: '/universities/filters/language',
    file: 'universities/filters/language.tsx',
    title: 'Язык обучения',
    auth: true,
    premium: false,
    navType: 'stack',
    destinations: ['FILTER_COST'],
    back: 'FILTER_FACULTY',
    demoHref: '/universities/filters/language',
    note: 'Шаг 5 из 6',
  }),
  FILTER_COST: R({
    id: 'FILTER_COST',
    path: '/universities/filters/cost',
    file: 'universities/filters/cost.tsx',
    title: 'Стоимость / стипендия',
    auth: true,
    premium: false,
    navType: 'stack',
    destinations: ['RESULTS'],
    back: 'FILTER_LANGUAGE',
    demoHref: '/universities/filters/cost',
    note: 'Шаг 6 из 6',
  }),
  RESULTS: R({
    id: 'RESULTS',
    path: '/universities/results',
    file: 'universities/results.tsx',
    title: 'Safety / Match / Reach',
    auth: true,
    premium: false,
    navType: 'tab',
    destinations: ['UNIVERSITY_DETAILS', 'FILTER_COUNTRY'],
    back: 'DASHBOARD',
    demoHref: '/universities/results',
    note: 'Открывается как таб «Вузы»',
  }),
  UNIVERSITY_DETAILS: R({
    id: 'UNIVERSITY_DETAILS',
    path: '/universities/[id]',
    file: 'universities/[id]/index.tsx',
    title: 'Карточка вуза',
    auth: true,
    premium: false,
    navType: 'stack',
    destinations: ['REQUIRED_DOCUMENTS'],
    back: 'RESULTS',
    demoHref: { pathname: '/universities/[id]', params: { id: 'msu' } },
    note: 'Блок документов — lock-тизер → PAYWALL для Free (§6)',
  }),
  REQUIRED_DOCUMENTS: R({
    id: 'REQUIRED_DOCUMENTS',
    path: '/universities/[id]/documents',
    file: 'universities/[id]/documents.tsx',
    title: 'Документы для поступления',
    auth: true,
    premium: true,
    navType: 'stack',
    destinations: ['VAULT_DETAIL'],
    back: 'UNIVERSITY_DETAILS',
    demoHref: { pathname: '/universities/[id]/documents', params: { id: 'msu' } },
    note: 'Premium-only. Free по deep link редиректится на PAYWALL',
  }),
  PORTFOLIO_UPLOAD: R({
    id: 'PORTFOLIO_UPLOAD',
    path: '/ai/portfolio',
    file: 'ai/portfolio.tsx',
    title: 'ИИ-портфолио',
    auth: true,
    premium: false,
    navType: 'stack',
    destinations: ['ANALYSIS_LOADING'],
    back: 'DASHBOARD',
    demoHref: '/ai/portfolio',
    note: 'Funnel-вход, доступен Free',
  }),
  ANALYSIS_LOADING: R({
    id: 'ANALYSIS_LOADING',
    path: '/ai/analysis/loading',
    file: 'ai/analysis/loading.tsx',
    title: 'Анализ идёт',
    auth: true,
    premium: false,
    navType: 'stack-no-back',
    destinations: ['ANALYSIS_PREVIEW'],
    back: 'disabled',
    demoHref: '/ai/analysis/loading',
    note: 'Авто-переход на ANALYSIS_PREVIEW',
  }),
  ANALYSIS_PREVIEW: R({
    id: 'ANALYSIS_PREVIEW',
    path: '/ai/analysis/preview',
    file: 'ai/analysis/preview.tsx',
    title: 'Превью стратегии',
    auth: true,
    premium: false,
    navType: 'stack',
    destinations: ['PAYWALL'],
    back: 'DASHBOARD',
    demoHref: '/ai/analysis/preview',
    note: 'Блюр-градиент + карточка монетизации',
  }),
  PAYWALL: R({
    id: 'PAYWALL',
    path: '/subscription/offer',
    file: 'subscription/offer.tsx',
    title: 'AcademicSpace Premium',
    auth: true,
    premium: false,
    navType: 'modal',
    // §7: PAYWALL включает inline PlanPicker и ведёт СРАЗУ на PAYMENT_FLOW;
    // PLAN_SELECTION остаётся отдельным лёгким входом (из PROFILE_SUBSCRIPTION).
    destinations: ['PLAN_SELECTION', 'PAYMENT_FLOW'],
    back: 'none',
    demoHref: '/subscription/offer',
    note: 'Модалка. Inline PlanPicker (§7) → PAYMENT_FLOW. Swipe-down dismiss',
  }),
  PLAN_SELECTION: R({
    id: 'PLAN_SELECTION',
    path: '/subscription/plans',
    file: 'subscription/plans.tsx',
    title: 'Неделя / Месяц',
    auth: true,
    premium: false,
    navType: 'modal',
    destinations: ['PAYMENT_FLOW'],
    back: 'PAYWALL',
    demoHref: '/subscription/plans',
    note: 'Только PlanPicker без маркетинга. Вход из PAYWALL и PROFILE_SUBSCRIPTION (§7)',
  }),
  PAYMENT_FLOW: R({
    id: 'PAYMENT_FLOW',
    path: '/subscription/payment',
    file: 'subscription/payment.tsx',
    title: 'Оплата',
    auth: true,
    premium: false,
    navType: 'modal',
    destinations: ['AI_CHAT'],
    back: 'disabled',
    demoHref: '/subscription/payment',
    note: 'idle → processing → success (payState). Back запрещён во время processing',
  }),
  AI_CHAT: R({
    id: 'AI_CHAT',
    path: '/ai/chat',
    file: 'ai/chat.tsx',
    title: 'Чат с ИИ-ментором',
    auth: true,
    premium: true,
    navType: 'tab',
    destinations: ['MODULE_DETAIL'],
    back: 'DASHBOARD',
    demoHref: '/ai/chat',
    note: 'Premium. Free видит превью (как ANALYSIS_PREVIEW). Открывается как таб «ИИ-ментор»',
  }),
  ACTIVE_TASKS: R({
    id: 'ACTIVE_TASKS',
    path: '/tasks',
    file: 'tasks/index.tsx',
    title: 'Активные задачи',
    auth: true,
    premium: true,
    navType: 'tab-conditional',
    destinations: ['MODULE_DETAIL'],
    back: 'none',
    demoHref: '/tasks',
    note: 'Таб скрыт целиком для Free (hard-hide, §6 паттерн 1)',
  }),
  MODULE_DETAIL: R({
    id: 'MODULE_DETAIL',
    path: '/tasks/[moduleId]',
    file: 'tasks/[moduleId].tsx',
    title: 'Модуль (Roadmap / Plan / Checklist / Timer / Task)',
    auth: true,
    premium: true,
    navType: 'stack',
    destinations: [],
    back: 'ACTIVE_TASKS',
    demoHref: { pathname: '/tasks/[moduleId]', params: { moduleId: 'm1' } },
    note: '5 вариантов kind, отдельная логика для timer',
  }),
  VAULTS_LIST: R({
    id: 'VAULTS_LIST',
    path: '/documents',
    file: 'documents/index.tsx',
    title: 'Копилки документов',
    auth: true,
    premium: true,
    navType: 'stack',
    destinations: ['VAULT_DETAIL'],
    back: 'PROFILE',
    demoHref: '/documents',
  }),
  VAULT_DETAIL: R({
    id: 'VAULT_DETAIL',
    path: '/documents/[vaultId]',
    file: 'documents/[vaultId].tsx',
    title: 'Копилка вуза',
    auth: true,
    premium: true,
    navType: 'stack',
    destinations: [],
    back: 'VAULTS_LIST',
    demoHref: { pathname: '/documents/[vaultId]', params: { vaultId: 'v1' } },
    note: 'Ячейки-слоты (cells), мок file-picker',
  }),
  FOCUS_TOOLS: R({
    id: 'FOCUS_TOOLS',
    path: '/focus',
    file: 'focus.tsx',
    title: 'Фокусировка и продуктивность',
    auth: true,
    premium: true,
    navType: 'stack',
    destinations: [],
    back: 'none',
    demoHref: '/focus',
    note: 'Звуки (bars-анимация) + трекеры-полоски за 7 дней',
  }),
  PROFILE: R({
    id: 'PROFILE',
    path: '/profile',
    file: 'profile/index.tsx',
    title: 'Профиль',
    auth: true,
    premium: false,
    navType: 'tab',
    destinations: [
      'ACHIEVEMENT_LOG',
      'VAULTS_LIST',
      'PROFILE_SUBSCRIPTION',
      'SETTINGS',
      'FOCUS_TOOLS',
      'PAYWALL',
    ],
    back: 'none',
    demoHref: '/profile',
    note: 'Строки-гейты на Premium-разделы (lock-тизер → PAYWALL, §6)',
  }),
  ACHIEVEMENT_LOG: R({
    id: 'ACHIEVEMENT_LOG',
    path: '/profile/history',
    file: 'profile/history.tsx',
    title: 'Журнал выполненных заданий',
    auth: true,
    premium: false,
    navType: 'stack',
    destinations: ['MODULE_DETAIL'],
    back: 'PROFILE',
    demoHref: '/profile/history',
    note: 'Группировка по датам. MODULE_DETAIL открывается read-only',
  }),
  PROFILE_SUBSCRIPTION: R({
    id: 'PROFILE_SUBSCRIPTION',
    path: '/profile/subscription',
    file: 'profile/subscription.tsx',
    title: 'Управление подпиской',
    auth: true,
    premium: false,
    navType: 'stack',
    destinations: ['PLAN_SELECTION'],
    back: 'PROFILE',
    demoHref: '/profile/subscription',
  }),
  SETTINGS: R({
    id: 'SETTINGS',
    path: '/settings',
    file: 'settings.tsx',
    title: 'Настройки',
    auth: true,
    premium: false,
    navType: 'stack',
    destinations: [],
    back: 'PROFILE',
    demoHref: '/settings',
    note: '3 группы строк + свитч «Тема оформления» (Фаза 3)',
  }),
  ERROR: R({
    id: 'ERROR',
    path: '/system/error',
    file: 'system/error.tsx',
    title: 'Ошибка',
    auth: false,
    premium: false,
    navType: 'stack',
    destinations: [],
    back: 'none',
    demoHref: '/system/error',
    note: 'Общий компонент SystemScreen (ветвится по sysCopy), §7',
  }),
  OFFLINE: R({
    id: 'OFFLINE',
    path: '/system/offline',
    file: 'system/offline.tsx',
    title: 'Нет соединения',
    auth: false,
    premium: false,
    navType: 'stack',
    destinations: [],
    back: 'none',
    demoHref: '/system/offline',
    note: 'Общий компонент SystemScreen. Ср. глобальный офлайн-баннер',
  }),
  MAINTENANCE: R({
    id: 'MAINTENANCE',
    path: '/system/maintenance',
    file: 'system/maintenance.tsx',
    title: 'Технические работы',
    auth: false,
    premium: false,
    navType: 'stack-no-back',
    destinations: [],
    back: 'disabled',
    demoHref: '/system/maintenance',
    note: 'Общий компонент SystemScreen',
  }),
  UPDATE_REQUIRED: R({
    id: 'UPDATE_REQUIRED',
    path: '/system/update',
    file: 'system/update.tsx',
    title: 'Требуется обновление',
    auth: false,
    premium: false,
    navType: 'stack-no-back',
    destinations: [],
    back: 'disabled',
    demoHref: '/system/update',
    note: 'Общий компонент SystemScreen. Ведёт на Store link',
  }),
} satisfies Record<RouteId, RouteMeta>;

export const ALL_ROUTES: RouteMeta[] = Object.values(ROUTES);

/** Роуты, над которыми отрисовывается плавающий таб-бар (прототип: `showTabs`). */
export const TAB_BAR_ROUTE_PATHS = new Set<string>([
  ROUTES.DASHBOARD.path,
  ROUTES.RESULTS.path,
  ROUTES.AI_CHAT.path,
  ROUTES.ACTIVE_TASKS.path,
  ROUTES.PROFILE.path,
]);

/**
 * Роуты без постоянного desktop-сайдбара (Фаза 7): без мок-сессии (Splash /
 * Welcome / Auth / System) или модалки (Paywall / PlanSelection / Payment) —
 * это брендовые/полноэкранные моменты, сайдбар им не идёт. Всё остальное
 * (19 аутентифицированных не-модальных роутов) получает сайдбар на десктопе,
 * см. `components/organisms/Sidebar.tsx` и `app/_layout.tsx`.
 */
export const NO_SHELL_ROUTE_PATHS = new Set<string>(
  ALL_ROUTES.filter((r) => !r.auth || r.navType === 'modal').map((r) => r.path),
);

export interface TabEntry {
  label: string;
  href: Href;
  routePath: string;
  /** Пункт только для premium — для Free физически не рендерится (§6). */
  premium?: boolean;
}

/** Прототип: `[['Главная','dash'],['Вузы','results'],['ИИ-ментор','chat'],(P?['Задачи','tasks']:[]),['Профиль','profile']]`. */
export const TAB_ENTRIES: TabEntry[] = [
  { label: 'Главная', href: ROUTES.DASHBOARD.demoHref, routePath: ROUTES.DASHBOARD.path },
  { label: 'Вузы', href: ROUTES.RESULTS.demoHref, routePath: ROUTES.RESULTS.path },
  { label: 'ИИ-ментор', href: ROUTES.AI_CHAT.demoHref, routePath: ROUTES.AI_CHAT.path },
  {
    label: 'Задачи',
    href: ROUTES.ACTIVE_TASKS.demoHref,
    routePath: ROUTES.ACTIVE_TASKS.path,
    premium: true,
  },
  { label: 'Профиль', href: ROUTES.PROFILE.demoHref, routePath: ROUTES.PROFILE.path },
];
