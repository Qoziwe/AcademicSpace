# Screen Inventory — AcademicSpace

Статус: 🔲 не начато / 🟡 в работе / ✅ готово (критерии готовности —
`CLAUDE.md` §10). Обновляется по ходу Фазы 3.

> **Фаза 1 (скелет навигации) завершена:** для каждого Route ID ниже создан
> честный отдельный route-файл в `app/**` (заглушка `<ScreenStub>` +
> `withGuard` из `navigation/registry.ts`). Навигация по всем
> Destinations / Back работает. Статусы ниже остаются 🔲 — они про полную
> вёрстку по DoD §10 (Фаза 3), а не про наличие роута.

Источник строк — `docs/source/design-reference.html` (маркеры
`═══ ИМЯ ═══`). Звёздочка (*) — диапазон приблизительный, экран
переиспользует общий блок с соседними роутами (см. `CLAUDE.md` §7).

| # | Route ID (реестр) | Path | Экран | Строки в design-reference.html | Premium | Заметки по реализации | Статус |
|---|---|---|---|---|---|---|---|
| 1 | SPLASH | `/` | Splash | 75–91 | – | Фаза 3 (батч 1). Линейный градиент вместо radial | ✅ |
| 2 | WELCOME | `/welcome` | Welcome | 93–116 | – | Фаза 3 (батч 1) | ✅ |
| 3 | AUTH_SIGNUP | `/auth/signup` | Регистрация | 118–146 | – | Фаза 3 (батч 1). Общий `<AuthScreen>` с #4 | ✅ |
| 4 | AUTH_SIGNIN | `/auth/signin` | Вход | 118–146 | – | Фаза 3 (батч 1). Общий `<AuthScreen>` с #3 | ✅ |
| 5 | AUTH_LOADING | `/auth/loading` | Активация навигатора | 148–162 | – | Фаза 3 (батч 1) | ✅ |
| 6 | DASHBOARD | `/dashboard` | Дашборд | 164–359 | false | Фаза 3 (батч 1). filled × Free/Premium; sheet theme-aware | ✅ |
| 7 | QUESTIONNAIRE | `/universities/questionnaire` | Анкета | 321–360* | false | Фаза 3 (батч 1). Шаг 1 из 6 | ✅ |
| 8 | FILTER_COUNTRY | `/universities/filters/country` | Страна | 361–395* | false | Фаза 3 (батч 1). Общий `<FilterStepScreen stepIndex={0}>` | ✅ |
| 9 | FILTER_UNIVERSITY | `/universities/filters/university` | Университеты | 361–395* | false | Фаза 3 (батч 1). `stepIndex={1}` (multi) | ✅ |
| 10 | FILTER_FACULTY | `/universities/filters/faculty` | Факультет | 361–395* | false | Фаза 3 (батч 1). `stepIndex={2}` | ✅ |
| 11 | FILTER_LANGUAGE | `/universities/filters/language` | Язык обучения | 361–395* | false | Фаза 3 (батч 1). `stepIndex={3}` | ✅ |
| 12 | FILTER_COST | `/universities/filters/cost` | Стоимость/стипендия | 361–395* | false | Фаза 3 (батч 1). `stepIndex={4}` → submit + RESULTS | ✅ |
| 13 | RESULTS | `/universities/results` | Safety/Match/Reach | 396–441 | false | Фаза 3 (батч 1). Таб «Вузы» | ✅ |
| 14 | UNIVERSITY_DETAILS | `/universities/:id` | Карточка вуза | 443–489 | false | Фаза 3 (батч 2). Навy-шапка + блок документов: Premium → VAULT_DETAIL, Free → lock-тизер → Paywall | ✅ |
| 15 | REQUIRED_DOCUMENTS | `/universities/:id/documents` | Документы для поступления | не выделен отдельно в прототипе | **true** | Фаза 3 (батч 2). Общий `<DocumentVaultScreen>`; Free по deep link → Paywall | ✅ |
| 16 | PORTFOLIO_UPLOAD | `/ai/portfolio` | ИИ-портфолио | 490–525 | false (funnel) | Фаза 3 (батч 2). `<DocumentCell>` слоты, мок file-picker → ANALYSIS_LOADING | ✅ |
| 17 | ANALYSIS_LOADING | `/ai/analysis/loading` | Анализ идёт | 526–549 | false | Фаза 3 (батч 2). Навy, авто → ANALYSIS_PREVIEW (2.6s), back disabled | ✅ |
| 18 | ANALYSIS_PREVIEW | `/ai/analysis/preview` | Превью стратегии | 550–587 | false | Фаза 3 (батч 2). Градиент-фейд (blur — Фаза 5) + карточка монетизации → Paywall | ✅ |
| 19 | PAYWALL | `/subscription/offer` | AcademicSpace Premium | 588–621 | – | Фаза 3 (батч 2). Маркетинг + inline `<PlanCard>` → PAYMENT_FLOW (§7) | ✅ |
| 20 | PLAN_SELECTION | `/subscription/plans` | Неделя / Месяц | нет в дизайне | – | Фаза 3 (батч 2). Только `<PlanCard>` без маркетинга (§7) | ✅ |
| 21 | PAYMENT_FLOW | `/subscription/payment` | Оплата | 943–995* | – | Фаза 3 (батч 2). idle → processing → success (`payState`), success → AI_CHAT | ✅ |
| 22 | AI_CHAT | `/ai/chat` | Чат с ИИ-ментором | 623–673 | **true** | Фаза 3 (батч 2). Premium-only (Free → Paywall гардом). `<ChatThread>` + `<Composer>`, создание модуля → ACTIVE_TASKS | ✅ |
| 23 | ACTIVE_TASKS | `/tasks` | Активные задачи | 675–719 | **true** | Таб скрыт целиком для Free (hard-hide) | 🔲 |
| 24 | MODULE_DETAIL | `/tasks/:moduleId` | Roadmap/Plan/Checklist/Timer/Task | 996–1044* | **true** | 5 вариантов kind, отдельная логика для timer | 🔲 |
| 25 | VAULTS_LIST | `/documents` | Копилки документов | 720–744 | **true** | | 🔲 |
| 26 | VAULT_DETAIL | `/documents/:vaultId` | Копилка вуза | 745–774 | **true** | Ячейки-слоты (`cells`), мок file-picker | 🔲 |
| 27 | FOCUS_TOOLS | `/focus` | Фокусировка и продуктивность | 775–824 | **true** | Звуки (bars-анимация) + трекеры-полоски за 7 дней | 🔲 |
| 28 | PROFILE | `/profile` | Профиль | 825–878 | false | Строки-гейты на Premium-разделы (lock-тизер) | 🔲 |
| 29 | ACHIEVEMENT_LOG | `/profile/history` | Журнал выполненных заданий | 879–909 | false | Группировка по датам | 🔲 |
| 30 | PROFILE_SUBSCRIPTION | `/profile/subscription` | Управление подпиской | 910–942* | false | Переиспользует `<PlanCard>` из #20 | 🔲 |
| 31 | SETTINGS | `/settings` | Настройки | 910–953* | false | 3 группы строк + свитч «Тема оформления» (light/dark, см. `design-tokens.md`) | 🔲 |
| 32 | ERROR | `/system/error` | Ошибка | 1045–1063 | – | Общий компонент SystemScreen | 🔲 |
| 33 | OFFLINE | `/system/offline` | Нет соединения | 1045–1063 | – | Общий компонент SystemScreen | 🔲 |
| 34 | MAINTENANCE | `/system/maintenance` | Технические работы | 1045–1063 | – | Общий компонент SystemScreen | 🔲 |
| 35 | UPDATE_REQUIRED | `/system/update` | Требуется обновление | 1045–1063 | – | Общий компонент SystemScreen | 🔲 |
| — | — | — | Offline banner (глобальный оверлей) | 1064–1072 | – | Показывается поверх любого экрана при потере сети | 🔲 |
| — | — | — | Tab Bar (глобальный) | 1073–1085 | – | Компонент-организм, не отдельный роут | 🔲 |

Итого: **30 реальных экранов** (24 из исходного счётчика прототипа +
`PLAN_SELECTION`, которого физически нет в файле, но который требует
реестр роутов) + 2 глобальных компонента (Tab Bar, Offline banner).

Точные диапазоны строк для нескольких экранов пересекаются/условны, так
как прототип рисует несколько роутов одним блоком (Filters / System /
Settings+Subscription) — сверяться по `renderVals()`
(design-reference.html, строки 1191–1564) для деталей переключения
состояний.
