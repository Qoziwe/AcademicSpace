# AcademicSpace — полный список функционала

Сводный документ по всему функционалу продукта на текущий момент
(2026-09-28, ветка `fix/mutation-error-feedback`). Составлен по коду
(`frontend/app`, `frontend/stores`, `frontend/services/api`,
`backend/app`) и источникам истины (`docs/screen-inventory.md`,
`docs/00-roadmap.md`, `docs/api-contract.md`). 39 реальных экранов + 2
глобальных компонента, фронтенд на Expo Router, бекенд на Flask —
подключаем реальный бекенд через `EXPO_PUBLIC_USE_MOCKS=false`.

## 1. Онбординг и авторизация

- **Splash** (`/`) — стартовый экран с градиентом, авто-переход.
- **Welcome** (`/welcome`) — приветствие, вход в регистрацию/вход.
- **Регистрация / Вход** (`/auth/signup`, `/auth/signin`) — один экран
  `<AuthScreen>` с сегмент-контролом «Регистрация»/«Вход»; форма email +
  пароль, мок-сессия в Zustand + AsyncStorage.
- **Auth loading** (`/auth/loading`) — активация навигатора после входа.
- Route guard: неавторизованный пользователь по любому `auth:true` роуту
  уводится на `/welcome`.

## 2. Подбор университетов

- **Анкета** (`/universities/questionnaire`) — шаг 1 из общей цепочки
  фильтров (интересы/цели абитуриента).
- **Фильтры, шаги 2–6**: страна (`/universities/filters/country`),
  университеты (`/filters/university`, множественный выбор), факультет
  (`/filters/faculty`), язык обучения (`/filters/language`),
  стоимость/стипендия (`/filters/cost`) — общий компонент
  `<FilterStepScreen>`, сабмит последнего шага уходит в поиск.
- **Результаты подбора** (`/universities/results`) — алгоритмическая
  группировка вузов по категориям **Safety / Match / Reach**
  (`POST /universities/search`).
- **Карточка вуза** (`/universities/:id`) — детальная информация; блок
  документов для Premium ведёт в копилку вуза, для Free — lock-тизер →
  Paywall.
- **Документы для поступления** (`/universities/:id/documents`,
  Premium-only) — общий `<DocumentVaultScreen>` в привязке к вузу.

## 3. ИИ-анализ портфолио

- **Загрузка портфолио** (`/ai/portfolio`) — ячейки для резюме,
  мотивационных писем, активностей, достижений (`<DocumentCell>`, файл-
  пикер — на бекенде реальный upload).
- **Анализ идёт** (`/ai/analysis/loading`) — экран ожидания (навy,
  анимация, `back` отключён), запрос `POST /ai/portfolio`.
- **Превью стратегии** (`/ai/analysis/preview`) — блочный превью-разбор
  портфолио с градиент-фейдом/blur и карточкой монетизации → Paywall
  (`GET /ai/analysis/:id`).

## 4. ИИ-ментор (чат)

- **Чат** (`/ai/chat`, Premium-only) — тред сообщений
  (`<ChatThread>` + `<Composer>`), typing-индикатор, история
  (`GET /ai/chat/meta`, `POST /ai/chat/messages`).
- ИИ в ответе чата сам решает, стоит ли предложить учебный модуль
  (карточка-предложение с типом: Карта/Чек-лист/Таймер и 2–5 шагами) —
  клик «Создать» материализует готовое предложение в задачу
  (`POST /ai/chat/modules`), без повторного похода к нейросети. XP по
  фиксированной шкале за тип модуля (120/80/40), идемпотентно (повторный
  клик → 409).
- Free-пользователь по deep link на чат уводится на Paywall (route guard).

## 5. Задачи и обучающие модули

- **Активные задачи** (`/tasks`, Premium-only) — список модулей
  (`<TaskModuleCard variant="full">`), таб «Задачи» физически скрыт в
  таб-баре для Free (не резервирует место), пустое состояние.
- **Модуль** (`/tasks/:moduleId`) — 4 типа контента внутри одного экрана:
  дорожная карта (Roadmap), план (Plan), чек-лист (Checklist), таймер
  (Timer, завязан на общий `stores/focus`). Показывает этапы и «что
  дальше», закрытие модуля/пункта чек-листа начисляет XP и пишет запись в
  журнал (`GET/PATCH /tasks`).

## 6. Копилки документов

- **Список копилок** (`/documents`, Premium-only) — карточки вузов с
  мини-ячейками заполненности (`useVaults`).
- **Копилка вуза** (`/documents/:vaultId`) — загрузка файла в конкретную
  ячейку (реальный `expo-document-picker`, multipart на бекенд), просмотр/
  скачивание загруженного файла (`GET/POST /vaults`).

## 7. Умные карточки (Фаза 9, сверх дизайн-референса)

- **Список колод** (`/flashcards`) — квота одновременно хранимых колод:
  Free — 1, Premium — 10; удаление освобождает слот.
- **Новая колода** (`/flashcards/create`) — создание по тексту темы или
  по фото конспекта/формул (`expo-image-picker`, multipart), тот же
  паттерн, что портфолио.
- **Генерация карточек** (`/flashcards/generating`) — экран ожидания,
  ИИ собирает набор «вопрос → ответ».
- **Изучение колоды** (`/flashcards/:deckId`) — свайп-механика
  (`<FlashcardStack>` на Reanimated + Gesture Handler): влево —
  «запомнил» (карточка уходит навсегда), вправо на лицевой стороне —
  перевернуть, вправо на обороте — следующая карточка; невыученные
  возвращаются на следующем круге в случайном порядке. Полное
  прохождение колоды начисляет XP и пишет запись в журнал, как закрытие
  задачи.

## 8. Геймификация

- XP и уровни пользователя (`profile.level`, `profile.xp`,
  `xp_to_next_level`) — растут за закрытие модулей задач, флешкард-колод,
  чек-лист-пунктов.
- **Журнал выполненных заданий** (`/profile/history`) — лог начислений
  XP, сгруппированный по датам (`GET /achievements/log`).
- Инструменты фокусировки (см. §10) также часть цикла продуктивности,
  хотя сохранение сессий/трекеров на бекенде осознанно не реализовано.

## 9. Монетизация / Premium

- **Paywall** (`/subscription/offer`) — маркетинговый экран
  «AcademicSpace Premium» со встроенным выбором тарифа (`<PlanCard>`
  inline) → переход в оплату.
- **Выбор тарифа** (`/subscription/plans`) — тот же `<PlanCard>` без
  маркетингового блока; используется и с Paywall, и из смены тарифа уже
  подписанным пользователем.
- **Оплата** (`/subscription/payment`) — стейт-машина
  `idle → processing → success` (мок-провайдер `PaymentProvider`,
  реальный платёжный провайдер под Кыргызстан пока не выбран), успех
  ведёт в чат с ИИ-ментором.
- **Управление подпиской** (`/profile/subscription`) — Premium: переход к
  смене тарифа + отмена подписки; Free: переход на Paywall.
- Гейтинг двух видов, оба переиспользуемы через `usePremiumGate` +
  `<PremiumLockTile>`:
  1. **Таб-бар**: вкладка «Задачи» не рендерится для Free вовсе.
  2. **Bento-плитки/строки**: рендерятся всегда с иконкой замка и уводят
     на Paywall по тапу (дашборд, блок документов в карточке вуза,
     строки профиля).
- Free по deep link на любой из Premium-only роутов уводится на Paywall.

## 10. Профиль, настройки, фокус

- **Профиль** (`/profile`) — `<ProfileHeaderWidget>`, уровень/XP, строки-
  гейты для Premium-функций.
- **Настройки** (`/settings`) — карточка подписки, переключатель темы
  (светлая/тёмная, персистентно через AsyncStorage), три группы
  настроек.
- **Инструменты фокусировки** (`/focus`, Premium-only) — таймер
  (`stores/focus`), звуковые плитки (`<FocusSoundTile>`), трекеры
  продуктивности; экран сознательно вне темы (навсегда навy).

## 11. Системные экраны и глобальные компоненты

- **Ошибка / Нет соединения / Технические работы / Требуется обновление**
  (`/system/error`, `/system/offline`, `/system/maintenance`,
  `/system/update`) — один `<SystemScreenLayout kind=...>`, часть экранов
  с отключённым `back` и CTA на переход в стор (`Linking`).
- **Офлайн-баннер** — глобальный оверлей поверх любого экрана при потере
  сети.
- **Таб-бар** — глобальная нижняя навигация, скрывает вкладки по
  премиум-статусу.
- **Toast / единая обработка ошибок мутаций** — глобальный
  `MutationCache.onError` в TanStack Query показывает пользователю ошибку
  любой неудавшейся мутации вместо тихого провала; экраны с собственным
  точным UI под ошибку (инлайн-текст в форме) опускаются через
  meta-флаг на конкретной мутации.
- **Liquid glass таб-бар** (дев-функция) — прозрачная переливающаяся
  панель на вебе (рефракция без blur), перетаскиваемая пилюля,
  переключается флагом `useDevFlags().liquidGlass`.

## 12. Адаптивность и деплой

- Единая кодовая база под iOS/Android/Web (Expo Router).
- Постоянный `<Sidebar>` вместо таб-бара на широком вебе для всех
  авторизованных не-модальных роутов, многоколоночные Dashboard/
  Results/Vaults List (`hooks/useBreakpoint.ts`).
- Остальные 19 shell-экранов — общая центрированная колонка (780px) без
  bespoke-раскладки.
- Деплой статического веб-билда на GitHub Pages.

## 13. Backend API (Flask)

Реализовано по `docs/api-contract.md`, PostgreSQL/SQLite + SQLAlchemy +
JWT + marshmallow:

| Домен | Эндпоинты |
|---|---|
| Health | `GET /health` |
| Auth | `POST /auth/signup`, `POST /auth/signin` |
| Profile | `GET /profile/me` |
| Questionnaire | `GET/POST /questionnaire` |
| Universities | `POST /universities/search`, `GET /universities/:id` |
| Tasks | `GET /tasks`, `GET /tasks/:id`, `PATCH /tasks/:id/items/:index` |
| Vaults | `GET /vaults`, `GET /vaults/:id`, `POST /vaults/:id/cells/:index`, `GET /vaults/:id/cells/:index/file` |
| Subscription | `GET /subscription/plans`, `POST /subscription/subscribe` |
| Achievements | `GET /achievements/log` |
| AI Mentor | `POST /ai/portfolio`, `GET /ai/analysis/:id`, `GET /ai/chat/meta`, `POST /ai/chat/messages`, `POST /ai/chat/modules` |
| Flashcards | `GET /flashcards`, `GET /flashcards/:id`, `POST /flashcards`, `DELETE /flashcards/:id`, `PATCH /flashcards/:id/cards/:cardId` |

Провайдеры за интерфейсами (легко заменить без переделки эндпоинтов):
`AIProvider` (Anthropic/OpenAI роутер), `PaymentProvider` (сейчас мок),
`StorageBackend` (сейчас локальный, облако — одним файлом).

**Осознанно не реализовано на бекенде:** сохранение сессий/трекеров
Focus Tools, preferences уведомлений в Settings, реальный платёжный
провайдер, продакшн-деплой бекенда, облачное хранилище файлов.

## 14. Технологический стек

- **Фронтенд**: React Native + TypeScript (strict) + Expo (managed,
  Expo Router), TanStack Query (серверный стейт) + Zustand (UI-стейт:
  тема, премиум-флаг, формы, таймер фокуса), атомарный дизайн
  (`atoms/molecules/organisms`), Reanimated + Gesture Handler для
  свайпов и жидкого стекла, ESLint + Prettier + Husky/lint-staged.
- **Бекенд**: Flask + PostgreSQL (SQLite для локальной разработки) +
  SQLAlchemy/Alembic + JWT + marshmallow, `uv`, Docker.
- **Бренд**: конфиг `constants/brand.ts` + `app.config.ts`, deep link
  `academicspace://`, ребрендинг UniPath → AcademicSpace нигде не
  хардкожен.
