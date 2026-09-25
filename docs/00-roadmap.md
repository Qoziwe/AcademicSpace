# Дорожная карта — AcademicSpace фронтенд

Порядок фаз без привязки к срокам (по договорённости — сроки не
оцениваем, делаем сколько нужно). Каждая фаза = отдельные feature-ветки,
Pull Request, squash-merge в `main`.

## Фаза 0 — Бутстрап проекта
- Инициализация Expo (TypeScript) + Expo Router, базовая структура папок
  (atomic design, `app/` под роуты, `stores/`, `hooks/`, `mocks/`,
  `constants/`)
- ESLint + Prettier, Husky + lint-staged, commitlint (Conventional
  Commits)
- `.env.example`, конфиг брендинга (`constants/brand.ts`) — AcademicSpace
  вместо UniPath
- Финализация `docs/design-tokens.md` вместе с пользователем (открытые
  вопросы отмечены внутри файла)
- Каркас `docs/api-contract.md` (шаблон + первые очевидные эндпоинты)
- CI на GitHub Actions: lint + typecheck на каждый PR (расширение п.14
  требований к фронтенду)

**Готово, когда:** `npx expo start` поднимается пустым, линт/тайпчек
зелёные, husky блокирует плохой коммит, ветка `main` защищена от прямых
пушей.

## Фаза 1 — Скелет навигации
- Файлы-роуты Expo Router на каждый ID из `docs/source/03-routes.md`
  (пустые заглушки-компоненты, но с реальными путями)
- Auth guard + Premium guard как переиспользуемые обёртки/hook'и
- Tab-навигация (Dashboard / Вузы / ИИ-ментор / [Задачи] / Профиль) с
  условным рендером таба «Задачи»
- Проверка: переход по всем `Entry points` → `Destinations` из реестра
  работает вручную (клик-тест), `Back behavior` соответствует таблице

**Готово, когда:** можно вручную «пройти» всё приложение по пустым
экранам, ни одна кнопка не ведёт в никуда.

## Фаза 2 — UI-кит (atoms → organisms)
Строится один раз, переиспользуется во всех экранах Фазы 3.
- **Atoms**: Button (primary/secondary/ghost), Chip/Badge, Switch,
  Checkbox (box-паттерн из прототипа), ProgressRing (XP-кольцо),
  ProgressBar, Avatar+LevelPill, TextField, IconTile, Divider
- **Molecules**: UniversityCard (Safety/Match/Reach), FilterOptionRow,
  TaskModuleCard, ChatBubble + ModuleConfirmationCard, DocumentCell,
  FocusSoundTile, SettingsRow, BentoTile (с lock-паттерном), PlanCard
- **Organisms**: HeaderBar (варианты light/dark/back-button),
  FilterStepper (точки прогресса), ResultsGroupedList, ActiveTasksBlock,
  ChatThread + Composer, TabBar, ProfileHeaderWidget, SystemScreenLayout

**Готово, когда:** все атомы/молекулы/организмы собраны в одном
dev-only «Playground»-роуте (аналог левой панели прототипа с
переключателями Premium/Filled) для визуальной сверки без прохождения
по всему флоу.

## Фаза 3 — Экраны (по `docs/screen-inventory.md`, всего 30)
Рекомендуемый порядок (соответствует пользовательскому флоу из концепта,
шаги 1–10):
1. Onboarding: Splash → Welcome → Auth(signup/signin) → AuthLoading
2. Dashboard (оба состояния анкеты × Free/Premium)
3. Анкета + 5 шагов фильтров → Results (Safety/Match/Reach)
4. UniversityDetails (+ гейт на RequiredDocuments)
5. PortfolioUpload → AnalysisLoading → AnalysisPreview (блюр + карточка
   монетизации)
6. Paywall (+ PlanCard) → PlanSelection (отдельный лёгкий экран) →
   PaymentFlow (idle/processing/success)
7. AiChat (+ создание модуля, quick prompts, typing-индикатор)
8. ActiveTasks (список) → ModuleDetail (roadmap/plan/checklist/timer/task
   варианты)
9. VaultsList → VaultDetail (+ загрузка файла в ячейку, мок file-picker)
10. FocusTools (звуки + трекеры)
11. Profile → AchievementLog, ProfileSubscription, Settings
12. System: Error/Offline/Maintenance/UpdateRequired + Offline-banner
    поверх остальных экранов

Каждый экран закрывается по чек-листу «Definition of Done» из
`CLAUDE.md` §10 и отмечается в `docs/screen-inventory.md`.

## Фаза 4 — Мок-слой как единая система
Не мок-данные «на коленке» по одному компоненту, а централизованный
`mocks/`-слой:
- `mocks/handlers/*` (по ресурсам: auth, profile, questionnaire,
  universities, chat, tasks, vaults, subscription) — форма ответа
  один-в-один как будущий `docs/api-contract.md`
- Единый мок-стор состояния сессии (эквивалент `state` из
  `renderVals()` прототипа: анкета/фильтры/тарифы/сообщения/задачи/
  оплата/офлайн), персистентный через AsyncStorage, чтобы можно было
  закрыть/открыть приложение без потери прогресса на демо
- Переключатель `EXPO_PUBLIC_USE_MOCKS`, чтобы Фаза 8 (бекенд) сводилась
  к замене адаптера, а не переписыванию хуков

**Готово, когда:** весь пользовательский путь (анкета → результаты →
апселл → пейвол → оплата «успех» → чат → создание модуля → выполнение
чек-листа → XP → журнал) проходим целиком на моках без единого хардкода
в UI-компонентах.

## Фаза 5 — Полировка (мобильный/веб-без-десктопа)
- Веб-сборка (`expo start --web`) не должна ломаться на широких
  экранах, но полноценная desktop-раскладка сюда не входит — она
  сознательно вынесена в отдельную Фазу 7, после того как весь
  мобильный фронтенд готов (см. `CLAUDE.md` §9)
- Safe area, клавиатура (KeyboardAvoidingView на Chat/Auth/фильтрах)
- Анимации (Reanimated) — воспроизвести spin/pulse/blink/slide из
  прототипа
- Deep linking по `docs/source/03-routes.md` (`RESULTS`,
  `UNIVERSITY_DETAILS`, `PAYWALL`, `AI_CHAT`), scheme
  `academicspace://`
- Обе темы (light/dark) визуально сверены на каждом theme-aware экране
  — см. «карту покрытия темы» в `docs/design-tokens.md`

## Фаза 6 — QA-проход
- Сверка каждого из 30 экранов с `docs/screen-inventory.md` — цель «0
  неготовых страниц»
- Проверка всех route guard'ов (Free не должен физически попасть на
  Premium-only роуты напрямую по deep link — редирект на Paywall)
- Финальный прогон Husky/ESLint/CI на всём репозитории

## Фаза 7 — Desktop-адаптация — завершена (первая итерация)
Готового desktop-макета от пользователя не появилось — решено
спроектировать раскладку самостоятельно по ориентирам ниже, на основе
уже готового мобильного UI (без переписывания бизнес-логики/хуков).
- `hooks/useBreakpoint.ts` + `theme.breakpoints` (`desktop=1024`,
  `wide=1280`, только веб) — единая точка входа для раскладки
- Постоянный `<Sidebar>` (`components/organisms/Sidebar.tsx`) заменяет
  плавающий `<TabBar>` на десктопе для всех аутентифицированных
  не-модальных роутов (`NO_SHELL_ROUTE_PATHS`); та же навигационная
  модель и premium-гейтинг, что у мобильного таб-бара
- Многоколоночная раскладка там, где уместно: **Dashboard**
  (`<DesktopDashboard>` — двухколоночная страница вместо
  мобильной шторки-жеста), **Results** и **Vaults List** (grid карточек
  вместо одной колонки) — см. `docs/design-tokens.md` → «Веб-контейнер»
- Остальные 19 shell-экранов получают комфортную центрированную колонку
  (780px) через общий wrapper в `app/_layout.tsx`, без per-экранных
  правок — не «растянутый телефонный экран», но и не бespoke-раскладка
- Экраны без мок-сессии (Splash/Welcome/Auth/System/Paywall-модалки)
  сознательно не тронуты — остаются на уровне Фазы 5 («не ломается»)

Дальше (не сделано в этой итерации, если понадобится): bespoke-раскладки
для отдельных shell-экранов (профиль, чат, фокус и т. д.), если после
использования выяснится, что дефолтной центрированной колонки мало.

## Фаза 8 — Бекенд (Flask) — реализована (8.0–8.9)
Монорепо `frontend/` + `backend/` (план — `~/.claude/plans/greedy-waddling-swan.md`),
подфазы 8.0–8.8 смёржены в `main` (PR #18–27). Реализовано по
`docs/api-contract.md`: Auth, Profile, Questionnaire/Universities, Tasks,
Document Vaults (включая загрузку файла в ячейку — реальный
`expo-document-picker`, `DocumentVaultScreen` перевязан на per-vault хук),
Subscription/Payment (мок-провайдер за интерфейсом `PaymentProvider` —
реальный провайдер для Кыргызстана не выбран, вне плана бекенда),
Achievement Log, AI Mentor (портфолио-анализ, чат, генерация карточек по
тексту и по фото — `expo-image-picker` + multipart), Flashcards CRUD.

Стек: Flask + PostgreSQL + SQLAlchemy/Alembic + JWT + marshmallow, `uv`.
Файлы — `StorageBackend`/`LocalStorageBackend` (облако подключается одним
файлом без переделки эндпоинтов).

**Фаза 8.9** (сверх исходного плана 8.0–8.8) — создание задачи из
карточки-предложения в чате: `POST /ai/chat/modules`. Нейронка уже в
самом ответе чата решает, стоит ли предложить модуль, и сразу
придумывает его состав (`kind` — КАРТА/ЧЕК-ЛИСТ/ТАЙМЕР, `items` — 2-5
шагов) — второй поход к ИИ в момент клика «Создать» не нужен, бекенд
только материализует уже готовое предложение в `Task`+`TaskItem`. XP —
фиксированная шкала по `kind` (120/80/40), идемпотентно (повторный клик
→ 409). См. `docs/api-contract.md` §AI Mentor.

Осознанно не реализовано (см. `docs/api-contract.md` §TBD): Focus tools
(сохранение сессий/трекеров), Settings/notifications preferences,
реальный платёжный провайдер, продакшн-деплой бекенда, облачное
хранилище.

**Осталось для полного закрытия фазы:** переключить фронтенд на реальный
бекенд (`EXPO_PUBLIC_USE_MOCKS=false`) и пройти пользовательский путь
целиком без моков — требует локального Docker+Postgres, ручная проверка
пользователем.

## Фаза 9 — Умные карточки
Новый функционал сверх исходных 24/30 экранов дизайн-референса (§0/§1) —
инструмент повторения: пользователь описывает тему текстом или загружает
фото (формулы/конспект), ИИ собирает набор карточек «вопрос → ответ»,
дальше их проходят свайпами. Реализован тем же паттерном, что и остальной
фронтенд (реестр роутов → мок-слой → экраны на токенах):
- 4 роута (`docs/source/03-routes.md`, `docs/screen-inventory.md`):
  `FLASHCARDS_LIST` → `FLASHCARDS_CREATE` → `FLASHCARDS_GENERATING` →
  `FLASHCARDS_STUDY`. Вход — плитка «Карточки» на Dashboard
- Квота одновременно хранимых колод: Free — 1, Premium — 10; удаление
  освобождает слот (не разовый счётчик создания навсегда)
- Свайп влево — карточка запомнена, уходит навсегда; свайп вправо на
  лицевой стороне — переворот; свайп вправо на обороте — следующая
  карточка (невыученная возвращается на следующем круге, порядок
  случайный при каждом заходе) — `components/organisms/FlashcardStack.tsx`
  (Reanimated + Gesture Handler, тот же приём, что таб-бар/шторка
  дашборда)
- Полностью пройденная колода начисляет XP и пишет запись в журнал, как
  закрытие модуля задач
- Мок-слой: `services/api/flashcards.ts`, `mocks/handlers/flashcards.ts`,
  контракт — `docs/api-contract.md` §Flashcards; "нейронка" на моках
  берёт готовый набор карточек (как `ANALYSIS_PREVIEW_BLOCKS`), реальная
  генерация — Фаза 8
