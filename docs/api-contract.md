# API Contract — AcademicSpace ↔ Flask backend

Заполняется по ходу разработки фронтенда (см. `CLAUDE.md` §5). Формат
каждой записи:

```
*** Метод: GET|POST|PUT|PATCH|DELETE
*** URL: /api/v1/...
*** Отправляем: {поля тела / квери-параметры}
*** Ожидаем получить: {форма ответа}
```

Правило: каждый TanStack Query хук в `hooks/api/*`, который сейчас
смотрит на мок в `mocks/handlers/*`, обязан иметь соответствующую запись
здесь — даже пока бекенда нет. Так бекендер сможет писать Flask-эндпоинты
по этому файлу, а замена мока на реальный fetch в Фазе 8 не потребует
менять форму данных.

## Адаптер-seam (Фаза 4)

Хуки `hooks/api/*` не импортируют `mocks/` напрямую — они ходят в
`services/api/<resource>.ts`, где по флагу `EXPO_PUBLIC_USE_MOCKS`
(`constants/env.ts → ENV.useMocks`) выбирается одна из двух реализаций
одного интерфейса `<Resource>Api`:

- **мок-ветка** — `mocks/handlers/*` (форма ответа = этот файл);
- **HTTP-ветка** — `services/api/http/*`: реализована по этому контракту
  для всех ресурсов Фаз 8.3–8.5 (Auth, Profile, Questionnaire,
  Universities, Tasks, Vaults-чтение, Subscription, Achievement Log,
  AI Mentor, Flashcards). Остаются `notImplemented()`: загрузка файла в
  ячейку копилки (`POST /vaults/:id/cells/:idx` — реальный
  `StorageBackend` приходит в Фазе 8.6, см. `docs/00-roadmap.md`) и
  создание задачи из карточки-предложения в чате (`POST /ai/chat/modules`
  — не описан в этом контракте, вне плана бекенда).

Фаза 8 = дозаполнить `services/api/http/*` по этому контракту; ни хуки,
ни `mocks/` при этом не меняются.

## Auth
```
*** Метод: POST
*** URL: /api/v1/auth/signup
*** Отправляем: {email, password, grade}
*** Ожидаем получить: {token, user: {id, name, email, grade}}

*** Метод: POST
*** URL: /api/v1/auth/signin
*** Отправляем: {email, password}
*** Ожидаем получить: {token, user: {id, name, email, grade}}
```

## Profile
```
*** Метод: GET
*** URL: /api/v1/profile/me
*** Отправляем: token
*** Ожидаем получить: {id, name, email, grade, avatarUrl, level, xp,
    xpToNextLevel, matchesCount, rating,
    plan: "free"|"premium",
    subscription: {period, periodLabel, price, renewsAt, summary} | null,
    subscriptionRowSub: string,          // подпись строки «Подписка» в профиле
    analysis: {country, sinceLabel},     // подпись зоны анализа на дашборде
    dashboardStats: [{v, k}]}            // плитки-статы карточки профиля
```
`xp` растёт на бекенде при закрытии интерактивных модулей (см. Tasks).
`analysis.country` = страна из сохранённой анкеты. `subscription.summary`
— готовая строка вида «Месяц · 1 900 тг · продлится 12 мая».

## Questionnaire / Universities
```
*** Метод: GET
*** URL: /api/v1/questionnaire
*** Отправляем: token
*** Ожидаем получить: {filled: boolean, interests: [...],
    groups: [{title, fields: [{label, value}]}]}

*** Метод: POST
*** URL: /api/v1/questionnaire
*** Отправляем: token, {academics: {...}, interests: [...], preferences: {...}}
*** Ожидаем получить: {questionnaireId, filled: true}

*** Метод: POST
*** URL: /api/v1/universities/search
*** Отправляем: token, {country, universities: [...], faculty, language, costRange}
*** Ожидаем получить: {country, matchesCount, rating,
    groups: [{category: "safety"|"match"|"reach",
    items: [{id, name, city, chance, tags: []}]}]}

*** Метод: GET
*** URL: /api/v1/universities/:id
*** Отправляем: token
*** Ожидаем получить: {id, name, city, category: "safety"|"match"|"reach",
    admissionsUrl, stats: [{k, v}], rows: [{k, v}],
    requiredDocuments: [...] | null,   // null для Free — lock-тизер
    documentsNote: string}             // текст блока документов: разбор (Premium) / тизер (Free)
```

## AI Mentor
```
*** Метод: POST
*** URL: /api/v1/ai/portfolio
*** Отправляем: token, {resume, motivationLetters: [...], activities: [...], achievements: [...]}
*** Ожидаем получить: {analysisId, status: "processing"}

*** Метод: GET
*** URL: /api/v1/ai/analysis/:analysisId
*** Отправляем: token
*** Ожидаем получить: {analysisId, status: "processing"|"ready",
    previewBlocks: [{title, text}], fullText: string | null}

*** Метод: POST
*** URL: /api/v1/ai/chat/messages
*** Отправляем: token, {text}
*** Ожидаем получить: {reply: {text, module: {title, sub, desc, created} | null}}
```

Быстрые подсказки чата (`quickPrompts`) — отдельным лёгким запросом:
```
*** Метод: GET
*** URL: /api/v1/ai/chat/meta
*** Отправляем: token
*** Ожидаем получить: {quickPrompts: [string]}
```

## Tasks / Modules
```
*** Метод: GET
*** URL: /api/v1/tasks
*** Отправляем: token
*** Ожидаем получить: [{id, kind, title, meta, xp, items: [{label, done}], isTimer}]

*** Метод: GET
*** URL: /api/v1/tasks/:taskId
*** Отправляем: token
*** Ожидаем получить: {id, kind, title, meta, xp, items: [{label, done}], isTimer}

*** Метод: PATCH
*** URL: /api/v1/tasks/:taskId/items/:itemIndex
*** Отправляем: token, {done}
*** Ожидаем получить: {task: {...обновлённая задача} | null,
    completed: boolean,   // все пункты закрыты этим запросом → модуль ушёл из активных
    xpAwarded: number}    // начислено XP (0, если модуль ещё в работе)
```
Когда `completed: true`, бекенд: (1) убирает модуль из `GET /tasks`,
(2) прибавляет его `xp` к `profile.xp`, (3) добавляет запись в
`GET /achievements/log` за сегодня. Клиент после этого инвалидирует
профиль и журнал.

## Document Vaults
```
*** Метод: GET
*** URL: /api/v1/vaults
*** Отправляем: token
*** Ожидаем получить: [{id, universityName, deadline, filled, cellsTotal}]

*** Метод: GET
*** URL: /api/v1/vaults/:vaultId
*** Отправляем: token
*** Ожидаем получить: {id, universityName, deadline, filled, cellsTotal,
    cells: [{title, sub, uploaded}]}

*** Метод: POST
*** URL: /api/v1/vaults/:vaultId/cells/:cellIndex
*** Отправляем: token, file (multipart)
*** Ожидаем получить: {cell: {...обновлённая ячейка}}
```

## Subscription
```
*** Метод: GET
*** URL: /api/v1/subscription/plans
*** Отправляем: token
*** Ожидаем получить: [{id, period: "week"|"month", price, label}]

*** Метод: POST
*** URL: /api/v1/subscription/subscribe
*** Отправляем: token, {planId, paymentMethod}
*** Ожидаем получить: {status: "success"|"failed", subscription: {...}}
```

## Achievement Log
```
*** Метод: GET
*** URL: /api/v1/achievements/log
*** Отправляем: token
*** Ожидаем получить: {totalXp, days: [{date,
    items: [{title, kind, xp, dot: "blue"|"blueLight"|"green"|"gold"|"rose"}]}]}
```
`totalXp` = актуальный `profile.xp`. Модули, закрытые сегодня (см.
`PATCH /tasks/...`), приходят записями в начале первого дня. Цвет точки
по виду модуля: КАРТА → `blue`, ЧЕК-ЛИСТ → `green`, ТАЙМЕР → `blueLight`.

## Flashcards
Умные карточки (Фаза 9, сверх исходного дизайн-референса). Лимит
одновременно хранимых колод — `quota.limit` (Free 1 / Premium 10);
удаление колоды освобождает слот.
```
*** Метод: GET
*** URL: /api/v1/flashcards
*** Отправляем: token
*** Ожидаем получить: {quota: {used, limit},
    decks: [{id, title, source: "text"|"image", createdAt,
             cardsTotal, cardsRemaining}]}

*** Метод: GET
*** URL: /api/v1/flashcards/:deckId
*** Отправляем: token
*** Ожидаем получить: {id, title, source, createdAt, cardsTotal,
    cardsRemaining, cards: [{id, question, answer}]} | null

*** Метод: POST
*** URL: /api/v1/flashcards
*** Отправляем: token, {source: "text"|"image", text?, images?: file[] (multipart)}
*** Ожидаем получить: {id, title, source, createdAt, cardsTotal,
    cardsRemaining, cards: [{id, question, answer}]}
    (409, если квота колод исчерпана)

*** Метод: DELETE
*** URL: /api/v1/flashcards/:deckId
*** Отправляем: token
*** Ожидаем получить: {ok: true}

*** Метод: PATCH
*** URL: /api/v1/flashcards/:deckId/cards/:cardId
*** Отправляем: token, {known: true}
*** Ожидаем получить: {deck: {...обновлённая колода} | null, xpAwarded: number}
```
Когда карточка была последней в колоде, `xpAwarded` > 0: бекенд (1)
прибавляет её к `profile.xp`, (2) добавляет запись в
`GET /achievements/log` за сегодня (`kind: "умные карточки"`). Колода
остаётся в списке пустой до явного `DELETE` — так пользователь сам решает,
когда освободить слот квоты.

## TBD (добавлять по ходу Фазы 4)
- Focus tools: сохранение сессий фокуса и трекеров привычек
- Settings / notifications preferences (сейчас строки-заглушки)
