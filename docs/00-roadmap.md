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

## Фаза 7 — Desktop-адаптация (после полностью готового фронтенда)
Начинается только когда Фазы 0–6 полностью закрыты — не раньше.
Пользователь сам сделает/закажет desktop-макет в Claude Design позже;
когда он появится, эта фаза дорабатывается по нему. Пока ориентиры:
- Полноценная widescreen-раскладка (не просто «не сломано», как в
  Фазе 5) — многоколоночные экраны там, где это уместно (Dashboard,
  Results, Vaults), а не растянутый телефонный экран по центру
- Раскладка сама по себе не должна требовать переписывания
  бизнес-логики/хуков экранов Фазы 3 — только компоновку и брейкпоинты

## Фаза 8 — Бекенд (Flask), отдельно, позже
Не детализируем сейчас — по готовности фронтенда переключаем
мок-адаптер на реальные эндпоинты из финальной версии
`docs/api-contract.md`.
