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
- **HTTP-ветка** — `services/api/http/*`: GET-чтения уже собраны через
  `apiFetch()` к `ENV.apiBaseUrl` по URL ниже; мутации с побочными
  эффектами (`signup/signin`, `POST /questionnaire`, `POST /ai/portfolio`,
  `POST /ai/chat/messages`, `PATCH /tasks/...`, `POST /subscription/...`)
  помечены `notImplemented()` — их тело и точный ответ проектирует Фаза 8.

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
*** Ожидаем получить: {reply: {text, module: {kind, title, sub, description} | null}}
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

## TBD (добавлять по ходу Фазы 4)
- Focus tools: сохранение сессий фокуса и трекеров привычек
- Settings / notifications preferences (сейчас строки-заглушки)
